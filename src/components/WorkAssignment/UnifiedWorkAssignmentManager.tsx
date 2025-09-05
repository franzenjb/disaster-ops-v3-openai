'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface WorkAssignment {
  id: string;
  discipline: 'Shelter' | 'Feeding' | 'Distribution' | 'Health Services' | 'Logistics' | 'Staff Services';
  operationalPeriod: string;
  site: {
    name: string;
    type: string;
    address: string;
    county: string;
    capacity?: number;
  };
  personnel: Array<{
    code: string;
    title: string;
    required: number;
    have: number;
    gap: number;
    dayLead?: string;
    nightLead?: string;
  }>;
  assets: Array<{
    code: string;
    name: string;
    unit: string;
    required: number;
    have: number;
    gap: number;
  }>;
  status: 'draft' | 'submitted' | 'approved';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Position templates by discipline
const POSITION_TEMPLATES = {
  Shelter: [
    { code: 'SHEL-MN', title: 'Shelter Manager' },
    { code: 'SHEL-SV', title: 'Shelter Supervisor' },
    { code: 'SHEL-SA', title: 'Shelter Associate' },
    { code: 'DHS-SA', title: 'Health Services Associate' },
    { code: 'DMH-SA', title: 'Mental Health Associate' },
  ],
  Feeding: [
    { code: 'MC-MN', title: 'Kitchen Manager' },
    { code: 'MC-SV', title: 'Kitchen Supervisor' },
    { code: 'MC-SA', title: 'Food Service Worker' },
    { code: 'ERV-TL', title: 'ERV Team Lead' },
    { code: 'ERV-DR', title: 'ERV Driver' },
  ],
  Distribution: [
    { code: 'DIST-MN', title: 'Distribution Manager' },
    { code: 'DIST-SV', title: 'Distribution Supervisor' },
    { code: 'DIST-SA', title: 'Distribution Associate' },
    { code: 'LOG-DR', title: 'Truck Driver' },
  ],
  'Health Services': [
    { code: 'DHS-MN', title: 'Health Services Manager' },
    { code: 'DHS-RN', title: 'Registered Nurse' },
    { code: 'DMH-MN', title: 'Mental Health Manager' },
    { code: 'DMH-CO', title: 'Mental Health Counselor' },
  ],
  Logistics: [
    { code: 'LOG-MN', title: 'Logistics Manager' },
    { code: 'LOG-SV', title: 'Logistics Supervisor' },
    { code: 'WARE-MN', title: 'Warehouse Manager' },
    { code: 'WARE-SA', title: 'Warehouse Associate' },
  ],
  'Staff Services': [
    { code: 'STAFF-MN', title: 'Staff Services Manager' },
    { code: 'STAFF-CO', title: 'Staff Coordinator' },
    { code: 'STAFF-SA', title: 'Staff Services Associate' },
  ],
};

// Asset templates by discipline
const ASSET_TEMPLATES = {
  Shelter: [
    { code: 'COT-STD', name: 'Cots - Standard', unit: 'Each' },
    { code: 'BLANK', name: 'Blankets', unit: 'Each' },
    { code: 'COMF-KIT', name: 'Comfort Kits', unit: 'Each' },
    { code: 'CLEAN-KIT', name: 'Cleaning Kits', unit: 'Each' },
  ],
  Feeding: [
    { code: 'MEAL-HOT', name: 'Hot Meals', unit: 'Meals/Day' },
    { code: 'MEAL-SNK', name: 'Snacks', unit: 'Units/Day' },
    { code: 'WATER', name: 'Water', unit: 'Cases' },
    { code: 'ERV', name: 'Emergency Response Vehicle', unit: 'Each' },
  ],
  Distribution: [
    { code: 'CLEAN-UP', name: 'Clean-up Kits', unit: 'Each' },
    { code: 'TARP', name: 'Tarps', unit: 'Each' },
    { code: 'COOLER', name: 'Coolers', unit: 'Each' },
  ],
  'Health Services': [
    { code: 'FIRST-AID', name: 'First Aid Kits', unit: 'Each' },
    { code: 'MED-SUP', name: 'Medical Supplies', unit: 'Cases' },
    { code: 'PPE', name: 'PPE Sets', unit: 'Each' },
  ],
  Logistics: [
    { code: 'TRUCK-26', name: '26ft Box Truck', unit: 'Each' },
    { code: 'FORKLIFT', name: 'Forklift', unit: 'Each' },
    { code: 'PALLET', name: 'Pallets', unit: 'Each' },
  ],
  'Staff Services': [
    { code: 'RADIO', name: 'Two-way Radios', unit: 'Each' },
    { code: 'LAPTOP', name: 'Laptops', unit: 'Each' },
    { code: 'BADGE', name: 'ID Badges', unit: 'Each' },
  ],
};

interface Props {
  onNavigate?: (view: string) => void;
}

export function UnifiedWorkAssignmentManager({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<WorkAssignment['discipline']>('Shelter');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(true);
  
  // Form state
  const [siteName, setSiteName] = useState('');
  const [siteType, setSiteType] = useState('');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [capacity, setCapacity] = useState('');
  const [personnel, setPersonnel] = useState<WorkAssignment['personnel']>([]);
  const [assets, setAssets] = useState<WorkAssignment['assets']>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<WorkAssignment['status']>('draft');

  // Load facilities on mount and when tab changes
  useEffect(() => {
    loadFacilities();
  }, [activeTab]);

  const loadFacilities = () => {
    // Get facilities from simpleStore
    const storedFacilities = simpleStore.getFacilities();
    
    // Combine with V27 data based on active tab
    let v27Data: any[] = [];
    if (activeTab === 'Shelter') {
      v27Data = V27_IAP_DATA.shelteringFacilities;
    } else if (activeTab === 'Feeding') {
      v27Data = V27_IAP_DATA.feedingFacilities;
    }
    
    // Filter stored facilities by discipline
    const filteredStored = storedFacilities.filter((f: any) => {
      // Map facility types to disciplines
      if (activeTab === 'Shelter' && (f.type?.includes('Shelter') || f.type?.includes('shelter'))) return true;
      if (activeTab === 'Feeding' && (f.type?.includes('Feeding') || f.type?.includes('Kitchen') || f.type?.includes('ERV'))) return true;
      if (activeTab === 'Distribution' && f.type?.includes('Distribution')) return true;
      if (activeTab === 'Health Services' && f.type?.includes('Health')) return true;
      if (activeTab === 'Logistics' && (f.type?.includes('Warehouse') || f.type?.includes('Logistics'))) return true;
      if (activeTab === 'Staff Services' && f.type?.includes('Staff')) return true;
      return false;
    });
    
    setFacilities([...v27Data, ...filteredStored]);
  };

  // Initialize form with templates
  useEffect(() => {
    const positions = POSITION_TEMPLATES[activeTab].map(p => ({
      ...p,
      required: 0,
      have: 0,
      gap: 0
    }));
    setPersonnel(positions);
    
    const assetList = ASSET_TEMPLATES[activeTab].map(a => ({
      ...a,
      required: 0,
      have: 0,
      gap: 0
    }));
    setAssets(assetList);
    
    // Set default site type based on discipline
    if (activeTab === 'Shelter') setSiteType('Standard Shelter');
    else if (activeTab === 'Feeding') setSiteType('Fixed Feeding Site');
    else if (activeTab === 'Distribution') setSiteType('Distribution Center');
    else if (activeTab === 'Health Services') setSiteType('Health Services Site');
    else if (activeTab === 'Logistics') setSiteType('Warehouse');
    else if (activeTab === 'Staff Services') setSiteType('Staff Center');
  }, [activeTab]);

  const handlePersonnelUpdate = (index: number, field: 'required' | 'have', value: string) => {
    const updated = [...personnel];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value) || 0,
      gap: field === 'required' 
        ? (parseInt(value) || 0) - updated[index].have
        : updated[index].required - (parseInt(value) || 0)
    };
    setPersonnel(updated);
  };

  const handleAssetUpdate = (index: number, field: 'required' | 'have', value: string) => {
    const updated = [...assets];
    updated[index] = {
      ...updated[index],
      [field]: parseInt(value) || 0,
      gap: field === 'required'
        ? (parseInt(value) || 0) - updated[index].have
        : updated[index].required - (parseInt(value) || 0)
    };
    setAssets(updated);
  };

  const handleSelectFacility = (facility: any) => {
    setSelectedFacility(facility);
    setIsCreating(false);
    
    // Populate form with facility data
    setSiteName(facility.name);
    setSiteType(facility.type);
    setAddress(facility.address || '');
    setCounty(facility.county);
    setCapacity(facility.capacity?.maximum || facility.capacity || '');
    
    // If facility has personnel data, use it
    if (facility.positions) {
      setPersonnel(facility.positions);
    }
    if (facility.assets) {
      setAssets(facility.assets);
    }
    setNotes(facility.notes || '');
    setStatus(facility.status || 'draft');
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedFacility(null);
    // Reset form
    setSiteName('');
    setAddress('');
    setCounty('');
    setCapacity('');
    setNotes('');
    setStatus('draft');
    
    // Reset to templates
    const positions = POSITION_TEMPLATES[activeTab].map(p => ({
      ...p,
      required: 0,
      have: 0,
      gap: 0
    }));
    setPersonnel(positions);
    
    const assetList = ASSET_TEMPLATES[activeTab].map(a => ({
      ...a,
      required: 0,
      have: 0,
      gap: 0
    }));
    setAssets(assetList);
  };

  const handleSave = () => {
    const assignment: any = {
      discipline: activeTab,
      operationalPeriod: new Date().toISOString().split('T')[0],
      site: {
        name: siteName,
        type: siteType,
        address,
        county,
        capacity: parseInt(capacity) || 0
      },
      personnel,
      assets,
      status,
      notes
    };

    if (isCreating) {
      // Create new facility
      simpleStore.createFacility({
        name: siteName,
        type: siteType,
        address,
        county,
        positions: personnel as any,
        assets: assets as any,
        notes
      } as any);
      alert('Work Assignment created successfully!');
    } else {
      // Update existing facility
      if (selectedFacility?.id) {
        simpleStore.updateFacility(selectedFacility.id, {
          name: siteName,
          type: siteType,
          address,
          county,
          positions: personnel as any,
          assets: assets as any,
          notes
        } as any);
        alert('Work Assignment updated successfully!');
      }
    }
    
    loadFacilities();
    handleCreateNew();
  };

  const getTotalGaps = () => {
    const personnelGap = personnel.reduce((sum, p) => sum + p.gap, 0);
    const assetGap = assets.filter(a => a.gap > 0).length;
    return { personnelGap, assetGap };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="text-white hover:text-gray-200 flex items-center mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Work Assignment Management</h1>
          <p className="text-red-100">Create and manage work assignments across all disciplines</p>
        </div>
      </div>

      {/* Discipline Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-4 overflow-x-auto">
            {Object.keys(POSITION_TEMPLATES).map((discipline) => (
              <button
                key={discipline}
                onClick={() => setActiveTab(discipline as WorkAssignment['discipline'])}
                className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === discipline
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {discipline}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Existing Facilities */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">Existing Facilities</h2>
                  <span className="text-sm text-gray-500">{facilities.length} total</span>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  + Create New {activeTab} Assignment
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {facilities.map((facility, idx) => {
                  const gaps = {
                    personnel: facility.personnel?.gap || (facility.personnel?.required - facility.personnel?.have) || 0,
                    assets: facility.assets?.filter((a: any) => a.gap > 0).length || 0
                  };
                  
                  return (
                    <div
                      key={facility.id || idx}
                      onClick={() => handleSelectFacility(facility)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedFacility?.id === facility.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-sm text-gray-600">{facility.county}</div>
                      <div className="text-xs text-gray-500 mt-1">{facility.type}</div>
                      {(gaps.personnel > 0 || gaps.assets > 0) && (
                        <div className="mt-1 flex gap-2">
                          {gaps.personnel > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              {gaps.personnel} staff gap
                            </span>
                          )}
                          {gaps.assets > 0 && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              {gaps.assets} assets needed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Create/Edit Form */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {isCreating ? `Create New ${activeTab} Assignment` : `Edit: ${selectedFacility?.name}`}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Site Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Site Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Name *
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter site name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Type
                      </label>
                      <select
                        value={siteType}
                        onChange={(e) => setSiteType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {activeTab === 'Shelter' && (
                          <>
                            <option>Standard Shelter</option>
                            <option>Mega Shelter</option>
                            <option>Partner Shelter</option>
                          </>
                        )}
                        {activeTab === 'Feeding' && (
                          <>
                            <option>Fixed Feeding Site</option>
                            <option>Mobile Feeding (ERV)</option>
                            <option>Kitchen</option>
                          </>
                        )}
                        {activeTab === 'Distribution' && (
                          <>
                            <option>Distribution Center</option>
                            <option>POD Site</option>
                          </>
                        )}
                        {activeTab === 'Health Services' && (
                          <>
                            <option>Health Services Site</option>
                            <option>First Aid Station</option>
                          </>
                        )}
                        {activeTab === 'Logistics' && (
                          <>
                            <option>Warehouse</option>
                            <option>Staging Area</option>
                          </>
                        )}
                        {activeTab === 'Staff Services' && (
                          <>
                            <option>Staff Center</option>
                            <option>Staff Shelter</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        County *
                      </label>
                      <input
                        type="text"
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="County name"
                      />
                    </div>
                    {(activeTab === 'Shelter' || activeTab === 'Feeding') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder={activeTab === 'Shelter' ? 'Max occupancy' : 'Meals per day'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Personnel Requirements */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Personnel Requirements (GAP Positions)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Position Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Required</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Have</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {personnel.map((position, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-sm font-mono">{position.code}</td>
                            <td className="px-3 py-2 text-sm">{position.title}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={position.required}
                                onChange={(e) => handlePersonnelUpdate(idx, 'required', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={position.have}
                                onChange={(e) => handlePersonnelUpdate(idx, 'have', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-center"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-medium ${position.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
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
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Asset Requirements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Asset Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Unit</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Required</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Have</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {assets.map((asset, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-sm font-mono">{asset.code}</td>
                            <td className="px-3 py-2 text-sm">{asset.name}</td>
                            <td className="px-3 py-2 text-sm text-center">{asset.unit}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={asset.required}
                                onChange={(e) => handleAssetUpdate(idx, 'required', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-center"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={asset.have}
                                onChange={(e) => handleAssetUpdate(idx, 'have', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-center"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`font-medium ${asset.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {asset.gap}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes / Special Instructions
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Add any special instructions or notes..."
                  />
                </div>

                {/* Status and Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as WorkAssignment['status'])}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateNew}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!siteName || !county}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {isCreating ? 'Create Assignment' : 'Update Assignment'}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {(getTotalGaps().personnelGap > 0 || getTotalGaps().assetGap > 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Gap Summary</h4>
                    <div className="text-sm text-yellow-700">
                      {getTotalGaps().personnelGap > 0 && (
                        <p>• Personnel Gap: {getTotalGaps().personnelGap} positions need filling</p>
                      )}
                      {getTotalGaps().assetGap > 0 && (
                        <p>• Asset Gap: {getTotalGaps().assetGap} asset types need procurement</p>
                      )}
                    </div>
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