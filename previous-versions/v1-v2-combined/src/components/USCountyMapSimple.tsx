import React from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { MapPinIcon } from '@heroicons/react/24/outline';

export function USCountyMapSimple() {
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  // Group counties by state
  const countiesByState = selectedCounties.reduce((acc, county) => {
    if (!acc[county.state]) {
      acc[county.state] = [];
    }
    acc[county.state].push(county.name);
    return acc;
  }, {} as Record<string, string[]>);
  
  // Simple state coordinates for basic positioning
  const stateCoordinates: Record<string, { x: number; y: number }> = {
    'WA': { x: 10, y: 10 }, 'OR': { x: 10, y: 20 }, 'CA': { x: 10, y: 35 }, 
    'NV': { x: 15, y: 30 }, 'ID': { x: 20, y: 15 }, 'MT': { x: 30, y: 10 },
    'WY': { x: 30, y: 25 }, 'UT': { x: 20, y: 35 }, 'AZ': { x: 20, y: 45 },
    'NM': { x: 30, y: 45 }, 'CO': { x: 35, y: 35 }, 'ND': { x: 45, y: 10 },
    'SD': { x: 45, y: 20 }, 'NE': { x: 45, y: 30 }, 'KS': { x: 45, y: 40 },
    'OK': { x: 45, y: 50 }, 'TX': { x: 45, y: 60 }, 'MN': { x: 55, y: 15 },
    'IA': { x: 55, y: 30 }, 'MO': { x: 55, y: 40 }, 'AR': { x: 55, y: 50 },
    'LA': { x: 55, y: 60 }, 'WI': { x: 60, y: 20 }, 'IL': { x: 60, y: 35 },
    'MS': { x: 60, y: 55 }, 'MI': { x: 65, y: 25 }, 'IN': { x: 65, y: 35 },
    'KY': { x: 65, y: 42 }, 'TN': { x: 65, y: 48 }, 'AL': { x: 65, y: 55 },
    'OH': { x: 70, y: 35 }, 'GA': { x: 70, y: 55 }, 'FL': { x: 75, y: 65 },
    'SC': { x: 75, y: 50 }, 'NC': { x: 75, y: 45 }, 'VA': { x: 75, y: 40 },
    'WV': { x: 72, y: 38 }, 'MD': { x: 78, y: 38 }, 'DE': { x: 80, y: 38 },
    'NJ': { x: 80, y: 35 }, 'PA': { x: 75, y: 33 }, 'NY': { x: 78, y: 28 },
    'CT': { x: 82, y: 30 }, 'RI': { x: 84, y: 30 }, 'MA': { x: 84, y: 28 },
    'VT': { x: 80, y: 25 }, 'NH': { x: 82, y: 25 }, 'ME': { x: 85, y: 20 },
    'AK': { x: 15, y: 70 }, 'HI': { x: 30, y: 70 },
    'PR': { x: 80, y: 70 }, 'VI': { x: 85, y: 70 }
  };
  
  return (
    <div className="bg-white rounded-lg p-4">
      {selectedCounties.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No counties selected</p>
            <p className="text-sm text-gray-500 mt-1">Select counties from the list to see them here</p>
          </div>
        </div>
      ) : (
        <div>
          {/* Simple US Map Visualization */}
          <div className="relative h-[300px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg mb-4 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
              {/* Draw state indicators for selected counties */}
              {Object.entries(countiesByState).map(([state, counties]) => {
                const coords = stateCoordinates[state];
                if (!coords) return null;
                
                return (
                  <g key={state}>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={Math.min(5, 2 + counties.length * 0.5)}
                      className="fill-red-500 opacity-70"
                    />
                    <text
                      x={coords.x}
                      y={coords.y + 0.5}
                      className="fill-white text-xs font-bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: '6px' }}
                    >
                      {state}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Map Title */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded shadow">
              <h4 className="font-semibold text-sm">Selected Areas</h4>
              <p className="text-xs text-gray-600">{selectedCounties.length} counties in {Object.keys(countiesByState).length} states</p>
            </div>
          </div>
          
          {/* County List by State */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Selected Counties by State:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {Object.entries(countiesByState).sort().map(([state, counties]) => (
                <div key={state} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {state}
                    </div>
                    <span className="ml-2 font-semibold text-gray-700">
                      {counties.length} {counties.length === 1 ? 'County' : 'Counties'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 pl-10">
                    {counties.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}