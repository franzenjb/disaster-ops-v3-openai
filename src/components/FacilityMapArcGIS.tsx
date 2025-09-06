'use client';

import React, { useState, useEffect, useRef } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface MapFacility {
  id: string;
  name: string;
  type: string;
  discipline: string;
  address: string;
  county: string;
  lat?: number;
  lng?: number;
  status: string;
  capacity?: any;
  personnel?: any;
  icon: string;
  color: string;
}

export function FacilityMapArcGIS() {
  const [facilities, setFacilities] = useState<MapFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<MapFacility | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<any>(null);

  useEffect(() => {
    // Load ArcGIS JavaScript API
    const loadMap = async () => {
      // Add ArcGIS CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://js.arcgis.com/4.28/esri/themes/light/main.css';
      document.head.appendChild(cssLink);

      // Add ArcGIS JavaScript
      const script = document.createElement('script');
      script.src = 'https://js.arcgis.com/4.28/';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        initializeMap();
      };
    };

    loadMap();

    return () => {
      // Cleanup
      if (mapViewRef.current) {
        mapViewRef.current.destroy();
      }
    };
  }, []);

  const initializeMap = () => {
    // @ts-ignore - ArcGIS global
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/TextSymbol",
      "esri/PopupTemplate",
      "esri/widgets/Search",
      "esri/widgets/Legend",
      "esri/widgets/Expand",
      "esri/geometry/Point",
      "esri/tasks/Locator"
    ], (
      Map: any,
      MapView: any,
      Graphic: any,
      GraphicsLayer: any,
      SimpleMarkerSymbol: any,
      TextSymbol: any,
      PopupTemplate: any,
      Search: any,
      Legend: any,
      Expand: any,
      Point: any,
      Locator: any
    ) => {
      // Create map
      const map = new Map({
        basemap: "streets-navigation-vector"
      });

      // Create map view
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [-81.5158, 27.6648], // Florida center
        zoom: 7
      });

      mapViewRef.current = view;

      // Create graphics layer for facilities
      const facilitiesLayer = new GraphicsLayer({
        title: "Disaster Response Facilities"
      });
      map.add(facilitiesLayer);

      // Add search widget
      const searchWidget = new Search({
        view: view
      });
      view.ui.add(searchWidget, "top-right");

      // Initialize geocoder
      const locator = new Locator({
        url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      });

      // Load and geocode facilities
      loadFacilities(facilitiesLayer, locator, Graphic, SimpleMarkerSymbol, PopupTemplate, Point);

      setMapLoaded(true);
    });
  };

  const loadFacilities = async (
    layer: any,
    locator: any,
    Graphic: any,
    SimpleMarkerSymbol: any,
    PopupTemplate: any,
    Point: any
  ) => {
    const allFacilities: MapFacility[] = [];
    
    // Process all facility types
    const facilityGroups = [
      {
        data: V27_IAP_DATA.shelteringFacilities,
        type: 'Shelter',
        discipline: 'Sheltering',
        icon: '🏠',
        color: [220, 38, 38], // red
        symbol: 'circle'
      },
      {
        data: V27_IAP_DATA.feedingFacilities,
        type: 'Feeding',
        discipline: 'Feeding',
        icon: '🍽️',
        color: [234, 88, 12], // orange
        symbol: 'square'
      },
      {
        data: V27_IAP_DATA.governmentFacilities || [],
        type: 'EOC',
        discipline: 'Government Operations',
        icon: '🏛️',
        color: [37, 99, 235], // blue
        symbol: 'diamond'
      }
    ];

    for (const group of facilityGroups) {
      for (const facility of group.data) {
        const mapFacility: MapFacility = {
          id: `${group.discipline}-${facility.id}`,
          name: facility.name,
          type: group.type,
          discipline: group.discipline,
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          capacity: facility.capacity,
          personnel: facility.personnel,
          icon: group.icon,
          color: `rgb(${group.color.join(',')})`
        };

        // Geocode address
        try {
          const result = await locator.addressToLocations({
            address: {
              SingleLine: `${facility.address}, ${facility.county} County, Florida`
            }
          });

          if (result && result[0]) {
            mapFacility.lat = result[0].location.latitude;
            mapFacility.lng = result[0].location.longitude;

            // Create popup content
            const popupContent = `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${mapFacility.icon} ${mapFacility.name}</h3>
                <table style="width: 100%; font-size: 12px;">
                  <tr><td style="padding: 3px;"><strong>Type:</strong></td><td>${mapFacility.type}</td></tr>
                  <tr><td style="padding: 3px;"><strong>Address:</strong></td><td>${mapFacility.address}</td></tr>
                  <tr><td style="padding: 3px;"><strong>County:</strong></td><td>${mapFacility.county}</td></tr>
                  <tr><td style="padding: 3px;"><strong>Status:</strong></td><td>
                    <span style="background: ${mapFacility.status === 'Open' || mapFacility.status === 'Active' ? '#10b981' : '#f59e0b'}; 
                                 color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
                      ${mapFacility.status}
                    </span>
                  </td></tr>
                  ${mapFacility.capacity ? `
                    <tr><td style="padding: 3px;"><strong>Capacity:</strong></td><td>
                      ${typeof mapFacility.capacity === 'object' && mapFacility.capacity.maximum
                        ? `${mapFacility.capacity.current || 0}/${mapFacility.capacity.maximum} beds`
                        : mapFacility.capacity.meals
                        ? `${mapFacility.capacity.meals} meals/day`
                        : '-'
                      }
                    </td></tr>
                  ` : ''}
                  ${mapFacility.personnel ? `
                    <tr><td style="padding: 3px;"><strong>Staffing:</strong></td><td>
                      ${mapFacility.personnel.have}/${mapFacility.personnel.required}
                      ${mapFacility.personnel.gap > 0 
                        ? `<span style="color: #dc2626; font-weight: bold;"> (-${mapFacility.personnel.gap})</span>` 
                        : ''}
                    </td></tr>
                  ` : ''}
                </table>
                <div style="margin-top: 10px; display: flex; gap: 5px;">
                  <button onclick="alert('View details for ${mapFacility.name}')" 
                          style="flex: 1; padding: 5px; background: #3b82f6; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    View Details
                  </button>
                  <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(mapFacility.address)}')" 
                          style="flex: 1; padding: 5px; background: #6b7280; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Get Directions
                  </button>
                </div>
              </div>
            `;

            // Create graphic
            const point = new Point({
              longitude: mapFacility.lng,
              latitude: mapFacility.lat
            });

            const symbol = new SimpleMarkerSymbol({
              style: group.symbol,
              color: group.color,
              size: "16px",
              outline: {
                color: [255, 255, 255],
                width: 2
              }
            });

            const popupTemplate = new PopupTemplate({
              title: "{name}",
              content: popupContent
            });

            const graphic = new Graphic({
              geometry: point,
              symbol: symbol,
              attributes: {
                name: mapFacility.name,
                type: mapFacility.type,
                discipline: mapFacility.discipline
              },
              popupTemplate: popupTemplate
            });

            layer.add(graphic);
          }
        } catch (error) {
          console.error(`Failed to geocode ${facility.address}:`, error);
        }

        allFacilities.push(mapFacility);
      }
    }

    setFacilities(allFacilities);
  };

  // Filter facilities
  const filteredFacilities = filterDiscipline === 'all' 
    ? facilities 
    : facilities.filter(f => f.discipline === filterDiscipline);

  const disciplines = ['all', ...Array.from(new Set(facilities.map(f => f.discipline)))];

  return (
    <div className="h-screen flex">
      {/* Left Panel - Facility List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gray-800 text-white sticky top-0 z-10">
          <h2 className="text-xl font-bold">🗺️ Facility Map (ArcGIS)</h2>
          <p className="text-sm mt-1">{filteredFacilities.length} locations</p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50 sticky top-[72px] z-10">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            {disciplines.map(disc => (
              <option key={disc} value={disc}>
                {disc === 'all' ? 'All Disciplines' : disc}
              </option>
            ))}
          </select>
        </div>

        {/* Facility List */}
        <div className="divide-y">
          {filteredFacilities.map(facility => (
            <button
              key={facility.id}
              onClick={() => {
                setSelectedFacility(facility);
                if (mapViewRef.current && facility.lat && facility.lng) {
                  mapViewRef.current.goTo({
                    center: [facility.lng, facility.lat],
                    zoom: 15
                  });
                }
              }}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                selectedFacility?.id === facility.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{facility.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{facility.name}</h3>
                  <p className="text-sm text-gray-600">{facility.type} • {facility.county} County</p>
                  <p className="text-xs text-gray-500 mt-1">{facility.address}</p>
                  
                  {/* Status Badge */}
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                    facility.status === 'Open' || facility.status === 'Active' || facility.status === 'Operational'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facility.status}
                  </span>
                  
                  {/* Quick Stats */}
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    {facility.capacity && (
                      <span>
                        {typeof facility.capacity === 'object' && facility.capacity.maximum
                          ? `${facility.capacity.current || 0}/${facility.capacity.maximum} beds`
                          : facility.capacity.meals
                          ? `${facility.capacity.meals} meals/day`
                          : null
                        }
                      </span>
                    )}
                    {facility.personnel && (
                      <span>
                        {facility.personnel.have}/{facility.personnel.required} staff
                        {facility.personnel.gap > 0 && (
                          <span className="text-red-600 font-semibold"> (-{facility.personnel.gap})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ArcGIS Map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}