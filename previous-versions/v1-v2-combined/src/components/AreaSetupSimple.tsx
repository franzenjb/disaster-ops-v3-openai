import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { USCountyMapbox } from './USCountyMapbox';
import { REGIONS } from '../data/regions';
import { redCrossRegionsData } from '../data/redcross-regions-full';
import { 
  MapPinIcon, 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export function AreaSetupSimple() {
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const currentOperation = useOperationStore(state => state.currentOperation);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [affectedChapters, setAffectedChapters] = useState<Set<string>>(new Set());
  const [regionSearch, setRegionSearch] = useState('');
  const [countySearch, setCountySearch] = useState('');

  // Custom functions to manage counties directly
  const setSelectedCounties = (counties: any[]) => {
    useOperationStore.setState(state => ({
      selectedCounties: counties,
      currentOperation: state.currentOperation ? {
        ...state.currentOperation,
        geography: {
          ...state.currentOperation.geography,
          counties: counties
        }
      } : state.currentOperation
    }));
  };

  const addCounty = (countyName: string, state: string) => {
    const cleanName = countyName.replace(' County', '').trim();
    const newCounty = {
      id: `${state}-${cleanName}`.toLowerCase().replace(/\s+/g, '-'),
      name: cleanName,
      state: state,
      fips: ''
    };
    
    // Check if already exists
    if (!selectedCounties.some(c => c.id === newCounty.id)) {
      setSelectedCounties([...selectedCounties, newCounty]);
    }
  };

  const removeCounty = (countyName: string, state: string) => {
    const cleanName = countyName.replace(' County', '').trim();
    const countyId = `${state}-${cleanName}`.toLowerCase().replace(/\s+/g, '-');
    setSelectedCounties(selectedCounties.filter(c => c.id !== countyId));
  };

  // Update affected chapters whenever counties change
  useEffect(() => {
    const chapters = new Set<string>();
    
    selectedCounties.forEach(county => {
      // Find which chapter covers this county across all regions
      Object.values(redCrossRegionsData).forEach(regionData => {
        // Try both with and without "County" suffix
        const countyKey1 = `${county.name}, ${county.state}`;
        const countyKey2 = `${county.name} County, ${county.state}`;
        
        if (regionData.counties[countyKey1]) {
          chapters.add(regionData.counties[countyKey1]);
        } else if (regionData.counties[countyKey2]) {
          chapters.add(regionData.counties[countyKey2]);
        }
      });
    });
    
    setAffectedChapters(chapters);
  }, [selectedCounties]);

  const handleRegionSelect = (regionName: string) => {
    setSelectedRegion(regionName);
    setCountySearch(''); // Clear county search when switching regions
  };

  const handleCountyToggle = (countyName: string, state: string) => {
    const cleanName = countyName.replace(' County', '').trim();
    const countyId = `${state}-${cleanName}`.toLowerCase().replace(/\s+/g, '-');
    
    if (selectedCounties.some(c => c.id === countyId)) {
      removeCounty(countyName, state);
    } else {
      addCounty(countyName, state);
    }
  };

  const clearAll = () => {
    setSelectedCounties([]);
    setSelectedRegion('');
    setRegionSearch('');
    setCountySearch('');
  };

  // Filter regions based on search
  const filteredRegions = REGIONS.filter(region =>
    region.name.toLowerCase().includes(regionSearch.toLowerCase())
  );

  // Get counties for selected region
  const getRegionCounties = () => {
    if (!selectedRegion) return [];
    const regionData = redCrossRegionsData[selectedRegion];
    if (!regionData) return [];
    
    return Object.entries(regionData.counties).map(([countyFullName, chapter]) => {
      // Parse county name and state from the full name
      const match = countyFullName.match(/^(.+?),\s*([A-Z]{2})$/);
      if (!match) return null;
      
      const [, countyNameRaw, state] = match;
      const countyName = countyNameRaw.trim();
      const cleanName = countyName.replace(' County', '').trim();
      const countyId = `${state}-${cleanName}`.toLowerCase().replace(/\s+/g, '-');
      const isSelected = selectedCounties.some(c => c.id === countyId);
      
      return {
        fullName: countyFullName,
        countyName,
        cleanName,
        state,
        chapter,
        isSelected
      };
    }).filter(Boolean);
  };

  const allCounties = getRegionCounties();
  
  // Filter counties based on search
  const filteredCounties = allCounties.filter(county =>
    county && county.fullName.toLowerCase().includes(countySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Area Setup</h2>
            <p className="text-gray-600 mt-1">Select a region and counties for this operation</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{selectedCounties.length}</div>
              <div className="text-sm text-gray-600">Counties Selected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{affectedChapters.size}</div>
              <div className="text-sm text-gray-600">Chapters Affected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Region and County Selection */}
        <div className="space-y-6">
          {/* Region Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Region</h3>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear All
              </button>
            </div>
            
            {/* Region Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search regions..."
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {regionSearch && (
                <button
                  onClick={() => setRegionSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {filteredRegions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionSelect(region.name)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      selectedRegion === region.name
                        ? 'bg-red-50 border-l-4 border-red-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{region.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {region.counties.length} counties • {region.chapters.length} chapters
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* County List for Selected Region */}
          {selectedRegion && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Counties in {selectedRegion}
              </h3>
              
              {/* County Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search counties..."
                  value={countySearch}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {countySearch && (
                  <button
                    onClick={() => setCountySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredCounties.length} of {allCounties.length} counties
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {filteredCounties.map((county, idx) => {
                    if (!county) return null;
                    return (
                      <label
                        key={`${county.state}-${county.cleanName}-${idx}`}
                        className="flex items-start p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={county.isSelected}
                          onChange={() => handleCountyToggle(county.countyName, county.state)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-sm">{county.fullName}</div>
                          <div className="text-xs text-gray-500">{county.chapter}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map and Selected Counties */}
        <div className="space-y-6">
          {/* Interactive Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Selected Counties Map
            </h3>
            <USCountyMapbox />
          </div>

          {/* Selected Counties Summary */}
          {selectedCounties.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Selected Counties ({selectedCounties.length})
              </h3>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {selectedCounties.map(county => (
                    <div
                      key={county.id}
                      className="flex justify-between items-center p-3 hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-medium text-sm">{county.name}, {county.state}</span>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            // Try both with and without "County" suffix
                            const key1 = `${county.name}, ${county.state}`;
                            const key2 = `${county.name} County, ${county.state}`;
                            
                            for (const regionData of Object.values(redCrossRegionsData)) {
                              if (regionData.counties[key1]) {
                                return regionData.counties[key1];
                              }
                              if (regionData.counties[key2]) {
                                return regionData.counties[key2];
                              }
                            }
                            return 'Chapter not found';
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCounty(county.name, county.state)}
                        className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affected Chapters */}
      {affectedChapters.size > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Affected Red Cross Chapters ({affectedChapters.size})
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(affectedChapters).sort().map(chapter => (
              <div key={chapter} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 text-sm">{chapter}</h4>
                <div className="mt-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    {selectedCounties.filter(county => {
                      const key1 = `${county.name}, ${county.state}`;
                      const key2 = `${county.name} County, ${county.state}`;
                      return Object.values(redCrossRegionsData).some(rd => 
                        rd.counties[key1] === chapter || rd.counties[key2] === chapter
                      );
                    }).length} counties selected
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary for IAP */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Operation Summary for IAP</h3>
        <div className="text-sm space-y-1">
          <p>
            <strong>Selected Region:</strong> {selectedRegion || 'None selected'}
          </p>
          <p>
            <strong>Affected Counties ({selectedCounties.length}):</strong> {
              selectedCounties.length > 0 
                ? selectedCounties.map(c => `${c.name}, ${c.state}`).join('; ')
                : 'None'
            }
          </p>
          <p>
            <strong>Chapters Involved ({affectedChapters.size}):</strong> {
              affectedChapters.size > 0
                ? Array.from(affectedChapters).sort().join(', ')
                : 'None'
            }
          </p>
        </div>
      </div>
    </div>
  );
}