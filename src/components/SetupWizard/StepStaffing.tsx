'use client';

import React, { useState, useEffect } from 'react';
import { ICSSection } from '@/types';

interface StepStaffingProps {
  data?: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface StaffPosition {
  id: string;
  code: string;
  title: string;
  section: ICSSection;
  level: number;
  personName?: string;
  personEmail?: string;
  personPhone?: string;
  isFilled: boolean;
  isRequired: boolean;
}

const ICS_POSITIONS: StaffPosition[] = [
  // Command
  { id: 'ic', code: 'IC', title: 'Incident Commander', section: 'command', level: 1, isFilled: false, isRequired: true },
  { id: 'pic', code: 'PIC', title: 'Public Information Officer', section: 'command', level: 2, isFilled: false, isRequired: false },
  { id: 'so', code: 'SO', title: 'Safety Officer', section: 'command', level: 2, isFilled: false, isRequired: false },
  { id: 'lo', code: 'LO', title: 'Liaison Officer', section: 'command', level: 2, isFilled: false, isRequired: false },
  
  // Operations
  { id: 'ops', code: 'OPS', title: 'Operations Section Chief', section: 'operations', level: 2, isFilled: false, isRequired: true },
  { id: 'dep-ops', code: 'DEP-OPS', title: 'Deputy Operations Chief', section: 'operations', level: 3, isFilled: false, isRequired: false },
  { id: 'shelter-mgr', code: 'SHEL-MGR', title: 'Sheltering Manager', section: 'operations', level: 3, isFilled: false, isRequired: false },
  { id: 'feed-mgr', code: 'FEED-MGR', title: 'Feeding Manager', section: 'operations', level: 3, isFilled: false, isRequired: false },
  { id: 'dist-mgr', code: 'DIST-MGR', title: 'Distribution Manager', section: 'operations', level: 3, isFilled: false, isRequired: false },
  
  // Planning
  { id: 'psc', code: 'PSC', title: 'Planning Section Chief', section: 'planning', level: 2, isFilled: false, isRequired: true },
  { id: 'dep-psc', code: 'DEP-PSC', title: 'Deputy Planning Chief', section: 'planning', level: 3, isFilled: false, isRequired: false },
  { id: 'sit-unit', code: 'SIT', title: 'Situation Unit Leader', section: 'planning', level: 3, isFilled: false, isRequired: false },
  { id: 'doc-unit', code: 'DOC', title: 'Documentation Unit Leader', section: 'planning', level: 3, isFilled: false, isRequired: false },
  
  // Logistics
  { id: 'log', code: 'LOG', title: 'Logistics Section Chief', section: 'logistics', level: 2, isFilled: false, isRequired: true },
  { id: 'dep-log', code: 'DEP-LOG', title: 'Deputy Logistics Chief', section: 'logistics', level: 3, isFilled: false, isRequired: false },
  { id: 'supply-unit', code: 'SUP', title: 'Supply Unit Leader', section: 'logistics', level: 3, isFilled: false, isRequired: false },
  { id: 'facilities-unit', code: 'FAC', title: 'Facilities Unit Leader', section: 'logistics', level: 3, isFilled: false, isRequired: false },
  { id: 'transport-unit', code: 'TRANS', title: 'Transportation Unit Leader', section: 'logistics', level: 3, isFilled: false, isRequired: false },
  
  // Finance
  { id: 'fin', code: 'FIN', title: 'Finance Section Chief', section: 'finance', level: 2, isFilled: false, isRequired: false },
  { id: 'cost-unit', code: 'COST', title: 'Cost Unit Leader', section: 'finance', level: 3, isFilled: false, isRequired: false },
  { id: 'time-unit', code: 'TIME', title: 'Time Unit Leader', section: 'finance', level: 3, isFilled: false, isRequired: false },
];

export function StepStaffing({ data, onUpdate, onNext, onPrev }: StepStaffingProps) {
  const [positions, setPositions] = useState<StaffPosition[]>(
    data?.positions || ICS_POSITIONS
  );
  const [selectedSection, setSelectedSection] = useState<ICSSection | 'all'>('all');
  const [showOnlyRequired, setShowOnlyRequired] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    onUpdate({ positions });
  }, [positions]);

  const handlePositionUpdate = (positionId: string, field: string, value: string) => {
    setPositions(prev => prev.map(pos => {
      if (pos.id === positionId) {
        const updated = { ...pos, [field]: value };
        if (field === 'personName' && value) {
          updated.isFilled = true;
        } else if (field === 'personName' && !value) {
          updated.isFilled = false;
        }
        return updated;
      }
      return pos;
    }));
  };

  const validateAndNext = () => {
    const newErrors: string[] = [];
    
    // Check required positions
    const requiredPositions = positions.filter(p => p.isRequired);
    const unfilledRequired = requiredPositions.filter(p => !p.isFilled);
    
    if (unfilledRequired.length > 0) {
      newErrors.push(`Please fill the following required positions: ${unfilledRequired.map(p => p.title).join(', ')}`);
    }
    
    // Check that filled positions have at least name and email
    const filledPositions = positions.filter(p => p.isFilled);
    const incompletePositions = filledPositions.filter(p => !p.personName || !p.personEmail);
    
    if (incompletePositions.length > 0) {
      newErrors.push(`Please provide name and email for: ${incompletePositions.map(p => p.title).join(', ')}`);
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    onNext();
  };

  const filteredPositions = positions.filter(pos => {
    if (selectedSection !== 'all' && pos.section !== selectedSection) return false;
    if (showOnlyRequired && !pos.isRequired) return false;
    return true;
  });

  const getSectionColor = (section: ICSSection) => {
    switch(section) {
      case 'command': return 'bg-red-50 border-red-200';
      case 'operations': return 'bg-blue-50 border-blue-200';
      case 'planning': return 'bg-green-50 border-green-200';
      case 'logistics': return 'bg-yellow-50 border-yellow-200';
      case 'finance': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getSectionBadgeColor = (section: ICSSection) => {
    switch(section) {
      case 'command': return 'bg-red-100 text-red-800';
      case 'operations': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-green-100 text-green-800';
      case 'logistics': return 'bg-yellow-100 text-yellow-800';
      case 'finance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Initial ICS Staffing</h3>
        <p className="text-gray-600">
          Assign key personnel to ICS positions. Required positions must be filled to continue.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value as ICSSection | 'all')}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Sections</option>
          <option value="command">Command</option>
          <option value="operations">Operations</option>
          <option value="planning">Planning</option>
          <option value="logistics">Logistics</option>
          <option value="finance">Finance</option>
        </select>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyRequired}
            onChange={(e) => setShowOnlyRequired(e.target.checked)}
            className="rounded"
          />
          <span>Show only required positions</span>
        </label>
        
        <div className="ml-auto text-sm text-gray-600">
          {positions.filter(p => p.isFilled).length} of {positions.length} positions filled
          ({positions.filter(p => p.isRequired && p.isFilled).length}/{positions.filter(p => p.isRequired).length} required)
        </div>
      </div>

      {/* Position Cards */}
      <div className="space-y-4">
        {filteredPositions.map(position => (
          <div
            key={position.id}
            className={`border rounded-lg p-4 ${getSectionColor(position.section)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-lg">{position.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSectionBadgeColor(position.section)}`}>
                    {position.section.toUpperCase()}
                  </span>
                  {position.isRequired && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Code: {position.code} | Level: {position.level}</p>
              </div>
              <div className="flex items-center gap-2">
                {position.isFilled ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Filled
                  </span>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                    Vacant
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Person Name"
                value={position.personName || ''}
                onChange={(e) => handlePositionUpdate(position.id, 'personName', e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={position.personEmail || ''}
                onChange={(e) => handlePositionUpdate(position.id, 'personEmail', e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={position.personPhone || ''}
                onChange={(e) => handlePositionUpdate(position.id, 'personPhone', e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Please correct the following:</h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button 
          onClick={onPrev} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
        >
          ← Previous
        </button>
        <button 
          onClick={validateAndNext} 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}