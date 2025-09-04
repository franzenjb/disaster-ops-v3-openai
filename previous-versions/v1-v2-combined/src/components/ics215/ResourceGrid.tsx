/**
 * Resource Grid Component
 * 
 * Excel-like grid interface for ICS Form 215
 * Designed for disaster responders to quickly enter and view data
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ICSResource,
  ServiceLineType,
  CellValue,
  CellStatus,
  GridState,
  GridAction,
  ColumnConfig
} from '../../types/ics-215-grid-types';
import { useOperationStore } from '../../stores/useOperationStore';
import { debounce } from 'lodash';

interface ResourceGridProps {
  serviceLineType: ServiceLineType;
  resources: ICSResource[];
  columns: ColumnConfig[];
  onCellChange: (resourceId: string, columnId: string, value: CellValue, date?: string) => void;
  onResourceAdd: () => void;
  readOnly?: boolean;
}

export function ResourceGrid({
  serviceLineType,
  resources,
  columns,
  onCellChange,
  onResourceAdd,
  readOnly = false
}: ResourceGridProps) {
  // Grid state
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [copiedCells, setCopiedCells] = useState<Map<string, CellValue>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CellStatus | 'all'>('all');
  
  // Refs for keyboard navigation
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-save with debounce
  const debouncedSave = useMemo(
    () => debounce((resourceId: string, columnId: string, value: CellValue, date?: string) => {
      onCellChange(resourceId, columnId, value, date);
    }, 1000),
    [onCellChange]
  );
  
  // Get dates for column headers (last 7 days + next 7 days)
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);
  
  // Filter resources based on search and status
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = searchTerm === '' || 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [resources, searchTerm, statusFilter]);
  
  // Get cell value
  const getCellValue = (resource: ICSResource, columnId: string, date?: Date): CellValue => {
    if (date) {
      const dateKey = date.toISOString().split('T')[0];
      const dailyData = (resource as any).dailyData?.[dateKey];
      return dailyData?.[columnId] || dailyData || null;
    }
    return (resource as any)[columnId] || null;
  };
  
  // Get cell status color
  const getCellColor = (value: CellValue, resource: ICSResource): string => {
    if (!value) return 'bg-white';
    
    // Check if value has explicit status
    if (typeof value === 'object' && value !== null && 'status' in value) {
      switch (value.status) {
        case 'red': return 'bg-red-100 border-red-400';
        case 'yellow': return 'bg-yellow-100 border-yellow-400';
        case 'green': return 'bg-green-100 border-green-400';
        case 'gray': return 'bg-gray-100 border-gray-400';
        default: return 'bg-white';
      }
    }
    
    // Apply automatic color coding based on values
    if (typeof value === 'object' && value !== null && 'need' in value) {
      const need = value.need || 0;
      const have = value.have || 0;
      const req = value.req || 0;
      
      if (need > req * 0.2) return 'bg-red-100 border-red-400'; // Critical need
      if (need > 0) return 'bg-yellow-100 border-yellow-400'; // Some need
      if (have >= req) return 'bg-green-100 border-green-400'; // Fully resourced
    }
    
    return 'bg-white';
  };
  
  // Format cell display value
  const formatCellValue = (value: CellValue): string => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'object' && value !== null) {
      if ('req' in value && 'have' in value && 'need' in value) {
        return `${value.have}/${value.req}`;
      }
      if ('total' in value) {
        return value.total.toString();
      }
    }
    
    return value.toString();
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newRow = Math.min(filteredResources.length - 1, row + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newCol = Math.min(columns.length + dates.length - 1, col + 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          handleCellSave();
        } else {
          setEditingCell({ row, col });
        }
        break;
      case 'Escape':
        e.preventDefault();
        setEditingCell(null);
        setEditValue('');
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          newCol = Math.max(0, col - 1);
        } else {
          newCol = Math.min(columns.length + dates.length - 1, col + 1);
        }
        break;
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCopy();
        }
        break;
      case 'v':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handlePaste();
        }
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // TODO: Implement undo
        }
        break;
    }
    
    if (newRow !== row || newCol !== col) {
      setSelectedCell({ row: newRow, col: newCol });
      setEditingCell(null);
    }
  };
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    if (!readOnly) {
      setEditingCell({ row, col });
    }
  };
  
  // Handle cell save
  const handleCellSave = () => {
    if (!editingCell) return;
    
    const { row, col } = editingCell;
    const resource = filteredResources[row];
    
    if (col < columns.length) {
      // Static column
      const column = columns[col];
      debouncedSave(resource.id, column.id, editValue);
    } else {
      // Date column
      const dateIndex = col - columns.length;
      const date = dates[dateIndex];
      const dateKey = date.toISOString().split('T')[0];
      // For simplicity, save as a number for now
      debouncedSave(resource.id, 'dailyData', parseFloat(editValue) || 0, dateKey);
    }
    
    setEditingCell(null);
    setEditValue('');
  };
  
  // Handle copy
  const handleCopy = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const resource = filteredResources[row];
    const value = col < columns.length 
      ? getCellValue(resource, columns[col].id)
      : getCellValue(resource, 'dailyData', dates[col - columns.length]);
    
    const cellKey = `${row}-${col}`;
    setCopiedCells(new Map([[cellKey, value]]));
  };
  
  // Handle paste
  const handlePaste = () => {
    if (!selectedCell || copiedCells.size === 0) return;
    const copiedValue = Array.from(copiedCells.values())[0];
    setEditValue(formatCellValue(copiedValue));
    handleCellSave();
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CellStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="green">Green - Good</option>
            <option value="yellow">Yellow - Caution</option>
            <option value="red">Red - Critical</option>
            <option value="gray">Gray - Inactive</option>
          </select>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="font-semibold">{filteredResources.length}</span>
            <span className="text-sm text-gray-400">|</span>
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="text-sm">{filteredResources.filter(r => r.status === 'red').length}</span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="text-sm">{filteredResources.filter(r => r.status === 'yellow').length}</span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            <span className="text-sm">{filteredResources.filter(r => r.status === 'green').length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={onResourceAdd}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </button>
          )}
        </div>
      </div>
      
      {/* Grid */}
      <div 
        ref={gridRef}
        className="flex-1 overflow-auto"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              {/* Static columns */}
              {columns.map((column, index) => (
                <th
                  key={column.id}
                  className="border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 text-left bg-gray-100"
                  style={{ minWidth: column.width || 120 }}
                >
                  {column.header}
                </th>
              ))}
              
              {/* Date columns */}
              {dates.map((date, index) => (
                <th
                  key={date.toISOString()}
                  className={`border border-gray-300 px-2 py-1 text-xs font-semibold text-center min-w-[80px] ${
                    date.toDateString() === new Date().toDateString() ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs font-normal text-gray-500">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {filteredResources.map((resource, rowIndex) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                {/* Static columns */}
                {columns.map((column, colIndex) => {
                  const value = getCellValue(resource, column.id);
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  
                  return (
                    <td
                      key={`${resource.id}-${column.id}`}
                      className={`border border-gray-300 px-2 py-1 text-sm cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                      } ${getCellColor(value, resource)}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type={column.type === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave();
                            if (e.key === 'Escape') {
                              setEditingCell(null);
                              setEditValue('');
                            }
                          }}
                          className="w-full px-1 py-0 border-none outline-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        formatCellValue(value)
                      )}
                    </td>
                  );
                })}
                
                {/* Date columns */}
                {dates.map((date, dateIndex) => {
                  const colIndex = columns.length + dateIndex;
                  const value = getCellValue(resource, 'dailyData', date);
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <td
                      key={`${resource.id}-${date.toISOString()}`}
                      className={`border border-gray-300 px-2 py-1 text-sm text-center cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                      } ${isToday ? 'bg-blue-50' : ''} ${getCellColor(value, resource)}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellSave();
                            if (e.key === 'Escape') {
                              setEditingCell(null);
                              setEditValue('');
                            }
                          }}
                          className="w-full px-1 py-0 border-none outline-none bg-transparent text-center"
                          autoFocus
                        />
                      ) : (
                        formatCellValue(value)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with keyboard shortcuts */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>↑↓←→ Navigate</span>
          <span>Enter: Edit</span>
          <span>Tab: Next Cell</span>
          <span>Ctrl+C: Copy</span>
          <span>Ctrl+V: Paste</span>
          <span>Esc: Cancel</span>
          <span className="ml-auto">Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
}