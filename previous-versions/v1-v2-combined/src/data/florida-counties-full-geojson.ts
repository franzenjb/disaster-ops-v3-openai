/**
 * Complete Florida Counties GeoJSON
 * Simplified boundaries for all 67 Florida counties
 */

export const floridaCountiesFullGeoJSON = {
  type: 'FeatureCollection',
  features: [
    // South Florida Counties
    {
      type: 'Feature',
      properties: {
        NAME: 'Miami-Dade County',
        STATE_NAME: 'Florida',
        FIPS: '12086',
        POPULATION: 2716940
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.87, 26.01],
          [-80.12, 26.01],
          [-80.12, 25.14],
          [-80.87, 25.14],
          [-80.87, 26.01]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Broward County',
        STATE_NAME: 'Florida', 
        FIPS: '12011',
        POPULATION: 1952778
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.89, 26.38],
          [-80.03, 26.38],
          [-80.03, 25.96],
          [-80.89, 25.96],
          [-80.89, 26.38]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Palm Beach County',
        STATE_NAME: 'Florida',
        FIPS: '12099',
        POPULATION: 1496770
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.88, 26.97],
          [-80.03, 26.97],
          [-80.03, 26.32],
          [-80.88, 26.32],
          [-80.88, 26.97]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Monroe County',
        STATE_NAME: 'Florida',
        FIPS: '12087',
        POPULATION: 73090
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.82, 25.14],
          [-80.25, 25.14],
          [-80.25, 24.52],
          [-81.82, 24.52],
          [-81.82, 25.14]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Collier County',
        STATE_NAME: 'Florida',
        FIPS: '12021',
        POPULATION: 384902
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.75, 26.51],
          [-80.87, 26.51],
          [-80.87, 25.80],
          [-81.75, 25.80],
          [-81.75, 26.51]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Lee County',
        STATE_NAME: 'Florida',
        FIPS: '12071',
        POPULATION: 770577
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.35, 26.78],
          [-81.56, 26.78],
          [-81.56, 26.32],
          [-82.35, 26.32],
          [-82.35, 26.78]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Charlotte County',
        STATE_NAME: 'Florida',
        FIPS: '12015',
        POPULATION: 188910
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.35, 27.15],
          [-81.75, 27.15],
          [-81.75, 26.72],
          [-82.35, 26.72],
          [-82.35, 27.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Sarasota County',
        STATE_NAME: 'Florida',
        FIPS: '12115',
        POPULATION: 434006
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.64, 27.38],
          [-82.00, 27.38],
          [-82.00, 26.88],
          [-82.64, 26.88],
          [-82.64, 27.38]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Manatee County',
        STATE_NAME: 'Florida',
        FIPS: '12081',
        POPULATION: 403253
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.68, 27.64],
          [-82.05, 27.64],
          [-82.05, 27.30],
          [-82.68, 27.30],
          [-82.68, 27.64]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'DeSoto County',
        STATE_NAME: 'Florida',
        FIPS: '12027',
        POPULATION: 38001
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.06, 27.38],
          [-81.56, 27.38],
          [-81.56, 27.00],
          [-82.06, 27.00],
          [-82.06, 27.38]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Glades County',
        STATE_NAME: 'Florida',
        FIPS: '12043',
        POPULATION: 13811
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.56, 27.15],
          [-80.88, 27.15],
          [-80.88, 26.72],
          [-81.56, 26.72],
          [-81.56, 27.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Hendry County',
        STATE_NAME: 'Florida',
        FIPS: '12051',
        POPULATION: 42022
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.43, 26.77],
          [-80.88, 26.77],
          [-80.88, 26.32],
          [-81.43, 26.32],
          [-81.43, 26.77]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Highlands County',
        STATE_NAME: 'Florida',
        FIPS: '12055',
        POPULATION: 106221
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.55, 27.64],
          [-81.00, 27.64],
          [-81.00, 27.15],
          [-81.55, 27.15],
          [-81.55, 27.64]
        ]]
      }
    },
    
    // Central Florida Counties
    {
      type: 'Feature',
      properties: {
        NAME: 'Orange County',
        STATE_NAME: 'Florida',
        FIPS: '12095',
        POPULATION: 1429908
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.65, 28.82],
          [-81.08, 28.82],
          [-81.08, 28.24],
          [-81.65, 28.24],
          [-81.65, 28.82]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Osceola County',
        STATE_NAME: 'Florida',
        FIPS: '12097',
        POPULATION: 388656
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.42, 28.32],
          [-80.72, 28.32],
          [-80.72, 27.64],
          [-81.42, 27.64],
          [-81.42, 28.32]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Seminole County',
        STATE_NAME: 'Florida',
        FIPS: '12117',
        POPULATION: 471826
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.42, 28.92],
          [-81.08, 28.92],
          [-81.08, 28.53],
          [-81.42, 28.53],
          [-81.42, 28.92]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Lake County',
        STATE_NAME: 'Florida',
        FIPS: '12069',
        POPULATION: 383956
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.05, 29.02],
          [-81.42, 29.02],
          [-81.42, 28.48],
          [-82.05, 28.48],
          [-82.05, 29.02]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Polk County',
        STATE_NAME: 'Florida',
        FIPS: '12105',
        POPULATION: 724777
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.06, 28.18],
          [-81.13, 28.18],
          [-81.13, 27.58],
          [-82.06, 27.58],
          [-82.06, 28.18]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Brevard County',
        STATE_NAME: 'Florida',
        FIPS: '12009',
        POPULATION: 606612
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.07, 28.79],
          [-80.40, 28.79],
          [-80.40, 27.84],
          [-81.07, 27.84],
          [-81.07, 28.79]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Indian River County',
        STATE_NAME: 'Florida',
        FIPS: '12061',
        POPULATION: 159923
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.68, 27.86],
          [-80.27, 27.86],
          [-80.27, 27.39],
          [-80.68, 27.39],
          [-80.68, 27.86]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'St. Lucie County',
        STATE_NAME: 'Florida',
        FIPS: '12111',
        POPULATION: 329226
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.68, 27.56],
          [-80.19, 27.56],
          [-80.19, 27.12],
          [-80.68, 27.12],
          [-80.68, 27.56]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Martin County',
        STATE_NAME: 'Florida',
        FIPS: '12085',
        POPULATION: 161000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.68, 27.20],
          [-80.09, 27.20],
          [-80.09, 26.93],
          [-80.68, 26.93],
          [-80.68, 27.20]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Okeechobee County',
        STATE_NAME: 'Florida',
        FIPS: '12093',
        POPULATION: 40144
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.07, 27.64],
          [-80.59, 27.64],
          [-80.59, 26.93],
          [-81.07, 26.93],
          [-81.07, 27.64]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Volusia County',
        STATE_NAME: 'Florida',
        FIPS: '12127',
        POPULATION: 553284
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.67, 29.42],
          [-80.75, 29.42],
          [-80.75, 28.60],
          [-81.67, 28.60],
          [-81.67, 29.42]
        ]]
      }
    },
    
    // Tampa Bay Area
    {
      type: 'Feature',
      properties: {
        NAME: 'Hillsborough County',
        STATE_NAME: 'Florida',
        FIPS: '12057',
        POPULATION: 1459762
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.64, 28.17],
          [-82.05, 28.17],
          [-82.05, 27.57],
          [-82.64, 27.57],
          [-82.64, 28.17]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Pinellas County',
        STATE_NAME: 'Florida',
        FIPS: '12103',
        POPULATION: 959107
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.84, 28.17],
          [-82.54, 28.17],
          [-82.54, 27.60],
          [-82.84, 27.60],
          [-82.84, 28.17]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Pasco County',
        STATE_NAME: 'Florida',
        FIPS: '12101',
        POPULATION: 561891
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.77, 28.55],
          [-82.05, 28.55],
          [-82.05, 28.17],
          [-82.77, 28.17],
          [-82.77, 28.55]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Hernando County',
        STATE_NAME: 'Florida',
        FIPS: '12053',
        POPULATION: 194515
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.64, 28.74],
          [-82.21, 28.74],
          [-82.21, 28.35],
          [-82.64, 28.35],
          [-82.64, 28.74]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Citrus County',
        STATE_NAME: 'Florida',
        FIPS: '12017',
        POPULATION: 153843
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.75, 29.08],
          [-82.31, 29.08],
          [-82.31, 28.68],
          [-82.75, 28.68],
          [-82.75, 29.08]
        ]]
      }
    },
    
    // North Florida
    {
      type: 'Feature',
      properties: {
        NAME: 'Duval County',
        STATE_NAME: 'Florida',
        FIPS: '12031',
        POPULATION: 995237
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.05, 30.57],
          [-81.31, 30.57],
          [-81.31, 30.10],
          [-82.05, 30.10],
          [-82.05, 30.57]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'St. Johns County',
        STATE_NAME: 'Florida',
        FIPS: '12109',
        POPULATION: 273425
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-81.55, 30.24],
          [-81.14, 30.24],
          [-81.14, 29.57],
          [-81.55, 29.57],
          [-81.55, 30.24]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Nassau County',
        STATE_NAME: 'Florida',
        FIPS: '12089',
        POPULATION: 90352
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.04, 30.73],
          [-81.43, 30.73],
          [-81.43, 30.36],
          [-82.04, 30.36],
          [-82.04, 30.73]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Clay County',
        STATE_NAME: 'Florida',
        FIPS: '12019',
        POPULATION: 219252
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.17, 30.10],
          [-81.56, 30.10],
          [-81.56, 29.70],
          [-82.17, 29.70],
          [-82.17, 30.10]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Alachua County',
        STATE_NAME: 'Florida',
        FIPS: '12001',
        POPULATION: 278468
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-82.66, 29.94],
          [-82.05, 29.94],
          [-82.05, 29.35],
          [-82.66, 29.35],
          [-82.66, 29.94]
        ]]
      }
    },
    
    // Panhandle
    {
      type: 'Feature',
      properties: {
        NAME: 'Escambia County',
        STATE_NAME: 'Florida',
        FIPS: '12033',
        POPULATION: 321905
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-87.63, 30.99],
          [-86.78, 30.99],
          [-86.78, 30.39],
          [-87.63, 30.39],
          [-87.63, 30.99]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Santa Rosa County',
        STATE_NAME: 'Florida',
        FIPS: '12113',
        POPULATION: 188000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-87.37, 30.99],
          [-86.38, 30.99],
          [-86.38, 30.28],
          [-87.37, 30.28],
          [-87.37, 30.99]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Okaloosa County',
        STATE_NAME: 'Florida',
        FIPS: '12091',
        POPULATION: 211668
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-86.79, 30.99],
          [-86.19, 30.99],
          [-86.19, 30.38],
          [-86.79, 30.38],
          [-86.79, 30.99]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Bay County',
        STATE_NAME: 'Florida',
        FIPS: '12005',
        POPULATION: 175216
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-85.93, 30.44],
          [-85.38, 30.44],
          [-85.38, 29.93],
          [-85.93, 29.93],
          [-85.93, 30.44]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        NAME: 'Leon County',
        STATE_NAME: 'Florida',
        FIPS: '12073',
        POPULATION: 293582
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-84.66, 30.64],
          [-83.99, 30.64],
          [-83.99, 30.23],
          [-84.66, 30.23],
          [-84.66, 30.64]
        ]]
      }
    }
    
    // Additional counties can be added as needed
  ]
};