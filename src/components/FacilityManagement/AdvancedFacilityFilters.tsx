'use client';

import React, { useState, useCallback, useMemo } from 'react';

/**
 * Advanced Facility Filters Component - Phase 3 Implementation
 * 
 * Sophisticated filtering system for facility management with
 * multiple criteria, saved filters, and real-time search.
 */

export interface FilterCriteria {
  // Basic filters
  search?: string;
  type?: string[];
  status?: string[];
  
  // Capacity filters
  minCapacity?: number;
  maxCapacity?: number;
  hasAvailableCapacity?: boolean;
  occupancyRange?: [number, number]; // percentage
  
  // Location filters
  county?: string[];
  region?: string[];
  address?: string;
  nearLocation?: {
    lat: number;
    lng: number;
    radius: number; // miles
  };
  
  // Personnel filters
  hasManager?: boolean;
  hasMedicalStaff?: boolean;
  minStaffCount?: number;
  
  // Resource filters
  hasResources?: string[]; // resource types
  resourceQuantity?: Record<string, { min?: number; max?: number }>;
  
  // Time-based filters
  openedAfter?: string;
  openedBefore?: string;
  lastActivityAfter?: string;
  
  // Compliance filters
  accessibilityCompliant?: boolean;
  petFriendly?: boolean;
  hasGenerator?: boolean;
  hasInternet?: boolean;
  
  // Custom filters
  customFilters?: Record<string, any>;
}

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria;
  isDefault?: boolean;
  createdAt: string;
  usageCount: number;
}

interface AdvancedFacilityFiltersProps {
  onFiltersChange: (criteria: FilterCriteria) => void;
  facilities?: any[]; // For generating filter options
  initialFilters?: FilterCriteria;
}

export function AdvancedFacilityFilters({
  onFiltersChange,
  facilities = [],
  initialFilters = {}
}: AdvancedFacilityFiltersProps) {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Generate filter options from facility data
  const filterOptions = useMemo(() => {
    return {
      types: [...new Set(facilities.map(f => f.type))].sort(),
      statuses: [...new Set(facilities.map(f => f.status))].sort(),
      counties: [...new Set(facilities.map(f => f.county))].filter(Boolean).sort(),
      regions: [...new Set(facilities.map(f => f.region))].filter(Boolean).sort(),
      resources: [...new Set(facilities.flatMap(f => f.resources?.map((r: any) => r.type) || []))].sort()
    };
  }, [facilities]);

  // Update filters and notify parent
  const updateFilters = useCallback((updates: Partial<FilterCriteria>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  // Save current filter set
  const saveCurrentFilter = useCallback(() => {
    if (!newFilterName.trim()) return;
    
    const newSavedFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName.trim(),
      criteria: filters,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    
    setSavedFilters(prev => [...prev, newSavedFilter]);
    setNewFilterName('');
    setShowSaveDialog(false);
  }, [filters, newFilterName]);

  // Load saved filter
  const loadSavedFilter = useCallback((savedFilter: SavedFilter) => {
    setFilters(savedFilter.criteria);
    onFiltersChange(savedFilter.criteria);
    
    // Update usage count
    setSavedFilters(prev => prev.map(sf => 
      sf.id === savedFilter.id 
        ? { ...sf, usageCount: sf.usageCount + 1 }
        : sf
    ));
  }, [onFiltersChange]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof FilterCriteria];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== undefined && value !== '' && value !== null;
    }).length;
  }, [filters]);

  // Quick filter presets
  const quickFilters = [
    {
      label: 'Available Capacity',
      criteria: { hasAvailableCapacity: true }
    },
    {
      label: 'Open Shelters',
      criteria: { type: ['shelter'], status: ['open'] }
    },
    {
      label: 'High Occupancy',
      criteria: { occupancyRange: [80, 100] as [number, number] }
    },
    {
      label: 'Needs Staff',
      criteria: { hasManager: false }
    },
    {
      label: 'Pet-Friendly',
      criteria: { petFriendly: true }
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-gray-900">
              Advanced Filters
            </h3>
            
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        
        {/* Quick Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Quick search facilities..."
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((quickFilter, index) => (
            <button
              key={index}
              onClick={() => updateFilters(quickFilter.criteria)}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
            >
              {quickFilter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4">
          
          {/* Filter Sections */}
          <div className="space-y-4">
            
            {/* Basic Filters */}
            <div className="border border-gray-200 rounded-lg p-3">
              <button
                onClick={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
              >
                <span>Basic Filters</span>
                <span>{activeSection === 'basic' ? '−' : '+'}</span>
              </button>
              
              {activeSection === 'basic' && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Facility Type
                    </label>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {filterOptions.types.map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.type?.includes(type) || false}
                            onChange={(e) => {
                              const currentTypes = filters.type || [];
                              const updatedTypes = e.target.checked
                                ? [...currentTypes, type]
                                : currentTypes.filter(t => t !== type);
                              updateFilters({ type: updatedTypes.length ? updatedTypes : undefined });
                            }}
                            className="h-3 w-3 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="space-y-1">
                      {filterOptions.statuses.map(status => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(status) || false}
                            onChange={(e) => {
                              const currentStatuses = filters.status || [];
                              const updatedStatuses = e.target.checked
                                ? [...currentStatuses, status]
                                : currentStatuses.filter(s => s !== status);
                              updateFilters({ status: updatedStatuses.length ? updatedStatuses : undefined });
                            }}
                            className="h-3 w-3 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Capacity Filters */}
            <div className="border border-gray-200 rounded-lg p-3">
              <button
                onClick={() => setActiveSection(activeSection === 'capacity' ? null : 'capacity')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
              >
                <span>Capacity & Occupancy</span>
                <span>{activeSection === 'capacity' ? '−' : '+'}</span>
              </button>
              
              {activeSection === 'capacity' && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Min Capacity
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minCapacity || ''}
                      onChange={(e) => updateFilters({ 
                        minCapacity: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={filters.maxCapacity || ''}
                      onChange={(e) => updateFilters({ 
                        maxCapacity: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.hasAvailableCapacity || false}
                        onChange={(e) => updateFilters({ 
                          hasAvailableCapacity: e.target.checked || undefined 
                        })}
                        className="h-3 w-3 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">Has Available Capacity</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Location Filters */}
            <div className="border border-gray-200 rounded-lg p-3">
              <button
                onClick={() => setActiveSection(activeSection === 'location' ? null : 'location')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
              >
                <span>Location</span>
                <span>{activeSection === 'location' ? '−' : '+'}</span>
              </button>
              
              {activeSection === 'location' && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {filterOptions.counties.map(county => (
                        <label key={county} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.county?.includes(county) || false}
                            onChange={(e) => {
                              const currentCounties = filters.county || [];
                              const updatedCounties = e.target.checked
                                ? [...currentCounties, county]
                                : currentCounties.filter(c => c !== county);
                              updateFilters({ county: updatedCounties.length ? updatedCounties : undefined });
                            }}
                            className="h-3 w-3 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700">{county}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address Contains
                    </label>
                    <input
                      type="text"
                      placeholder="Street, city, or ZIP"
                      value={filters.address || ''}
                      onChange={(e) => updateFilters({ address: e.target.value || undefined })}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Filters */}
            <div className="border border-gray-200 rounded-lg p-3">
              <button
                onClick={() => setActiveSection(activeSection === 'compliance' ? null : 'compliance')}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
              >
                <span>Compliance & Features</span>
                <span>{activeSection === 'compliance' ? '−' : '+'}</span>
              </button>
              
              {activeSection === 'compliance' && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {[
                    { key: 'accessibilityCompliant', label: 'ADA Compliant' },
                    { key: 'petFriendly', label: 'Pet Friendly' },
                    { key: 'hasGenerator', label: 'Backup Power' },
                    { key: 'hasInternet', label: 'Internet Access' },
                    { key: 'hasManager', label: 'Has Manager' },
                    { key: 'hasMedicalStaff', label: 'Medical Staff' }
                  ].map(feature => (
                    <label key={feature.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters[feature.key as keyof FilterCriteria] || false}
                        onChange={(e) => updateFilters({ 
                          [feature.key]: e.target.checked || undefined 
                        })}
                        className="h-3 w-3 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Saved Filters</h4>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Save Current
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {savedFilters.map(savedFilter => (
                  <button
                    key={savedFilter.id}
                    onClick={() => loadSavedFilter(savedFilter)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                    title={`Used ${savedFilter.usageCount} times`}
                  >
                    {savedFilter.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Filter Dialog */}
          {showSaveDialog && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Save Filter Set</h4>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Filter name"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  className="flex-1 text-xs border border-blue-300 rounded px-2 py-1"
                  onKeyPress={(e) => e.key === 'Enter' && saveCurrentFilter()}
                />
                <button
                  onClick={saveCurrentFilter}
                  disabled={!newFilterName.trim()}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}