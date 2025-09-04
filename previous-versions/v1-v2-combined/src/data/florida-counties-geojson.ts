/**
 * Simplified Florida County Boundaries
 * GeoJSON format for choropleth mapping
 */

export default {
  type: 'FeatureCollection',
  features: [
    // Miami-Dade County (simplified boundary)
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
          [-80.87, 25.98],
          [-80.12, 25.98],
          [-80.12, 25.35],
          [-80.35, 25.35],
          [-80.35, 25.13],
          [-80.87, 25.13],
          [-80.87, 25.98]
        ]]
      }
    },
    // Broward County
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
          [-80.87, 26.32],
          [-80.03, 26.32],
          [-80.03, 25.98],
          [-80.87, 25.98],
          [-80.87, 26.32]
        ]]
      }
    },
    // Palm Beach County
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
    // Lee County
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
    // Collier County
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
    // Monroe County (Florida Keys)
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
          [-81.80, 25.00],
          [-80.25, 25.00],
          [-80.25, 24.55],
          [-81.80, 24.55],
          [-81.80, 25.00]
        ]]
      }
    },
    // Orange County (Orlando area)
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
    // Hillsborough County (Tampa area)
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
    // Duval County (Jacksonville area)
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
    // Pinellas County
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
          [-82.85, 28.17],
          [-82.54, 28.17],
          [-82.54, 27.57],
          [-82.85, 27.57],
          [-82.85, 28.17]
        ]]
      }
    },
    // Leon County (Tallahassee)
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
          [-84.66, 30.63],
          [-84.00, 30.63],
          [-84.00, 30.24],
          [-84.66, 30.24],
          [-84.66, 30.63]
        ]]
      }
    },
    // Escambia County (Pensacola)
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
          [-87.00, 30.99],
          [-87.00, 30.28],
          [-87.63, 30.28],
          [-87.63, 30.99]
        ]]
      }
    },
    // Polk County
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
          [-82.05, 28.18],
          [-81.13, 28.18],
          [-81.13, 27.58],
          [-82.05, 27.58],
          [-82.05, 28.18]
        ]]
      }
    },
    // Brevard County
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
    // Volusia County
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
    // Sarasota County
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
          [-82.64, 27.37],
          [-82.00, 27.37],
          [-82.00, 26.89],
          [-82.64, 26.89],
          [-82.64, 27.37]
        ]]
      }
    },
    // Manatee County
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
          [-82.05, 27.29],
          [-82.68, 27.29],
          [-82.68, 27.64]
        ]]
      }
    },
    // Pasco County
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
    }
  ]
};