/**
 * County Boundaries Service
 * Fetches GeoJSON data for US county boundaries
 */

export interface CountyGeoJSON {
  type: 'Feature';
  properties: {
    NAME: string;
    STATE_NAME: string;
    FIPS: string;
    POPULATION?: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface CountyCollection {
  type: 'FeatureCollection';
  features: CountyGeoJSON[];
}

// Cache for county data
const countyCache = new Map<string, CountyCollection>();

/**
 * Fetch county boundaries for a specific state
 * Using public US Census Bureau data
 */
export async function getStateCountyBoundaries(stateName: string): Promise<CountyCollection | null> {
  // Check cache first
  if (countyCache.has(stateName)) {
    return countyCache.get(stateName)!;
  }

  try {
    // For now, we'll use a simplified approach with embedded Florida data
    // In production, this would fetch from US Census Bureau or similar source
    if (stateName === 'Florida') {
      const floridaGeoJSON = await import('../data/florida-counties-geojson');
      const data = floridaGeoJSON.default as CountyCollection;
      countyCache.set(stateName, data);
      return data;
    }

    // Placeholder for other states - would fetch from API
    console.warn(`County boundaries for ${stateName} not yet available`);
    return null;
  } catch (error) {
    console.error(`Error fetching county boundaries for ${stateName}:`, error);
    return null;
  }
}

/**
 * Get simplified county boundaries for better performance
 */
export function simplifyCountyBoundaries(geojson: CountyCollection): CountyCollection {
  // In production, this would use turf.js or similar to simplify geometry
  // For now, return as-is
  return geojson;
}