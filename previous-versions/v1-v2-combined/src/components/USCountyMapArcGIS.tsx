import React, { useEffect, useRef } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import '@arcgis/core/assets/esri/themes/light/main.css';

export function USCountyMapArcGIS() {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const selectedCounties = useOperationStore(state => state.selectedCounties);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import ArcGIS modules
    const loadMap = async () => {
      try {
        const [Map, MapView, FeatureLayer, GraphicsLayer, Graphic] = await Promise.all([
          import('@arcgis/core/Map').then(m => m.default),
          import('@arcgis/core/views/MapView').then(m => m.default),
          import('@arcgis/core/layers/FeatureLayer').then(m => m.default),
          import('@arcgis/core/layers/GraphicsLayer').then(m => m.default),
          import('@arcgis/core/Graphic').then(m => m.default),
        ]);

        // Create map with simple basemap
        const map = new Map({
          basemap: 'topo-vector'  // Changed to a simpler basemap
        });

        // Create map view
        const view = new MapView({
          container: mapRef.current!,
          map: map,
          center: [-98.5795, 39.8283],
          zoom: 4,
          ui: {
            components: ['zoom', 'compass']
          }
        });

        // Use ESRI's public county service (no auth required)
        const countiesLayer = new FeatureLayer({
          url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3',
          outFields: ['NAME', 'STATE_NAME'],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: [255, 255, 255, 0.1],
              outline: {
                width: 0.5,
                color: [200, 200, 200, 0.5]
              }
            }
          } as any
        });

        map.add(countiesLayer);

        // Create graphics layer for selected counties
        const selectionLayer = new GraphicsLayer({
          title: 'Selected Counties'
        });
        map.add(selectionLayer);

        viewRef.current = view;
        layerRef.current = selectionLayer;

        // Update selected counties when view is ready
        view.when(() => {
          updateSelectedCounties(countiesLayer, selectionLayer, view);
        });
      } catch (error) {
        console.error('Error loading ArcGIS map:', error);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  const updateSelectedCounties = async (countiesLayer: any, selectionLayer: any, view: any) => {
    if (!countiesLayer || !selectionLayer) return;

    // Clear previous selection
    selectionLayer.removeAll();

    if (selectedCounties.length === 0) {
      // Reset to US view
      view.goTo({
        center: [-98.5795, 39.8283],
        zoom: 4
      });
      return;
    }

    try {
      // For now, just show markers for selected counties
      // since querying might require auth
      const [Point, SimpleMarkerSymbol, TextSymbol] = await Promise.all([
        import('@arcgis/core/geometry/Point').then(m => m.default),
        import('@arcgis/core/symbols/SimpleMarkerSymbol').then(m => m.default),
        import('@arcgis/core/symbols/TextSymbol').then(m => m.default),
      ]);

      // Add a marker for each selected county
      // In production you'd have actual coordinates
      selectedCounties.forEach(county => {
        // This is a placeholder - you'd need actual county coordinates
        const point = new Point({
          longitude: -98.5795 + (Math.random() - 0.5) * 20,
          latitude: 39.8283 + (Math.random() - 0.5) * 10
        });

        const symbol = new SimpleMarkerSymbol({
          color: [220, 38, 38, 0.8],
          size: 12,
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        });

        const graphic = new (await import('@arcgis/core/Graphic')).default({
          geometry: point,
          symbol: symbol,
          attributes: {
            name: county.name,
            state: county.state
          },
          popupTemplate: {
            title: '{name}, {state}',
            content: 'Selected County'
          }
        });

        selectionLayer.add(graphic);
      });

    } catch (error) {
      console.error('Error updating counties:', error);
    }
  };

  // Update when counties change
  useEffect(() => {
    if (viewRef.current && layerRef.current) {
      const view = viewRef.current;
      const countiesLayer = view.map.layers.getItemAt(0);
      
      if (countiesLayer) {
        updateSelectedCounties(countiesLayer, layerRef.current, view);
      }
    }
  }, [selectedCounties]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-lg border border-gray-300" />
      {selectedCounties.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md z-10">
          <div className="text-sm font-semibold">{selectedCounties.length} counties selected</div>
          <button
            onClick={() => {
              if (viewRef.current) {
                viewRef.current.goTo({
                  center: [-98.5795, 39.8283],
                  zoom: 4
                });
              }
            }}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Reset view
          </button>
        </div>
      )}
    </div>
  );
}