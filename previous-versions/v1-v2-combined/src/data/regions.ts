/**
 * Red Cross Regions Data Interface
 * This connects to the full database of all 50 regions
 */

import { redCrossRegionsData, getRegionCounties, allRegions } from './redcross-regions-full';

export interface Region {
  id: string;
  name: string;
  abbreviation: string;
  counties: string[];
  chapters: string[];
}

// Convert full data to simplified format for components
export const REGIONS: Region[] = allRegions.map(regionName => {
  const regionData = redCrossRegionsData[regionName];
  return {
    id: regionName.toLowerCase().replace(/\s+/g, '-'),
    name: regionName,
    abbreviation: getRegionAbbreviation(regionName),
    counties: Object.keys(regionData.counties),
    chapters: regionData.chapters
  };
});

// Generate abbreviations
function getRegionAbbreviation(regionName: string): string {
  // Special cases
  const abbreviations: { [key: string]: string } = {
    'Alabama and Mississippi Region': 'AL-MS',
    'Alaska Region': 'AK',
    'Arizona and New Mexico Region': 'AZ-NM',
    'California Gold Country Region': 'CA-GC',
    'Cascades Region': 'CAS',
    'Central Appalachia Region': 'CAP',
    'Central California Region': 'CCA',
    'Central Florida and the US Virgin Islands Region': 'CFL-VI',
    'Central and South Texas Region': 'CSTX',
    'Central and Southern Ohio Region': 'CSOH',
    'Colorado and Wyoming Region': 'CO-WY',
    'Connecticut and Rhode Island Region': 'CT-RI',
    'Eastern New York Region': 'ENY',
    'Eastern North Carolina Region': 'ENC',
    'Georgia Region': 'GA',
    'Greater Carolinas Region': 'GC',
    'Greater New York Region': 'GNY',
    'Greater Pennsylvania Region': 'GPA',
    'Guam Region': 'GU',
    'Idaho and Montana Region': 'ID-MT',
    'Illinois Region': 'IL',
    'Indiana Region': 'IN',
    'Kansas and Oklahoma Region': 'KS-OK',
    'Kentucky Region': 'KY',
    'Los Angeles Region': 'LA',
    'Louisiana Region': 'LOU',
    'Massachusetts Region': 'MA',
    'Michigan Region': 'MI',
    'Minnesota and Dakotas Region': 'MN-DAK',
    'Missouri and Arkansas Region': 'MO-AR',
    'National Capital and Greater Chesapeake Region': 'NCGC',
    'Nebraska and Iowa Region': 'NE-IA',
    'New Jersey Region': 'NJ',
    'North Florida Region': 'NFL',
    'North Texas Region': 'NTX',
    'Northern California Coastal Region': 'NCCA',
    'Northern New England Region': 'NNE',
    'Northern Ohio Region': 'NOH',
    'Northwest Region': 'NW',
    'Pacific Islands Region': 'PI',
    'Puerto Rico Region': 'PR',
    'South Carolina Region': 'SC',
    'South Florida Region': 'SFL',
    'Southeastern Pennsylvania Region': 'SEPA',
    'Southern California Region': 'SCA',
    'Tennessee Region': 'TN',
    'Texas Gulf Coast Region': 'TGC',
    'Utah and Nevada Region': 'UT-NV',
    'Virginia Region': 'VA',
    'Western New York Region': 'WNY',
    'Wisconsin Region': 'WI'
  };
  
  return abbreviations[regionName] || regionName.substring(0, 3).toUpperCase();
}

// Export helper to get statistics
export function getRegionStats() {
  const totalRegions = REGIONS.length;
  const totalCounties = Object.values(redCrossRegionsData).reduce(
    (sum, region) => sum + region.countyCount, 0
  );
  const totalChapters = new Set(
    Object.values(redCrossRegionsData).flatMap(r => r.chapters)
  ).size;
  
  return {
    regions: totalRegions,
    counties: totalCounties,
    chapters: totalChapters
  };
}