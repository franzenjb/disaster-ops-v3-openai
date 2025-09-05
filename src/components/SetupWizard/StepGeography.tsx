'use client';

import { useState, useEffect } from 'react';
import { OperationGeography } from '@/types';
import { 
  ARC_ORGANIZATION,
  ARCRegion,
  ARCCounty,
  FLORIDA_COUNTIES
} from '@/data/arc-organization';

interface StepGeographyProps {
  data?: OperationGeography;
  onUpdate: (data: OperationGeography) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ExtendedGeography extends OperationGeography {
  selectedCounties: string[];
}

export function StepGeography({ data, onUpdate, onNext, onPrev }: StepGeographyProps) {
  const [formData, setFormData] = useState<ExtendedGeography>({
    regions: [],
    states: [],
    counties: [],
    chapters: [],
    selectedCounties: [],
    ...data,
  });

  const [selectedRegionsForCounties, setSelectedRegionsForCounties] = useState<string[]>([]);
  const [availableCounties, setAvailableCounties] = useState<ARCCounty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  // Derive divisions, states, and chapters from selected regions and counties
  const deriveGeographyFromSelections = (regions: string[], counties: string[]) => {
    // Derive divisions from regions
    const divisions = new Set<string>();
    const states = new Set<string>();
    const chapters = new Set<string>();

    // From regions, get divisions and states
    regions.forEach(regionCode => {
      const region = ARC_ORGANIZATION.getRegionByCode(regionCode);
      if (region) {
        divisions.add(region.divisionCode);
        region.states.forEach(state => states.add(state));
      }
    });

    // From counties, get chapters and ensure states are included
    counties.forEach(countyKey => {
      const [countyName, stateCode] = countyKey.split(', ');
      if (stateCode) {
        states.add(stateCode);
        // Find the chapter that serves this county
        const county = FLORIDA_COUNTIES.find(c => `${c.name}, ${c.state}` === countyKey);
        if (county?.chapterId) {
          chapters.add(county.chapterId);
        }
      }
    });

    return {
      divisions: Array.from(divisions),
      states: Array.from(states),
      chapters: Array.from(chapters)
    };
  };

  // Update available counties when regions change
  useEffect(() => {
    const selectedStates = new Set<string>();
    
    // Get all states from selected regions
    formData.regions.forEach(regionCode => {
      const region = ARC_ORGANIZATION.getRegionByCode(regionCode);
      if (region) {
        region.states.forEach(state => selectedStates.add(state));
      }
    });

    // For now, we only have detailed county data for Florida
    // In production, you'd load counties for all selected states
    const counties: ARCCounty[] = [];
    if (selectedStates.has('FL')) {
      counties.push(...FLORIDA_COUNTIES);
    }
    // Add other states' counties as data becomes available
    
    setAvailableCounties(counties);
    setSelectedRegionsForCounties(Array.from(selectedStates));
  }, [formData.regions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Derive all other geographic entities
    const derived = deriveGeographyFromSelections(formData.regions, formData.selectedCounties);
    
    // Convert selected counties to County objects for the main type
    const countyObjects = formData.selectedCounties.map(countyName => {
      const county = FLORIDA_COUNTIES.find(c => `${c.name}, ${c.state}` === countyName);
      return county ? {
        id: county.fips,
        name: county.name,
        state: county.state,
        fips: county.fips,
        population: county.population
      } : null;
    }).filter(Boolean);
    
    onUpdate({
      ...formData,
      states: derived.states,
      chapters: derived.chapters as any[],
      counties: countyObjects as any[]
    });
    onNext();
  };

  const handleRegionToggle = (regionCode: string) => {
    const region = ARC_ORGANIZATION.getRegionByCode(regionCode);
    if (!region) return;

    if (formData.regions.includes(regionCode)) {
      // Remove region and any counties from its states
      const newRegions = formData.regions.filter(r => r !== regionCode);
      
      // Remove counties from this region's states
      const statesToRemove = region.states;
      const newCounties = formData.selectedCounties.filter(countyKey => {
        const [, stateCode] = countyKey.split(', ');
        return !statesToRemove.includes(stateCode);
      });
      
      setFormData({
        ...formData,
        regions: newRegions,
        selectedCounties: newCounties
      });
    } else {
      // Add region
      setFormData({
        ...formData,
        regions: [...formData.regions, regionCode]
      });
    }
  };

  const handleCountyToggle = (countyName: string) => {
    if (formData.selectedCounties.includes(countyName)) {
      setFormData({
        ...formData,
        selectedCounties: formData.selectedCounties.filter(c => c !== countyName)
      });
    } else {
      setFormData({
        ...formData,
        selectedCounties: [...formData.selectedCounties, countyName]
      });
    }
  };

  // Quick select presets
  const applyQuickSelect = (preset: string) => {
    switch (preset) {
      case 'florida-all':
        const floridaRegions = ARC_ORGANIZATION.regions
          .filter(r => r.states.includes('FL'))
          .map(r => r.code);
        const floridaCounties = FLORIDA_COUNTIES.map(c => `${c.name}, ${c.state}`);
        
        setFormData({
          ...formData,
          regions: floridaRegions,
          selectedCounties: floridaCounties
        });
        break;
        
      case 'florida-west-coast':
        // Select Central and South Florida regions
        const westCoastRegions = ['R06', 'R08']; // Central and South Florida
        const westCoastCounties = [
          'Pinellas, FL', 'Hillsborough, FL', 'Pasco, FL', 'Hernando, FL',
          'Manatee, FL', 'Sarasota, FL', 'Charlotte, FL', 'Lee, FL', 'Collier, FL'
        ];
        
        setFormData({
          ...formData,
          regions: westCoastRegions,
          selectedCounties: westCoastCounties
        });
        break;
        
      case 'florida-panhandle':
        const panhandleRegions = ['R07']; // North Florida
        const panhandleCounties = [
          'Escambia, FL', 'Santa Rosa, FL', 'Okaloosa, FL', 'Walton, FL',
          'Bay, FL', 'Holmes, FL', 'Washington, FL', 'Jackson, FL',
          'Calhoun, FL', 'Gulf, FL', 'Liberty, FL', 'Franklin, FL'
        ];
        
        setFormData({
          ...formData,
          regions: panhandleRegions,
          selectedCounties: panhandleCounties
        });
        break;
        
      case 'florida-east-coast':
        const eastCoastRegions = ['R06', 'R08']; // Central and South Florida
        const eastCoastCounties = [
          'Nassau, FL', 'Duval, FL', 'St. Johns, FL', 'Flagler, FL', 'Volusia, FL',
          'Brevard, FL', 'Indian River, FL', 'St. Lucie, FL', 'Martin, FL',
          'Palm Beach, FL', 'Broward, FL', 'Miami-Dade, FL', 'Monroe, FL'
        ];
        
        setFormData({
          ...formData,
          regions: eastCoastRegions,
          selectedCounties: eastCoastCounties
        });
        break;
        
      case 'southeast-us':
        const southeastStates = ['FL', 'GA', 'SC', 'NC', 'AL', 'MS', 'TN'];
        const southeastRegions = new Set<string>();
        
        southeastStates.forEach(state => {
          const regions = ARC_ORGANIZATION.getRegionsByState(state);
          regions.forEach(r => southeastRegions.add(r.code));
        });
        
        setFormData({
          ...formData,
          regions: Array.from(southeastRegions),
          selectedCounties: [] // No specific counties for multi-state selection
        });
        break;
        
      case 'gulf-coast':
        const gulfStates = ['FL', 'AL', 'MS', 'LA', 'TX'];
        const gulfRegions = new Set<string>();
        
        gulfStates.forEach(state => {
          const regions = ARC_ORGANIZATION.getRegionsByState(state);
          regions.forEach(r => gulfRegions.add(r.code));
        });
        
        setFormData({
          ...formData,
          regions: Array.from(gulfRegions),
          selectedCounties: [] // No specific counties for multi-state selection
        });
        break;
    }
    
    setShowQuickSelect(false);
  };

  // Get derived geography for display
  const derived = deriveGeographyFromSelections(formData.regions, formData.selectedCounties);
  
  // Group regions by division for better display
  const regionsByDivision = ARC_ORGANIZATION.divisions.map(division => ({
    division,
    regions: ARC_ORGANIZATION.regions.filter(r => r.divisionCode === division.code)
  })).filter(group => group.regions.length > 0);

  // Filter counties based on search
  const filteredCounties = availableCounties.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Select Options */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Geographic Scope</h3>
          <button
            type="button"
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="text-sm text-red-cross-red hover:text-red-700 font-medium"
          >
            Quick Select Presets
          </button>
        </div>
        
        {showQuickSelect && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">Select a common configuration:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyQuickSelect('florida-all')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                All Florida
              </button>
              <button
                type="button"
                onClick={() => applyQuickSelect('florida-west-coast')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                FL West Coast
              </button>
              <button
                type="button"
                onClick={() => applyQuickSelect('florida-panhandle')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                FL Panhandle
              </button>
              <button
                type="button"
                onClick={() => applyQuickSelect('florida-east-coast')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                FL East Coast
              </button>
              <button
                type="button"
                onClick={() => applyQuickSelect('southeast-us')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Southeast US
              </button>
              <button
                type="button"
                onClick={() => applyQuickSelect('gulf-coast')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Gulf Coast
              </button>
            </div>
          </div>
        )}
        
        {/* Selection Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 mb-1">Current Selection Summary:</p>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• {formData.regions.length} regions selected</p>
            <p>• {formData.selectedCounties.length} counties selected</p>
            <p className="text-xs text-blue-600 mt-2 italic">
              Auto-derived: {derived.divisions.length} divisions, {derived.states.length} states, {derived.chapters.length} chapters
            </p>
          </div>
        </div>
      </div>

      {/* Region Selection - Organized by Division */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Select Regions
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Divisions and states will be automatically determined)
          </span>
        </h4>
        <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
          {regionsByDivision.map(({ division, regions }) => (
            <div key={division.code} className="mb-6 last:mb-0">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-white pb-1">
                {division.name} • {division.headquarters}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {regions.map(region => (
                  <label key={region.code} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region.code)}
                      onChange={() => handleRegionToggle(region.code)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{region.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({region.states.join(', ')})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* County Selection */}
      {availableCounties.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Select Counties
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Chapters will be automatically determined)
            </span>
          </h4>
          
          {selectedRegionsForCounties.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                Available counties from: {selectedRegionsForCounties.join(', ')}
              </p>
            </div>
          )}
          
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search counties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredCounties.map(county => {
                const countyKey = `${county.name}, ${county.state}`;
                return (
                  <label key={county.fips} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.selectedCounties.includes(countyKey)}
                      onChange={() => handleCountyToggle(countyKey)}
                      className="mr-2"
                    />
                    <span className="text-sm">{county.name}</span>
                    {county.population && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({(county.population / 1000).toFixed(0)}k)
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          
          {filteredCounties.length === 0 && searchTerm && (
            <p className="text-sm text-gray-500 mt-2">No counties found matching "{searchTerm}"</p>
          )}
        </div>
      )}
      
      {availableCounties.length === 0 && formData.regions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            County-level data is currently only available for Florida. 
            For other states, operations will be managed at the regional level.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="btn-secondary"
        >
          ← Previous
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Next Step →
        </button>
      </div>
    </form>
  );
}