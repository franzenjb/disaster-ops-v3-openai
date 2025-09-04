/**
 * ICS Form 215 Grid Interface
 * 
 * Main interface for the Excel-like grid system
 * Provides tabs for each service line and handles data management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ResourceGrid } from './ResourceGrid';
import { 
  ServiceLineType,
  ICSResource,
  ServiceLineSummary,
  CellValue
} from '../../types/ics-215-grid-types';
import {
  serviceLineConfigs,
  getAllServiceLineTypes,
  getServiceLineDisplayName,
  getServiceLineConfig
} from '../../config/ics215-service-lines';
import { useOperationStore } from '../../stores/useOperationStore';
import { useICS215GridStore } from '../../stores/useICS215GridStore';

export function ICS215GridInterface() {
  const operation = useOperationStore(state => state.currentOperation);
  
  // Connect to central store
  const resources = useICS215GridStore(state => state.resources);
  const hasUnsavedChanges = useICS215GridStore(state => state.hasUnsavedChanges);
  const lastSaved = useICS215GridStore(state => state.lastSaved);
  const updateResource = useICS215GridStore(state => state.updateResource);
  const addResourceToStore = useICS215GridStore(state => state.addResource);
  const deleteResourceFromStore = useICS215GridStore(state => state.deleteResource);
  const getServiceLineSummary = useICS215GridStore(state => state.getServiceLineSummary);
  
  // Local UI state
  const [activeTab, setActiveTab] = useState<ServiceLineType>('sheltering');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Note: Data is now loaded from the central store via Zustand persist
  // No need for separate initialization - the store handles it
  
  // Handle cell change - now updates central store
  const handleCellChange = useCallback((
    resourceId: string,
    columnId: string,
    value: CellValue,
    date?: string
  ) => {
    const resource = resources[activeTab].find(r => r.id === resourceId);
    if (!resource) return;
    
    let updates: Partial<ICSResource> = {};
    
    if (date && columnId === 'dailyData') {
      // Handle date-specific data
      const dailyData = { ...(resource as any).dailyData };
      if (!dailyData[date]) {
        dailyData[date] = { status: 'white' };
      }
      dailyData[date] = { ...dailyData[date], value };
      updates = { dailyData };
    } else {
      // Handle static column data
      updates = { [columnId]: value };
    }
    
    // Update in central store
    updateResource(activeTab, resourceId, updates);
  }, [activeTab, resources, updateResource]);
  
  // Add new resource - now adds to central store
  const handleResourceAdd = useCallback(() => {
    const config = getServiceLineConfig(activeTab);
    const newResource: ICSResource = {
      id: Date.now().toString(),
      ...config.defaultResource,
      name: `New ${config.displayName} Resource`,
      lastUpdated: new Date(),
      dailyData: {}
    } as ICSResource;
    
    // Add to central store
    addResourceToStore(activeTab, newResource);
  }, [activeTab, addResourceToStore]);
  
  // Get tab counts for visual indicators
  const getTabCounts = (serviceLineType: ServiceLineType) => {
    const serviceLineResources = resources[serviceLineType];
    return {
      total: serviceLineResources.length,
      critical: serviceLineResources.filter(r => r.status === 'red').length,
      warning: serviceLineResources.filter(r => r.status === 'yellow').length
    };
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ICS Form 215 - Operational Planning Worksheet
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {operation?.operationName || 'Disaster Response Operation'} • 
              Operational Period: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {hasUnsavedChanges ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Unsaved changes</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
            
            {/* Mode Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditMode ? 'Save & Exit Edit Mode' : 'Enter Edit Mode'}
            </button>
            
            {/* Export Button */}
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Export to Excel
            </button>
          </div>
        </div>
      </div>
      
      {/* Service Line Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="-mb-px flex space-x-8">
            {getAllServiceLineTypes().map(serviceLineType => {
              const counts = getTabCounts(serviceLineType);
              return (
                <button
                  key={serviceLineType}
                  onClick={() => setActiveTab(serviceLineType)}
                  className={`
                    py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${activeTab === serviceLineType
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{getServiceLineDisplayName(serviceLineType)}</span>
                  {counts.total > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                        {counts.total}
                      </span>
                      {counts.critical > 0 && (
                        <span className="text-xs bg-red-200 text-red-700 rounded-full px-2 py-0.5">
                          {counts.critical}
                        </span>
                      )}
                      {counts.warning > 0 && (
                        <span className="text-xs bg-yellow-200 text-yellow-700 rounded-full px-2 py-0.5">
                          {counts.warning}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Summary Tab */}
            <button
              onClick={() => {/* TODO: Show summary view */}}
              className="py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              📊 Summary
            </button>
          </nav>
        </div>
      </div>
      
      {/* Grid Container */}
      <div className="flex-1 p-6 overflow-hidden">
        <ResourceGrid
          serviceLineType={activeTab}
          resources={resources[activeTab]}
          columns={getServiceLineConfig(activeTab).columns}
          onCellChange={handleCellChange}
          onResourceAdd={handleResourceAdd}
          readOnly={!isEditMode}
        />
      </div>
      
      {/* Summary Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total Resources:</span>
              <span className="font-semibold">{resources[activeTab].length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Operational:</span>
              <span className="font-semibold">
                {resources[activeTab].filter(r => r.status === 'green').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Limited:</span>
              <span className="font-semibold">
                {resources[activeTab].filter(r => r.status === 'yellow').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Critical:</span>
              <span className="font-semibold">
                {resources[activeTab].filter(r => r.status === 'red').length}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            💡 Tip: Use arrow keys to navigate, Enter to edit, Tab to move between cells
          </div>
        </div>
      </div>
    </div>
  );
}