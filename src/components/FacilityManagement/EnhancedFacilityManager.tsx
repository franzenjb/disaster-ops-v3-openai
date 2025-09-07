/**
 * Enhanced Facility Management System
 * Combines ShelterConsole's excellent layout with comprehensive facility management
 * Features collapsible left sidebar for facility list
 */

'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { useFacilities } from '@/hooks/useMasterData';

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
    possibleOccupancy?: number;
    actualOccupancy?: number;
  };
  personnel: {
    positions: Array<{
      code: string;
      title: string;
      recommended: number;
      required: number;
      have: number;
      gap: number;
      surplus: number;
      dayLead?: string;
      nightLead?: string;
    }>;
  };
  assets: {
    items: Array<{
      code: string;
      name: string;
      unit: string;
      recommended: number;
      required: number;
      have: number;
      gap: number;
      surplus: number;
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

// Red Cross staffing formulas based on occupancy
const STAFFING_FORMULAS: Record<string, (occupancy: number) => number> = {
  // Shelter Manager: 1 per 250 people (minimum 1)
  'SHEL-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 250)),
  // Shelter Supervisor: 1 per 100 people (minimum 1)
  'SHEL-SV': (occupancy) => Math.max(1, Math.ceil(occupancy / 100)),
  // Shelter Associate: 1 per 30 people (minimum 2)
  'SHEL-SA': (occupancy) => Math.max(2, Math.ceil(occupancy / 30)),
  // Disaster Health Manager: 1 per 500 people (minimum 1 if health services)
  'DHS-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 500)),
  // Disaster Health Supervisor: 1 per 200 people
  'DHS-SV': (occupancy) => Math.ceil(occupancy / 200),
  // Mental Health Manager: 1 per 1000 people
  'DMH-MN': (occupancy) => Math.ceil(occupancy / 1000),
  // Spiritual Care Manager: 1 per 1000 people
  'DSC-MN': (occupancy) => Math.ceil(occupancy / 1000),
  
  // Feeding positions based on meals served (assume 3 meals per person per day)
  'FEED-MN': (occupancy) => Math.max(1, Math.ceil((occupancy * 3) / 1000)),
  'FEED-SV': (occupancy) => Math.max(1, Math.ceil((occupancy * 3) / 500)),
  'FEED-SA': (occupancy) => Math.max(2, Math.ceil((occupancy * 3) / 150)),
  'ERV-OP': (occupancy) => Math.ceil((occupancy * 3) / 300),
  'ERV-AS': (occupancy) => Math.ceil((occupancy * 3) / 300),
  'KITCH-MN': (occupancy) => Math.max(1, Math.ceil((occupancy * 3) / 800)),
  
  // Government positions - typically fixed regardless of size
  'GOV-LO': () => 1,
  'GOV-CO': () => 1,
  'EOC-REP': () => 1,
  'PUB-INF': () => 1,
  
  // Damage Assessment - based on area served, not occupancy
  'DA-MN': () => 1,
  'DA-TL': () => 2,
  'DA-AS': () => 4,
  'DA-DR': () => 2,
  
  // Distribution based on people served
  'DIST-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 500)),
  'DIST-SV': (occupancy) => Math.max(1, Math.ceil(occupancy / 200)),
  'WARE-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 1000)),
  'WARE-AS': (occupancy) => Math.max(2, Math.ceil(occupancy / 300)),
  'TRANS-CO': (occupancy) => Math.max(1, Math.ceil(occupancy / 800)),
  
  // Individual Care based on caseload
  'CAS-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 200)),
  'CAS-SV': (occupancy) => Math.max(1, Math.ceil(occupancy / 100)),
  'CAS-AS': (occupancy) => Math.max(2, Math.ceil(occupancy / 50)),
  'RC-MN': (occupancy) => Math.max(1, Math.ceil(occupancy / 300)),
  'RC-AS': (occupancy) => Math.max(2, Math.ceil(occupancy / 100)),
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use the proper hook for facility data
  const { 
    facilities: dbFacilities, 
    addFacility, 
    updateFacility,
    loading: facilitiesLoading,
    error: facilitiesError
  } = useFacilities('demo-op');

  const disciplineNames: Record<DisciplineType, string> = {
    sheltering: 'Sheltering',
    feeding: 'Feeding',
    government: 'Government Operations',
    damage_assessment: 'Damage Assessment',
    distribution: 'Distribution',
    individual_care: 'Individual Disaster Care'
  };

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
    // Add database facilities for this discipline
    const disciplineFacilities = dbFacilities.filter(f => 
      f.facility_type === activeDiscipline || 
      (activeDiscipline === 'sheltering' && f.facility_type === 'shelter') ||
      (activeDiscipline === 'individual_care' && f.facility_type === 'care')
    );
    
    return [...baseFacilities, ...disciplineFacilities];
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
        capacity: 0,
        possibleOccupancy: 0,
        actualOccupancy: 0
      },
      personnel: {
        positions: POSITION_TEMPLATES[activeDiscipline].map(pos => ({
          ...pos,
          recommended: STAFFING_FORMULAS[pos.code]?.(0) || 0,
          required: 0,
          have: 0,
          gap: 0,
          surplus: 0
        }))
      },
      assets: {
        items: ASSET_TEMPLATES[activeDiscipline].map(asset => ({
          ...asset,
          recommended: 0,
          required: 0,
          have: 0,
          gap: 0,
          surplus: 0
        }))
      },
      status: 'draft',
      createdBy: 'Current User',
      updatedAt: new Date().toISOString()
    };

    setSelectedAssignment(newAssignment);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!selectedAssignment) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      // Convert assignment to facility format for database
      const facilityData = {
        operation_id: 'demo-op',
        facility_type: activeDiscipline === 'sheltering' ? 'shelter' : 
                      activeDiscipline === 'individual_care' ? 'care' :
                      activeDiscipline as 'feeding' | 'government' | 'distribution' | 'assessment',
        name: selectedAssignment.site.name,
        address: selectedAssignment.site.address,
        county: selectedAssignment.site.county,
        status: 'open' as const,
        capacity: {
          maximum: selectedAssignment.site.possibleOccupancy || 0,
          current: selectedAssignment.site.actualOccupancy || 0,
          available: Math.max(0, (selectedAssignment.site.possibleOccupancy || 0) - (selectedAssignment.site.actualOccupancy || 0))
        },
        special_notes: `Personnel Gaps: ${selectedAssignment.personnel.positions.filter(p => p.gap > 0).length}`,
        created_by: 'current-user'
      };

      if (isCreating) {
        // Add new facility to database
        const newId = await addFacility(facilityData);
        console.log('Facility created successfully with ID:', newId);
        
        // Update local state
        const updatedAssignment = { ...selectedAssignment, id: newId };
        setAssignments([...assignments, updatedAssignment]);
      } else {
        // Update existing facility
        const facilityToUpdate = {
          ...facilityData,
          id: selectedAssignment.id
        };
        await updateFacility(facilityToUpdate);
        console.log('Facility updated successfully');
        
        // Update local state
        setAssignments(assignments.map(a => 
          a.id === selectedAssignment.id ? selectedAssignment : a
        ));
      }
      
      setIsCreating(false);
      setSaveError(null);
      
    } catch (error) {
      console.error('Error saving facility:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save facility');
    } finally {
      setSaving(false);
    }
  };

  // Function to recalculate recommendations based on occupancy
  const updateRecommendations = (assignment: FacilityAssignment) => {
    const occupancy = assignment.site.actualOccupancy || assignment.site.possibleOccupancy || 0;
    
    // Update personnel recommendations
    assignment.personnel.positions = assignment.personnel.positions.map(pos => ({
      ...pos,
      recommended: STAFFING_FORMULAS[pos.code]?.(occupancy) || 0
    }));
    
    return assignment;
  };

  const updatePersonnel = (index: number, field: 'required' | 'have', value: number) => {
    if (selectedAssignment) {
      const updated = { ...selectedAssignment };
      updated.personnel.positions[index][field] = value;
      const position = updated.personnel.positions[index];
      position.gap = Math.max(0, position.required - position.have);
      position.surplus = Math.max(0, position.have - position.required);
      setSelectedAssignment(updated);
    }
  };

  const updateAsset = (index: number, field: 'required' | 'have', value: number) => {
    if (selectedAssignment) {
      const updated = { ...selectedAssignment };
      updated.assets.items[index][field] = value;
      const asset = updated.assets.items[index];
      asset.gap = Math.max(0, asset.required - asset.have);
      asset.surplus = Math.max(0, asset.have - asset.required);
      setSelectedAssignment(updated);
    }
  };

  const updateOccupancy = (field: 'possibleOccupancy' | 'actualOccupancy', value: number) => {
    if (selectedAssignment) {
      const updated = { ...selectedAssignment };
      updated.site[field] = value;
      const updatedWithRecommendations = updateRecommendations(updated);
      setSelectedAssignment(updatedWithRecommendations);
    }
  };

  // Function to render gap/surplus icon with larger numbers
  const renderGapSurplusIcon = (gap: number, surplus: number) => {
    if (gap > 0) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
            {gap}
          </div>
        </div>
      );
    } else if (surplus > 0) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
            +{surplus}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
            0
          </div>
        </div>
      );
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
              disabled={facilitiesLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              Create New {disciplineNames[activeDiscipline]} Assignment
            </button>
            
            {selectedAssignment && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || facilitiesLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Assignment'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignment(null);
                    setIsCreating(false);
                    setSaveError(null);
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Error Messages */}
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="text-red-700">
                  <strong>Error saving facility:</strong> {saveError}
                </div>
              </div>
            </div>
          )}

          {facilitiesError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="text-yellow-700">
                  <strong>Database connection issue:</strong> {facilitiesError.message}
                </div>
              </div>
            </div>
          )}

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
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Possible Occupancy</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedAssignment.site.possibleOccupancy || ''}
                      placeholder="0"
                      onChange={(e) => updateOccupancy('possibleOccupancy', parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Actual Occupancy</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedAssignment.site.actualOccupancy || ''}
                      placeholder="0"
                      onChange={(e) => updateOccupancy('actualOccupancy', parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full px-3 py-2 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                          Recommended
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Required
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Have
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gap/Surplus
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
                            <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              {position.recommended}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={position.required || ''}
                              placeholder="0"
                              onChange={(e) => updatePersonnel(index, 'required', parseInt(e.target.value) || 0)}
                              className="w-24 text-center px-2 py-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              min="0"
                              value={position.have || ''}
                              placeholder="0"
                              onChange={(e) => updatePersonnel(index, 'have', parseInt(e.target.value) || 0)}
                              className="w-24 text-center px-2 py-1 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {renderGapSurplusIcon(position.gap, position.surplus)}
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