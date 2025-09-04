import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { USCountyMap } from './USCountyMap';
import { 
  MapPinIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import {
  ARC_DIVISIONS,
  STATE_NAMES,
  getAllStates,
  getChaptersByState,
  getDivisionByState,
  getRegionByState,
  type Chapter,
  type Division,
  type Region
} from '../data/redCrossRegions';

export function AreaSetupNational() {
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const updateSelectedCounties = useOperationStore(state => state.updateSelectedCounties);
  
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [affectedChapters, setAffectedChapters] = useState<Chapter[]>([]);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  // Update affected chapters whenever counties change
  useEffect(() => {
    const chaptersSet = new Set<Chapter>();
    
    selectedCounties.forEach(county => {
      const stateChapters = getChaptersByState(county.state);
      stateChapters.forEach(chapter => {
        // Check if this chapter covers the selected county
        if (chapter.counties.includes(county.name) || 
            chapter.counties.includes(`All ${county.state} Counties`)) {
          chaptersSet.add(chapter);
        }
      });
    });
    
    setAffectedChapters(Array.from(chaptersSet));
  }, [selectedCounties]);

  const handleDivisionSelect = (divisionCode: string) => {
    setSelectedDivision(divisionCode);
    setSelectedRegion('');
    setSelectedState('');
    
    // Toggle expansion
    const newExpanded = new Set(expandedDivisions);
    if (newExpanded.has(divisionCode)) {
      newExpanded.delete(divisionCode);
    } else {
      newExpanded.add(divisionCode);
    }
    setExpandedDivisions(newExpanded);
  };

  const handleRegionSelect = (regionCode: string, division: Division) => {
    setSelectedRegion(regionCode);
    const region = division.regions.find(r => r.code === regionCode);
    
    if (region && region.states.length === 1) {
      setSelectedState(region.states[0]);
    }
    
    // Toggle expansion
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionCode)) {
      newExpanded.delete(regionCode);
    } else {
      newExpanded.add(regionCode);
    }
    setExpandedRegions(newExpanded);
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    // Could auto-select all counties in state if desired
  };

  const handleCountyToggle = (county: string, state: string) => {
    const existing = selectedCounties.find(c => c.name === county && c.state === state);
    if (existing) {
      updateSelectedCounties(selectedCounties.filter(c => !(c.name === county && c.state === state)));
    } else {
      updateSelectedCounties([...selectedCounties, { state, name: county, fips: '' }]);
    }
  };

  const clearAll = () => {
    updateSelectedCounties([]);
    setSelectedDivision('');
    setSelectedRegion('');
    setSelectedState('');
  };

  // Calculate statistics
  const totalChapters = affectedChapters.length;
  const totalCounties = selectedCounties.length;
  const affectedStates = new Set(selectedCounties.map(c => c.state)).size;
  const affectedDivisions = new Set(
    selectedCounties.map(c => getDivisionByState(c.state)?.name).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">National Area Setup</h2>
            <p className="text-gray-600 mt-1">Select divisions, regions, states, and counties for this operation</p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{affectedDivisions}</div>
              <div className="text-sm text-gray-600">Divisions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{affectedStates}</div>
              <div className="text-sm text-gray-600">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalCounties}</div>
              <div className="text-sm text-gray-600">Counties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalChapters}</div>
              <div className="text-sm text-gray-600">Chapters</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - ARC Hierarchy */}
        <div className="space-y-6">
          {/* Division/Region/State Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">American Red Cross Structure</h3>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ARC_DIVISIONS.map(division => (
                <div key={division.code} className="border rounded-lg">
                  <button
                    onClick={() => handleDivisionSelect(division.code)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                      selectedDivision === division.code ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {expandedDivisions.has(division.code) ? (
                        <ChevronDownIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 mr-2" />
                      )}
                      <span className="font-semibold">{division.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{division.headquarters}</span>
                  </button>
                  
                  {expandedDivisions.has(division.code) && (
                    <div className="border-t bg-gray-50">
                      {division.regions.map(region => (
                        <div key={region.code} className="border-b last:border-b-0">
                          <button
                            onClick={() => handleRegionSelect(region.code, division)}
                            className={`w-full px-8 py-2 flex items-center justify-between hover:bg-gray-100 ${
                              selectedRegion === region.code ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              {expandedRegions.has(region.code) ? (
                                <ChevronDownIcon className="w-3 h-3 mr-2" />
                              ) : (
                                <ChevronRightIcon className="w-3 h-3 mr-2" />
                              )}
                              <span className="text-sm">{region.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {region.states.join(', ')}
                            </span>
                          </button>
                          
                          {expandedRegions.has(region.code) && (
                            <div className="bg-white px-12 py-2">
                              {region.states.map(state => (
                                <button
                                  key={state}
                                  onClick={() => handleStateSelect(state)}
                                  className={`block w-full text-left px-3 py-1 text-sm hover:bg-gray-50 ${
                                    selectedState === state ? 'bg-green-50 font-medium' : ''
                                  }`}
                                >
                                  {state} - {Object.entries(STATE_NAMES).find(([_, abbr]) => abbr === state)?.[0]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Counties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Selected Counties</h3>
            <div className="max-h-64 overflow-y-auto">
              {selectedCounties.length === 0 ? (
                <p className="text-gray-500">No counties selected. Use the map or selectors above.</p>
              ) : (
                <div className="space-y-1">
                  {selectedCounties.map(county => (
                    <div
                      key={`${county.state}-${county.name}`}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                    >
                      <span className="font-medium">{county.name}, {county.state}</span>
                      <button
                        onClick={() => handleCountyToggle(county.name, county.state)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="space-y-6">
          {/* Interactive Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Interactive Map 
              {selectedState && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Focused on {selectedState})
                </span>
              )}
            </h3>
            <USCountyMap />
          </div>

          {/* Quick State Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick State Selection</h3>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {getAllStates().map(state => (
                <button
                  key={state}
                  onClick={() => handleStateSelect(state)}
                  className={`px-2 py-1 rounded border ${
                    selectedState === state
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Affected Chapters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BuildingOfficeIcon className="w-5 h-5 mr-2" />
          Affected Red Cross Chapters ({totalChapters})
        </h3>
        
        {affectedChapters.length === 0 ? (
          <p className="text-gray-500">No chapters affected. Select counties to see chapter information.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affectedChapters.map(chapter => {
              const division = getDivisionByState(chapter.state);
              const region = getRegionByState(chapter.state);
              
              return (
                <div key={`${chapter.name}-${chapter.state}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {division?.name} / {region?.name}
                  </div>
                  <h4 className="font-semibold text-red-600">{chapter.name}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {chapter.headquarters}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <a href={`tel:${chapter.phone}`} className="text-blue-600 hover:underline">
                        {chapter.phone}
                      </a>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        State: {chapter.state}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary for IAP */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Operation Summary for IAP</h3>
        <div className="text-sm space-y-1">
          <p>
            <strong>Affected Divisions:</strong> {
              Array.from(new Set(
                affectedChapters.map(c => getDivisionByState(c.state)?.name).filter(Boolean)
              )).join(', ') || 'None'
            }
          </p>
          <p>
            <strong>Affected Regions:</strong> {
              Array.from(new Set(
                affectedChapters.map(c => getRegionByState(c.state)?.name).filter(Boolean)
              )).join(', ') || 'None'
            }
          </p>
          <p>
            <strong>Affected States:</strong> {
              Array.from(new Set(selectedCounties.map(c => c.state))).join(', ') || 'None'
            }
          </p>
          <p>
            <strong>Affected Counties:</strong> {
              selectedCounties.map(c => `${c.name}, ${c.state}`).join('; ') || 'None'
            }
          </p>
          <p>
            <strong>Chapters Involved:</strong> {
              affectedChapters.map(c => c.name).join(', ') || 'None'
            }
          </p>
          <p>
            <strong>Total Statistics:</strong> {affectedDivisions} Division(s), {affectedStates} State(s), {totalCounties} Count(ies), {totalChapters} Chapter(s)
          </p>
        </div>
      </div>
    </div>
  );
}