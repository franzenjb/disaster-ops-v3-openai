/**
 * SIMPLE TABLES HUB - Direct Data Access
 * 
 * Bypasses all IndexedDB complexity and directly displays permanent database content
 * Shows 32 personnel, 25 assets, 27 gaps immediately
 */

'use client';

import React, { useState } from 'react';
import { useDirectData } from '@/hooks/useDirectData';

// Safe render helper to handle any data type
const safeRender = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function SimpleTablesHub() {
  const [selectedTable, setSelectedTable] = useState<string>('facilities');
  const data = useDirectData();

  const tables = [
    {
      id: 'facilities',
      name: 'Facilities & Locations',
      icon: '🏢',
      description: 'All facilities: shelters, feeding, government, distribution, care, assessment',
      count: data.counts.facilities,
      data: data.facilities
    },
    {
      id: 'personnel',
      name: 'Personnel Roster',
      icon: '👥', 
      description: 'All operation personnel and contact information',
      count: data.counts.personnel,
      data: data.personnel
    },
    {
      id: 'gaps',
      name: 'Gap Analysis',
      icon: '⚠️',
      description: 'All Red Cross gaps: personnel, equipment, supplies, vehicles, space',
      count: data.counts.gaps,
      data: data.gaps
    },
    {
      id: 'assets',
      name: 'Assets & Resources',
      icon: '📋',
      description: 'All vehicles, equipment, and supplies (single unified table)',
      count: data.counts.assets,
      data: data.assets
    }
  ];

  const selectedTableData = tables.find(t => t.id === selectedTable);

  if (!data.loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📊 Tables & Data Hub</h2>
              <p className="text-gray-600 mt-1">Single Source of Truth - Master Database</p>
            </div>
          </div>
          
          <input
            type="text"
            placeholder="Search tables..."
            className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Table Categories */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedTable === table.id
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{table.icon}</span>
                      <div>
                        <h3 className="font-medium">{table.name}</h3>
                        <span className="text-2xl font-bold text-green-600">{table.count}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{table.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedTableData?.icon} {selectedTableData?.name}
                    </h1>
                    <p className="text-gray-600">{selectedTableData?.description}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      📥 Import CSV
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      📤 Export CSV
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                      ✏️ Edit Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                {selectedTableData?.count === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No {selectedTableData.name.toLowerCase()} found.</p>
                    <button className="mt-2 text-red-600 hover:text-red-800">
                      Create your first {selectedTableData.name.toLowerCase().slice(0, -1)}
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {selectedTable === 'personnel' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        )}
                        {selectedTable === 'assets' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        )}
                        {selectedTable === 'gaps' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          </>
                        )}
                        {selectedTable === 'facilities' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTableData?.data?.slice(0, 50).map((item: any, index: number) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          {selectedTable === 'personnel' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{safeRender(item.name)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.position)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.section)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.phone)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.region)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'available' ? 'bg-green-100 text-green-800' :
                                  item.status === 'deployed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                          {selectedTable === 'assets' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{safeRender(item.name)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.type)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.category)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.quantity)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.location)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {safeRender(item.status, 'unknown')}
                                </span>
                              </td>
                            </>
                          )}
                          {selectedTable === 'gaps' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{safeRender(item.name)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.type)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {safeRender(item.priority)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{safeRender(item.description).slice(0, 100)}...</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.standard)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${safeRender(item.cost, '0')}</td>
                            </>
                          )}
                          {selectedTable === 'facilities' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{safeRender(item.name, 'New Facility')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.type, 'Shelter')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.county, 'TBD')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.address, 'TBD')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.capacity, '0')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{safeRender(item.status, 'Active')}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {selectedTableData && selectedTableData.count > 50 && (
                  <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600">
                    Showing first 50 of {selectedTableData.count} records
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}