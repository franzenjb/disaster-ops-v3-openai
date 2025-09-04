import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../services/eventBus';

export function MassCareServiceLine() {
  const { currentOperation, updateServiceLine } = useOperationStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const massCare = currentOperation?.serviceLines?.distribution || {
    cleanupKits: 0,
    comfortKits: 0,
    emergencySupplies: 0,
    bulkItems: 0,
    distributionSites: 0,
    itemsDistributed: []
  };

  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('distribution', {
      ...massCare,
      [field]: value
    });
    
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'distribution',
      field,
      value,
      timestamp: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
          </svg>
          <h2 className="text-lg font-semibold">Mass Care / Distribution</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{massCare.distributionSites || 0}</span> sites active
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-6">
          
          {/* Line 16-20: Distribution Items */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 mb-3">Distribution Items (Lines 16-20)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 16: Cleanup Kits
                </label>
                <input
                  type="number"
                  value={massCare.cleanupKits || 0}
                  onChange={(e) => handleUpdate('cleanupKits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 17: Comfort Kits
                </label>
                <input
                  type="number"
                  value={massCare.comfortKits || 0}
                  onChange={(e) => handleUpdate('comfortKits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 18: Emergency Supplies
                </label>
                <input
                  type="number"
                  value={massCare.emergencySupplies || 0}
                  onChange={(e) => handleUpdate('emergencySupplies', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 19: Bulk Distribution Items
                </label>
                <input
                  type="number"
                  value={massCare.bulkItems || 0}
                  onChange={(e) => handleUpdate('bulkItems', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Line 21-25: Sites and Operations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sites and Operations (Lines 21-25)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 21: Distribution Sites
                </label>
                <input
                  type="number"
                  value={massCare.distributionSites || 0}
                  onChange={(e) => handleUpdate('distributionSites', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 22: Staff Assigned
                </label>
                <input
                  type="number"
                  value={massCare.distributionStaff || 0}
                  onChange={(e) => handleUpdate('distributionStaff', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 23: Volunteers
                </label>
                <input
                  type="number"
                  value={massCare.distributionVolunteers || 0}
                  onChange={(e) => handleUpdate('distributionVolunteers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 24-25: Total Items Distributed Today
                </label>
                <input
                  type="number"
                  value={massCare.totalItemsToday || 0}
                  onChange={(e) => handleUpdate('totalItemsToday', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-purple-100 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Daily Distribution Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Cleanup Kits:</span>
                  <span className="ml-2 font-bold">{massCare.cleanupKits || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Comfort Kits:</span>
                  <span className="ml-2 font-bold">{massCare.comfortKits || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Emergency Supplies:</span>
                  <span className="ml-2 font-bold">{massCare.emergencySupplies || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Bulk Items:</span>
                  <span className="ml-2 font-bold">{massCare.bulkItems || 0}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <span className="text-gray-600">Total Items Distributed:</span>
                <span className="ml-2 font-bold text-lg text-purple-900">
                  {(massCare.cleanupKits || 0) + (massCare.comfortKits || 0) + 
                   (massCare.emergencySupplies || 0) + (massCare.bulkItems || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distribution Notes
            </label>
            <textarea
              value={massCare.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add any distribution-specific notes, special requests, or issues..."
            />
          </div>
        </div>
      )}
    </div>
  );
}