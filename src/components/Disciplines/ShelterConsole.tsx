'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface ShelterAssignment {
  id: string;
  operationalPeriod: string;
  site: {
    name: string;
    type: 'Managed Client Shelter' | 'Partner Managed Shelter' | 'Staff Shelter';
    address: string;
    county: string;
    capacity: number;
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

// Standard GAP Position Codes for Sheltering
const SHELTER_POSITIONS = [
  { code: 'SHEL-MN', title: 'Shelter Manager' },
  { code: 'SHEL-SV', title: 'Shelter Supervisor' },
  { code: 'SHEL-SA', title: 'Shelter Associate' },
  { code: 'DHS-MN', title: 'Disaster Health Manager' },
  { code: 'DHS-SV', title: 'Disaster Health Supervisor' },
  { code: 'DHS-SA', title: 'Disaster Health Associate' },
  { code: 'DMH-MN', title: 'Mental Health Manager' },
  { code: 'DMH-SA', title: 'Mental Health Associate' },
  { code: 'DIS-MN', title: 'Disability Integration Manager' },
];

// Standard Assets for Sheltering
const SHELTER_ASSETS = [
  { code: 'COT-STD', name: 'Cots - Standard', unit: 'Each' },
  { code: 'COT-ADA', name: 'Cots - ADA', unit: 'Each' },
  { code: 'BLANK', name: 'Blankets', unit: 'Each' },
  { code: 'COMF-KIT', name: 'Comfort Kits', unit: 'Each' },
  { code: 'CLEAN-KIT', name: 'Cleaning Kits', unit: 'Each' },
  { code: 'TOWEL', name: 'Towels', unit: 'Each' },
  { code: 'PIL', name: 'Pillows', unit: 'Each' },
  { code: 'HAND-SAN', name: 'Hand Sanitizer', unit: 'Bottles' },
  { code: 'TOILET', name: 'Portable Toilets', unit: 'Each' },
  { code: 'SHOW', name: 'Portable Showers', unit: 'Each' },
];

interface ShelterConsoleProps {
  onNavigate?: (view: string) => void;
}

export function ShelterConsole({ onNavigate }: ShelterConsoleProps = {}) {
  const [assignments, setAssignments] = useState<ShelterAssignment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ShelterAssignment>>({
    site: {
      name: '',
      type: 'Managed Client Shelter',
      address: '',
      county: '',
      capacity: 100
    },
    personnel: {
      positions: SHELTER_POSITIONS.map(p => ({
        code: p.code,
        title: p.title,
        required: 0,
        have: 0,
        gap: 0
      }))
    },
    assets: {
      items: SHELTER_ASSETS.map(a => ({
        code: a.code,
        name: a.name,
        unit: a.unit,
        required: 0,
        have: 0,
        gap: 0
      }))
    }
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    // Load from localStorage for now
    const stored = localStorage.getItem('shelter_assignments');
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
  };

  const saveAssignment = () => {
    const newAssignment: ShelterAssignment = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      operationalPeriod: new Date().toISOString().split('T')[0],
      site: formData.site!,
      personnel: formData.personnel!,
      assets: formData.assets!,
      status: 'draft',
      createdBy: 'current-user',
      updatedAt: new Date().toISOString()
    };

    let updated: ShelterAssignment[];
    if (editingId) {
      updated = assignments.map(a => a.id === editingId ? newAssignment : a);
    } else {
      updated = [...assignments, newAssignment];
    }
    
    setAssignments(updated);
    localStorage.setItem('shelter_assignments', JSON.stringify(updated));
    
    // Reset form
    setShowCreateForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      site: {
        name: '',
        type: 'Managed Client Shelter',
        address: '',
        county: '',
        capacity: 100
      },
      personnel: {
        positions: SHELTER_POSITIONS.map(p => ({
          code: p.code,
          title: p.title,
          required: 0,
          have: 0,
          gap: 0
        }))
      },
      assets: {
        items: SHELTER_ASSETS.map(a => ({
          code: a.code,
          name: a.name,
          unit: a.unit,
          required: 0,
          have: 0,
          gap: 0
        }))
      }
    });
  };

  const updatePosition = (index: number, field: string, value: number) => {
    const positions = [...formData.personnel!.positions];
    positions[index] = {
      ...positions[index],
      [field]: value,
      gap: field === 'required' ? value - positions[index].have : 
           field === 'have' ? positions[index].required - value :
           positions[index].gap
    };
    setFormData({ ...formData, personnel: { positions } });
  };

  const updateAsset = (index: number, field: string, value: number) => {
    const items = [...formData.assets!.items];
    items[index] = {
      ...items[index],
      [field]: value,
      gap: field === 'required' ? value - items[index].have : 
           field === 'have' ? items[index].required - value :
           items[index].gap
    };
    setFormData({ ...formData, assets: { items } });
  };

  const calculateTotals = (assignment: ShelterAssignment) => {
    const personnelTotals = assignment.personnel.positions.reduce((acc, p) => ({
      required: acc.required + p.required,
      have: acc.have + p.have,
      gap: acc.gap + p.gap
    }), { required: 0, have: 0, gap: 0 });

    const assetGaps = assignment.assets.items.filter(a => a.gap > 0).length;
    
    return { personnelTotals, assetGaps };
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
          <h1 className="text-2xl font-bold">Shelter Operations Console</h1>
          <p className="text-red-100">Discipline: Sheltering | Operational Period: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Create Work Assignment
            </button>
            <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
              Import from Excel
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total Sites: {assignments.length} | 
            Personnel Gap: {assignments.reduce((sum, a) => sum + calculateTotals(a).personnelTotals.gap, 0)} |
            Asset Issues: {assignments.reduce((sum, a) => sum + calculateTotals(a).assetGaps, 0)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {showCreateForm ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit' : 'Create'} Shelter Work Assignment
            </h2>

            {/* Site Information */}
            <div className="border rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">Site Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shelter Name</label>
                  <input
                    type="text"
                    value={formData.site?.name || ''}
                    onChange={e => setFormData({...formData, site: {...formData.site!, name: e.target.value}})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Central High School Shelter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shelter Type</label>
                  <select
                    value={formData.site?.type || ''}
                    onChange={e => setFormData({...formData, site: {...formData.site!, type: e.target.value as any}})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option>Managed Client Shelter</option>
                    <option>Partner Managed Shelter</option>
                    <option>Staff Shelter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.site?.address || ''}
                    onChange={e => setFormData({...formData, site: {...formData.site!, address: e.target.value}})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">County</label>
                  <input
                    type="text"
                    value={formData.site?.county || ''}
                    onChange={e => setFormData({...formData, site: {...formData.site!, county: e.target.value}})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.site?.capacity || 0}
                    onChange={e => setFormData({...formData, site: {...formData.site!, capacity: parseInt(e.target.value)}})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Personnel Requirements */}
            <div className="border rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">Personnel Requirements (GAP Positions)</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Position</th>
                    <th className="p-2 text-center">Required</th>
                    <th className="p-2 text-center">Have</th>
                    <th className="p-2 text-center">Gap</th>
                    <th className="p-2">Day Lead</th>
                    <th className="p-2">Night Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.personnel?.positions.map((pos, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2">
                        <span className="font-mono text-xs text-gray-500">{pos.code}</span>
                        <span className="ml-2">{pos.title}</span>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={pos.required}
                          onChange={e => updatePosition(idx, 'required', parseInt(e.target.value) || 0)}
                          className="w-16 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={pos.have}
                          onChange={e => updatePosition(idx, 'have', parseInt(e.target.value) || 0)}
                          className="w-16 border rounded px-2 py-1 text-center"
                          min="0"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <span className={`font-bold ${pos.gap > 0 ? 'text-red-600' : pos.gap < 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {pos.gap}
                        </span>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Name"
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Name"
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Asset Requirements */}
            <div className="border rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">Asset Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                {formData.assets?.items.map((asset, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-gray-500">{asset.code}</span>
                      <span className="ml-2 text-sm">{asset.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({asset.unit})</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs">Req:</label>
                      <input
                        type="number"
                        value={asset.required}
                        onChange={e => updateAsset(idx, 'required', parseInt(e.target.value) || 0)}
                        className="w-16 border rounded px-1 py-0.5 text-center text-sm"
                        min="0"
                      />
                      <label className="text-xs">Have:</label>
                      <input
                        type="number"
                        value={asset.have}
                        onChange={e => updateAsset(idx, 'have', parseInt(e.target.value) || 0)}
                        className="w-16 border rounded px-1 py-0.5 text-center text-sm"
                        min="0"
                      />
                      <span className={`font-bold text-sm ${asset.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Gap: {asset.gap}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Save Work Assignment
              </button>
            </div>
          </div>
        ) : (
          /* Assignment List */
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">No shelter assignments created yet.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-red-600 hover:text-red-700 font-medium"
                >
                  Create your first assignment
                </button>
              </div>
            ) : (
              assignments.map(assignment => {
                const { personnelTotals, assetGaps } = calculateTotals(assignment);
                return (
                  <div key={assignment.id} className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">{assignment.site.name}</h3>
                          <p className="text-sm text-gray-600">
                            {assignment.site.type} • {assignment.site.county} County • Capacity: {assignment.site.capacity}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFormData(assignment);
                              setEditingId(assignment.id);
                              setShowCreateForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            assignment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Personnel Required</p>
                          <p className="text-2xl font-bold">{personnelTotals.required}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Personnel Have</p>
                          <p className="text-2xl font-bold text-green-600">{personnelTotals.have}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Personnel Gap</p>
                          <p className={`text-2xl font-bold ${personnelTotals.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {personnelTotals.gap}
                          </p>
                        </div>
                      </div>
                      {assetGaps > 0 && (
                        <p className="mt-3 text-sm text-red-600 text-center">
                          ⚠️ {assetGaps} asset types below requirements
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}