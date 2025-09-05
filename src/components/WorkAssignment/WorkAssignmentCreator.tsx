/**
 * Work Assignment Creator
 * Implements the core workflow from the developer message:
 * 1. Pick a site (existing or new)
 * 2. Set discipline and template
 * 3. Define personnel requirements
 * 4. Define asset requirements
 * 5. Auto-calculate gaps
 */

'use client';

import React, { useState } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { createWorkAssignment } from '@/lib/events/workAssignmentEvents';

interface WorkAssignmentCreatorProps {
  onNavigate?: (view: string) => void;
  onSave?: (assignment: any) => void;
}

// Standard templates for different facility types
const FACILITY_TEMPLATES = {
  shelter: {
    name: 'Standard Shelter',
    discipline: 'SHEL',
    positions: [
      { code: 'SHEL-MN', title: 'Shelter Manager', defaultReq: 1 },
      { code: 'SHEL-SV', title: 'Shelter Supervisor', defaultReq: 2 },
      { code: 'SHEL-SA', title: 'Shelter Associate', defaultReq: 6 },
      { code: 'DHS-SV', title: 'Health Services', defaultReq: 1 },
      { code: 'DMH-SA', title: 'Mental Health', defaultReq: 1 }
    ],
    assets: [
      { type: 'Cots', unit: 'each', defaultReq: 100 },
      { type: 'Blankets', unit: 'each', defaultReq: 200 },
      { type: 'Comfort Kits', unit: 'each', defaultReq: 100 },
      { type: 'ADA Cots', unit: 'each', defaultReq: 10 },
      { type: 'Hand Wash Stations', unit: 'each', defaultReq: 2 }
    ]
  },
  kitchen: {
    name: 'Fixed Feeding Site',
    discipline: 'MC',
    positions: [
      { code: 'MC-MN', title: 'Kitchen Manager', defaultReq: 1 },
      { code: 'MC-SV', title: 'Kitchen Supervisor', defaultReq: 2 },
      { code: 'MC-SA', title: 'Food Service Worker', defaultReq: 10 }
    ],
    assets: [
      { type: 'Cambros', unit: 'each', defaultReq: 20 },
      { type: 'Serving Tables', unit: 'each', defaultReq: 6 },
      { type: 'Hand Wash Stations', unit: 'each', defaultReq: 4 },
      { type: 'Refrigeration Truck', unit: 'vehicle', defaultReq: 1 }
    ]
  },
  erv: {
    name: 'Mobile Feeding',
    discipline: 'MC',
    positions: [
      { code: 'MC-SV', title: 'ERV Team Lead', defaultReq: 1 },
      { code: 'MC-SA', title: 'ERV Team Member', defaultReq: 3 }
    ],
    assets: [
      { type: 'ERV (Emergency Response Vehicle)', unit: 'vehicle', defaultReq: 1 },
      { type: 'Cambros', unit: 'each', defaultReq: 6 },
      { type: 'Coolers', unit: 'each', defaultReq: 2 },
      { type: 'Serving Supplies', unit: 'kit', defaultReq: 1 }
    ]
  },
  warehouse: {
    name: 'Supply Warehouse',
    discipline: 'LOG',
    positions: [
      { code: 'LOG-MN', title: 'Warehouse Manager', defaultReq: 1 },
      { code: 'LOG-SV', title: 'Warehouse Supervisor', defaultReq: 2 },
      { code: 'LOG-SA', title: 'Warehouse Worker', defaultReq: 4 }
    ],
    assets: [
      { type: 'Forklift', unit: 'vehicle', defaultReq: 2 },
      { type: 'Pallet Jack', unit: 'each', defaultReq: 4 },
      { type: 'Box Truck', unit: 'vehicle', defaultReq: 2 }
    ]
  }
};

export function WorkAssignmentCreator({ onNavigate, onSave }: WorkAssignmentCreatorProps) {
  const [step, setStep] = useState(1);
  const [facilityType, setFacilityType] = useState<keyof typeof FACILITY_TEMPLATES | ''>('');
  const [facilityData, setFacilityData] = useState({
    name: '',
    address: '',
    county: '',
    operationalPeriod: {
      start: '06:00',
      end: '05:59'
    },
    shifts: ['Day', 'Night'] as string[]
  });
  
  const [positions, setPositions] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  const handleTemplateSelect = (type: keyof typeof FACILITY_TEMPLATES) => {
    setFacilityType(type);
    const template = FACILITY_TEMPLATES[type];
    
    // Initialize with template data
    setPositions(template.positions.map(p => ({
      ...p,
      required: p.defaultReq,
      have: 0,
      gap: p.defaultReq
    })));
    
    setAssets(template.assets.map(a => ({
      ...a,
      required: a.defaultReq,
      have: 0,
      gap: a.defaultReq
    })));
  };

  const updatePosition = (index: number, field: 'required' | 'have', value: number) => {
    const updated = [...positions];
    updated[index][field] = value;
    updated[index].gap = Math.max(0, updated[index].required - updated[index].have);
    setPositions(updated);
  };

  const updateAsset = (index: number, field: 'required' | 'have', value: number) => {
    const updated = [...assets];
    updated[index][field] = value;
    updated[index].gap = Math.max(0, updated[index].required - updated[index].have);
    setAssets(updated);
  };

  const calculateTotals = () => {
    const personnelTotals = positions.reduce((acc, p) => ({
      required: acc.required + p.required,
      have: acc.have + p.have,
      gap: acc.gap + p.gap
    }), { required: 0, have: 0, gap: 0 });

    return { personnel: personnelTotals };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="text-red-600 hover:text-red-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Create Work Assignment</h1>
          <p className="text-gray-600 mt-2">
            Set up a new facility with personnel and asset requirements
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Facility Type' },
              { num: 2, label: 'Facility Details' },
              { num: 3, label: 'Personnel' },
              { num: 4, label: 'Assets' },
              { num: 5, label: 'Review' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${step >= s.num ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {s.num}
                </div>
                <span className={`ml-2 text-sm ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {idx < 4 && <div className={`w-12 h-0.5 ml-4 ${step > s.num ? 'bg-red-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Step 1: Facility Type */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Select Facility Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(FACILITY_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleTemplateSelect(key as keyof typeof FACILITY_TEMPLATES);
                      setStep(2);
                    }}
                    className={`
                      p-4 border-2 rounded-lg text-left hover:border-red-500 transition-colors
                      ${facilityType === key ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                    `}
                  >
                    <h3 className="font-medium text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600">Discipline: {template.discipline}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {template.positions.length} positions • {template.assets.length} asset types
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Facility Details */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Facility Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    value={facilityData.name}
                    onChange={(e) => setFacilityData({...facilityData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Central High School Shelter"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={facilityData.address}
                    onChange={(e) => setFacilityData({...facilityData, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 123 Main St, Tampa, FL 33607"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <select
                    value={facilityData.county}
                    onChange={(e) => setFacilityData({...facilityData, county: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select County</option>
                    <option value="Hillsborough">Hillsborough</option>
                    <option value="Pinellas">Pinellas</option>
                    <option value="Pasco">Pasco</option>
                    <option value="Manatee">Manatee</option>
                    <option value="Sarasota">Sarasota</option>
                    <option value="Lee">Lee</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Time
                    </label>
                    <input
                      type="time"
                      value={facilityData.operationalPeriod.start}
                      onChange={(e) => setFacilityData({
                        ...facilityData, 
                        operationalPeriod: {...facilityData.operationalPeriod, start: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shifts
                    </label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={facilityData.shifts.includes('Day')}
                          onChange={(e) => {
                            const shifts = e.target.checked 
                              ? [...facilityData.shifts, 'Day']
                              : facilityData.shifts.filter(s => s !== 'Day');
                            setFacilityData({...facilityData, shifts});
                          }}
                          className="mr-2"
                        />
                        Day
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={facilityData.shifts.includes('Night')}
                          onChange={(e) => {
                            const shifts = e.target.checked 
                              ? [...facilityData.shifts, 'Night']
                              : facilityData.shifts.filter(s => s !== 'Night');
                            setFacilityData({...facilityData, shifts});
                          }}
                          className="mr-2"
                        />
                        Night
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!facilityData.name || !facilityData.county}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Personnel Requirements */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Personnel Requirements</h2>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex justify-between">
                <span className="text-sm font-medium">Total Personnel</span>
                <div className="flex space-x-4 text-sm">
                  <span>Required: <strong>{totals.personnel.required}</strong></span>
                  <span className="text-green-600">Have: <strong>{totals.personnel.have}</strong></span>
                  <span className={totals.personnel.gap > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                    Gap: {totals.personnel.gap}
                  </span>
                </div>
              </div>
              
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Position</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Required</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Have</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {positions.map((position, idx) => (
                    <tr key={idx}>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-xs text-gray-500">{position.code}</p>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <input
                          type="number"
                          min="0"
                          value={position.required}
                          onChange={(e) => updatePosition(idx, 'required', parseInt(e.target.value) || 0)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="text-center py-3">
                        <input
                          type="number"
                          min="0"
                          value={position.have}
                          onChange={(e) => updatePosition(idx, 'have', parseInt(e.target.value) || 0)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="text-center py-3">
                        <span className={`font-medium ${position.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {position.gap}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium">
                + Add Position
              </button>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Asset Requirements */}
          {step === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Asset Requirements</h2>
              
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Asset Type</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Unit</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Required</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Have</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase pb-2">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.map((asset, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium">{asset.type}</td>
                      <td className="text-center py-3 text-sm text-gray-500">{asset.unit}</td>
                      <td className="text-center py-3">
                        <input
                          type="number"
                          min="0"
                          value={asset.required}
                          onChange={(e) => updateAsset(idx, 'required', parseInt(e.target.value) || 0)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="text-center py-3">
                        <input
                          type="number"
                          min="0"
                          value={asset.have}
                          onChange={(e) => updateAsset(idx, 'have', parseInt(e.target.value) || 0)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1"
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
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Review Work Assignment</h2>
              
              <div className="space-y-6">
                {/* Facility Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Facility Information</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Name</dt>
                      <dd className="font-medium">{facilityData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Type</dt>
                      <dd className="font-medium">
                        {facilityType && FACILITY_TEMPLATES[facilityType].name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">County</dt>
                      <dd className="font-medium">{facilityData.county}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Shifts</dt>
                      <dd className="font-medium">{facilityData.shifts.join(', ')}</dd>
                    </div>
                  </dl>
                </div>

                {/* Personnel Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Personnel Summary</h3>
                  <div className="flex justify-between">
                    <span>Total Positions: {positions.length}</span>
                    <div className="flex space-x-4">
                      <span>Required: <strong>{totals.personnel.required}</strong></span>
                      <span className="text-green-600">Have: <strong>{totals.personnel.have}</strong></span>
                      <span className={totals.personnel.gap > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}>
                        Gap: {totals.personnel.gap}
                      </span>
                    </div>
                  </div>
                  {totals.personnel.gap > 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      ⚠️ Personnel gap of {totals.personnel.gap} needs to be addressed
                    </div>
                  )}
                </div>

                {/* Asset Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Asset Summary</h3>
                  <p>Total Asset Types: {assets.length}</p>
                  {assets.filter(a => a.gap > 0).length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                      ⚠️ {assets.filter(a => a.gap > 0).length} asset types have gaps
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
                <button
                  onClick={async () => {
                    // Save the work assignment using event sourcing
                    const assignment = {
                      facility: facilityData,
                      facilityType,
                      positions,
                      assets,
                      createdAt: new Date().toISOString()
                    };
                    
                    try {
                      const assignmentId = await createWorkAssignment(assignment);
                      console.log('Work assignment created with ID:', assignmentId);
                      onSave?.(assignment);
                      alert('Work Assignment Created Successfully! The facility and requirements have been saved to the database.');
                      onNavigate?.('dashboard');
                    } catch (error) {
                      console.error('Error creating work assignment:', error);
                      alert('Error creating work assignment. Please try again.');
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Work Assignment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}