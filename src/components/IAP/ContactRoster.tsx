'use client';

import React, { useState, useEffect } from 'react';
import { PERSONNEL_DATABASE, POSITION_TITLES, PersonnelMember, searchPersonnel } from '@/data/personnel-database';
import { simpleStore } from '@/lib/simple-store';

interface RosterPosition {
  id: string;
  category: string;
  title: string;
  personnelId?: string;
  name?: string;
  phone?: string;
  email?: string;
  isCustom?: boolean;
  reportsTo?: string; // For org chart hierarchy
}

const ROSTER_STRUCTURE: RosterPosition[] = [
  // 24 Hour Lines
  { id: 'line-lodging', category: '24 Hour Lines', title: '24 Hour / Lodging' },
  { id: 'line-dmh', category: '24 Hour Lines', title: '24 Hour / Disaster Mental Health' },
  { id: 'line-health', category: '24 Hour Lines', title: '24 Hour / Staff Health (Illness and Injury)' },
  { id: 'line-staffing', category: '24 Hour Lines', title: '24 Hour / Staffing' },
  { id: 'line-dhs', category: '24 Hour Lines', title: '24 Hour / DHS (Client Health Needs)' },
  { id: 'line-transport', category: '24 Hour Lines', title: '24 Hour / Transportation' },
  { id: 'line-fulfillment', category: '24 Hour Lines', title: '24 Hour / Fulfillment Line' },
  { id: 'line-shuttle', category: '24 Hour Lines', title: 'Tampa Shuttle' },
  { id: 'line-dst', category: '24 Hour Lines', title: '24 Hour / DST Helpline' },
  
  // Command
  { id: 'cmd-dro', category: 'Command', title: 'DRO Director', reportsTo: null },
  { id: 'cmd-dro2', category: 'Command', title: 'DRO Director', reportsTo: null },
  { id: 'cmd-rcco', category: 'Command', title: 'RCCO', reportsTo: 'cmd-dro' },
  { id: 'cmd-cos', category: 'Command', title: 'Chief of Staff', reportsTo: 'cmd-dro' },
  { id: 'cmd-seoc', category: 'Command', title: 'SEOC Principal', reportsTo: 'cmd-dro' },
  { id: 'cmd-eol', category: 'Command', title: 'EOL Chief', reportsTo: 'cmd-dro' },
  { id: 'cmd-deol', category: 'Command', title: 'Deputy EOL Chief', reportsTo: 'cmd-eol' },
  { id: 'cmd-cap', category: 'Command', title: 'CAP Liaison', reportsTo: 'cmd-cos' },
  { id: 'cmd-saf', category: 'Command', title: 'SAF Liaison', reportsTo: 'cmd-cos' },
  { id: 'cmd-dat-cfl', category: 'Command', title: 'DAT Liaison CFL', reportsTo: 'cmd-cos' },
  { id: 'cmd-dat-nfl', category: 'Command', title: 'DAT Liaison NFL', reportsTo: 'cmd-cos' },
  { id: 'cmd-dat-sfl', category: 'Command', title: 'DAT Liaison SFL', reportsTo: 'cmd-cos' },
  
  // Operations
  { id: 'ops-ad', category: 'Operations', title: 'AD Operations', reportsTo: 'cmd-dro' },
  { id: 'ops-dad1', category: 'Operations', title: 'DAD Operations', reportsTo: 'ops-ad' },
  { id: 'ops-dad2', category: 'Operations', title: 'DAD Operations', reportsTo: 'ops-ad' },
  { id: 'ops-zone1', category: 'Operations', title: 'Zone Coordinator-Zone 1', reportsTo: 'ops-ad' },
  { id: 'ops-zone2', category: 'Operations', title: 'Zone Coordinator-Zone 2', reportsTo: 'ops-ad' },
  { id: 'ops-zone3', category: 'Operations', title: 'Zone Coordinator-Zone 3', reportsTo: 'ops-ad' },
  { id: 'ops-district', category: 'Operations', title: 'District Director - District A', reportsTo: 'ops-zone1' },
  { id: 'ops-mass', category: 'Operations', title: 'HQ Mass Care Chief', reportsTo: 'ops-ad' },
  { id: 'ops-shelter', category: 'Operations', title: 'HQ Sheltering Coordinator', reportsTo: 'ops-mass' },
  { id: 'ops-pet', category: 'Operations', title: 'HQ Pet Liaison', reportsTo: 'ops-mass' },
  { id: 'ops-feeding', category: 'Operations', title: 'HQ Feeding Manager', reportsTo: 'ops-mass' },
  { id: 'ops-des', category: 'Operations', title: 'HQ DES Manager', reportsTo: 'ops-mass' },
  { id: 'ops-reunify', category: 'Operations', title: 'HQ Reunification MN', reportsTo: 'ops-mass' },
  { id: 'ops-srt', category: 'Operations', title: 'HQ SRT MN', reportsTo: 'ops-mass' },
  { id: 'ops-client', category: 'Operations', title: 'Client Care Chief', reportsTo: 'ops-ad' },
  { id: 'ops-icct', category: 'Operations', title: 'ICCT Manager', reportsTo: 'ops-client' },
  { id: 'ops-dhs', category: 'Operations', title: 'DHS Manager', reportsTo: 'ops-client' },
  { id: 'ops-dmh', category: 'Operations', title: 'DMH Manager', reportsTo: 'ops-client' },
  { id: 'ops-dsc', category: 'Operations', title: 'DSC Manager', reportsTo: 'ops-client' },
  { id: 'ops-di', category: 'Operations', title: 'DI Manager', reportsTo: 'ops-client' },
  { id: 'ops-webeoc', category: 'Operations', title: 'HQ WebEOC OPS Admin', reportsTo: 'ops-ad' },
  { id: 'ops-frost', category: 'Operations', title: 'FROST', reportsTo: 'ops-ad' },
  
  // Logistics Section
  { id: 'log-ad', category: 'Logistics Section', title: 'AD Logistics', reportsTo: 'cmd-dro' },
  { id: 'log-uber', category: 'Logistics Section', title: 'Uber Connect', reportsTo: 'log-ad' },
  { id: 'log-chief', category: 'Logistics Section', title: 'HQ Logistics Chief', reportsTo: 'log-ad' },
  { id: 'log-source', category: 'Logistics Section', title: 'HQ Sourcing Manager', reportsTo: 'log-chief' },
  { id: 'log-facilities', category: 'Logistics Section', title: 'HQ Facilities Manager', reportsTo: 'log-chief' },
  { id: 'log-transport', category: 'Logistics Section', title: 'HQ Transportation Manager', reportsTo: 'log-chief' },
  { id: 'log-warehouse', category: 'Logistics Section', title: 'HQ Warehousing Manager', reportsTo: 'log-chief' },
  { id: 'log-donations', category: 'Logistics Section', title: 'In-Kind-Donations Manager', reportsTo: 'log-chief' },
  { id: 'log-fulfill', category: 'Logistics Section', title: 'Fulfillment MN', reportsTo: 'log-chief' },
  { id: 'log-dst', category: 'Logistics Section', title: 'DST Chief', reportsTo: 'log-ad' },
  { id: 'log-nfo', category: 'Logistics Section', title: 'National Fleet Operations (NFO)', reportsTo: 'log-transport' },
];

export function ContactRoster() {
  const [roster, setRoster] = useState<RosterPosition[]>(ROSTER_STRUCTURE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  
  useEffect(() => {
    // Load saved roster from storage
    const savedRoster = simpleStore.getContactRoster();
    if (savedRoster && savedRoster.length > 0) {
      // Merge saved data with structure to preserve any new fields
      const mergedRoster = ROSTER_STRUCTURE.map(structPos => {
        const savedPos = savedRoster.find((s: RosterPosition) => s.id === structPos.id);
        return savedPos ? { ...structPos, ...savedPos } : structPos;
      });
      setRoster(mergedRoster);
    }
  }, []);
  
  const handleAssignPerson = (positionId: string, person: PersonnelMember) => {
    const newRoster = roster.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          personnelId: person.id,
          name: person.name,
          phone: person.phone,
          email: person.email,
          isCustom: false
        };
      }
      return pos;
    });
    setRoster(newRoster);
    simpleStore.saveContactRoster(newRoster);
    setShowDropdown(null);
    setSearchTerm('');
    setEditingId(null);
  };
  
  const handleClearPosition = (positionId: string) => {
    const newRoster = roster.map(pos => {
      if (pos.id === positionId) {
        const { personnelId, name, phone, email, isCustom, ...rest } = pos;
        return rest;
      }
      return pos;
    });
    setRoster(newRoster);
    simpleStore.saveContactRoster(newRoster);
  };
  
  const handleCustomEntry = (positionId: string, field: 'name' | 'phone' | 'email', value: string) => {
    const newRoster = roster.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          [field]: value,
          isCustom: true,
          personnelId: undefined
        };
      }
      return pos;
    });
    setRoster(newRoster);
    simpleStore.saveContactRoster(newRoster);
  };
  
  const handleReportingChange = (positionId: string, reportsTo: string) => {
    const newRoster = roster.map(pos => {
      if (pos.id === positionId) {
        return {
          ...pos,
          reportsTo: reportsTo === 'none' ? undefined : reportsTo
        };
      }
      return pos;
    });
    setRoster(newRoster);
    simpleStore.saveContactRoster(newRoster);
  };
  
  const formatEmail = (email?: string) => {
    if (!email) return '';
    // Remove @redcross.org for display
    return email.replace('@redcross.org', '');
  };
  
  const formatEmailForSave = (value: string) => {
    // Add @redcross.org if not present
    if (value && !value.includes('@')) {
      return value + '@redcross.org';
    }
    return value;
  };
  
  const groupedRoster = roster.reduce((acc, pos) => {
    if (!acc[pos.category]) {
      acc[pos.category] = [];
    }
    acc[pos.category].push(pos);
    return acc;
  }, {} as Record<string, RosterPosition[]>);
  
  // Get positions that can be supervisors (for reporting dropdown)
  const getPossibleSupervisors = (positionId: string) => {
    const position = roster.find(p => p.id === positionId);
    if (!position) return [];
    
    // Get all filled positions except self and subordinates
    return roster.filter(p => 
      p.id !== positionId && 
      p.name && 
      // Avoid circular reporting
      p.reportsTo !== positionId
    );
  };
  
  return (
    <div className="p-4">
      {/* Header matching exact IAP format */}
      <div className="border-b-2 border-black pb-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <span className="font-bold">Incident Name:</span> FLOCOM
            </div>
            <div>
              <span className="font-bold">DR Number:</span> 220-25
            </div>
          </div>
          <div>
            <span className="font-bold">Operational Period:</span> 18:00 20/10/2024 to 17:59 21/10/2024
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-blue-600 mb-4">Contact Roster DRO HQ</h2>
      
      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-300 p-2 mb-4 text-sm">
        <strong>Instructions:</strong> Click on any name field to edit or select from database. 
        Phone and email fields auto-save as you type. All changes are saved automatically.
      </div>
      
      {/* Contact roster tables by category */}
      {Object.entries(groupedRoster).map(([category, positions]) => (
        <div key={category} className="mb-6">
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-left" style={{ width: editMode ? '22%' : '25%' }}>
                  {category}
                </th>
                <th className="border border-black p-2 text-left" style={{ width: '20%' }}>
                  Name
                </th>
                <th className="border border-black p-2 text-center" style={{ width: '15%' }}>
                  Phone
                </th>
                <th className="border border-black p-2 text-left" style={{ width: '20%' }}>
                  Email (@redcross.org)
                </th>
                <th className="border border-black p-2 text-left" style={{ width: editMode ? '17%' : '20%' }}>
                  Reports To
                </th>
                {editMode && (
                  <th className="border border-black p-2 text-center" style={{ width: '8%' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="border border-black p-2">
                    {editingTitle === position.id ? (
                      <select
                        value={position.title}
                        onChange={(e) => {
                          const newRoster = roster.map(pos => 
                            pos.id === position.id ? { ...pos, title: e.target.value } : pos
                          );
                          setRoster(newRoster);
                          simpleStore.saveContactRoster(newRoster);
                        }}
                        onBlur={() => setEditingTitle(null)}
                        className="w-full px-1 py-0.5 border rounded text-sm font-medium"
                        autoFocus
                      >
                        {Object.values(POSITION_TITLES).flat().map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    ) : (
                      <div 
                        className={`font-medium ${editMode ? 'cursor-pointer hover:bg-blue-50 px-1 rounded' : ''}`}
                        onClick={() => editMode && setEditingTitle(position.id)}
                      >
                        {position.title}
                      </div>
                    )}
                  </td>
                  <td className="border border-black p-2">
                    <div className="relative">
                      {editingId === position.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={position.name || ''}
                            onChange={(e) => handleCustomEntry(position.id, 'name', e.target.value)}
                            onBlur={() => setEditingId(null)}
                            placeholder="Enter name..."
                            className="flex-1 px-1 py-0.5 border rounded text-sm"
                            autoFocus
                          />
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setEditingId(null);
                              setShowDropdown(position.id);
                            }}
                            className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Select
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-1 rounded min-h-[24px]"
                          onClick={() => setEditingId(position.id)}
                        >
                          {position.name || <span className="text-gray-400">Click to assign...</span>}
                        </div>
                      )}
                      
                      {/* Personnel dropdown */}
                      {showDropdown === position.id && (
                        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              placeholder="Search personnel..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {searchPersonnel(searchTerm).map(person => (
                              <div
                                key={person.id}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                onClick={() => handleAssignPerson(position.id, person)}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-xs text-gray-600">{person.phone}</div>
                              </div>
                            ))}
                          </div>
                          <div className="p-2 border-t flex justify-between">
                            <button
                              onClick={() => {
                                setShowDropdown(null);
                                setSearchTerm('');
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Close
                            </button>
                            {position.name && (
                              <button
                                onClick={() => handleClearPosition(position.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-black p-2 text-center">
                    <input
                      type="tel"
                      placeholder="Phone..."
                      value={position.phone || ''}
                      onChange={(e) => handleCustomEntry(position.id, 'phone', e.target.value)}
                      className={`w-full px-1 py-0.5 border rounded text-sm text-center ${
                        position.phone ? 'text-blue-600 underline cursor-pointer' : ''
                      }`}
                      onClick={(e) => {
                        if (position.phone) {
                          window.location.href = `tel:${position.phone}`;
                        }
                      }}
                    />
                  </td>
                  <td className="border border-black p-2">
                    <input
                      type="text"
                      placeholder="Email..."
                      value={formatEmail(position.email)}
                      onChange={(e) => handleCustomEntry(position.id, 'email', formatEmailForSave(e.target.value))}
                      className={`w-full px-1 py-0.5 border rounded text-sm ${
                        position.email ? 'text-blue-600 underline cursor-pointer' : ''
                      }`}
                      onClick={(e) => {
                        if (position.email) {
                          window.location.href = `mailto:${position.email}`;
                        }
                      }}
                    />
                  </td>
                  <td className="border border-black p-2">
                    <select
                      value={position.reportsTo || 'none'}
                      onChange={(e) => handleReportingChange(position.id, e.target.value)}
                      className="w-full px-1 py-0.5 border rounded text-sm"
                    >
                      <option value="none">-- Select --</option>
                      {getPossibleSupervisors(position.id).map(supervisor => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {supervisor.name} ({supervisor.title})
                        </option>
                      ))}
                    </select>
                  </td>
                  {editMode && (
                    <td className="border border-black p-2 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete position: ${position.title}?`)) {
                            const newRoster = roster.filter(pos => pos.id !== position.id);
                            setRoster(newRoster);
                            simpleStore.saveContactRoster(newRoster);
                          }
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      
      {/* Action buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded text-white ${
            editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {editMode ? 'Done Editing' : 'Edit Mode'}
        </button>
        {editMode && (
          <button
            onClick={() => {
              const newPosition: RosterPosition = {
                id: `custom-${Date.now()}`,
                category: 'Command',
                title: 'New Position',
                reportsTo: 'cmd-dro'
              };
              const newRoster = [...roster, newPosition];
              setRoster(newRoster);
              simpleStore.saveContactRoster(newRoster);
              setEditingTitle(newPosition.id);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Position
          </button>
        )}
        <button
          onClick={() => {
            // Export roster data as JSON
            const dataStr = JSON.stringify(roster, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contact-roster.json';
            a.click();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export Roster
        </button>
        <button
          onClick={() => {
            if (confirm('This will clear all roster entries. Are you sure?')) {
              setRoster(ROSTER_STRUCTURE);
              simpleStore.saveContactRoster(ROSTER_STRUCTURE);
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear All
        </button>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 5 of 53
        </div>
      </div>
    </div>
  );
}