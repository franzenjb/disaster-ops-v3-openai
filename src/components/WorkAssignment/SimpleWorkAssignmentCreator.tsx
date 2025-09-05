'use client';

import React, { useState } from 'react';
import { simpleStore } from '@/lib/simple-store';

export function SimpleWorkAssignmentCreator({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: 'Shelter',
    address: '',
    county: '',
    operationalPeriodStart: '',
    operationalPeriodEnd: '',
    shifts: [] as string[],
    positions: [
      { code: 'SL', title: 'Shelter Lead', required: 1, have: 0, gap: 1 },
      { code: 'SR', title: 'Shelter Resident', required: 4, have: 0, gap: 4 }
    ],
    assets: [
      { type: 'Cots', unit: 'Each', required: 50, have: 0, gap: 50 },
      { type: 'Blankets', unit: 'Each', required: 100, have: 0, gap: 100 }
    ]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create facility with work assignment
      const facility = simpleStore.createFacility({
        name: formData.facilityName,
        type: formData.facilityType,
        address: formData.address,
        county: formData.county,
        operationalPeriod: {
          start: formData.operationalPeriodStart,
          end: formData.operationalPeriodEnd
        },
        shifts: formData.shifts,
        personnel: { positions: formData.positions },
        resources: { assets: formData.assets }
      });
      
      // Also create a work assignment record
      simpleStore.createWorkAssignment({
        facilityId: facility.id,
        type: 'Initial Setup',
        createdAt: new Date().toISOString()
      });
      
      alert(`Work assignment created successfully for ${facility.name}`);
      onClose();
    } catch (error) {
      console.error('Error creating work assignment:', error);
      alert('Error creating work assignment. Check console for details.');
    }
  };

  const updatePosition = (index: number, field: string, value: number) => {
    const newPositions = [...formData.positions];
    newPositions[index] = {
      ...newPositions[index],
      [field]: value,
      gap: field === 'required' ? value - newPositions[index].have : 
           field === 'have' ? newPositions[index].required - value :
           newPositions[index].gap
    };
    setFormData({ ...formData, positions: newPositions });
  };

  const updateAsset = (index: number, field: string, value: number) => {
    const newAssets = [...formData.assets];
    newAssets[index] = {
      ...newAssets[index],
      [field]: value,
      gap: field === 'required' ? value - newAssets[index].have : 
           field === 'have' ? newAssets[index].required - value :
           newAssets[index].gap
    };
    setFormData({ ...formData, assets: newAssets });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create Work Assignment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Facility Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Facility Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={formData.facilityName}
                    onChange={e => setFormData({...formData, facilityName: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facility Type</label>
                  <select
                    value={formData.facilityType}
                    onChange={e => setFormData({...formData, facilityType: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option>Shelter</option>
                    <option>Feeding Site</option>
                    <option>Distribution Site</option>
                    <option>Headquarters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">County</label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={e => setFormData({...formData, county: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Personnel Requirements */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Personnel Requirements</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Position</th>
                    <th className="text-center p-2">Required</th>
                    <th className="text-center p-2">Have</th>
                    <th className="text-center p-2">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.positions.map((pos, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{pos.title}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={pos.required}
                          onChange={e => updatePosition(idx, 'required', parseInt(e.target.value) || 0)}
                          className="w-20 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={pos.have}
                          onChange={e => updatePosition(idx, 'have', parseInt(e.target.value) || 0)}
                          className="w-20 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <span className={pos.gap > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          {pos.gap}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resource Requirements */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Resource Requirements</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Asset</th>
                    <th className="text-center p-2">Required</th>
                    <th className="text-center p-2">Have</th>
                    <th className="text-center p-2">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.assets.map((asset, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{asset.type}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={asset.required}
                          onChange={e => updateAsset(idx, 'required', parseInt(e.target.value) || 0)}
                          className="w-20 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={asset.have}
                          onChange={e => updateAsset(idx, 'have', parseInt(e.target.value) || 0)}
                          className="w-20 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <span className={asset.gap > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          {asset.gap}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Work Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}