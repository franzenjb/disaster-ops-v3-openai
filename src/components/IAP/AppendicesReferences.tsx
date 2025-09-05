'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface AppendixItem {
  id: string;
  title: string;
  type: 'document' | 'link' | 'text' | 'image';
  content: string;
  category: string;
}

interface Reference {
  id: string;
  title: string;
  type: string;
  url?: string;
  document?: string;
  notes?: string;
}

export function AppendicesReferences() {
  const [appendices, setAppendices] = useState<AppendixItem[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'appendices' | 'references'>('appendices');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  useEffect(() => {
    // Load from storage or use defaults
    const savedAppendices = simpleStore.getAppendices ? simpleStore.getAppendices() : null;
    const savedReferences = simpleStore.getReferences ? simpleStore.getReferences() : null;
    
    if (!savedAppendices || savedAppendices.length === 0) {
      // Default appendices
      setAppendices([
        {
          id: '1',
          title: 'Evacuation Routes Map',
          type: 'image',
          content: 'evacuation-routes.jpg',
          category: 'Maps'
        },
        {
          id: '2',
          title: 'Emergency Contact Numbers',
          type: 'text',
          content: `National HQ: 1-800-RED-CROSS
FL State EOC: (850) 815-4000
FEMA Region IV: (770) 220-5200
National Weather Service: (813) 645-2323`,
          category: 'Contacts'
        },
        {
          id: '3',
          title: 'Radio Frequencies',
          type: 'text',
          content: `Primary: 154.265 MHz (Red Cross 1)
Secondary: 154.295 MHz (Red Cross 2)
Tertiary: 462.675 MHz (FRS/GMRS 15)
State EOC: 155.370 MHz`,
          category: 'Communications'
        },
        {
          id: '4',
          title: 'Shelter Operating Procedures',
          type: 'document',
          content: 'SOP-Shelter-Operations-v3.2.pdf',
          category: 'SOPs'
        },
        {
          id: '5',
          title: 'Supply Request Form',
          type: 'document',
          content: 'Form-6409-Supply-Request.pdf',
          category: 'Forms'
        }
      ]);
    } else {
      setAppendices(savedAppendices);
    }
    
    if (!savedReferences || savedReferences.length === 0) {
      // Default references
      setReferences([
        {
          id: '1',
          title: 'Red Cross Disaster Services Procedures',
          type: 'Manual',
          document: 'DSP Manual v2024',
          notes: 'Primary operational guidance'
        },
        {
          id: '2',
          title: 'Florida Emergency Management',
          type: 'Website',
          url: 'https://www.floridadisaster.org',
          notes: 'State emergency information'
        },
        {
          id: '3',
          title: 'National Hurricane Center',
          type: 'Website',
          url: 'https://www.nhc.noaa.gov',
          notes: 'Hurricane tracking and forecasts'
        },
        {
          id: '4',
          title: 'FEMA Disaster Declarations',
          type: 'Website',
          url: 'https://www.fema.gov/disasters',
          notes: 'Federal disaster declarations'
        },
        {
          id: '5',
          title: 'Shelter Standards and Procedures',
          type: 'Document',
          document: 'ARC 3041 (Rev. 8/23)',
          notes: 'Shelter operations standards'
        },
        {
          id: '6',
          title: 'Mass Care Operations Guide',
          type: 'Document',
          document: 'MC-001-2024',
          notes: 'Mass care planning and operations'
        }
      ]);
    } else {
      setReferences(savedReferences);
    }
  }, []);
  
  const handleSave = () => {
    if (simpleStore.saveAppendices) {
      simpleStore.saveAppendices(appendices);
    }
    if (simpleStore.saveReferences) {
      simpleStore.saveReferences(references);
    }
    setEditMode(false);
    setEditingItem(null);
  };
  
  const handleAddAppendix = () => {
    const newItem: AppendixItem = {
      id: `app-${Date.now()}`,
      title: 'New Appendix',
      type: 'text',
      content: '',
      category: 'Other'
    };
    setAppendices([...appendices, newItem]);
    setEditingItem(newItem.id);
  };
  
  const handleAddReference = () => {
    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      title: 'New Reference',
      type: 'Document',
      notes: ''
    };
    setReferences([...references, newRef]);
    setEditingItem(newRef.id);
  };
  
  const handleDeleteAppendix = (id: string) => {
    setAppendices(appendices.filter(item => item.id !== id));
  };
  
  const handleDeleteReference = (id: string) => {
    setReferences(references.filter(item => item.id !== id));
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center">
        <h2 className="text-xl font-bold">Appendices and References</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          {editMode && (
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Save All
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setActiveTab('appendices')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'appendices'
              ? 'bg-white border-t-2 border-l border-r border-gray-300 -mb-px'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Appendices ({appendices.length})
        </button>
        <button
          onClick={() => setActiveTab('references')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'references'
              ? 'bg-white border-t-2 border-l border-r border-gray-300 -mb-px'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          References ({references.length})
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-white border-l border-r border-b border-gray-300 p-4">
        {activeTab === 'appendices' ? (
          <div>
            {editMode && (
              <button
                onClick={handleAddAppendix}
                className="mb-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Add Appendix
              </button>
            )}
            
            {/* Appendices List */}
            <div className="space-y-3">
              {appendices.map((item) => (
                <div key={item.id} className="border border-gray-300 rounded p-3">
                  {editingItem === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          setAppendices(prev => prev.map(a => 
                            a.id === item.id ? { ...a, title: e.target.value } : a
                          ));
                        }}
                        className="w-full px-2 py-1 border rounded font-bold"
                        placeholder="Title"
                      />
                      <div className="flex gap-2">
                        <select
                          value={item.type}
                          onChange={(e) => {
                            setAppendices(prev => prev.map(a => 
                              a.id === item.id ? { ...a, type: e.target.value as any } : a
                            ));
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="text">Text</option>
                          <option value="document">Document</option>
                          <option value="link">Link</option>
                          <option value="image">Image</option>
                        </select>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => {
                            setAppendices(prev => prev.map(a => 
                              a.id === item.id ? { ...a, category: e.target.value } : a
                            ));
                          }}
                          className="px-2 py-1 border rounded"
                          placeholder="Category"
                        />
                      </div>
                      <textarea
                        value={item.content}
                        onChange={(e) => {
                          setAppendices(prev => prev.map(a => 
                            a.id === item.id ? { ...a, content: e.target.value } : a
                          ));
                        }}
                        className="w-full px-2 py-1 border rounded"
                        rows={4}
                        placeholder={item.type === 'text' ? 'Enter text content...' : 'Enter file name or URL...'}
                      />
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">{item.title}</h3>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded ml-2">{item.type}</span>
                        </div>
                        {editMode && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAppendix(item.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {item.type === 'link' ? (
                          <a href={item.content} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {item.content}
                          </a>
                        ) : item.type === 'document' || item.type === 'image' ? (
                          <span className="italic">File: {item.content}</span>
                        ) : (
                          item.content
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {editMode && (
              <button
                onClick={handleAddReference}
                className="mb-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Add Reference
              </button>
            )}
            
            {/* References Table */}
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Title</th>
                  <th className="border border-gray-300 p-2 text-left">Type</th>
                  <th className="border border-gray-300 p-2 text-left">Source</th>
                  <th className="border border-gray-300 p-2 text-left">Notes</th>
                  {editMode && <th className="border border-gray-300 p-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {references.map((ref) => (
                  <tr key={ref.id}>
                    <td className="border border-gray-300 p-2">
                      {editingItem === ref.id ? (
                        <input
                          type="text"
                          value={ref.title}
                          onChange={(e) => {
                            setReferences(prev => prev.map(r => 
                              r.id === ref.id ? { ...r, title: e.target.value } : r
                            ));
                          }}
                          className="w-full px-1 border rounded"
                        />
                      ) : (
                        <strong>{ref.title}</strong>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {editingItem === ref.id ? (
                        <input
                          type="text"
                          value={ref.type}
                          onChange={(e) => {
                            setReferences(prev => prev.map(r => 
                              r.id === ref.id ? { ...r, type: e.target.value } : r
                            ));
                          }}
                          className="w-24 px-1 border rounded"
                        />
                      ) : (
                        ref.type
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {editingItem === ref.id ? (
                        <input
                          type="text"
                          value={ref.url || ref.document || ''}
                          onChange={(e) => {
                            const isUrl = e.target.value.startsWith('http');
                            setReferences(prev => prev.map(r => 
                              r.id === ref.id ? { 
                                ...r, 
                                url: isUrl ? e.target.value : undefined,
                                document: !isUrl ? e.target.value : undefined
                              } : r
                            ));
                          }}
                          className="w-full px-1 border rounded"
                          placeholder="URL or Document ID"
                        />
                      ) : (
                        ref.url ? (
                          <a href={ref.url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noopener noreferrer">
                            {ref.url}
                          </a>
                        ) : (
                          <span className="text-sm">{ref.document}</span>
                        )
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {editingItem === ref.id ? (
                        <input
                          type="text"
                          value={ref.notes || ''}
                          onChange={(e) => {
                            setReferences(prev => prev.map(r => 
                              r.id === ref.id ? { ...r, notes: e.target.value } : r
                            ));
                          }}
                          className="w-full px-1 border rounded"
                        />
                      ) : (
                        <span className="text-sm italic">{ref.notes}</span>
                      )}
                    </td>
                    {editMode && (
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-1 justify-center">
                          {editingItem === ref.id ? (
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                            >
                              Done
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingItem(ref.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReference(ref.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}