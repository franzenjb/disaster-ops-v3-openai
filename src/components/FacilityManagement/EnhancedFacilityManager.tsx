/**
 * Enhanced Facility Management System
 * Combines ShelterConsole's excellent layout with comprehensive facility management
 * Features collapsible left sidebar for facility list
 */

'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { getAllFacilities } from '@/lib/events/workAssignmentEvents';

type DisciplineType = 'sheltering' | 'feeding' | 'government' | 'damage_assessment' | 'distribution' | 'individual_care';

interface FacilityAssignment {
  id: string;
  operationalPeriod: string;
  discipline: DisciplineType;
  site: {
    name: string;
    type: string;
    address: string;
    county: string;
    capacity?: number;
  };
  personnel: {
    positions: Array<{
      code: string;
      title: string;
      required: number;
      have: number;
      gap: number;
      dayLead?: string;
      nightLead?: string;
    }>;
  };
  assets: {
    items: Array<{
      code: string;
      name: string;
      unit: string;
      required: number;
      have: number;
      gap: number;
    }>;
  };
  status: 'draft' | 'submitted' | 'approved';
  createdBy: string;
  updatedAt: string;
}

// Standard position templates for each discipline
const POSITION_TEMPLATES: Record<DisciplineType, Array<{code: string; title: string}>> = {
  sheltering: [
    { code: 'SHEL-MN', title: 'Shelter Manager' },
    { code: 'SHEL-SV', title: 'Shelter Supervisor' },
    { code: 'SHEL-SA', title: 'Shelter Associate' },
    { code: 'DHS-MN', title: 'Disaster Health Manager' },
    { code: 'DHS-SV', title: 'Disaster Health Supervisor' },
    { code: 'DMH-MN', title: 'Mental Health Manager' },
    { code: 'DSC-MN', title: 'Spiritual Care Manager' },
  ],
  feeding: [
    { code: 'FEED-MN', title: 'Feeding Manager' },
    { code: 'FEED-SV', title: 'Feeding Supervisor' },
    { code: 'FEED-SA', title: 'Feeding Associate' },
    { code: 'ERV-OP', title: 'ERV Operator' },
    { code: 'ERV-AS', title: 'ERV Assistant' },
    { code: 'KITCH-MN', title: 'Kitchen Manager' },
  ],
  government: [
    { code: 'GOV-LO', title: 'Government Liaison Officer' },
    { code: 'GOV-CO', title: 'Government Coordinator' },
    { code: 'EOC-REP', title: 'EOC Representative' },
    { code: 'PUB-INF', title: 'Public Information Officer' },
  ],
  damage_assessment: [
    { code: 'DA-MN', title: 'Damage Assessment Manager' },
    { code: 'DA-TL', title: 'DA Team Lead' },
    { code: 'DA-AS', title: 'DA Assessor' },
    { code: 'DA-DR', title: 'DA Driver' },
  ],
  distribution: [
    { code: 'DIST-MN', title: 'Distribution Manager' },
    { code: 'DIST-SV', title: 'Distribution Supervisor' },
    { code: 'WARE-MN', title: 'Warehouse Manager' },
    { code: 'WARE-AS', title: 'Warehouse Associate' },
    { code: 'TRANS-CO', title: 'Transportation Coordinator' },
  ],
  individual_care: [
    { code: 'CAS-MN', title: 'Casework Manager' },
    { code: 'CAS-SV', title: 'Casework Supervisor' },
    { code: 'CAS-AS', title: 'Casework Associate' },
    { code: 'RC-MN', title: 'Reception Center Manager' },
    { code: 'RC-AS', title: 'Reception Center Associate' },
  ]
};

// Asset templates for each discipline
const ASSET_TEMPLATES: Record<DisciplineType, Array<{code: string; name: string; unit: string}>> = {
  sheltering: [
    { code: 'COT', name: 'Cots', unit: 'each' },
    { code: 'BLANK', name: 'Blankets', unit: 'each' },
    { code: 'PKIT', name: 'Personal Comfort Kits', unit: 'kit' },
    { code: 'TOWEL', name: 'Towels', unit: 'each' },
    { code: 'SIGNAGE', name: 'Shelter Signage Package', unit: 'set' },
  ],
  feeding: [
    { code: 'ERV', name: 'Emergency Response Vehicle', unit: 'vehicle' },
    { code: 'CAMBRO', name: 'Cambros', unit: 'each' },
    { code: 'COOLER', name: 'Coolers', unit: 'each' },
    { code: 'MEAL', name: 'Prepared Meals', unit: 'meal' },
    { code: 'WATER', name: 'Water (bottles)', unit: 'case' },
  ],
  government: [
    { code: 'LAPTOP', name: 'Laptops', unit: 'each' },
    { code: 'PHONE', name: 'Satellite Phones', unit: 'each' },
    { code: 'RADIO', name: 'Two-Way Radios', unit: 'each' },
  ],
  damage_assessment: [
    { code: 'TABLET', name: 'Assessment Tablets', unit: 'each' },
    { code: 'VEHICLE', name: 'Assessment Vehicles', unit: 'vehicle' },
    { code: 'PPE', name: 'PPE Kits', unit: 'kit' },
    { code: 'CAMERA', name: 'Digital Cameras', unit: 'each' },
  ],
  distribution: [
    { code: 'PALLET', name: 'Pallets', unit: 'each' },
    { code: 'FORKLIFT', name: 'Forklifts', unit: 'each' },
    { code: 'TRUCK', name: 'Box Trucks', unit: 'vehicle' },
    { code: 'CLEANUP', name: 'Cleanup Kits', unit: 'kit' },
  ],
  individual_care: [
    { code: 'FORM', name: 'Case Forms', unit: 'pack' },
    { code: 'TABLET', name: 'Client Tablets', unit: 'each' },
    { code: 'PRINTER', name: 'Mobile Printers', unit: 'each' },
    { code: 'CNA', name: 'Client Assistance Cards', unit: 'card' },
  ]
};

interface EnhancedFacilityManagerProps {
  onNavigate?: (view: string) => void;
}

export function EnhancedFacilityManager({ onNavigate }: EnhancedFacilityManagerProps) {
  const [assignments, setAssignments] = useState<FacilityAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<FacilityAssignment | null>(null);
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>('sheltering');
  const [showDisciplineDropdown, setShowDisciplineDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customFacilities, setCustomFacilities] = useState<any[]>([]);

  const disciplineNames: Record<DisciplineType, string> = {
    sheltering: 'Sheltering',
    feeding: 'Feeding',
    government: 'Government Operations',
    damage_assessment: 'Damage Assessment',
    distribution: 'Distribution',
    individual_care: 'Individual Disaster Care'
  };

  useEffect(() => {
    // Load facilities from database
    const loadFacilities = async () => {
      try {
        const dbFacilities = await getAllFacilities();
        setCustomFacilities(dbFacilities);
      } catch (error) {
        console.error('Error loading facilities:', error);
      }
    };
    loadFacilities();
  }, []);

  // Get facilities for current discipline
  const getFacilitiesForDiscipline = () => {
    let baseFacilities: any[] = [];
    switch (activeDiscipline) {
      case 'sheltering':
        baseFacilities = V27_IAP_DATA.shelteringFacilities || [];
        break;
      case 'feeding':
        baseFacilities = V27_IAP_DATA.feedingFacilities || [];
        break;
      default:
        baseFacilities = [];
    }
    return baseFacilities;
  };

  const facilities = getFacilitiesForDiscipline();

  const handleCreateNew = () => {
    const newAssignment: FacilityAssignment = {
      id: `${activeDiscipline}-${Date.now()}`,
      operationalPeriod: '1',
      discipline: activeDiscipline,
      site: {
        name: '',
        type: activeDiscipline === 'sheltering' ? 'Managed Client Shelter' : 'Standard Site',
        address: '',
        county: '',
        capacity: 0
      },
      personnel: {
        positions: POSITION_TEMPLATES[activeDiscipline].map(pos => ({
          ...pos,
          required: 0,
          have: 0,
          gap: 0
        }))
      },
      assets: {
        items: ASSET_TEMPLATES[activeDiscipline].map(asset => ({
          ...asset,
          required: 0,
          have: 0,
          gap: 0
        }))
      },
      status: 'draft',
      createdBy: 'Current User',
      updatedAt: new Date().toISOString()
    };

    setSelectedAssignment(newAssignment);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (selectedAssignment) {
      if (isCreating) {
        setAssignments([...assignments, selectedAssignment]);
      } else {
        setAssignments(assignments.map(a => 
          a.id === selectedAssignment.id ? selectedAssignment : a
        ));
      }
      setIsCreating(false);
    }
  };

  const updatePersonnel = (index: number, field: 'required' | 'have', value: number) => {
    if (selectedAssignment) {
      const updated = { ...selectedAssignment };
      updated.personnel.positions[index][field] = value;
      updated.personnel.positions[index].gap = 
        updated.personnel.positions[index].required - updated.personnel.positions[index].have;
      setSelectedAssignment(updated);
    }
  };

  const updateAsset = (index: number, field: 'required' | 'have', value: number) => {
    if (selectedAssignment) {
      const updated = { ...selectedAssignment };
      updated.assets.items[index][field] = value;
      updated.assets.items[index].gap = 
        updated.assets.items[index].required - updated.assets.items[index].have;
      setSelectedAssignment(updated);
    }
  };

  const totalPersonnelGap = selectedAssignment?.personnel.positions.reduce(
    (sum, pos) => sum + Math.max(0, pos.gap), 0
  ) || 0;

  const totalAssetGaps = selectedAssignment?.assets.items.filter(
    item => item.gap > 0
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Left Sidebar */}
      <div className={`flex-shrink-0 transition-all duration-300 h-screen sticky top-0 ${
        sidebarOpen ? 'w-80 bg-white shadow-lg' : 'w-12 bg-green-600 shadow-xl'
      }`}>
        <div className={`p-4 border-b flex justify-between items-center ${
          !sidebarOpen ? 'bg-green-700' : ''
        }`}>
          <h3 className={`font-bold text-gray-900 ${!sidebarOpen && 'hidden'}`}>
            Facilities
          </h3>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${
              sidebarOpen 
                ? 'text-gray-500 hover:text-gray-700' 
                : 'text-white hover:text-gray-200'
            }`}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {sidebarOpen && (
          <div className="flex flex-col h-full">
            {/* Discipline Dropdown - Now in sidebar */}
            <div className="p-4 border-b">
              <div className="relative">
                <button
                  onClick={() => setShowDisciplineDropdown(!showDisciplineDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <span className="font-medium text-sm">{disciplineNames[activeDiscipline]}</span>
                  <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showDisciplineDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    {Object.entries(disciplineNames).map(([key, name]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveDiscipline(key as DisciplineType);
                          setShowDisciplineDropdown(false);
                          setSelectedAssignment(null);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                          activeDiscipline === key ? 'bg-red-50 text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2 block">
                {facilities.length} facilities
              </span>
            </div>
            
            {/* Facility List */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {facilities.map((facility: any) => (
                <button
                  key={facility.id || facility.name}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 border border-gray-200"
                  onClick={() => {
                    // Load or create assignment for this facility
                    const existing = assignments.find(a => 
                      a.site.name === facility.name
                    );
                    if (existing) {
                      setSelectedAssignment(existing);
                    } else {
                      // Create new from facility
                      handleCreateNew();
                    }
                  }}
                >
                  <div className="font-medium">{facility.name}</div>
                  <div className="text-sm text-gray-600">{facility.county}</div>
                  {facility.capacity && (
                    <div className="text-sm text-gray-500">
                      Capacity: {typeof facility.capacity === 'object' 
                        ? `${facility.capacity.current || 0}/${facility.capacity.maximum || 0}`
                        : facility.capacity}
                    </div>
                  )}
                </button>
              ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Using ShelterConsole Layout */}
      <div className="flex-1 overflow-x-auto">
        <div className="px-6 lg:px-8 py-6 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="text-red-600 hover:text-red-800 flex items-center mb-4"
            >
              ← Back to Dashboard
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive work assignment management with gaps and assets
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Create New {disciplineNames[activeDiscipline]} Assignment
            </button>
            
            {selectedAssignment && (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Assignment
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Main Form Area - ShelterConsole Style */}
          {selectedAssignment ? (
            <div className="space-y-6 w-full">
              {/* Site Information */}
              <div className="bg-white shadow rounded-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-4">Site Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Site Name</label>
                    <input
                      type="text"
                      value={selectedAssignment.site.name}
                      onChange={(e) => setSelectedAssignment({
                        ...selectedAssignment,
                        site: { ...selectedAssignment.site, name: e.target.value }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={selectedAssignment.site.type}
                      onChange={(e) => setSelectedAssignment({
                        ...selectedAssignment,
                        site: { ...selectedAssignment.site, type: e.target.value }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option>Standard Site</option>
                      <option>Managed Client Shelter</option>
                      <option>Partner Managed</option>
                      <option>Mobile Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      value={selectedAssignment.site.address}
                      onChange={(e) => setSelectedAssignment({
                        ...selectedAssignment,
                        site: { ...selectedAssignment.site, address: e.target.value }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">County</label>
                    <input
                      type="text"
                      value={selectedAssignment.site.county}
                      onChange={(e) => setSelectedAssignment({
                        ...selectedAssignment,
                        site: { ...selectedAssignment.site, county: e.target.value }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personnel Requirements */}
              <div className="bg-white shadow rounded-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-4">
                  Personnel Requirements
                  {totalPersonnelGap > 0 && (
                    <span className="ml-2 text-red-600">({totalPersonnelGap} gaps)</span>
                  )}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Have
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gap
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedAssignment.personnel.positions.map((position, index) => (
                        <tr key={position.code} className={position.gap > 0 ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{position.title}</div>
                            <div className="text-sm text-gray-500">{position.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={position.required}
                              onChange={(e) => updatePersonnel(index, 'required', parseInt(e.target.value) || 0)}
                              className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={position.have}
                              onChange={(e) => updatePersonnel(index, 'have', parseInt(e.target.value) || 0)}
                              className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-sm font-medium ${position.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {position.gap}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Asset Requirements */}
              <div className="bg-white shadow rounded-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-4">
                  Asset Requirements
                  {totalAssetGaps > 0 && (
                    <span className="ml-2 text-red-600">({totalAssetGaps} gaps)</span>
                  )}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Have
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gap
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedAssignment.assets.items.map((asset, index) => (
                        <tr key={asset.code} className={asset.gap > 0 ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {asset.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={asset.required}
                              onChange={(e) => updateAsset(index, 'required', parseInt(e.target.value) || 0)}
                              className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={asset.have}
                              onChange={(e) => updateAsset(index, 'have', parseInt(e.target.value) || 0)}
                              className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-sm font-medium ${asset.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {asset.gap}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                Select a facility from the sidebar or create a new assignment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}