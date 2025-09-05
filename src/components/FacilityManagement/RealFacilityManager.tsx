/**
 * Real Facility Management System
 * Based on actual V27 IAP data structure
 * Implements the three pillars: Locations, Personnel, Assets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { getAllFacilities } from '@/lib/events/workAssignmentEvents';

interface FacilityManagementProps {
  onNavigate?: (view: string) => void;
}

export function RealFacilityManager({ onNavigate }: FacilityManagementProps) {
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sheltering' | 'feeding'>('sheltering');
  const [customFacilities, setCustomFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load facilities from database
    const loadFacilities = async () => {
      try {
        const dbFacilities = await getAllFacilities();
        setCustomFacilities(dbFacilities);
      } catch (error) {
        console.error('Error loading facilities:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFacilities();
  }, []);

  // Combine V27 data with custom facilities from database
  const baseFacilities = activeTab === 'sheltering' 
    ? V27_IAP_DATA.shelteringFacilities 
    : V27_IAP_DATA.feedingFacilities;
    
  // Filter custom facilities by type
  const filteredCustom = customFacilities.filter(f => {
    if (activeTab === 'sheltering') {
      return f.type === 'shelter' || f.type === 'Standard Shelter';
    }
    return f.type === 'kitchen' || f.type === 'Fixed Feeding Site' || 
           f.type === 'erv' || f.type === 'Mobile Feeding';
  });
  
  const facilities = [...baseFacilities, ...filteredCustom];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="text-red-600 hover:text-red-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600 mt-2">
            Manage facilities with comprehensive Req/Have/Gap tracking for Personnel and Assets
          </p>
        </div>

        {/* Service Line Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sheltering')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sheltering'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sheltering ({V27_IAP_DATA.shelteringFacilities.length} facilities)
            </button>
            <button
              onClick={() => setActiveTab('feeding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feeding'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Feeding ({V27_IAP_DATA.feedingFacilities.length} facilities)
            </button>
          </nav>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Facilities</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {facilities.map((facility) => {
                  const hasGaps = facility.personnel.gap > 0 || 
                    facility.assets.some((a: any) => a.gap > 0);
                  
                  const isCustom = filteredCustom.some(f => f.id === facility.id);
                  
                  return (
                    <button
                      key={facility.id}
                      onClick={() => setSelectedFacility(facility)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedFacility?.id === facility.id ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {facility.name}
                            </h3>
                            {isCustom && (
                              <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {facility.type} • {facility.county}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs">
                              👥 {facility.personnel.have}/{facility.personnel.required}
                            </span>
                            {activeTab === 'sheltering' && facility.capacity && (
                              <span className="text-xs">
                                🏠 {facility.capacity.current}/{facility.capacity.maximum}
                              </span>
                            )}
                            {activeTab === 'feeding' && facility.mealsPerDay && (
                              <span className="text-xs">
                                🍽️ {facility.mealsPerDay.toLocaleString()} meals/day
                              </span>
                            )}
                          </div>
                        </div>
                        {hasGaps && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Gaps
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add New Facility Button */}
            <button 
              onClick={() => onNavigate?.('work-assignment-create')}
              className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              + Add New {activeTab === 'sheltering' ? 'Shelter' : 'Feeding Site'}
            </button>
          </div>

          {/* Facility Details */}
          <div className="lg:col-span-2">
            {selectedFacility ? (
              <div className="space-y-6">
                {/* Facility Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedFacility.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{selectedFacility.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">County</p>
                      <p className="font-medium">{selectedFacility.county}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedFacility.address}</p>
                    </div>
                    {selectedFacility.capacity && (
                      <div>
                        <p className="text-sm text-gray-500">Occupancy</p>
                        <p className="font-medium">
                          {selectedFacility.capacity.current} / {selectedFacility.capacity.maximum}
                        </p>
                      </div>
                    )}
                    {selectedFacility.mealsPerDay && (
                      <div>
                        <p className="text-sm text-gray-500">Meals Per Day</p>
                        <p className="font-medium">
                          {selectedFacility.mealsPerDay.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personnel Requirements */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Personnel Requirements</h3>
                      <div className="flex space-x-6 text-sm">
                        <span>Required: {selectedFacility.personnel.required}</span>
                        <span className="text-green-600">Have: {selectedFacility.personnel.have}</span>
                        <span className={selectedFacility.personnel.gap > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                          Gap: {selectedFacility.personnel.gap}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Position</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Required</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Have</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Gap</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedFacility.positions.map((position: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{position.title}</p>
                                <p className="text-xs text-gray-500">{position.code}</p>
                              </div>
                            </td>
                            <td className="text-center py-3">
                              <input
                                type="number"
                                value={position.required}
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                onChange={() => {}}
                              />
                            </td>
                            <td className="text-center py-3">
                              <input
                                type="number"
                                value={position.have}
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                onChange={() => {}}
                              />
                            </td>
                            <td className="text-center py-3">
                              <span className={`font-medium ${position.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {position.gap}
                              </span>
                            </td>
                            <td className="text-right py-3">
                              <button className="text-red-600 hover:text-red-800 text-sm">
                                Assign
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <button className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">
                      + Add Position
                    </button>
                  </div>
                </div>

                {/* Asset Requirements */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Asset Requirements</h3>
                  </div>
                  
                  <div className="p-6">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Asset Type</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Unit</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Required</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Have</th>
                          <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedFacility.assets.map((asset: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-3">
                              <p className="text-sm font-medium text-gray-900">{asset.type}</p>
                            </td>
                            <td className="text-center py-3 text-sm text-gray-500">
                              {asset.unit}
                            </td>
                            <td className="text-center py-3">
                              <input
                                type="number"
                                value={asset.required}
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                onChange={() => {}}
                              />
                            </td>
                            <td className="text-center py-3">
                              <input
                                type="number"
                                value={asset.have}
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                onChange={() => {}}
                              />
                            </td>
                            <td className="text-center py-3">
                              <span className={`font-medium ${asset.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {asset.gap}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <button className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">
                      + Add Asset
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Select a facility to view and edit details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}