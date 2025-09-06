'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface MapImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  uploadedAt: string;
}

export function MapsGeographic() {
  const [maps, setMaps] = useState<MapImage[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load from storage
    const savedMaps = localStorage.getItem('iap_maps');
    if (savedMaps) {
      setMaps(JSON.parse(savedMaps));
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMap: MapImage = {
          id: `map-${Date.now()}-${Math.random()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          imageUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString()
        };
        setMaps(prev => {
          const updated = [...prev, newMap];
          localStorage.setItem('iap_maps', JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const updateMap = (id: string, field: keyof MapImage, value: string) => {
    setMaps(prev => {
      const updated = prev.map(map => 
        map.id === id ? { ...map, [field]: value } : map
      );
      localStorage.setItem('iap_maps', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMap = (id: string) => {
    setMaps(prev => {
      const updated = prev.filter(map => map.id !== id);
      localStorage.setItem('iap_maps', JSON.stringify(updated));
      return updated;
    });
  };

  const moveMap = (id: string, direction: 'up' | 'down') => {
    setMaps(prev => {
      const index = prev.findIndex(m => m.id === id);
      if ((direction === 'up' && index === 0) || 
          (direction === 'down' && index === prev.length - 1)) {
        return prev;
      }
      
      const newMaps = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newMaps[index], newMaps[newIndex]] = [newMaps[newIndex], newMaps[index]];
      
      localStorage.setItem('iap_maps', JSON.stringify(newMaps));
      return newMaps;
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Maps and Geographic Information</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded font-semibold ${
              editMode 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {editMode ? '🔴 EDITING - Click to Exit' : '✏️ Edit Maps'}
          </button>
          {editMode && (
            <>
              <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold cursor-pointer">
                📤 Upload Maps
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      {editMode && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-3 mb-4">
          <strong>📝 Edit Mode Active:</strong> Upload one or multiple map images. 
          Click on titles and descriptions to edit them. Use arrow buttons to reorder maps.
          Images will automatically be included in the IAP document.
        </div>
      )}

      {/* Default content if no maps */}
      {maps.length === 0 && !editMode && (
        <div className="border-2 border-gray-300 h-96 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No maps uploaded yet</p>
            <button
              onClick={() => setEditMode(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add Maps
            </button>
          </div>
        </div>
      )}

      {/* Map Gallery */}
      {maps.length > 0 && (
        <div className="space-y-6">
          {maps.map((map, index) => (
            <div key={map.id} className="border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* Map Header */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editMode ? (
                      <input
                        type="text"
                        value={map.title}
                        onChange={(e) => updateMap(map.id, 'title', e.target.value)}
                        className="text-lg font-bold w-full px-2 py-1 border rounded"
                        placeholder="Map Title"
                      />
                    ) : (
                      <h3 className="text-lg font-bold">{map.title || 'Untitled Map'}</h3>
                    )}
                    {editMode ? (
                      <textarea
                        value={map.description}
                        onChange={(e) => updateMap(map.id, 'description', e.target.value)}
                        className="w-full mt-2 px-2 py-1 border rounded text-sm"
                        placeholder="Map description (optional)"
                        rows={2}
                      />
                    ) : map.description ? (
                      <p className="text-sm text-gray-600 mt-1">{map.description}</p>
                    ) : null}
                  </div>
                  {editMode && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => moveMap(map.id, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveMap(map.id, 'down')}
                        disabled={index === maps.length - 1}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteMap(map.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Map Image */}
              <div className="p-4 bg-white">
                <img 
                  src={map.imageUrl} 
                  alt={map.title}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
              
              {/* Map Footer */}
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-300 text-xs text-gray-500">
                Map {index + 1} of {maps.length} • Uploaded: {new Date(map.uploadedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state when in edit mode but no maps */}
      {maps.length === 0 && editMode && (
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center bg-gray-50">
          <div className="text-gray-500">
            <p className="text-lg mb-2">📍 No maps uploaded yet</p>
            <p className="mb-4">Click "Upload Maps" to add operational area maps, facility locations, evacuation routes, etc.</p>
            <label className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
              📤 Upload Your First Map
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}