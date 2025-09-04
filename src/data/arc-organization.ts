/**
 * American Red Cross Organizational Structure
 * This is the permanent reference data for the ARC hierarchy
 */

export interface ARCDivision {
  code: string;
  name: string;
  headquarters: string;
  regions: string[]; // Region codes
}

export interface ARCRegion {
  code: string;
  name: string;
  divisionCode: string;
  states: string[];
  headquarters?: {
    city: string;
    state: string;
  };
}

export interface ARCChapter {
  id: string;
  name: string;
  regionCode: string;
  state: string;
  counties: string[]; // County names served
  headquarters?: {
    address?: string;
    city: string;
    state: string;
    zip?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
}

export interface ARCState {
  code: string;
  name: string;
  regionCodes: string[]; // Can span multiple regions
  fipsCode: string;
}

export interface ARCCounty {
  name: string;
  state: string;
  fips: string;
  chapterId?: string; // Chapter that serves this county
  population?: number;
}

// DIVISIONS (7 total)
export const ARC_DIVISIONS: ARCDivision[] = [
  {
    code: 'DIV1',
    name: 'Northeast Division',
    headquarters: 'Washington, DC',
    regions: ['R01', 'R02', 'R03', 'R04', 'R05']
  },
  {
    code: 'DIV2',
    name: 'Southeast Division',
    headquarters: 'Atlanta, GA',
    regions: ['R06', 'R07', 'R08', 'R09', 'R10']
  },
  {
    code: 'DIV3',
    name: 'Central Division',
    headquarters: 'Chicago, IL',
    regions: ['R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'R17']
  },
  {
    code: 'DIV4',
    name: 'South Central Division',
    headquarters: 'Dallas, TX',
    regions: ['R18', 'R19', 'R20', 'R21', 'R22']
  },
  {
    code: 'DIV5',
    name: 'Mountain Division',
    headquarters: 'Denver, CO',
    regions: ['R23', 'R24', 'R25', 'R26']
  },
  {
    code: 'DIV6',
    name: 'Pacific Division',
    headquarters: 'Sacramento, CA',
    regions: ['R27', 'R28', 'R29', 'R30', 'R31', 'R32']
  },
  {
    code: 'DIV7',
    name: 'Biomedical Division',
    headquarters: 'Washington, DC',
    regions: [] // Blood services, operates differently
  }
];

// REGIONS (60+ regions)
export const ARC_REGIONS: ARCRegion[] = [
  // Northeast Division
  {
    code: 'R01',
    name: 'Eastern New York',
    divisionCode: 'DIV1',
    states: ['NY'],
    headquarters: { city: 'Albany', state: 'NY' }
  },
  {
    code: 'R02',
    name: 'Greater New York',
    divisionCode: 'DIV1',
    states: ['NY'],
    headquarters: { city: 'New York', state: 'NY' }
  },
  {
    code: 'R03',
    name: 'Western New York',
    divisionCode: 'DIV1',
    states: ['NY'],
    headquarters: { city: 'Buffalo', state: 'NY' }
  },
  {
    code: 'R04',
    name: 'New England',
    divisionCode: 'DIV1',
    states: ['MA', 'CT', 'RI', 'VT', 'NH', 'ME'],
    headquarters: { city: 'Boston', state: 'MA' }
  },
  {
    code: 'R05',
    name: 'Pennsylvania',
    divisionCode: 'DIV1',
    states: ['PA'],
    headquarters: { city: 'Harrisburg', state: 'PA' }
  },
  
  // Southeast Division
  {
    code: 'R06',
    name: 'Central Florida',
    divisionCode: 'DIV2',
    states: ['FL'],
    headquarters: { city: 'Tampa', state: 'FL' }
  },
  {
    code: 'R07',
    name: 'North Florida',
    divisionCode: 'DIV2',
    states: ['FL'],
    headquarters: { city: 'Tallahassee', state: 'FL' }
  },
  {
    code: 'R08',
    name: 'South Florida',
    divisionCode: 'DIV2',
    states: ['FL'],
    headquarters: { city: 'Miami', state: 'FL' }
  },
  {
    code: 'R09',
    name: 'Georgia',
    divisionCode: 'DIV2',
    states: ['GA'],
    headquarters: { city: 'Atlanta', state: 'GA' }
  },
  {
    code: 'R10',
    name: 'Alabama & Mississippi',
    divisionCode: 'DIV2',
    states: ['AL', 'MS'],
    headquarters: { city: 'Birmingham', state: 'AL' }
  },
  
  // Central Division
  {
    code: 'R11',
    name: 'Northern Ohio',
    divisionCode: 'DIV3',
    states: ['OH'],
    headquarters: { city: 'Cleveland', state: 'OH' }
  },
  {
    code: 'R12',
    name: 'Central & Southern Ohio',
    divisionCode: 'DIV3',
    states: ['OH'],
    headquarters: { city: 'Columbus', state: 'OH' }
  },
  {
    code: 'R13',
    name: 'Indiana',
    divisionCode: 'DIV3',
    states: ['IN'],
    headquarters: { city: 'Indianapolis', state: 'IN' }
  },
  {
    code: 'R14',
    name: 'Michigan',
    divisionCode: 'DIV3',
    states: ['MI'],
    headquarters: { city: 'Detroit', state: 'MI' }
  },
  {
    code: 'R15',
    name: 'Illinois',
    divisionCode: 'DIV3',
    states: ['IL'],
    headquarters: { city: 'Chicago', state: 'IL' }
  },
  {
    code: 'R16',
    name: 'Wisconsin',
    divisionCode: 'DIV3',
    states: ['WI'],
    headquarters: { city: 'Madison', state: 'WI' }
  },
  {
    code: 'R17',
    name: 'Minnesota & Dakotas',
    divisionCode: 'DIV3',
    states: ['MN', 'ND', 'SD'],
    headquarters: { city: 'Minneapolis', state: 'MN' }
  },
  
  // South Central Division
  {
    code: 'R18',
    name: 'North Texas',
    divisionCode: 'DIV4',
    states: ['TX'],
    headquarters: { city: 'Dallas', state: 'TX' }
  },
  {
    code: 'R19',
    name: 'Texas Gulf Coast',
    divisionCode: 'DIV4',
    states: ['TX'],
    headquarters: { city: 'Houston', state: 'TX' }
  },
  {
    code: 'R20',
    name: 'Central & South Texas',
    divisionCode: 'DIV4',
    states: ['TX'],
    headquarters: { city: 'San Antonio', state: 'TX' }
  },
  {
    code: 'R21',
    name: 'Arkansas',
    divisionCode: 'DIV4',
    states: ['AR'],
    headquarters: { city: 'Little Rock', state: 'AR' }
  },
  {
    code: 'R22',
    name: 'Oklahoma',
    divisionCode: 'DIV4',
    states: ['OK'],
    headquarters: { city: 'Oklahoma City', state: 'OK' }
  },
  
  // Mountain Division
  {
    code: 'R23',
    name: 'Colorado & Wyoming',
    divisionCode: 'DIV5',
    states: ['CO', 'WY'],
    headquarters: { city: 'Denver', state: 'CO' }
  },
  {
    code: 'R24',
    name: 'Utah & Nevada',
    divisionCode: 'DIV5',
    states: ['UT', 'NV'],
    headquarters: { city: 'Salt Lake City', state: 'UT' }
  },
  {
    code: 'R25',
    name: 'Montana',
    divisionCode: 'DIV5',
    states: ['MT'],
    headquarters: { city: 'Billings', state: 'MT' }
  },
  {
    code: 'R26',
    name: 'Idaho',
    divisionCode: 'DIV5',
    states: ['ID'],
    headquarters: { city: 'Boise', state: 'ID' }
  },
  
  // Pacific Division
  {
    code: 'R27',
    name: 'Northern California',
    divisionCode: 'DIV6',
    states: ['CA'],
    headquarters: { city: 'Sacramento', state: 'CA' }
  },
  {
    code: 'R28',
    name: 'Central California',
    divisionCode: 'DIV6',
    states: ['CA'],
    headquarters: { city: 'Fresno', state: 'CA' }
  },
  {
    code: 'R29',
    name: 'Los Angeles',
    divisionCode: 'DIV6',
    states: ['CA'],
    headquarters: { city: 'Los Angeles', state: 'CA' }
  },
  {
    code: 'R30',
    name: 'San Diego & Imperial',
    divisionCode: 'DIV6',
    states: ['CA'],
    headquarters: { city: 'San Diego', state: 'CA' }
  },
  {
    code: 'R31',
    name: 'Oregon',
    divisionCode: 'DIV6',
    states: ['OR'],
    headquarters: { city: 'Portland', state: 'OR' }
  },
  {
    code: 'R32',
    name: 'Washington',
    divisionCode: 'DIV6',
    states: ['WA'],
    headquarters: { city: 'Seattle', state: 'WA' }
  },
  
  // Additional regions for other states
  {
    code: 'R33',
    name: 'Arizona',
    divisionCode: 'DIV5',
    states: ['AZ'],
    headquarters: { city: 'Phoenix', state: 'AZ' }
  },
  {
    code: 'R34',
    name: 'New Mexico',
    divisionCode: 'DIV5',
    states: ['NM'],
    headquarters: { city: 'Albuquerque', state: 'NM' }
  },
  {
    code: 'R35',
    name: 'Louisiana',
    divisionCode: 'DIV4',
    states: ['LA'],
    headquarters: { city: 'Baton Rouge', state: 'LA' }
  },
  {
    code: 'R36',
    name: 'Tennessee',
    divisionCode: 'DIV2',
    states: ['TN'],
    headquarters: { city: 'Nashville', state: 'TN' }
  },
  {
    code: 'R37',
    name: 'Kentucky',
    divisionCode: 'DIV3',
    states: ['KY'],
    headquarters: { city: 'Louisville', state: 'KY' }
  },
  {
    code: 'R38',
    name: 'West Virginia',
    divisionCode: 'DIV1',
    states: ['WV'],
    headquarters: { city: 'Charleston', state: 'WV' }
  },
  {
    code: 'R39',
    name: 'Virginia',
    divisionCode: 'DIV1',
    states: ['VA'],
    headquarters: { city: 'Richmond', state: 'VA' }
  },
  {
    code: 'R40',
    name: 'Maryland & Delaware',
    divisionCode: 'DIV1',
    states: ['MD', 'DE'],
    headquarters: { city: 'Baltimore', state: 'MD' }
  },
  {
    code: 'R41',
    name: 'National Capital',
    divisionCode: 'DIV1',
    states: ['DC'],
    headquarters: { city: 'Washington', state: 'DC' }
  },
  {
    code: 'R42',
    name: 'New Jersey',
    divisionCode: 'DIV1',
    states: ['NJ'],
    headquarters: { city: 'Trenton', state: 'NJ' }
  },
  {
    code: 'R43',
    name: 'North Carolina',
    divisionCode: 'DIV2',
    states: ['NC'],
    headquarters: { city: 'Raleigh', state: 'NC' }
  },
  {
    code: 'R44',
    name: 'South Carolina',
    divisionCode: 'DIV2',
    states: ['SC'],
    headquarters: { city: 'Columbia', state: 'SC' }
  },
  {
    code: 'R45',
    name: 'Missouri',
    divisionCode: 'DIV3',
    states: ['MO'],
    headquarters: { city: 'St. Louis', state: 'MO' }
  },
  {
    code: 'R46',
    name: 'Kansas',
    divisionCode: 'DIV4',
    states: ['KS'],
    headquarters: { city: 'Wichita', state: 'KS' }
  },
  {
    code: 'R47',
    name: 'Nebraska',
    divisionCode: 'DIV3',
    states: ['NE'],
    headquarters: { city: 'Omaha', state: 'NE' }
  },
  {
    code: 'R48',
    name: 'Iowa',
    divisionCode: 'DIV3',
    states: ['IA'],
    headquarters: { city: 'Des Moines', state: 'IA' }
  },
  {
    code: 'R49',
    name: 'Hawaii',
    divisionCode: 'DIV6',
    states: ['HI'],
    headquarters: { city: 'Honolulu', state: 'HI' }
  },
  {
    code: 'R50',
    name: 'Alaska',
    divisionCode: 'DIV6',
    states: ['AK'],
    headquarters: { city: 'Anchorage', state: 'AK' }
  },
  {
    code: 'R51',
    name: 'Puerto Rico',
    divisionCode: 'DIV2',
    states: ['PR'],
    headquarters: { city: 'San Juan', state: 'PR' }
  }
];

// STATES (All 50 states + DC + territories)
export const ARC_STATES: ARCState[] = [
  { code: 'AL', name: 'Alabama', regionCodes: ['R10'], fipsCode: '01' },
  { code: 'AK', name: 'Alaska', regionCodes: ['R50'], fipsCode: '02' },
  { code: 'AZ', name: 'Arizona', regionCodes: ['R33'], fipsCode: '04' },
  { code: 'AR', name: 'Arkansas', regionCodes: ['R21'], fipsCode: '05' },
  { code: 'CA', name: 'California', regionCodes: ['R27', 'R28', 'R29', 'R30'], fipsCode: '06' },
  { code: 'CO', name: 'Colorado', regionCodes: ['R23'], fipsCode: '08' },
  { code: 'CT', name: 'Connecticut', regionCodes: ['R04'], fipsCode: '09' },
  { code: 'DE', name: 'Delaware', regionCodes: ['R40'], fipsCode: '10' },
  { code: 'DC', name: 'District of Columbia', regionCodes: ['R41'], fipsCode: '11' },
  { code: 'FL', name: 'Florida', regionCodes: ['R06', 'R07', 'R08'], fipsCode: '12' },
  { code: 'GA', name: 'Georgia', regionCodes: ['R09'], fipsCode: '13' },
  { code: 'HI', name: 'Hawaii', regionCodes: ['R49'], fipsCode: '15' },
  { code: 'ID', name: 'Idaho', regionCodes: ['R26'], fipsCode: '16' },
  { code: 'IL', name: 'Illinois', regionCodes: ['R15'], fipsCode: '17' },
  { code: 'IN', name: 'Indiana', regionCodes: ['R13'], fipsCode: '18' },
  { code: 'IA', name: 'Iowa', regionCodes: ['R48'], fipsCode: '19' },
  { code: 'KS', name: 'Kansas', regionCodes: ['R46'], fipsCode: '20' },
  { code: 'KY', name: 'Kentucky', regionCodes: ['R37'], fipsCode: '21' },
  { code: 'LA', name: 'Louisiana', regionCodes: ['R35'], fipsCode: '22' },
  { code: 'ME', name: 'Maine', regionCodes: ['R04'], fipsCode: '23' },
  { code: 'MD', name: 'Maryland', regionCodes: ['R40'], fipsCode: '24' },
  { code: 'MA', name: 'Massachusetts', regionCodes: ['R04'], fipsCode: '25' },
  { code: 'MI', name: 'Michigan', regionCodes: ['R14'], fipsCode: '26' },
  { code: 'MN', name: 'Minnesota', regionCodes: ['R17'], fipsCode: '27' },
  { code: 'MS', name: 'Mississippi', regionCodes: ['R10'], fipsCode: '28' },
  { code: 'MO', name: 'Missouri', regionCodes: ['R45'], fipsCode: '29' },
  { code: 'MT', name: 'Montana', regionCodes: ['R25'], fipsCode: '30' },
  { code: 'NE', name: 'Nebraska', regionCodes: ['R47'], fipsCode: '31' },
  { code: 'NV', name: 'Nevada', regionCodes: ['R24'], fipsCode: '32' },
  { code: 'NH', name: 'New Hampshire', regionCodes: ['R04'], fipsCode: '33' },
  { code: 'NJ', name: 'New Jersey', regionCodes: ['R42'], fipsCode: '34' },
  { code: 'NM', name: 'New Mexico', regionCodes: ['R34'], fipsCode: '35' },
  { code: 'NY', name: 'New York', regionCodes: ['R01', 'R02', 'R03'], fipsCode: '36' },
  { code: 'NC', name: 'North Carolina', regionCodes: ['R43'], fipsCode: '37' },
  { code: 'ND', name: 'North Dakota', regionCodes: ['R17'], fipsCode: '38' },
  { code: 'OH', name: 'Ohio', regionCodes: ['R11', 'R12'], fipsCode: '39' },
  { code: 'OK', name: 'Oklahoma', regionCodes: ['R22'], fipsCode: '40' },
  { code: 'OR', name: 'Oregon', regionCodes: ['R31'], fipsCode: '41' },
  { code: 'PA', name: 'Pennsylvania', regionCodes: ['R05'], fipsCode: '42' },
  { code: 'PR', name: 'Puerto Rico', regionCodes: ['R51'], fipsCode: '72' },
  { code: 'RI', name: 'Rhode Island', regionCodes: ['R04'], fipsCode: '44' },
  { code: 'SC', name: 'South Carolina', regionCodes: ['R44'], fipsCode: '45' },
  { code: 'SD', name: 'South Dakota', regionCodes: ['R17'], fipsCode: '46' },
  { code: 'TN', name: 'Tennessee', regionCodes: ['R36'], fipsCode: '47' },
  { code: 'TX', name: 'Texas', regionCodes: ['R18', 'R19', 'R20'], fipsCode: '48' },
  { code: 'UT', name: 'Utah', regionCodes: ['R24'], fipsCode: '49' },
  { code: 'VT', name: 'Vermont', regionCodes: ['R04'], fipsCode: '50' },
  { code: 'VA', name: 'Virginia', regionCodes: ['R39'], fipsCode: '51' },
  { code: 'WA', name: 'Washington', regionCodes: ['R32'], fipsCode: '53' },
  { code: 'WV', name: 'West Virginia', regionCodes: ['R38'], fipsCode: '54' },
  { code: 'WI', name: 'Wisconsin', regionCodes: ['R16'], fipsCode: '55' },
  { code: 'WY', name: 'Wyoming', regionCodes: ['R23'], fipsCode: '56' }
];

// SAMPLE CHAPTERS (Florida focus - need to expand to all 250+)
export const ARC_CHAPTERS: ARCChapter[] = [
  // Central Florida Region (R06)
  {
    id: 'CH001',
    name: 'Central Florida Chapter',
    regionCode: 'R06',
    state: 'FL',
    counties: ['Orange', 'Osceola', 'Seminole', 'Lake', 'Brevard'],
    headquarters: {
      address: '5 N Bumby Ave',
      city: 'Orlando',
      state: 'FL',
      zip: '32803'
    },
    contact: {
      phone: '(407) 894-4141',
      email: 'info@centralflorida.redcross.org'
    }
  },
  {
    id: 'CH002',
    name: 'Tampa Bay Chapter',
    regionCode: 'R06',
    state: 'FL',
    counties: ['Hillsborough', 'Pinellas', 'Pasco', 'Hernando', 'Citrus'],
    headquarters: {
      address: '3310 W Main St',
      city: 'Tampa',
      state: 'FL',
      zip: '33607'
    },
    contact: {
      phone: '(813) 348-4820'
    }
  },
  {
    id: 'CH003',
    name: 'Suncoast Chapter',
    regionCode: 'R06',
    state: 'FL',
    counties: ['Sarasota', 'Manatee', 'Charlotte', 'DeSoto'],
    headquarters: {
      city: 'Sarasota',
      state: 'FL'
    }
  },
  
  // North Florida Region (R07)
  {
    id: 'CH004',
    name: 'Capital Area Chapter',
    regionCode: 'R07',
    state: 'FL',
    counties: ['Leon', 'Jefferson', 'Madison', 'Taylor', 'Wakulla', 'Franklin', 'Gadsden', 'Liberty'],
    headquarters: {
      address: '1115 Easterwood Dr',
      city: 'Tallahassee',
      state: 'FL',
      zip: '32311'
    }
  },
  {
    id: 'CH005',
    name: 'Northeast Florida Chapter',
    regionCode: 'R07',
    state: 'FL',
    counties: ['Duval', 'Clay', 'St. Johns', 'Nassau', 'Baker'],
    headquarters: {
      address: '751 Riverside Ave',
      city: 'Jacksonville',
      state: 'FL',
      zip: '32204'
    }
  },
  {
    id: 'CH006',
    name: 'Northwest Florida Chapter',
    regionCode: 'R07',
    state: 'FL',
    counties: ['Escambia', 'Santa Rosa', 'Okaloosa', 'Walton', 'Bay', 'Holmes', 'Washington'],
    headquarters: {
      city: 'Pensacola',
      state: 'FL'
    }
  },
  
  // South Florida Region (R08)
  {
    id: 'CH007',
    name: 'Greater Miami & The Keys',
    regionCode: 'R08',
    state: 'FL',
    counties: ['Miami-Dade', 'Monroe'],
    headquarters: {
      address: '335 SW 27th Ave',
      city: 'Miami',
      state: 'FL',
      zip: '33135'
    }
  },
  {
    id: 'CH008',
    name: 'South Florida Chapter',
    regionCode: 'R08',
    state: 'FL',
    counties: ['Broward', 'Palm Beach', 'Martin', 'St. Lucie', 'Indian River', 'Okeechobee'],
    headquarters: {
      city: 'West Palm Beach',
      state: 'FL'
    }
  },
  {
    id: 'CH009',
    name: 'Lee County Chapter',
    regionCode: 'R08',
    state: 'FL',
    counties: ['Lee', 'Collier', 'Hendry', 'Glades'],
    headquarters: {
      address: '1682 N Airport Rd',
      city: 'Fort Myers',
      state: 'FL',
      zip: '33907'
    }
  },
  
  // Sample chapters from other states
  {
    id: 'CH010',
    name: 'Greater New York',
    regionCode: 'R02',
    state: 'NY',
    counties: ['New York', 'Bronx', 'Kings', 'Queens', 'Richmond'],
    headquarters: {
      address: '520 W 49th St',
      city: 'New York',
      state: 'NY',
      zip: '10019'
    }
  },
  {
    id: 'CH011',
    name: 'Los Angeles Region',
    regionCode: 'R29',
    state: 'CA',
    counties: ['Los Angeles'],
    headquarters: {
      address: '11355 Ohio Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90025'
    }
  },
  {
    id: 'CH012',
    name: 'Houston Area Chapter',
    regionCode: 'R19',
    state: 'TX',
    counties: ['Harris', 'Fort Bend', 'Montgomery', 'Galveston', 'Brazoria'],
    headquarters: {
      address: '2700 Southwest Fwy',
      city: 'Houston',
      state: 'TX',
      zip: '77098'
    }
  }
];

// FLORIDA COUNTIES (All 67)
export const FLORIDA_COUNTIES: ARCCounty[] = [
  // Northwest Florida
  { name: 'Escambia', state: 'FL', fips: '12033', chapterId: 'CH006', population: 321905 },
  { name: 'Santa Rosa', state: 'FL', fips: '12113', chapterId: 'CH006', population: 188000 },
  { name: 'Okaloosa', state: 'FL', fips: '12091', chapterId: 'CH006', population: 211668 },
  { name: 'Walton', state: 'FL', fips: '12131', chapterId: 'CH006', population: 75305 },
  { name: 'Bay', state: 'FL', fips: '12005', chapterId: 'CH006', population: 175216 },
  { name: 'Holmes', state: 'FL', fips: '12059', chapterId: 'CH006', population: 19530 },
  { name: 'Washington', state: 'FL', fips: '12133', chapterId: 'CH006', population: 25318 },
  { name: 'Jackson', state: 'FL', fips: '12063', chapterId: 'CH004', population: 46414 },
  { name: 'Calhoun', state: 'FL', fips: '12013', chapterId: 'CH004', population: 13648 },
  { name: 'Gulf', state: 'FL', fips: '12045', chapterId: 'CH004', population: 14875 },
  
  // North Central Florida  
  { name: 'Leon', state: 'FL', fips: '12073', chapterId: 'CH004', population: 293582 },
  { name: 'Wakulla', state: 'FL', fips: '12129', chapterId: 'CH004', population: 33764 },
  { name: 'Jefferson', state: 'FL', fips: '12065', chapterId: 'CH004', population: 14510 },
  { name: 'Madison', state: 'FL', fips: '12079', chapterId: 'CH004', population: 17968 },
  { name: 'Taylor', state: 'FL', fips: '12123', chapterId: 'CH004', population: 21569 },
  { name: 'Franklin', state: 'FL', fips: '12037', chapterId: 'CH004', population: 12451 },
  { name: 'Gadsden', state: 'FL', fips: '12039', chapterId: 'CH004', population: 43826 },
  { name: 'Liberty', state: 'FL', fips: '12077', chapterId: 'CH004', population: 7974 },
  { name: 'Hamilton', state: 'FL', fips: '12047', chapterId: 'CH005', population: 14004 },
  { name: 'Suwannee', state: 'FL', fips: '12121', chapterId: 'CH005', population: 45087 },
  { name: 'Lafayette', state: 'FL', fips: '12067', chapterId: 'CH005', population: 8451 },
  { name: 'Columbia', state: 'FL', fips: '12023', chapterId: 'CH005', population: 69698 },
  
  // Northeast Florida
  { name: 'Nassau', state: 'FL', fips: '12089', chapterId: 'CH005', population: 90352 },
  { name: 'Duval', state: 'FL', fips: '12031', chapterId: 'CH005', population: 995567 },
  { name: 'Clay', state: 'FL', fips: '12019', chapterId: 'CH005', population: 219252 },
  { name: 'St. Johns', state: 'FL', fips: '12109', chapterId: 'CH005', population: 273425 },
  { name: 'Baker', state: 'FL', fips: '12003', chapterId: 'CH005', population: 29210 },
  { name: 'Bradford', state: 'FL', fips: '12007', chapterId: 'CH005', population: 28201 },
  { name: 'Union', state: 'FL', fips: '12125', chapterId: 'CH005', population: 15854 },
  { name: 'Alachua', state: 'FL', fips: '12001', chapterId: 'CH005', population: 276111 },
  { name: 'Gilchrist', state: 'FL', fips: '12041', chapterId: 'CH005', population: 18582 },
  { name: 'Levy', state: 'FL', fips: '12075', chapterId: 'CH005', population: 42915 },
  { name: 'Dixie', state: 'FL', fips: '12029', chapterId: 'CH005', population: 16759 },
  { name: 'Putnam', state: 'FL', fips: '12107', chapterId: 'CH005', population: 73267 },
  { name: 'Marion', state: 'FL', fips: '12083', chapterId: 'CH005', population: 375908 },
  { name: 'Flagler', state: 'FL', fips: '12035', chapterId: 'CH005', population: 115378 },
  { name: 'Volusia', state: 'FL', fips: '12127', chapterId: 'CH005', population: 553543 },
  
  // Central Florida
  { name: 'Lake', state: 'FL', fips: '12069', chapterId: 'CH001', population: 383956 },
  { name: 'Sumter', state: 'FL', fips: '12119', chapterId: 'CH001', population: 129752 },
  { name: 'Citrus', state: 'FL', fips: '12017', chapterId: 'CH002', population: 153843 },
  { name: 'Hernando', state: 'FL', fips: '12053', chapterId: 'CH002', population: 194515 },
  { name: 'Pasco', state: 'FL', fips: '12101', chapterId: 'CH002', population: 561891 },
  { name: 'Pinellas', state: 'FL', fips: '12103', chapterId: 'CH002', population: 959107 },
  { name: 'Hillsborough', state: 'FL', fips: '12057', chapterId: 'CH002', population: 1471968 },
  { name: 'Polk', state: 'FL', fips: '12105', chapterId: 'CH001', population: 724777 },
  { name: 'Orange', state: 'FL', fips: '12095', chapterId: 'CH001', population: 1429908 },
  { name: 'Osceola', state: 'FL', fips: '12097', chapterId: 'CH001', population: 388656 },
  { name: 'Seminole', state: 'FL', fips: '12117', chapterId: 'CH001', population: 470856 },
  { name: 'Brevard', state: 'FL', fips: '12009', chapterId: 'CH001', population: 606612 },
  
  // Southwest Florida
  { name: 'Manatee', state: 'FL', fips: '12081', chapterId: 'CH003', population: 399710 },
  { name: 'Sarasota', state: 'FL', fips: '12115', chapterId: 'CH003', population: 434006 },
  { name: 'Charlotte', state: 'FL', fips: '12015', chapterId: 'CH003', population: 188910 },
  { name: 'DeSoto', state: 'FL', fips: '12027', chapterId: 'CH003', population: 33976 },
  { name: 'Hardee', state: 'FL', fips: '12049', chapterId: 'CH003', population: 25327 },
  { name: 'Highlands', state: 'FL', fips: '12055', chapterId: 'CH001', population: 101235 },
  { name: 'Lee', state: 'FL', fips: '12071', chapterId: 'CH009', population: 770577 },
  { name: 'Collier', state: 'FL', fips: '12021', chapterId: 'CH009', population: 375752 },
  { name: 'Glades', state: 'FL', fips: '12043', chapterId: 'CH009', population: 12126 },
  { name: 'Hendry', state: 'FL', fips: '12051', chapterId: 'CH009', population: 39619 },
  
  // Southeast Florida
  { name: 'Indian River', state: 'FL', fips: '12061', chapterId: 'CH008', population: 159923 },
  { name: 'St. Lucie', state: 'FL', fips: '12111', chapterId: 'CH008', population: 329226 },
  { name: 'Martin', state: 'FL', fips: '12085', chapterId: 'CH008', population: 161000 },
  { name: 'Okeechobee', state: 'FL', fips: '12093', chapterId: 'CH008', population: 39644 },
  { name: 'Palm Beach', state: 'FL', fips: '12099', chapterId: 'CH008', population: 1496770 },
  { name: 'Broward', state: 'FL', fips: '12011', chapterId: 'CH008', population: 1944375 },
  { name: 'Miami-Dade', state: 'FL', fips: '12086', chapterId: 'CH007', population: 2716940 },
  { name: 'Monroe', state: 'FL', fips: '12087', chapterId: 'CH007', population: 82874 }
];

// Helper functions to work with the data
export function getDivisionByCode(code: string): ARCDivision | undefined {
  return ARC_DIVISIONS.find(d => d.code === code);
}

export function getRegionByCode(code: string): ARCRegion | undefined {
  return ARC_REGIONS.find(r => r.code === code);
}

export function getRegionsByDivision(divisionCode: string): ARCRegion[] {
  return ARC_REGIONS.filter(r => r.divisionCode === divisionCode);
}

export function getRegionsByState(stateCode: string): ARCRegion[] {
  return ARC_REGIONS.filter(r => r.states.includes(stateCode));
}

export function getChaptersByRegion(regionCode: string): ARCChapter[] {
  return ARC_CHAPTERS.filter(c => c.regionCode === regionCode);
}

export function getChaptersByState(stateCode: string): ARCChapter[] {
  return ARC_CHAPTERS.filter(c => c.state === stateCode);
}

export function getCountiesByChapter(chapterId: string): ARCCounty[] {
  return FLORIDA_COUNTIES.filter(c => c.chapterId === chapterId);
}

export function getCountiesByState(stateCode: string): ARCCounty[] {
  if (stateCode === 'FL') {
    return FLORIDA_COUNTIES;
  }
  // Add more states as we expand the data
  return [];
}

// Export everything as a single object for convenience
export const ARC_ORGANIZATION = {
  divisions: ARC_DIVISIONS,
  regions: ARC_REGIONS,
  states: ARC_STATES,
  chapters: ARC_CHAPTERS,
  floridaCounties: FLORIDA_COUNTIES,
  // Helper methods
  getDivisionByCode,
  getRegionByCode,
  getRegionsByDivision,
  getRegionsByState,
  getChaptersByRegion,
  getChaptersByState,
  getCountiesByChapter,
  getCountiesByState
};