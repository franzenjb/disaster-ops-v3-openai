'use client';

import React, { useState, useEffect } from 'react';

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
    { code: 'ERV-TM', title: 'ERV Team Member' },
  ],
  Distribution: [
    { code: 'BDR-MN', title: 'Distribution Manager' },
    { code: 'BDR-SV', title: 'Distribution Supervisor' },
    { code: 'BDR-SA', title: 'Distribution Associate' },
    { code: 'LOG-SA', title: 'Logistics Associate' },
  ],
  'Health Services': [
    { code: 'DHS-MN', title: 'Health Services Manager' },
    { code: 'DHS-SV', title: 'Health Services Supervisor' },
    { code: 'DHS-SA', title: 'Health Services Associate' },
    { code: 'DHS-RN', title: 'Registered Nurse' },
    { code: 'DHS-EMT', title: 'EMT/Paramedic' },
  ],
  Logistics: [
    { code: 'LOG-MN', title: 'Logistics Manager' },
    { code: 'LOG-SV', title: 'Logistics Supervisor' },
    { code: 'LOG-SA', title: 'Logistics Associate' },
    { code: 'LOG-DR', title: 'Driver' },
    { code: 'LOG-WH', title: 'Warehouse Associate' },
  ],
  'Staff Services': [
    { code: 'STF-MN', title: 'Staff Services Manager' },
    { code: 'STF-SV', title: 'Staff Services Supervisor' },
    { code: 'STF-SA', title: 'Staff Services Associate' },
    { code: 'STF-LOD', title: 'Lodging Coordinator' },
  ],
};

// Asset templates by discipline
const ASSET_TEMPLATES = {
  Shelter: [
    { code: 'COT-STD', name: 'Cots - Standard', unit: 'Each' },
    { code: 'COT-ADA', name: 'Cots - ADA', unit: 'Each' },
    { code: 'BLANK', name: 'Blankets', unit: 'Each' },
    { code: 'COMF-KIT', name: 'Comfort Kits', unit: 'Each' },
    { code: 'TOILET', name: 'Portable Toilets', unit: 'Each' },
  ],
  Feeding: [
    { code: 'CAMBRO', name: 'Cambros', unit: 'Each' },
    { code: 'ERV', name: 'Emergency Response Vehicle', unit: 'Vehicle' },
    { code: 'COOLER', name: 'Coolers', unit: 'Each' },
    { code: 'TABLE', name: 'Serving Tables', unit: 'Each' },
    { code: 'HAND-WASH', name: 'Hand Wash Stations', unit: 'Each' },
  ],
  Distribution: [
    { code: 'CLEAN-KIT', name: 'Cleanup Kits', unit: 'Each' },
    { code: 'TARP', name: 'Tarps', unit: 'Each' },
    { code: 'WATER', name: 'Water (Cases)', unit: 'Cases' },
    { code: 'MRE', name: 'MREs', unit: 'Cases' },
    { code: 'RAKE', name: 'Rakes', unit: 'Each' },
  ],
  'Health Services': [
    { code: 'FIRST-AID', name: 'First Aid Kits', unit: 'Each' },
    { code: 'AED', name: 'AED Units', unit: 'Each' },
    { code: 'WHEELCHAIR', name: 'Wheelchairs', unit: 'Each' },
    { code: 'WALKER', name: 'Walkers', unit: 'Each' },
    { code: 'O2-TANK', name: 'Oxygen Tanks', unit: 'Each' },
  ],
  Logistics: [
    { code: 'TRUCK-26', name: '26ft Box Truck', unit: 'Vehicle' },
    { code: 'VAN-15', name: '15-passenger Van', unit: 'Vehicle' },
    { code: 'FORKLIFT', name: 'Forklift', unit: 'Each' },
    { code: 'PALLET', name: 'Pallets', unit: 'Each' },
    { code: 'FUEL', name: 'Fuel (Gallons)', unit: 'Gallons' },
  ],
  'Staff Services': [
    { code: 'HOTEL', name: 'Hotel Rooms', unit: 'Room-nights' },
    { code: 'RENTAL', name: 'Rental Cars', unit: 'Car-days' },
    { code: 'MEAL-VOL', name: 'Volunteer Meals', unit: 'Meals' },
    { code: 'LAUNDRY', name: 'Laundry Service', unit: 'Loads' },
    { code: 'WIFI', name: 'WiFi Hotspots', unit: 'Each' },
  ],
};

// Site types by discipline
const SITE_TYPES = {
  Shelter: ['Managed Client Shelter', 'Partner Managed Shelter', 'Staff Shelter', 'Evacuation Shelter'],
  Feeding: ['Fixed Feeding Site', 'Mobile Feeding Route', 'Kitchen', 'Canteen'],
  Distribution: ['Distribution Site', 'POD (Point of Distribution)', 'Mobile Distribution'],
  'Health Services': ['First Aid Station', 'Medical Shelter', 'Health Screening Site'],
  Logistics: ['Warehouse', 'Staging Area', 'Fleet Parking', 'Fuel Depot'],
  'Staff Services': ['Staff Processing Center', 'Staff Shelter', 'Respite Center'],
};

interface Props {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function UnifiedWorkAssignmentCreator({ onClose, onNavigate }: Props) {
  const [discipline, setDiscipline] = useState<WorkAssignment['discipline']>('Shelter');
  const [siteName, setSiteName] = useState('');
  const [siteType, setSiteType] = useState('');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [personnel, setPersonnel] = useState<WorkAssignment['personnel']>([]);
  const [assets, setAssets] = useState<WorkAssignment['assets']>([]);
  const [notes, setNotes] = useState('');
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);

  // Load assignments from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('unified_work_assignments');
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
  }, []);

  // Update templates when discipline changes
  useEffect(() => {
    setPersonnel(POSITION_TEMPLATES[discipline].map(p => ({
      ...p,
      required: 0,
      have: 0,
      gap: 0
    })));
    setAssets(ASSET_TEMPLATES[discipline].map(a => ({
      ...a,
      required: 0,
      have: 0,
      gap: 0
    })));
    setSiteType(SITE_TYPES[discipline][0]);
  }, [discipline]);

  const updatePersonnel = (index: number, field: string, value: number) => {
    const updated = [...personnel];
    updated[index] = {
      ...updated[index],
      [field]: value,
      gap: field === 'required' ? value - updated[index].have : 
           field === 'have' ? updated[index].required - value :
           updated[index].gap
    };
    setPersonnel(updated);
  };

  const updateAsset = (index: number, field: string, value: number) => {
    const updated = [...assets];
    updated[index] = {
      ...updated[index],
      [field]: value,
      gap: field === 'required' ? value - updated[index].have : 
           field === 'have' ? updated[index].required - value :
           updated[index].gap
    };
    setAssets(updated);
  };

  const saveAssignment = () => {
    const newAssignment: WorkAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      discipline,
      operationalPeriod: new Date().toISOString().split('T')[0],
      site: {
        name: siteName,
        type: siteType,
        address,
        county,
        capacity: discipline === 'Shelter' ? capacity : undefined
      },
      personnel,
      assets,
      status: 'draft',
      notes
    };

    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    localStorage.setItem('unified_work_assignments', JSON.stringify(updated));
    
    alert(`Work assignment created for ${discipline}: ${siteName}`);
    onClose();
  };

  const getTotals = () => {
    const personnelTotal = personnel.reduce((acc, p) => ({
      required: acc.required + p.required,
      have: acc.have + p.have,
      gap: acc.gap + p.gap
    }), { required: 0, have: 0, gap: 0 });

    const assetTotal = assets.reduce((acc, a) => ({
      required: acc.required + a.required,
      have: acc.have + a.have,
      gap: acc.gap + a.gap
    }), { required: 0, have: 0, gap: 0 });

    return { personnelTotal, assetTotal };
  };

  const totals = getTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Create Work Assignment</h1>
            <p className="text-red-100">Unified creation for all disciplines</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Discipline Selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex gap-2">
            {Object.keys(POSITION_TEMPLATES).map(d => (
              <button
                key={d}
                onClick={() => setDiscipline(d as WorkAssignment['discipline'])}
                className={`px-4 py-2 rounded ${
                  discipline === d 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Site Information */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              {discipline} Site Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder={`e.g., ${discipline === 'Shelter' ? 'Central High School' : discipline === 'Feeding' ? 'Main Kitchen' : 'Distribution Center'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Type</label>
                <select
                  value={siteType}
                  onChange={e => setSiteType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {SITE_TYPES[discipline].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={e => setCounty(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {discipline === 'Shelter' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(parseInt(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Personnel Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Personnel Requirements 
              <span className="ml-4 text-sm font-normal">
                Total Req: <span className="font-bold">{totals.personnelTotal.required}</span> | 
                Have: <span className="font-bold text-green-600">{totals.personnelTotal.have}</span> | 
                Gap: <span className={`font-bold ${totals.personnelTotal.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totals.personnelTotal.gap}
                </span>
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {personnel.map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-mono text-xs text-gray-500">{p.code}</span>
                    <span className="ml-2">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Req:</label>
                    <input
                      type="number"
                      value={p.required}
                      onChange={e => updatePersonnel(idx, 'required', parseInt(e.target.value) || 0)}
                      className="w-16 border rounded px-2 py-1 text-center"
                      min="0"
                    />
                    <label className="text-sm">Have:</label>
                    <input
                      type="number"
                      value={p.have}
                      onChange={e => updatePersonnel(idx, 'have', parseInt(e.target.value) || 0)}
                      className="w-16 border rounded px-2 py-1 text-center"
                      min="0"
                    />
                    <span className={`font-bold ${p.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Gap: {p.gap}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Asset Requirements
              <span className="ml-4 text-sm font-normal">
                Total Issues: <span className={`font-bold ${assets.filter(a => a.gap > 0).length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {assets.filter(a => a.gap > 0).length}
                </span>
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {assets.map((a, idx) => (
                <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-mono text-xs text-gray-500">{a.code}</span>
                    <span className="ml-2">{a.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({a.unit})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Req:</label>
                    <input
                      type="number"
                      value={a.required}
                      onChange={e => updateAsset(idx, 'required', parseInt(e.target.value) || 0)}
                      className="w-16 border rounded px-2 py-1 text-center"
                      min="0"
                    />
                    <label className="text-sm">Have:</label>
                    <input
                      type="number"
                      value={a.have}
                      onChange={e => updateAsset(idx, 'have', parseInt(e.target.value) || 0)}
                      className="w-16 border rounded px-2 py-1 text-center"
                      min="0"
                    />
                    <span className={`font-bold ${a.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Gap: {a.gap}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Any additional notes or special requirements..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('draft_work_assignment', JSON.stringify({
                    discipline, siteName, siteType, address, county, capacity, personnel, assets, notes
                  }));
                  alert('Draft saved!');
                }}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Save Draft
              </button>
              <button
                onClick={saveAssignment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!siteName || !county}
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>

        {/* Existing Assignments */}
        {assignments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recent Assignments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.slice(-4).map(a => (
                <div key={a.id} className="bg-white rounded shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{a.site.name}</h4>
                      <p className="text-sm text-gray-600">{a.discipline} • {a.site.county} County</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      a.discipline === 'Shelter' ? 'bg-blue-100 text-blue-800' :
                      a.discipline === 'Feeding' ? 'bg-green-100 text-green-800' :
                      a.discipline === 'Distribution' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {a.discipline}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    Personnel Gap: <span className={`font-bold ${
                      a.personnel.reduce((sum, p) => sum + p.gap, 0) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {a.personnel.reduce((sum, p) => sum + p.gap, 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('view-all-assignments')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              View All Assignments →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}