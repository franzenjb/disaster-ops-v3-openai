/**
 * Real Florida County Coordinates
 * Accurate lat/lng for proper map display
 */

export interface CountyCoordinates {
  [key: string]: {
    lat: number;
    lng: number;
    population?: number;
    fipsCode?: string;
  };
}

export const FLORIDA_COUNTIES: CountyCoordinates = {
  // South Florida Region
  'Miami-Dade County': { lat: 25.7617, lng: -80.1918, population: 2716940, fipsCode: '12086' },
  'Broward County': { lat: 26.1224, lng: -80.1373, population: 1952778, fipsCode: '12011' },
  'Palm Beach County': { lat: 26.7056, lng: -80.0364, population: 1496770, fipsCode: '12099' },
  'Monroe County': { lat: 24.6463, lng: -81.4503, population: 73090, fipsCode: '12087' },
  'Collier County': { lat: 26.0765, lng: -81.4170, population: 384902, fipsCode: '12021' },
  'Lee County': { lat: 26.5318, lng: -81.8358, population: 770577, fipsCode: '12071' },
  'Charlotte County': { lat: 26.9898, lng: -82.0453, population: 188910, fipsCode: '12015' },
  'Sarasota County': { lat: 27.2658, lng: -82.4795, population: 434006, fipsCode: '12115' },
  'Manatee County': { lat: 27.4799, lng: -82.3543, population: 403253, fipsCode: '12081' },
  'DeSoto County': { lat: 27.1878, lng: -81.8092, population: 38001, fipsCode: '12027' },
  'Glades County': { lat: 26.9311, lng: -81.1845, population: 13811, fipsCode: '12043' },
  'Hendry County': { lat: 26.5801, lng: -81.4140, population: 42022, fipsCode: '12051' },
  'Highlands County': { lat: 27.3479, lng: -81.3367, population: 106221, fipsCode: '12055' },
  
  // Central Florida Region
  'Orange County': { lat: 28.5383, lng: -81.3792, population: 1429908, fipsCode: '12095' },
  'Osceola County': { lat: 28.0564, lng: -81.0815, population: 388656, fipsCode: '12097' },
  'Seminole County': { lat: 28.7097, lng: -81.2085, population: 471826, fipsCode: '12117' },
  'Lake County': { lat: 28.7611, lng: -81.7178, population: 383956, fipsCode: '12069' },
  'Polk County': { lat: 27.8947, lng: -81.5862, population: 724777, fipsCode: '12105' },
  'Brevard County': { lat: 28.2639, lng: -80.7214, population: 606612, fipsCode: '12009' },
  'Indian River County': { lat: 27.6367, lng: -80.3978, population: 159923, fipsCode: '12061' },
  'St. Lucie County': { lat: 27.3364, lng: -80.3520, population: 329226, fipsCode: '12111' },
  'Martin County': { lat: 27.0669, lng: -80.2331, population: 161000, fipsCode: '12085' },
  'Okeechobee County': { lat: 27.2439, lng: -80.8298, population: 40144, fipsCode: '12093' },
  'Volusia County': { lat: 29.0280, lng: -81.0750, population: 553284, fipsCode: '12127' },
  
  // North Florida Region
  'Duval County': { lat: 30.3322, lng: -81.6557, population: 995237, fipsCode: '12031' },
  'St. Johns County': { lat: 29.9012, lng: -81.3124, population: 273425, fipsCode: '12109' },
  'Nassau County': { lat: 30.6107, lng: -81.7632, population: 90352, fipsCode: '12089' },
  'Baker County': { lat: 30.3308, lng: -82.2846, population: 29210, fipsCode: '12003' },
  'Clay County': { lat: 29.9858, lng: -81.8545, population: 219252, fipsCode: '12019' },
  'Putnam County': { lat: 29.5844, lng: -81.7787, population: 73321, fipsCode: '12107' },
  'Flagler County': { lat: 29.4099, lng: -81.2573, population: 115378, fipsCode: '12035' },
  'Alachua County': { lat: 29.6516, lng: -82.3248, population: 278468, fipsCode: '12001' },
  'Marion County': { lat: 29.2123, lng: -82.0620, population: 375908, fipsCode: '12083' },
  'Leon County': { lat: 30.4383, lng: -84.2807, population: 293582, fipsCode: '12073' },
  'Gadsden County': { lat: 30.5896, lng: -84.6145, population: 43826, fipsCode: '12039' },
  'Jefferson County': { lat: 30.5450, lng: -83.8781, population: 14510, fipsCode: '12065' },
  'Wakulla County': { lat: 30.1463, lng: -84.3765, population: 33739, fipsCode: '12129' },
  
  // Panhandle Counties
  'Bay County': { lat: 30.2266, lng: -85.6477, population: 175216, fipsCode: '12005' },
  'Escambia County': { lat: 30.6389, lng: -87.3414, population: 321905, fipsCode: '12033' },
  'Santa Rosa County': { lat: 30.6741, lng: -86.9371, population: 188000, fipsCode: '12113' },
  'Okaloosa County': { lat: 30.7435, lng: -86.5815, population: 211668, fipsCode: '12091' },
  'Walton County': { lat: 30.5702, lng: -86.1199, population: 75305, fipsCode: '12131' },
  'Holmes County': { lat: 30.8541, lng: -85.8655, population: 19653, fipsCode: '12059' },
  'Washington County': { lat: 30.6168, lng: -85.6138, population: 25473, fipsCode: '12133' },
  'Jackson County': { lat: 30.7769, lng: -85.2286, population: 46414, fipsCode: '12063' },
  'Calhoun County': { lat: 30.4521, lng: -85.1851, population: 13648, fipsCode: '12013' },
  'Liberty County': { lat: 30.2373, lng: -84.8824, population: 7974, fipsCode: '12077' },
  'Franklin County': { lat: 29.7969, lng: -84.8630, population: 12451, fipsCode: '12037' },
  'Gulf County': { lat: 29.9491, lng: -85.2040, population: 14877, fipsCode: '12045' },
  
  // Additional Counties
  'Citrus County': { lat: 28.8831, lng: -82.4597, population: 153843, fipsCode: '12017' },
  'Hernando County': { lat: 28.5544, lng: -82.3885, population: 194515, fipsCode: '12053' },
  'Pasco County': { lat: 28.3232, lng: -82.4319, population: 561891, fipsCode: '12101' },
  'Pinellas County': { lat: 27.8764, lng: -82.7779, population: 959107, fipsCode: '12103' },
  'Hillsborough County': { lat: 27.9904, lng: -82.3018, population: 1459762, fipsCode: '12057' },
  'Hardee County': { lat: 27.5125, lng: -81.8153, population: 25327, fipsCode: '12049' },
  'Sumter County': { lat: 28.7494, lng: -82.1047, population: 129752, fipsCode: '12119' },
  'Levy County': { lat: 29.2553, lng: -82.7992, population: 42915, fipsCode: '12075' },
  'Gilchrist County': { lat: 29.6838, lng: -82.8137, population: 17864, fipsCode: '12041' },
  'Dixie County': { lat: 29.5966, lng: -83.1501, population: 16826, fipsCode: '12029' },
  'Lafayette County': { lat: 30.1127, lng: -83.2236, population: 8422, fipsCode: '12067' },
  'Suwannee County': { lat: 30.3926, lng: -82.9962, population: 41551, fipsCode: '12121' },
  'Hamilton County': { lat: 30.5061, lng: -82.9468, population: 13008, fipsCode: '12047' },
  'Madison County': { lat: 30.4693, lng: -83.4132, population: 17968, fipsCode: '12079' },
  'Taylor County': { lat: 30.0441, lng: -83.5816, population: 21170, fipsCode: '12123' },
  'Columbia County': { lat: 30.1897, lng: -82.6393, population: 69698, fipsCode: '12023' },
  'Union County': { lat: 30.0727, lng: -82.3498, population: 15854, fipsCode: '12125' },
  'Bradford County': { lat: 29.9441, lng: -82.1098, population: 28201, fipsCode: '12007' }
};

// Helper function to get county data
export function getFloridaCountyData(countyName: string) {
  return FLORIDA_COUNTIES[countyName] || null;
}

// Get all counties for a region
export function getRegionCounties(regionName: string): string[] {
  switch(regionName) {
    case 'South Florida Region':
      return [
        'Miami-Dade County', 'Broward County', 'Palm Beach County', 
        'Monroe County', 'Collier County', 'Lee County', 'Charlotte County',
        'Sarasota County', 'Manatee County', 'DeSoto County', 'Glades County',
        'Hendry County', 'Highlands County'
      ];
    case 'Central Florida and the US Virgin Islands Region':
      return [
        'Orange County', 'Osceola County', 'Seminole County', 'Lake County',
        'Polk County', 'Brevard County', 'Indian River County', 'St. Lucie County',
        'Martin County', 'Okeechobee County', 'Volusia County'
      ];
    case 'North Florida Region':
      return [
        'Duval County', 'St. Johns County', 'Nassau County', 'Baker County',
        'Clay County', 'Putnam County', 'Flagler County', 'Alachua County',
        'Marion County', 'Leon County', 'Gadsden County', 'Jefferson County',
        'Wakulla County'
      ];
    default:
      return [];
  }
}