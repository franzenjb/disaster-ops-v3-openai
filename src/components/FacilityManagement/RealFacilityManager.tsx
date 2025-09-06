/**
 * Real Facility Management System
 * Based on actual V27 IAP data structure
 * Implements the three pillars: Locations, Personnel, Assets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { getAllFacilities } from '@/lib/events/workAssignmentEvents';
import { GapIndicator, InlineGapIndicator } from '@/components/GapIndicator';

interface FacilityManagementProps {
  onNavigate?: (view: string) => void;
}

type DisciplineType = 'sheltering' | 'feeding' | 'government' | 'damage_assessment' | 'distribution' | 'individual_care';

export function RealFacilityManager({ onNavigate }: FacilityManagementProps) {
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<DisciplineType>('sheltering');
  const [customFacilities, setCustomFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDisciplineDropdown, setShowDisciplineDropdown] = useState(false);

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

  // Get discipline display name
  const disciplineNames: Record<DisciplineType, string> = {
    sheltering: 'Sheltering',
    feeding: 'Feeding',
    government: 'Government Operations',
    damage_assessment: 'Damage Assessment',
    distribution: 'Distribution',
    individual_care: 'Individual Disaster Care'
  };

  // Combine V27 data with custom facilities from database
  let baseFacilities: any[] = [];
  switch (activeTab) {
    case 'sheltering':
      baseFacilities = V27_IAP_DATA.shelteringFacilities;
      break;
    case 'feeding':
      baseFacilities = V27_IAP_DATA.feedingFacilities;
      break;
    case 'government':
      baseFacilities = V27_IAP_DATA.governmentFacilities || [];
      break;
    case 'damage_assessment':
      baseFacilities = V27_IAP_DATA.damageAssessmentFacilities || [];
      break;
    case 'distribution':
      baseFacilities = V27_IAP_DATA.distributionFacilities || [];
      break;
    case 'individual_care':
      baseFacilities = V27_IAP_DATA.individualCareFacilities || [];
      break;
  }
    
  // Filter custom facilities by type
  const filteredCustom = customFacilities.filter(f => {
    switch (activeTab) {
      case 'sheltering':
        return f.type === 'shelter' || f.type === 'Standard Shelter';
      case 'feeding':
        return f.type === 'kitchen' || f.type === 'Fixed Feeding Site' || 
               f.type === 'erv' || f.type === 'Mobile Feeding';
      case 'government':
        return f.type === 'eoc' || f.type === 'government';
      case 'damage_assessment':
        return f.type === 'assessment' || f.type === 'damage_assessment';
      case 'distribution':
        return f.type === 'distribution' || f.type === 'warehouse';
      case 'individual_care':
        return f.type === 'reception_center' || f.type === 'individual_care';
      default:
        return false;
    }
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

        {/* Service Line Dropdown Selector */}
        <div className="border-b border-gray-200 mb-6 pb-4">
          <div className="relative inline-block">
            <button
              onClick={() => setShowDisciplineDropdown(!showDisciplineDropdown)}
              className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[250px]"
            >
              <span className="font-medium">{disciplineNames[activeTab]}</span>
              <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showDisciplineDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                {Object.entries(disciplineNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key as DisciplineType);
                      setShowDisciplineDropdown(false);
                      setSelectedFacility(null);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      activeTab === key ? 'bg-red-50 text-red-600' : 'text-gray-700'
                    }`}
                  >
                    {name}
                    <span className="ml-2 text-sm text-gray-500">
                      ({key === 'sheltering' ? V27_IAP_DATA.shelteringFacilities.length :
                        key === 'feeding' ? V27_IAP_DATA.feedingFacilities.length : 0} facilities)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="ml-4 text-sm text-gray-600">
            {facilities.length} total facilities in {disciplineNames[activeTab]}
          </span>
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
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">Gap:</span>
                          <GapIndicator gap={selectedFacility.personnel.gap} size="sm" showLabel={false} />
                          <span className="font-medium">{selectedFacility.personnel.gap}</span>
                        </div>
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
                              <div className="flex items-center justify-center">
                                <InlineGapIndicator gap={position.gap} />
                              </div>
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
                              <div className="flex items-center justify-center">
                                <InlineGapIndicator gap={asset.gap} />
                              </div>
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