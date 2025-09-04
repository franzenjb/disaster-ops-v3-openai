import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../services/eventBus';

export function LogisticsServiceLine() {
  const { currentOperation, updateServiceLine } = useOperationStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const logistics = currentOperation?.serviceLines?.logistics || {
    totalStaff: 0,
    totalVolunteers: 0,
    ervCount: 0,
    vehiclesDeployed: 0,
    warehousesOpen: 0,
    inventoryValue: 0
  };

  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('logistics', {
      ...logistics,
      [field]: value
    });
    
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'logistics',
      field,
      value,
      timestamp: Date.now()
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2h1a2 2 0 012 2v4a2 2 0 01-2 2H9v-1a1 1 0 00-2 0v1H5a2 2 0 01-2-2v-4a2 2 0 012-2h1a2 2 0 002-2V5z" clipRule="evenodd"/>
          </svg>
          <h2 className="text-lg font-semibold">Logistics & Staffing</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{(logistics.totalStaff || 0) + (logistics.totalVolunteers || 0)}</span> personnel
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
          
          {/* Line 57-59: Staffing */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3">Personnel (Lines 57-59)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 57: Total Staff
                </label>
                <input
                  type="number"
                  value={logistics.totalStaff || 0}
                  onChange={(e) => handleUpdate('totalStaff', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-1 text-xs text-gray-500">Paid staff members</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 58: Total Volunteers
                </label>
                <input
                  type="number"
                  value={logistics.totalVolunteers || 0}
                  onChange={(e) => handleUpdate('totalVolunteers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-1 text-xs text-gray-500">Volunteer workers</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 59: Total Personnel
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md font-semibold">
                  {(logistics.totalStaff || 0) + (logistics.totalVolunteers || 0)}
                </div>
                <div className="mt-1 text-xs text-gray-500">Auto-calculated total</div>
              </div>
            </div>
          </div>

          {/* Line 60-62: Vehicles & Equipment */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-orange-900 mb-3">Vehicles & Equipment (Lines 60-62)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 60: ERV Count
                </label>
                <input
                  type="number"
                  value={logistics.ervCount || 0}
                  onChange={(e) => handleUpdate('ervCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="mt-1 text-xs text-gray-500">Emergency Response Vehicles</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 61: Vehicles Deployed
                </label>
                <input
                  type="number"
                  value={logistics.vehiclesDeployed || 0}
                  onChange={(e) => handleUpdate('vehiclesDeployed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="mt-1 text-xs text-gray-500">All vehicle types</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 62: Equipment Units
                </label>
                <input
                  type="number"
                  value={logistics.equipmentUnits || 0}
                  onChange={(e) => handleUpdate('equipmentUnits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="mt-1 text-xs text-gray-500">Major equipment pieces</div>
              </div>
            </div>
          </div>

          {/* Line 63-65: Warehousing & Inventory */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Warehousing & Inventory (Lines 63-65)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 63: Warehouses Open
                </label>
                <input
                  type="number"
                  value={logistics.warehousesOpen || 0}
                  onChange={(e) => handleUpdate('warehousesOpen', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 64-65: Inventory Value ($)
                </label>
                <input
                  type="number"
                  value={logistics.inventoryValue || 0}
                  onChange={(e) => handleUpdate('inventoryValue', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="0"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Total value: {formatCurrency(logistics.inventoryValue || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Dashboard */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-indigo-50 to-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Logistics Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <svg className="w-6 h-6 text-indigo-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  <div className="text-2xl font-bold text-indigo-600">
                    {logistics.totalStaff || 0}
                  </div>
                  <div className="text-xs text-gray-600">Staff</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                  <div className="text-2xl font-bold text-green-600">
                    {logistics.totalVolunteers || 0}
                  </div>
                  <div className="text-xs text-gray-600">Volunteers</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <svg className="w-6 h-6 text-orange-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                  <div className="text-2xl font-bold text-orange-600">
                    {logistics.ervCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">ERVs</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                  <div className="text-2xl font-bold text-purple-600">
                    {logistics.warehousesOpen || 0}
                  </div>
                  <div className="text-xs text-gray-600">Warehouses</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <svg className="w-6 h-6 text-gray-500 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                  </svg>
                  <div className="text-lg font-bold text-gray-700">
                    {formatCurrency(logistics.inventoryValue || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Inventory</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm text-gray-600">Total Vehicles:</span>
                    <span className="ml-2 font-bold text-lg">
                      {(logistics.ervCount || 0) + (logistics.vehiclesDeployed || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Personnel:</span>
                    <span className="ml-2 font-bold text-lg text-indigo-600">
                      {(logistics.totalStaff || 0) + (logistics.totalVolunteers || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logistics Notes
            </label>
            <textarea
              value={logistics.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add logistics notes, equipment needs, staffing issues, supply chain updates..."
            />
          </div>
        </div>
      )}
    </div>
  );
}