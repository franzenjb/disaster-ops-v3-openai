'use client';

import React, { useState, useEffect } from 'react';
import { GAP_CODES, getGAPCodesByCategory, searchGAPCodes, GAPCode } from '@/data/gap-codes';
import { ASSETS, getAssetsByCategory, searchAssets, Asset } from '@/data/assets';
import { simpleStore } from '@/lib/simple-store';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface GAPPosition {
  id: string;
  code: string;
  title: string;
  required: number;
  have: number;
  gap: number;
  notes?: string;
}

interface AssetRequirement {
  id: string;
  name: string;
  unit: string;
  required: number;
  have: number;
  gap: number;
}

interface WorkAssignment {
  id: string;
  discipline: string;
  facilityName: string;
  facilityType: string;
  address: string;
  county: string;
  positions: GAPPosition[];
  assets: AssetRequirement[];
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ImprovedWorkAssignmentManagerProps {
  onNavigate?: (view: string) => void;
}

export function ImprovedWorkAssignmentManager({ onNavigate }: ImprovedWorkAssignmentManagerProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [facilities, setFacilities] = useState<WorkAssignment[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<WorkAssignment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // GAP Position Management
  const [gapSearchTerm, setGapSearchTerm] = useState('');
  const [showGAPDropdown, setShowGAPDropdown] = useState(false);
  const [selectedGAPCode, setSelectedGAPCode] = useState<GAPCode | null>(null);
  
  // Asset Management
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const disciplines = ['All', 'Shelter', 'Feeding', 'Distribution', 'Health Services', 'Logistics', 'Staff Services'];

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = () => {
    const stored = simpleStore.getFacilities();
    setFacilities(stored.map(f => ({
      id: f.id,
      discipline: f.type,
      facilityName: f.name,
      facilityType: f.type,
      address: f.address,
      county: f.county || '',
      positions: [],
      assets: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })));
  };

  const filteredFacilities = selectedDiscipline === 'All' 
    ? facilities 
    : facilities.filter(f => f.discipline === selectedDiscipline);

  const handleCreateNew = () => {
    const newAssignment: WorkAssignment = {
      id: `wa-${Date.now()}`,
      discipline: selectedDiscipline === 'All' ? 'Shelter' : selectedDiscipline,
      facilityName: '',
      facilityType: '',
      address: '',
      county: '',
      positions: [],
      assets: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedFacility(newAssignment);
    setIsCreating(true);
  };

  const handleAddGAPPosition = () => {
    if (!selectedGAPCode || !selectedFacility) return;
    
    const newPosition: GAPPosition = {
      id: `gap-${Date.now()}`,
      code: selectedGAPCode.code,
      title: selectedGAPCode.title,
      required: 0,
      have: 0,
      gap: 0
    };
    
    setSelectedFacility({
      ...selectedFacility,
      positions: [...selectedFacility.positions, newPosition]
    });
    
    setSelectedGAPCode(null);
    setGapSearchTerm('');
    setShowGAPDropdown(false);
  };

  const handleUpdatePosition = (positionId: string, field: string, value: number) => {
    if (!selectedFacility) return;
    
    const updatedPositions = selectedFacility.positions.map(pos => {
      if (pos.id === positionId) {
        const updated = { ...pos, [field]: value };
        updated.gap = updated.required - updated.have;
        return updated;
      }
      return pos;
    });
    
    setSelectedFacility({
      ...selectedFacility,
      positions: updatedPositions
    });
  };

  const handleDeletePosition = (positionId: string) => {
    if (!selectedFacility) return;
    
    setSelectedFacility({
      ...selectedFacility,
      positions: selectedFacility.positions.filter(p => p.id !== positionId)
    });
  };

  const handleAddAsset = () => {
    if (!selectedAsset || !selectedFacility) return;
    
    const newAssetReq: AssetRequirement = {
      id: `asset-${Date.now()}`,
      name: selectedAsset.name,
      unit: selectedAsset.unit || 'Each',
      required: 0,
      have: 0,
      gap: 0
    };
    
    setSelectedFacility({
      ...selectedFacility,
      assets: [...selectedFacility.assets, newAssetReq]
    });
    
    setSelectedAsset(null);
    setAssetSearchTerm('');
    setShowAssetDropdown(false);
  };

  const handleUpdateAsset = (assetId: string, field: string, value: number) => {
    if (!selectedFacility) return;
    
    const updatedAssets = selectedFacility.assets.map(asset => {
      if (asset.id === assetId) {
        const updated = { ...asset, [field]: value };
        updated.gap = updated.required - updated.have;
        return updated;
      }
      return asset;
    });
    
    setSelectedFacility({
      ...selectedFacility,
      assets: updatedAssets
    });
  };

  const handleDeleteAsset = (assetId: string) => {
    if (!selectedFacility) return;
    
    setSelectedFacility({
      ...selectedFacility,
      assets: selectedFacility.assets.filter(a => a.id !== assetId)
    });
  };

  const handleSave = () => {
    if (!selectedFacility) return;
    
    // Save to store
    simpleStore.createFacility({
      id: selectedFacility.id,
      name: selectedFacility.facilityName,
      type: selectedFacility.discipline,
      address: selectedFacility.address,
      county: selectedFacility.county,
      status: selectedFacility.status,
      personnel: {
        required: selectedFacility.positions.reduce((sum, p) => sum + p.required, 0),
        assigned: selectedFacility.positions.reduce((sum, p) => sum + p.have, 0)
      }
    } as any);
    
    // Update local state
    if (isCreating) {
      setFacilities([...facilities, selectedFacility]);
    } else {
      setFacilities(facilities.map(f => f.id === selectedFacility.id ? selectedFacility : f));
    }
    
    setSelectedFacility(null);
    setIsCreating(false);
  };

  // Filter GAP codes based on search
  const filteredGAPCodes = gapSearchTerm 
    ? searchGAPCodes(gapSearchTerm)
    : selectedDiscipline !== 'All' 
      ? getGAPCodesByCategory(selectedDiscipline)
      : GAP_CODES;

  // Filter assets based on search
  const filteredAssets = assetSearchTerm
    ? searchAssets(assetSearchTerm)
    : selectedDiscipline !== 'All'
      ? getAssetsByCategory(selectedDiscipline)
      : ASSETS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Panel - Existing Facilities */}
        <div className="w-1/4 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-2">Existing Facilities</h2>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="text-sm text-blue-600 hover:text-blue-800 mb-3 block"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={handleCreateNew}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Create New Work Assignment
            </button>
          </div>
          
          {/* Discipline Filter Tabs */}
          <div className="p-4 border-b">
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {disciplines.map(disc => (
                <option key={disc} value={disc}>{disc}</option>
              ))}
            </select>
          </div>

          {/* Facilities List */}
          <div className="p-4">
            {filteredFacilities.length === 0 ? (
              <p className="text-gray-500 text-sm">No facilities found</p>
            ) : (
              <div className="space-y-2">
                {filteredFacilities.map((facility) => (
                  <div
                    key={facility.id}
                    onClick={() => {
                      setSelectedFacility(facility);
                      setIsCreating(false);
                    }}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedFacility?.id === facility.id ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                  >
                    <h3 className="font-medium">{facility.facilityName || 'Unnamed Facility'}</h3>
                    <p className="text-sm text-gray-600">{facility.facilityType}</p>
                    <p className="text-xs text-gray-500">{facility.county}</p>
                    <div className="mt-1 text-xs">
                      <span className="text-red-600">
                        GAPs: {facility.positions.reduce((sum, p) => sum + p.gap, 0)} gap
                      </span>
                      {' | '}
                      <span className="text-orange-600">
                        Assets: {facility.assets.reduce((sum, a) => sum + a.gap, 0)} gap
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Create/Edit */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedFacility ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {isCreating ? 'Create Work Assignment' : 'Edit Work Assignment'}
              </h2>

              {/* Facility Information */}
              <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-semibold mb-3">Facility Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Facility Name"
                    value={selectedFacility.facilityName}
                    onChange={(e) => setSelectedFacility({
                      ...selectedFacility,
                      facilityName: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                  <select
                    value={selectedFacility.discipline}
                    onChange={(e) => setSelectedFacility({
                      ...selectedFacility,
                      discipline: e.target.value
                    })}
                    className="p-2 border rounded"
                  >
                    {disciplines.filter(d => d !== 'All').map(disc => (
                      <option key={disc} value={disc}>{disc}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Address"
                    value={selectedFacility.address}
                    onChange={(e) => setSelectedFacility({
                      ...selectedFacility,
                      address: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="County"
                    value={selectedFacility.county}
                    onChange={(e) => setSelectedFacility({
                      ...selectedFacility,
                      county: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                </div>
              </div>

              {/* GAP Positions */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">GAP Positions (Personnel)</h3>
                
                {/* GAP Code Search and Dropdown */}
                <div className="relative mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search GAP codes by code or title..."
                        value={gapSearchTerm}
                        onChange={(e) => {
                          setGapSearchTerm(e.target.value);
                          setShowGAPDropdown(true);
                        }}
                        onFocus={() => setShowGAPDropdown(true)}
                        className="w-full p-2 border rounded"
                      />
                      {showGAPDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredGAPCodes.map((gap) => (
                            <div
                              key={gap.code}
                              onClick={() => {
                                setSelectedGAPCode(gap);
                                setGapSearchTerm(`${gap.code} - ${gap.title}`);
                                setShowGAPDropdown(false);
                              }}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="font-medium">{gap.code}</span> - {gap.title}
                              <span className="text-xs text-gray-500 ml-2">({gap.category})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAddGAPPosition}
                      disabled={!selectedGAPCode}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Add GAP
                    </button>
                  </div>
                </div>

                {/* GAP Positions Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">GAP Code</th>
                      <th className="border p-2 text-left">Position Title</th>
                      <th className="border p-2 text-center w-20">Req</th>
                      <th className="border p-2 text-center w-20">Have</th>
                      <th className="border p-2 text-center w-20">Gap</th>
                      <th className="border p-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFacility.positions.map((position) => (
                      <tr key={position.id}>
                        <td className="border p-2">{position.code}</td>
                        <td className="border p-2">{position.title}</td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="0"
                            value={position.required}
                            onChange={(e) => handleUpdatePosition(position.id, 'required', parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-center"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="0"
                            value={position.have}
                            onChange={(e) => handleUpdatePosition(position.id, 'have', parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-center"
                          />
                        </td>
                        <td className={`border p-2 text-center font-semibold ${
                          position.gap > 0 ? 'text-red-600' : position.gap < 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {position.gap}
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => handleDeletePosition(position.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedFacility.positions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border p-4 text-center text-gray-500">
                          No GAP positions added. Search and add positions above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assets */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Asset Requirements</h3>
                
                {/* Asset Search and Dropdown */}
                <div className="relative mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search assets by name..."
                        value={assetSearchTerm}
                        onChange={(e) => {
                          setAssetSearchTerm(e.target.value);
                          setShowAssetDropdown(true);
                        }}
                        onFocus={() => setShowAssetDropdown(true)}
                        className="w-full p-2 border rounded"
                      />
                      {showAssetDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredAssets.map((asset) => (
                            <div
                              key={asset.name}
                              onClick={() => {
                                setSelectedAsset(asset);
                                setAssetSearchTerm(asset.name);
                                setShowAssetDropdown(false);
                              }}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="font-medium">{asset.name}</span>
                              {asset.unit && <span className="text-sm text-gray-500 ml-2">({asset.unit})</span>}
                              <span className="text-xs text-gray-500 ml-2">[{asset.category}]</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAddAsset}
                      disabled={!selectedAsset}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Add Asset
                    </button>
                  </div>
                </div>

                {/* Assets Table */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Asset Name</th>
                      <th className="border p-2 text-left">Unit</th>
                      <th className="border p-2 text-center w-20">Req</th>
                      <th className="border p-2 text-center w-20">Have</th>
                      <th className="border p-2 text-center w-20">Gap</th>
                      <th className="border p-2 text-center w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFacility.assets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="border p-2">{asset.name}</td>
                        <td className="border p-2">{asset.unit}</td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="0"
                            value={asset.required}
                            onChange={(e) => handleUpdateAsset(asset.id, 'required', parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-center"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="0"
                            value={asset.have}
                            onChange={(e) => handleUpdateAsset(asset.id, 'have', parseInt(e.target.value) || 0)}
                            className="w-full p-1 text-center"
                          />
                        </td>
                        <td className={`border p-2 text-center font-semibold ${
                          asset.gap > 0 ? 'text-red-600' : asset.gap < 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {asset.gap}
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selectedFacility.assets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border p-4 text-center text-gray-500">
                          No assets added. Search and add assets above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded mb-6">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Personnel Gap:</span>
                    <span className={`ml-2 font-bold ${
                      selectedFacility.positions.reduce((sum, p) => sum + p.gap, 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {selectedFacility.positions.reduce((sum, p) => sum + p.gap, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Total Asset Gap:</span>
                    <span className={`ml-2 font-bold ${
                      selectedFacility.assets.reduce((sum, a) => sum + a.gap, 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {selectedFacility.assets.reduce((sum, a) => sum + a.gap, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedFacility(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Save Work Assignment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">Select a facility to edit</p>
                <p className="text-sm">or create a new work assignment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}