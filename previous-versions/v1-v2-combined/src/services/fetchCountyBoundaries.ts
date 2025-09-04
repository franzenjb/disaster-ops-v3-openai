/**
 * Fetches Real County Boundary Data
 * Uses public GeoJSON sources for US county boundaries
 */

// US Census Bureau provides county boundaries at different resolutions
// 500k = highest detail, 5m = medium, 20m = lowest (fastest)
const CENSUS_BASE_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

// Alternative: Natural Earth Data (simplified boundaries)
const NATURAL_EARTH_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

export interface CountyProperties {
  NAME: string;
  STATE_NAME?: string;
  STATEFP?: string;
  COUNTYFP?: string;
  GEOID?: string;
  LSAD?: string;
}

export interface CountyFeature {
  type: 'Feature';
  properties: CountyProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface CountiesGeoJSON {
  type: 'FeatureCollection';
  features: CountyFeature[];
}

// Cache to avoid re-fetching
let cachedCounties: CountiesGeoJSON | null = null;

/**
 * Fetch all US county boundaries
 * This gets the entire US dataset which we can filter client-side
 */
export async function fetchAllUSCounties(): Promise<CountiesGeoJSON | null> {
  if (cachedCounties) {
    return cachedCounties;
  }

  try {
    // Try fetching from GitHub-hosted GeoJSON
    const response = await fetch(CENSUS_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch counties: ${response.status}`);
    }
    
    const data = await response.json();
    cachedCounties = data;
    return data;
  } catch (error) {
    console.error('Error fetching county boundaries:', error);
    
    // Fallback to local simplified data if fetch fails
    return null;
  }
}

/**
 * Get counties for specific state(s)
 */
export async function getStateCounties(stateNames: string[]): Promise<CountiesGeoJSON | null> {
  const allCounties = await fetchAllUSCounties();
  if (!allCounties) return null;
  
  // Filter to just the requested states
  const filteredFeatures = allCounties.features.filter(feature => {
    const stateName = feature.properties.STATE_NAME;
    return stateName && stateNames.includes(stateName);
  });
  
  return {
    type: 'FeatureCollection',
    features: filteredFeatures
  };
}

/**
 * Get specific counties by name
 */
export async function getCountiesByName(countyNames: string[]): Promise<CountiesGeoJSON | null> {
  const allCounties = await fetchAllUSCounties();
  if (!allCounties) return null;
  
  // Create a set for faster lookup
  const countySet = new Set(countyNames.map(n => n.toLowerCase()));
  
  const filteredFeatures = allCounties.features.filter(feature => {
    const countyName = feature.properties.NAME?.toLowerCase();
    return countyName && countySet.has(countyName);
  });
  
  return {
    type: 'FeatureCollection',
    features: filteredFeatures
  };
}

/**
 * Create a simplified Florida counties GeoJSON for fallback
 */
export function getSimplifiedFloridaCounties(): CountiesGeoJSON {
  // This would be imported from our florida-counties-geojson.ts
  // but including inline for completeness
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          NAME: 'Miami-Dade',
          STATE_NAME: 'Florida'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-80.87, 25.98],
            [-80.12, 25.98],
            [-80.12, 25.35],
            [-80.87, 25.35],
            [-80.87, 25.98]
          ]]
        }
      },
      // ... add more counties as needed
    ]
  };
}