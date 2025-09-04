/**
 * American Red Cross National Structure
 * Divisions, Regions, and Chapters
 * 
 * The American Red Cross is organized into:
 * - National Headquarters (Washington, DC)
 * - Divisions (major geographic areas)
 * - Regions (within divisions)
 * - Chapters (local service delivery)
 */

export interface Chapter {
  name: string;
  code?: string;
  headquarters: string;
  phone: string;
  counties: string[];
  state: string;
}

export interface Region {
  name: string;
  code: string;
  states: string[];
  headquarters?: string;
  chapters: Chapter[];
}

export interface Division {
  name: string;
  code: string;
  headquarters: string;
  regions: Region[];
}

/**
 * American Red Cross Divisions
 * As of 2024, the ARC operates through several major divisions
 */
export const ARC_DIVISIONS: Division[] = [
  {
    name: "Atlantic Division",
    code: "ATL",
    headquarters: "Philadelphia, PA",
    regions: [
      {
        name: "Greater New York Region",
        code: "GNY",
        states: ["NY"],
        headquarters: "New York, NY",
        chapters: [
          {
            name: "Greater New York Chapter",
            headquarters: "New York, NY",
            phone: "(212) 875-2100",
            counties: ["New York", "Kings", "Queens", "Bronx", "Richmond"],
            state: "NY"
          },
          {
            name: "Long Island Chapter",
            headquarters: "Mineola, NY",
            phone: "(516) 747-3500",
            counties: ["Nassau", "Suffolk"],
            state: "NY"
          },
          {
            name: "Westchester County Chapter",
            headquarters: "White Plains, NY",
            phone: "(914) 946-6500",
            counties: ["Westchester", "Putnam"],
            state: "NY"
          },
          {
            name: "Hudson Valley Chapter",
            headquarters: "Middletown, NY",
            phone: "(845) 341-4700",
            counties: ["Orange", "Sullivan", "Ulster", "Dutchess"],
            state: "NY"
          }
        ]
      },
      {
        name: "Eastern Pennsylvania Region",
        code: "EPA",
        states: ["PA"],
        headquarters: "Philadelphia, PA",
        chapters: [
          {
            name: "Southeastern Pennsylvania Chapter",
            headquarters: "Philadelphia, PA",
            phone: "(215) 299-4000",
            counties: ["Philadelphia", "Bucks", "Chester", "Delaware", "Montgomery"],
            state: "PA"
          },
          {
            name: "Central Pennsylvania Chapter",
            headquarters: "Harrisburg, PA",
            phone: "(717) 234-3101",
            counties: ["Dauphin", "Cumberland", "Perry", "Lebanon", "York", "Lancaster"],
            state: "PA"
          },
          {
            name: "Northeastern Pennsylvania Chapter",
            headquarters: "Wilkes-Barre, PA",
            phone: "(570) 823-7161",
            counties: ["Luzerne", "Wyoming", "Lackawanna", "Monroe", "Pike", "Wayne", "Susquehanna"],
            state: "PA"
          }
        ]
      },
      {
        name: "New Jersey Region",
        code: "NJ",
        states: ["NJ"],
        headquarters: "Fairfield, NJ",
        chapters: [
          {
            name: "New Jersey Region",
            headquarters: "Fairfield, NJ",
            phone: "(973) 797-3300",
            counties: ["All NJ Counties"],
            state: "NJ"
          }
        ]
      },
      {
        name: "Greater Chesapeake Region",
        code: "CHE",
        states: ["MD", "DE", "DC"],
        headquarters: "Baltimore, MD",
        chapters: [
          {
            name: "Greater Chesapeake Chapter",
            headquarters: "Baltimore, MD",
            phone: "(410) 624-2000",
            counties: ["All MD Counties", "All DE Counties", "Washington DC"],
            state: "MD"
          }
        ]
      },
      {
        name: "Virginia Region",
        code: "VA",
        states: ["VA"],
        headquarters: "Richmond, VA",
        chapters: [
          {
            name: "Virginia Region",
            headquarters: "Richmond, VA",
            phone: "(804) 648-4636",
            counties: ["All VA Counties"],
            state: "VA"
          }
        ]
      }
    ]
  },
  {
    name: "Central & South Division",
    code: "CSD",
    headquarters: "Atlanta, GA",
    regions: [
      {
        name: "North Carolina Region",
        code: "NC",
        states: ["NC"],
        headquarters: "Charlotte, NC",
        chapters: [
          {
            name: "Eastern North Carolina Chapter",
            headquarters: "Raleigh, NC",
            phone: "(919) 755-6700",
            counties: ["Wake", "Durham", "Orange", "Johnston", "Wayne", "Wilson", "Nash", "Edgecombe"],
            state: "NC"
          },
          {
            name: "Greater Carolinas Chapter",
            headquarters: "Charlotte, NC",
            phone: "(704) 376-1661",
            counties: ["Mecklenburg", "Union", "Cabarrus", "Gaston", "Lincoln", "Cleveland", "Rutherford"],
            state: "NC"
          },
          {
            name: "Cape Fear Chapter",
            headquarters: "Wilmington, NC",
            phone: "(910) 762-2683",
            counties: ["New Hanover", "Brunswick", "Pender", "Columbus", "Bladen"],
            state: "NC"
          }
        ]
      },
      {
        name: "South Carolina Region",
        code: "SC",
        states: ["SC"],
        headquarters: "Columbia, SC",
        chapters: [
          {
            name: "Palmetto SC Region",
            headquarters: "Columbia, SC",
            phone: "(803) 540-1200",
            counties: ["All SC Counties"],
            state: "SC"
          }
        ]
      },
      {
        name: "Georgia Region",
        code: "GA",
        states: ["GA"],
        headquarters: "Atlanta, GA",
        chapters: [
          {
            name: "Georgia Region",
            headquarters: "Atlanta, GA",
            phone: "(404) 876-0655",
            counties: ["All GA Counties"],
            state: "GA"
          }
        ]
      },
      {
        name: "Florida Region",
        code: "FL",
        states: ["FL"],
        headquarters: "Tampa, FL",
        chapters: [
          {
            name: "Central Florida Chapter",
            headquarters: "Orlando, FL",
            phone: "(407) 894-4141",
            counties: ["Orange", "Osceola", "Seminole", "Lake", "Brevard"],
            state: "FL"
          },
          {
            name: "Northeast Florida Chapter",
            headquarters: "Jacksonville, FL",
            phone: "(904) 358-8091",
            counties: ["Duval", "Clay", "St. Johns", "Nassau", "Baker", "Putnam", "Flagler"],
            state: "FL"
          },
          {
            name: "South Florida Chapter",
            headquarters: "Miami, FL",
            phone: "(305) 644-1200",
            counties: ["Miami-Dade", "Broward", "Monroe"],
            state: "FL"
          },
          {
            name: "Tampa Bay Chapter",
            headquarters: "Tampa, FL",
            phone: "(813) 348-4820",
            counties: ["Hillsborough", "Pinellas", "Pasco", "Hernando", "Citrus"],
            state: "FL"
          },
          {
            name: "Southwest Florida Chapter",
            headquarters: "Fort Myers, FL",
            phone: "(239) 278-3401",
            counties: ["Lee", "Collier", "Charlotte", "Hendry", "Glades"],
            state: "FL"
          },
          {
            name: "North Central Florida Chapter",
            headquarters: "Gainesville, FL",
            phone: "(352) 376-4669",
            counties: ["Alachua", "Marion", "Columbia", "Suwannee", "Hamilton", "Lafayette", "Dixie", "Gilchrist", "Levy", "Bradford", "Union"],
            state: "FL"
          }
        ]
      },
      {
        name: "Alabama & Mississippi Region",
        code: "ALMS",
        states: ["AL", "MS"],
        headquarters: "Birmingham, AL",
        chapters: [
          {
            name: "Alabama Region",
            headquarters: "Birmingham, AL",
            phone: "(205) 458-8111",
            counties: ["All AL Counties"],
            state: "AL"
          },
          {
            name: "Mississippi Region",
            headquarters: "Jackson, MS",
            phone: "(601) 353-5442",
            counties: ["All MS Counties"],
            state: "MS"
          }
        ]
      },
      {
        name: "Tennessee Region",
        code: "TN",
        states: ["TN"],
        headquarters: "Nashville, TN",
        chapters: [
          {
            name: "Tennessee Region",
            headquarters: "Nashville, TN",
            phone: "(615) 250-4300",
            counties: ["All TN Counties"],
            state: "TN"
          }
        ]
      },
      {
        name: "Kentucky Region",
        code: "KY",
        states: ["KY"],
        headquarters: "Louisville, KY",
        chapters: [
          {
            name: "Kentucky Region",
            headquarters: "Louisville, KY",
            phone: "(502) 589-4450",
            counties: ["All KY Counties"],
            state: "KY"
          }
        ]
      }
    ]
  },
  {
    name: "Midwest Division",
    code: "MW",
    headquarters: "Chicago, IL",
    regions: [
      {
        name: "Illinois Region",
        code: "IL",
        states: ["IL"],
        headquarters: "Chicago, IL",
        chapters: [
          {
            name: "Greater Chicago Chapter",
            headquarters: "Chicago, IL",
            phone: "(312) 729-6100",
            counties: ["Cook", "DuPage", "Kane", "Lake", "McHenry", "Will"],
            state: "IL"
          },
          {
            name: "Central Illinois Chapter",
            headquarters: "Peoria, IL",
            phone: "(309) 677-7272",
            counties: ["Peoria", "Tazewell", "Woodford", "Fulton", "Marshall", "Stark", "Knox"],
            state: "IL"
          },
          {
            name: "Southern Illinois Chapter",
            headquarters: "Belleville, IL",
            phone: "(618) 234-9234",
            counties: ["St. Clair", "Madison", "Monroe", "Clinton", "Washington", "Randolph"],
            state: "IL"
          }
        ]
      },
      {
        name: "Indiana Region",
        code: "IN",
        states: ["IN"],
        headquarters: "Indianapolis, IN",
        chapters: [
          {
            name: "Indiana Region",
            headquarters: "Indianapolis, IN",
            phone: "(317) 684-1441",
            counties: ["All IN Counties"],
            state: "IN"
          }
        ]
      },
      {
        name: "Ohio Region",
        code: "OH",
        states: ["OH"],
        headquarters: "Columbus, OH",
        chapters: [
          {
            name: "Central & Southern Ohio Region",
            headquarters: "Columbus, OH",
            phone: "(614) 253-2740",
            counties: ["Franklin", "Delaware", "Licking", "Fairfield", "Madison", "Union", "Marion"],
            state: "OH"
          },
          {
            name: "Northern Ohio Region",
            headquarters: "Cleveland, OH",
            phone: "(216) 431-3010",
            counties: ["Cuyahoga", "Lake", "Geauga", "Ashtabula", "Lorain", "Medina", "Summit"],
            state: "OH"
          },
          {
            name: "Southwest Ohio Chapter",
            headquarters: "Cincinnati, OH",
            phone: "(513) 579-3000",
            counties: ["Hamilton", "Butler", "Warren", "Clermont", "Brown", "Adams"],
            state: "OH"
          }
        ]
      },
      {
        name: "Michigan Region",
        code: "MI",
        states: ["MI"],
        headquarters: "Detroit, MI",
        chapters: [
          {
            name: "Michigan Region",
            headquarters: "Detroit, MI",
            phone: "(313) 494-2700",
            counties: ["All MI Counties"],
            state: "MI"
          }
        ]
      },
      {
        name: "Wisconsin Region",
        code: "WI",
        states: ["WI"],
        headquarters: "Milwaukee, WI",
        chapters: [
          {
            name: "Wisconsin Region",
            headquarters: "Milwaukee, WI",
            phone: "(414) 342-8680",
            counties: ["All WI Counties"],
            state: "WI"
          }
        ]
      },
      {
        name: "Minnesota & Dakotas Region",
        code: "MND",
        states: ["MN", "ND", "SD"],
        headquarters: "Minneapolis, MN",
        chapters: [
          {
            name: "Minnesota Region",
            headquarters: "Minneapolis, MN",
            phone: "(612) 871-7676",
            counties: ["All MN Counties"],
            state: "MN"
          },
          {
            name: "Dakotas Region",
            headquarters: "Fargo, ND",
            phone: "(701) 364-1800",
            counties: ["All ND Counties", "All SD Counties"],
            state: "ND"
          }
        ]
      },
      {
        name: "Iowa & Nebraska Region",
        code: "IANE",
        states: ["IA", "NE"],
        headquarters: "Des Moines, IA",
        chapters: [
          {
            name: "Iowa Region",
            headquarters: "Des Moines, IA",
            phone: "(515) 243-7681",
            counties: ["All IA Counties"],
            state: "IA"
          },
          {
            name: "Nebraska Region",
            headquarters: "Omaha, NE",
            phone: "(402) 343-7700",
            counties: ["All NE Counties"],
            state: "NE"
          }
        ]
      },
      {
        name: "Missouri & Arkansas Region",
        code: "MOAR",
        states: ["MO", "AR"],
        headquarters: "St. Louis, MO",
        chapters: [
          {
            name: "Missouri Region",
            headquarters: "St. Louis, MO",
            phone: "(314) 516-2700",
            counties: ["All MO Counties"],
            state: "MO"
          },
          {
            name: "Arkansas Region",
            headquarters: "Little Rock, AR",
            phone: "(501) 748-1000",
            counties: ["All AR Counties"],
            state: "AR"
          }
        ]
      }
    ]
  },
  {
    name: "Western Division",
    code: "WD",
    headquarters: "Sacramento, CA",
    regions: [
      {
        name: "Northern California Region",
        code: "NCA",
        states: ["CA"],
        headquarters: "Sacramento, CA",
        chapters: [
          {
            name: "Bay Area Chapter",
            headquarters: "Oakland, CA",
            phone: "(510) 595-4400",
            counties: ["Alameda", "Contra Costa", "San Francisco", "San Mateo", "Santa Clara", "Santa Cruz"],
            state: "CA"
          },
          {
            name: "Capital Region Chapter",
            headquarters: "Sacramento, CA",
            phone: "(916) 993-7070",
            counties: ["Sacramento", "Yolo", "Placer", "El Dorado", "Amador", "Calaveras"],
            state: "CA"
          },
          {
            name: "Coastal Valleys Chapter",
            headquarters: "Fresno, CA",
            phone: "(559) 455-1000",
            counties: ["Fresno", "Madera", "Kings", "Tulare", "Kern"],
            state: "CA"
          }
        ]
      },
      {
        name: "Southern California Region",
        code: "SCA",
        states: ["CA"],
        headquarters: "Los Angeles, CA",
        chapters: [
          {
            name: "Los Angeles Region",
            headquarters: "Los Angeles, CA",
            phone: "(310) 445-9900",
            counties: ["Los Angeles"],
            state: "CA"
          },
          {
            name: "San Diego/Imperial Counties Chapter",
            headquarters: "San Diego, CA",
            phone: "(858) 309-1200",
            counties: ["San Diego", "Imperial"],
            state: "CA"
          },
          {
            name: "Orange County Chapter",
            headquarters: "Santa Ana, CA",
            phone: "(714) 481-5300",
            counties: ["Orange"],
            state: "CA"
          },
          {
            name: "Ventura County Chapter",
            headquarters: "Camarillo, CA",
            phone: "(805) 987-1514",
            counties: ["Ventura"],
            state: "CA"
          }
        ]
      },
      {
        name: "Pacific Northwest Region",
        code: "PNW",
        states: ["WA", "OR", "ID"],
        headquarters: "Seattle, WA",
        chapters: [
          {
            name: "Northwest Region",
            headquarters: "Seattle, WA",
            phone: "(206) 323-2345",
            counties: ["All WA Counties"],
            state: "WA"
          },
          {
            name: "Oregon Region",
            headquarters: "Portland, OR",
            phone: "(503) 284-1234",
            counties: ["All OR Counties"],
            state: "OR"
          },
          {
            name: "Idaho Region",
            headquarters: "Boise, ID",
            phone: "(208) 375-0314",
            counties: ["All ID Counties"],
            state: "ID"
          }
        ]
      },
      {
        name: "Mountain West Region",
        code: "MTW",
        states: ["CO", "WY", "UT", "MT"],
        headquarters: "Denver, CO",
        chapters: [
          {
            name: "Colorado & Wyoming Region",
            headquarters: "Denver, CO",
            phone: "(303) 722-7474",
            counties: ["All CO Counties", "All WY Counties"],
            state: "CO"
          },
          {
            name: "Utah/Nevada Region",
            headquarters: "Salt Lake City, UT",
            phone: "(801) 323-7000",
            counties: ["All UT Counties", "All NV Counties"],
            state: "UT"
          },
          {
            name: "Montana Region",
            headquarters: "Billings, MT",
            phone: "(406) 252-3104",
            counties: ["All MT Counties"],
            state: "MT"
          }
        ]
      },
      {
        name: "Southwest Region",
        code: "SW",
        states: ["AZ", "NM", "TX", "OK"],
        headquarters: "Dallas, TX",
        chapters: [
          {
            name: "Arizona Region",
            headquarters: "Phoenix, AZ",
            phone: "(602) 336-6660",
            counties: ["All AZ Counties"],
            state: "AZ"
          },
          {
            name: "New Mexico Region",
            headquarters: "Albuquerque, NM",
            phone: "(505) 265-8514",
            counties: ["All NM Counties"],
            state: "NM"
          },
          {
            name: "North Texas Region",
            headquarters: "Dallas, TX",
            phone: "(214) 678-4800",
            counties: ["Dallas", "Tarrant", "Collin", "Denton", "Rockwall", "Kaufman", "Ellis"],
            state: "TX"
          },
          {
            name: "Texas Gulf Coast Region",
            headquarters: "Houston, TX",
            phone: "(713) 526-8300",
            counties: ["Harris", "Fort Bend", "Montgomery", "Galveston", "Brazoria", "Waller"],
            state: "TX"
          },
          {
            name: "Central & South Texas Region",
            headquarters: "San Antonio, TX",
            phone: "(210) 224-5151",
            counties: ["Bexar", "Travis", "Williamson", "Guadalupe", "Comal", "Hays"],
            state: "TX"
          },
          {
            name: "Oklahoma Region",
            headquarters: "Oklahoma City, OK",
            phone: "(405) 228-9500",
            counties: ["All OK Counties"],
            state: "OK"
          }
        ]
      },
      {
        name: "Kansas Region",
        code: "KS",
        states: ["KS"],
        headquarters: "Wichita, KS",
        chapters: [
          {
            name: "Kansas Region",
            headquarters: "Wichita, KS",
            phone: "(316) 219-4000",
            counties: ["All KS Counties"],
            state: "KS"
          }
        ]
      }
    ]
  },
  {
    name: "Northeast Division",
    code: "NED",
    headquarters: "Boston, MA",
    regions: [
      {
        name: "Massachusetts Region",
        code: "MA",
        states: ["MA"],
        headquarters: "Boston, MA",
        chapters: [
          {
            name: "Massachusetts Region",
            headquarters: "Boston, MA",
            phone: "(617) 274-5200",
            counties: ["All MA Counties"],
            state: "MA"
          }
        ]
      },
      {
        name: "Connecticut & Rhode Island Region",
        code: "CTRI",
        states: ["CT", "RI"],
        headquarters: "Farmington, CT",
        chapters: [
          {
            name: "Connecticut & Rhode Island Region",
            headquarters: "Farmington, CT",
            phone: "(860) 678-2700",
            counties: ["All CT Counties", "All RI Counties"],
            state: "CT"
          }
        ]
      },
      {
        name: "Northern New England Region",
        code: "NNE",
        states: ["ME", "NH", "VT"],
        headquarters: "Concord, NH",
        chapters: [
          {
            name: "Northern New England Region",
            headquarters: "Concord, NH",
            phone: "(603) 225-6697",
            counties: ["All ME Counties", "All NH Counties", "All VT Counties"],
            state: "NH"
          }
        ]
      },
      {
        name: "Western & Central New York Region",
        code: "WCNY",
        states: ["NY"],
        headquarters: "Rochester, NY",
        chapters: [
          {
            name: "Western New York Chapter",
            headquarters: "Buffalo, NY",
            phone: "(716) 886-7500",
            counties: ["Erie", "Niagara", "Genesee", "Orleans", "Wyoming", "Chautauqua", "Cattaraugus", "Allegany"],
            state: "NY"
          },
          {
            name: "Central New York Chapter",
            headquarters: "Syracuse, NY",
            phone: "(315) 234-2200",
            counties: ["Onondaga", "Oswego", "Cayuga", "Madison", "Cortland", "Tompkins", "Oneida"],
            state: "NY"
          },
          {
            name: "Northeastern New York Chapter",
            headquarters: "Albany, NY",
            phone: "(518) 694-2215",
            counties: ["Albany", "Rensselaer", "Schenectady", "Saratoga", "Warren", "Washington"],
            state: "NY"
          }
        ]
      }
    ]
  },
  {
    name: "Pacific Division",
    code: "PAC",
    headquarters: "Honolulu, HI",
    regions: [
      {
        name: "Hawaii Region",
        code: "HI",
        states: ["HI"],
        headquarters: "Honolulu, HI",
        chapters: [
          {
            name: "Hawaii State Chapter",
            headquarters: "Honolulu, HI",
            phone: "(808) 734-2101",
            counties: ["All HI Counties"],
            state: "HI"
          }
        ]
      },
      {
        name: "Alaska Region",
        code: "AK",
        states: ["AK"],
        headquarters: "Anchorage, AK",
        chapters: [
          {
            name: "Alaska Chapter",
            headquarters: "Anchorage, AK",
            phone: "(907) 646-5400",
            counties: ["All AK Boroughs"],
            state: "AK"
          }
        ]
      },
      {
        name: "Pacific Territories",
        code: "PT",
        states: ["GU", "AS", "MP"],
        headquarters: "Guam",
        chapters: [
          {
            name: "Guam Chapter",
            headquarters: "Hagåtña, GU",
            phone: "(671) 648-0260",
            counties: ["Guam"],
            state: "GU"
          },
          {
            name: "American Samoa Chapter",
            headquarters: "Pago Pago, AS",
            phone: "(684) 633-0001",
            counties: ["American Samoa"],
            state: "AS"
          },
          {
            name: "Northern Mariana Islands",
            headquarters: "Saipan, MP",
            phone: "(670) 234-3459",
            counties: ["Northern Mariana Islands"],
            state: "MP"
          }
        ]
      }
    ]
  },
  {
    name: "National Capital & Virgin Islands Division",
    code: "NCVI",
    headquarters: "Washington, DC",
    regions: [
      {
        name: "National Capital Region",
        code: "NCR",
        states: ["DC"],
        headquarters: "Washington, DC",
        chapters: [
          {
            name: "National Capital & Greater Chesapeake Region",
            headquarters: "Washington, DC",
            phone: "(202) 728-6400",
            counties: ["Washington DC"],
            state: "DC"
          }
        ]
      },
      {
        name: "Virgin Islands",
        code: "VI",
        states: ["VI"],
        headquarters: "St. Croix, VI",
        chapters: [
          {
            name: "Virgin Islands Chapter",
            headquarters: "St. Croix, VI",
            phone: "(340) 774-0375",
            counties: ["St. Croix", "St. Thomas", "St. John"],
            state: "VI"
          }
        ]
      },
      {
        name: "Puerto Rico",
        code: "PR",
        states: ["PR"],
        headquarters: "San Juan, PR",
        chapters: [
          {
            name: "Puerto Rico Chapter",
            headquarters: "San Juan, PR",
            phone: "(787) 729-6222",
            counties: ["All PR Municipalities"],
            state: "PR"
          }
        ]
      }
    ]
  },
  {
    name: "Louisiana Region",
    code: "LA",
    headquarters: "Baton Rouge, LA",
    regions: [
      {
        name: "Louisiana Region",
        code: "LA",
        states: ["LA"],
        headquarters: "Baton Rouge, LA",
        chapters: [
          {
            name: "Louisiana Capital Area Chapter",
            headquarters: "Baton Rouge, LA",
            phone: "(225) 291-4533",
            counties: ["East Baton Rouge", "West Baton Rouge", "Ascension", "Livingston", "Iberville"],
            state: "LA"
          },
          {
            name: "Southeast Louisiana Chapter",
            headquarters: "New Orleans, LA",
            phone: "(504) 620-3105",
            counties: ["Orleans", "Jefferson", "St. Bernard", "Plaquemines", "St. Tammany", "Washington"],
            state: "LA"
          },
          {
            name: "Southwest Louisiana Chapter",
            headquarters: "Lake Charles, LA",
            phone: "(337) 478-2130",
            counties: ["Calcasieu", "Cameron", "Jeff Davis", "Allen", "Beauregard"],
            state: "LA"
          },
          {
            name: "Central Louisiana Chapter",
            headquarters: "Alexandria, LA",
            phone: "(318) 442-7578",
            counties: ["Rapides", "Avoyelles", "Grant", "LaSalle", "Vernon", "Winn", "Natchitoches"],
            state: "LA"
          },
          {
            name: "Northeast Louisiana Chapter",
            headquarters: "Monroe, LA",
            phone: "(318) 325-3200",
            counties: ["Ouachita", "Morehouse", "Union", "Lincoln", "Jackson", "Caldwell", "Franklin"],
            state: "LA"
          },
          {
            name: "Northwest Louisiana Chapter",
            headquarters: "Shreveport, LA",
            phone: "(318) 865-9314",
            counties: ["Caddo", "Bossier", "Webster", "Claiborne", "DeSoto", "Red River", "Bienville"],
            state: "LA"
          }
        ]
      }
    ]
  },
  {
    name: "West Virginia Region",
    code: "WV",
    headquarters: "Charleston, WV",
    regions: [
      {
        name: "West Virginia Region",
        code: "WV",
        states: ["WV"],
        headquarters: "Charleston, WV",
        chapters: [
          {
            name: "West Virginia Region",
            headquarters: "Charleston, WV",
            phone: "(304) 340-3650",
            counties: ["All WV Counties"],
            state: "WV"
          }
        ]
      }
    ]
  }
];

// Helper function to get all states
export function getAllStates(): string[] {
  const states = new Set<string>();
  ARC_DIVISIONS.forEach(division => {
    division.regions.forEach(region => {
      region.states.forEach(state => states.add(state));
    });
  });
  return Array.from(states).sort();
}

// Helper function to get chapters by state
export function getChaptersByState(state: string): Chapter[] {
  const chapters: Chapter[] = [];
  ARC_DIVISIONS.forEach(division => {
    division.regions.forEach(region => {
      if (region.states.includes(state)) {
        chapters.push(...region.chapters.filter(ch => ch.state === state));
      }
    });
  });
  return chapters;
}

// Helper function to get division by state
export function getDivisionByState(state: string): Division | undefined {
  return ARC_DIVISIONS.find(division =>
    division.regions.some(region => region.states.includes(state))
  );
}

// Helper function to get region by state
export function getRegionByState(state: string): Region | undefined {
  for (const division of ARC_DIVISIONS) {
    const region = division.regions.find(r => r.states.includes(state));
    if (region) return region;
  }
  return undefined;
}

// State name to abbreviation mapping
export const STATE_NAMES: Record<string, string> = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
  'District of Columbia': 'DC',
  'Puerto Rico': 'PR',
  'Virgin Islands': 'VI',
  'Guam': 'GU',
  'American Samoa': 'AS',
  'Northern Mariana Islands': 'MP'
};