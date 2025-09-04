import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { USCountyMap } from './USCountyMap';
import { MapPinIcon, BuildingOfficeIcon, PhoneIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface ChapterInfo {
  name: string;
  counties: string[];
  headquarters: string;
  phone: string;
  director: string;
}

// Florida Red Cross Chapters
const FLORIDA_CHAPTERS: ChapterInfo[] = [
  {
    name: "Central Florida Chapter",
    counties: ["Orange", "Osceola", "Seminole", "Lake", "Brevard"],
    headquarters: "Orlando, FL",
    phone: "(407) 894-4141",
    director: "Regional Director"
  },
  {
    name: "Northeast Florida Chapter",
    counties: ["Duval", "Clay", "St. Johns", "Nassau", "Baker", "Putnam", "Flagler"],
    headquarters: "Jacksonville, FL",
    phone: "(904) 358-8091",
    director: "Chapter Executive"
  },
  {
    name: "South Florida Chapter",
    counties: ["Miami-Dade", "Broward", "Monroe"],
    headquarters: "Miami, FL",
    phone: "(305) 644-1200",
    director: "Regional CEO"
  },
  {
    name: "Tampa Bay Chapter",
    counties: ["Hillsborough", "Pinellas", "Pasco", "Hernando", "Citrus"],
    headquarters: "Tampa, FL",
    phone: "(813) 348-4820",
    director: "Chapter Director"
  },
  {
    name: "Southwest Florida Chapter",
    counties: ["Lee", "Collier", "Charlotte", "Hendry", "Glades"],
    headquarters: "Fort Myers, FL",
    phone: "(239) 278-3401",
    director: "Chapter Director"
  },
  {
    name: "Palm Beach County Chapter",
    counties: ["Palm Beach"],
    headquarters: "West Palm Beach, FL",
    phone: "(561) 833-7711",
    director: "Chapter Director"
  },
  {
    name: "Space Coast Chapter",
    counties: ["Volusia"],
    headquarters: "Daytona Beach, FL",
    phone: "(386) 254-4413",
    director: "Chapter Manager"
  },
  {
    name: "Capital Area Chapter",
    counties: ["Leon", "Gadsden", "Jefferson", "Wakulla", "Franklin", "Liberty", "Madison", "Taylor"],
    headquarters: "Tallahassee, FL",
    phone: "(850) 878-6080",
    director: "Chapter Director"
  },
  {
    name: "Northwest Florida Chapter",
    counties: ["Escambia", "Santa Rosa", "Okaloosa", "Walton", "Bay", "Holmes", "Washington", "Jackson", "Calhoun", "Gulf"],
    headquarters: "Pensacola, FL",
    phone: "(850) 432-7601",
    director: "Chapter Director"
  },
  {
    name: "North Central Florida Chapter",
    counties: ["Alachua", "Marion", "Columbia", "Suwannee", "Hamilton", "Lafayette", "Dixie", "Gilchrist", "Levy", "Bradford", "Union"],
    headquarters: "Gainesville, FL",
    phone: "(352) 376-4669",
    director: "Chapter Manager"
  },
  {
    name: "Treasure Coast Chapter",
    counties: ["Martin", "St. Lucie", "Indian River", "Okeechobee"],
    headquarters: "Port St. Lucie, FL",
    phone: "(772) 461-2200",
    director: "Chapter Manager"
  },
  {
    name: "Heartland Chapter",
    counties: ["Polk", "Highlands", "Hardee", "DeSoto"],
    headquarters: "Lakeland, FL",
    phone: "(863) 687-2358",
    director: "Chapter Manager"
  },
  {
    name: "Central West Florida Chapter",
    counties: ["Manatee", "Sarasota"],
    headquarters: "Sarasota, FL",
    phone: "(941) 379-9300",
    director: "Chapter Director"
  },
  {
    name: "Suncoast Chapter",
    counties: ["Sumter"],
    headquarters: "The Villages, FL",
    phone: "(352) 750-1200",
    director: "Chapter Manager"
  }
];

// Florida Regions for quick selection
const FLORIDA_REGIONS = {
  "Northwest": ["Escambia", "Santa Rosa", "Okaloosa", "Walton", "Bay", "Holmes", "Washington", "Jackson", "Calhoun", "Gulf"],
  "Big Bend": ["Leon", "Gadsden", "Jefferson", "Wakulla", "Franklin", "Liberty", "Madison", "Taylor"],
  "Northeast": ["Duval", "Clay", "St. Johns", "Nassau", "Baker", "Putnam", "Flagler", "Alachua", "Marion", "Columbia", "Suwannee"],
  "Central": ["Orange", "Osceola", "Seminole", "Lake", "Brevard", "Volusia", "Polk", "Sumter"],
  "Tampa Bay": ["Hillsborough", "Pinellas", "Pasco", "Hernando", "Citrus", "Manatee", "Sarasota"],
  "Southwest": ["Lee", "Collier", "Charlotte", "Hendry", "Glades", "DeSoto", "Hardee", "Highlands"],
  "Southeast": ["Miami-Dade", "Broward", "Monroe", "Palm Beach", "Martin", "St. Lucie", "Indian River", "Okeechobee"]
};

export function AreaSetup() {
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const updateSelectedCounties = useOperationStore(state => state.updateSelectedCounties);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [affectedChapters, setAffectedChapters] = useState<ChapterInfo[]>([]);

  // Update affected chapters whenever counties change
  useEffect(() => {
    const affected = FLORIDA_CHAPTERS.filter(chapter =>
      chapter.counties.some(county => 
        selectedCounties.some(selected => 
          selected.name === county && selected.state === 'FL'
        )
      )
    );
    setAffectedChapters(affected);
  }, [selectedCounties]);

  const handleRegionSelect = (region: string) => {
    if (!region) {
      updateSelectedCounties([]);
      return;
    }
    
    const counties = FLORIDA_REGIONS[region as keyof typeof FLORIDA_REGIONS];
    const countyObjects = counties.map(name => ({
      state: 'FL',
      name,
      fips: '' // We'll need to add FIPS codes if needed
    }));
    updateSelectedCounties(countyObjects);
    setSelectedRegion(region);
  };

  const handleCountyToggle = (county: string) => {
    const existing = selectedCounties.find(c => c.name === county && c.state === 'FL');
    if (existing) {
      updateSelectedCounties(selectedCounties.filter(c => !(c.name === county && c.state === 'FL')));
    } else {
      updateSelectedCounties([...selectedCounties, { state: 'FL', name: county, fips: '' }]);
    }
  };

  const clearAll = () => {
    updateSelectedCounties([]);
    setSelectedRegion('');
  };

  // Calculate statistics
  const totalChapters = affectedChapters.length;
  const totalCounties = selectedCounties.length;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Area Setup</h2>
            <p className="text-gray-600 mt-1">Select counties and regions for this operation</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{totalCounties}</div>
              <div className="text-sm text-gray-600">Counties Selected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalChapters}</div>
              <div className="text-sm text-gray-600">Chapters Affected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Selection Tools */}
        <div className="space-y-6">
          {/* Region Quick Select */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Select by Region</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(FLORIDA_REGIONS).map(region => (
                <button
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className={`px-4 py-2 rounded border transition-colors ${
                    selectedRegion === region
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
            <button
              onClick={clearAll}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>

          {/* County List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Selected Counties</h3>
            <div className="max-h-96 overflow-y-auto">
              {selectedCounties.length === 0 ? (
                <p className="text-gray-500">No counties selected. Use the map or region selector.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCounties.map(county => (
                    <div
                      key={`${county.state}-${county.name}`}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium">{county.name}, {county.state}</span>
                      <button
                        onClick={() => handleCountyToggle(county.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
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
            <h3 className="text-lg font-semibold mb-4">Click Counties to Select</h3>
            <USCountyMap />
          </div>
        </div>
      </div>

      {/* Affected Chapters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BuildingOfficeIcon className="w-5 h-5 mr-2" />
          Affected Red Cross Chapters
        </h3>
        
        {affectedChapters.length === 0 ? (
          <p className="text-gray-500">No chapters affected. Select counties to see chapter information.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affectedChapters.map(chapter => (
              <div key={chapter.name} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600">{chapter.name}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {chapter.headquarters}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <a href={`tel:${chapter.phone}`} className="text-blue-600 hover:underline">
                      {chapter.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    {chapter.director}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Counties: {chapter.counties.filter(c => 
                        selectedCounties.some(sc => sc.name === c && sc.state === 'FL')
                      ).join(', ') || 'None selected'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary for IAP */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Operation Summary for IAP</h3>
        <div className="text-sm space-y-1">
          <p><strong>Affected Area:</strong> {selectedCounties.map(c => c.name).join(', ') || 'No counties selected'}</p>
          <p><strong>Chapters Involved:</strong> {affectedChapters.map(c => c.name).join(', ') || 'No chapters affected'}</p>
          <p><strong>Total Counties:</strong> {totalCounties}</p>
          <p><strong>Total Chapters:</strong> {totalChapters}</p>
        </div>
      </div>
    </div>
  );
}