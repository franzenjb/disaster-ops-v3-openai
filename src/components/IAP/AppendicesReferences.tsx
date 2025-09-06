'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface AppendixItem {
  id: string;
  title: string;
  type: 'document' | 'image' | 'link' | 'text';
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  uploadedAt: string;
}

interface ReferenceItem {
  id: string;
  title: string;
  type: 'manual' | 'plan' | 'procedure' | 'contact' | 'link';
  content: string;
  url?: string;
}

export function AppendicesReferences() {
  const [appendices, setAppendices] = useState<AppendixItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'appendices' | 'references'>('appendices');

  useEffect(() => {
    // Load from storage
    const savedAppendices = localStorage.getItem('iap_appendices');
    const savedReferences = localStorage.getItem('iap_references');
    
    if (savedAppendices) {
      setAppendices(JSON.parse(savedAppendices));
    } else {
      // Default typical IAP appendices based on real operations
      setAppendices([
        {
          id: '1',
          title: 'Lodging and Accommodations Guide',
          type: 'text',
          content: `**APPROVED HOTELS FOR RESPONDERS**

**Primary Lodging (American Red Cross Rate)**
• Hampton Inn & Suites Downtown
  - Address: 123 Main Street, Tampa, FL 33602
  - Rate: $89/night (ARC Corporate Rate)
  - Confirmation Code: ARC2024
  - Contact: (813) 555-0123

**Secondary Lodging Options**
• Courtyard by Marriott Airport
  - Address: 4567 Airport Blvd, Tampa, FL 33607
  - Rate: $95/night
  - Pet Friendly: Yes (fee applies)

**LODGING REIMBURSEMENT**
- Maximum $120/night for approved facilities
- Receipts required for all stays
- Book through ARC Travel when possible
- Personal vehicles: $0.655/mile reimbursement

**CHECK-IN PROCEDURES**
1. Present Red Cross ID badge
2. Use corporate rate code "ARC2024"
3. Submit receipts to Finance Section daily
4. Report any issues to Logistics Section Chief`,
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Parking and Transportation Instructions',
          type: 'text',
          content: `**PARKING ASSIGNMENTS BY SECTION**

**Command Staff & ICS Leadership**
• North Parking Lot (Spaces 1-20)
• Access via Main Gate
• 24/7 security patrol

**Operations & Field Teams**
• West Parking Garage (Levels 2-3)
• Vehicle staging area for ERVs
• Equipment loading zone

**Logistics & Administration**
• South Surface Lot
• Visitor parking after 6 PM
• Overflow parking across street

**VEHICLE ASSIGNMENTS**
• ERV-1: Bay 3 (Operations)
• ERV-2: Bay 4 (Mass Care)
• Box Truck: Loading Dock A
• Staff Vehicles: General parking

**TRANSPORTATION SCHEDULES**
- Airport Shuttle: Departs hourly 6 AM - 10 PM
- Hotel Shuttle: 7 AM, 6 PM, 11 PM daily
- Equipment Transport: On-demand via Radio

**SECURITY REQUIREMENTS**
- All vehicles must display ARC placard
- No overnight parking in fire lanes
- Report security issues to: (813) 555-0199`,
          uploadedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Personnel Performance and Recognition',
          type: 'text',
          content: `**OUTSTANDING PERFORMANCE RECOGNITION**

**Daily Commendations (Report Period: 10/15-10/16)**

**⭐ EXCEPTIONAL SERVICE AWARDS**

**Maria Rodriguez - Mass Care Supervisor**
- Exceeded shelter capacity by 20% through innovative space management
- Managed 450 clients with zero safety incidents
- Coordinated bilingual services for 75% non-English speaking clients
- Recommended for Regional Recognition

**James Thompson - ERV Team Leader**
- Delivered 2,847 meals to 12 different locations
- Maintained 100% food safety compliance
- Trained 6 new volunteers in mobile feeding operations
- Led response to emergency medical incident

**Sarah Chen - Intake Specialist**  
- Processed 89 new shelter registrations
- Identified and supported 12 unaccompanied minors
- Maintained accurate records despite system outages
- Provided trauma-informed care to all clients

**PERFORMANCE IMPROVEMENT NOTES**
• Reminder: All meal service requires hair nets and gloves
• Safety protocols: Hard hats required in debris areas  
• Documentation: Daily activity logs due by 7 PM
• Communication: Use proper radio protocols (no personal names)

**SHIFT EVALUATIONS**
- Day Shift: Excellent coordination, minor supply delays
- Night Shift: Strong security, need more bilingual support
- Weekend Coverage: Adequate staffing, monitor fatigue levels`,
          uploadedAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Emergency Contact Information',
          type: 'text',
          content: `**CRITICAL EMERGENCY CONTACTS**

**24/7 DUTY OFFICER**
Primary: (813) 555-0911
Backup: (727) 555-0922
Email: duty.officer@redcross.org

**INCIDENT COMMAND TEAM**
• Incident Commander: John Davis - (813) 555-1001  
• Deputy IC: Lisa Martinez - (813) 555-1002
• Safety Officer: Mike Johnson - (813) 555-1003
• Liaison Officer: Amy Wilson - (813) 555-1004

**EXTERNAL COORDINATION**
• County EOC: (813) 555-2000
• State Emergency Management: (850) 555-3000
• Local Fire Department: (813) 555-4000
• Police Coordination: (813) 555-5000

**SUPPORT SERVICES**
• IT Help Desk: (800) 555-HELP
• Fleet Maintenance: (813) 555-AUTO  
• Medical Support: (813) 555-MEDIC
• Mental Health Services: (800) 555-CARE

**MEDIA RELATIONS**
• ARC Communications: (202) 555-NEWS
• Local Media Hotline: (813) 555-MEDIA
• Do NOT speak to media - refer to PIO`,
          uploadedAt: new Date().toISOString()
        }
      ]);
    }
    
    if (savedReferences) {
      setReferences(JSON.parse(savedReferences));
    } else {
      // Default references
      setReferences([
        {
          id: '1',
          title: 'Red Cross Disaster Operations Manual',
          type: 'manual',
          content: 'Standard operating procedures for disaster response',
          url: 'https://redcross.org/manual'
        },
        {
          id: '2',
          title: 'State Emergency Response Plan',
          type: 'plan',
          content: 'Florida state emergency management protocols',
          url: 'https://floridadisaster.org/serp'
        },
        {
          id: '3',
          title: 'County EOC Coordination Procedures',
          type: 'procedure',
          content: 'Coordination procedures with county emergency operations',
          url: ''
        }
      ]);
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('iap_appendices', JSON.stringify(appendices));
    localStorage.setItem('iap_references', JSON.stringify(references));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAppendix: AppendixItem = {
          id: `appendix-${Date.now()}-${Math.random()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: 'image',
          content: '',
          imageUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString()
        };
        setAppendices(prev => {
          const updated = [...prev, newAppendix];
          localStorage.setItem('iap_appendices', JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAppendix: AppendixItem = {
          id: `appendix-${Date.now()}-${Math.random()}`,
          title: file.name,
          type: 'document',
          content: `Uploaded document: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          uploadedAt: new Date().toISOString()
        };
        setAppendices(prev => {
          const updated = [...prev, newAppendix];
          localStorage.setItem('iap_appendices', JSON.stringify(updated));
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const addAppendixText = () => {
    const newAppendix: AppendixItem = {
      id: `appendix-${Date.now()}`,
      title: 'New Appendix',
      type: 'text',
      content: '',
      uploadedAt: new Date().toISOString()
    };
    setAppendices([...appendices, newAppendix]);
  };

  const addReference = () => {
    const newReference: ReferenceItem = {
      id: `ref-${Date.now()}`,
      title: 'New Reference',
      type: 'link',
      content: '',
      url: ''
    };
    setReferences([...references, newReference]);
  };

  const updateAppendix = (id: string, field: keyof AppendixItem, value: string) => {
    setAppendices(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      localStorage.setItem('iap_appendices', JSON.stringify(updated));
      return updated;
    });
  };

  const updateReference = (id: string, field: keyof ReferenceItem, value: string) => {
    setReferences(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      localStorage.setItem('iap_references', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAppendix = (id: string) => {
    setAppendices(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('iap_appendices', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteReference = (id: string) => {
    setReferences(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('iap_references', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Appendices and References</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded font-semibold ${
              editMode 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {editMode ? '🔴 EDITING - Click to Exit' : '✏️ Edit Content'}
          </button>
          {editMode && (
            <button
              onClick={saveData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
            >
              💾 Save All
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 mb-4">
        <button
          onClick={() => setActiveTab('appendices')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'appendices' 
              ? 'bg-white border-t-2 border-l border-r border-gray-300 -mb-px' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Appendices
        </button>
        <button
          onClick={() => setActiveTab('references')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'references' 
              ? 'bg-white border-t-2 border-l border-r border-gray-300 -mb-px' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          References
        </button>
      </div>

      {/* Instructions */}
      {editMode && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-3 mb-4">
          <strong>📝 Edit Mode Active:</strong> 
          {activeTab === 'appendices' 
            ? ' Upload images, documents, or add text appendices. Each appendix can be 0.5 to 10+ pages.'
            : ' Add reference documents, links, and important resources for the operation.'
          }
        </div>
      )}

      {/* Appendices Tab */}
      {activeTab === 'appendices' && (
        <div className="space-y-4">
          {editMode && (
            <div className="flex gap-2 mb-4">
              <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
                📷 Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <label className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer">
                📄 Upload Documents
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={addAppendixText}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✏️ Add Text Appendix
              </button>
            </div>
          )}

          {appendices.length === 0 ? (
            <div className="border-2 border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-500 mb-4">No appendices added yet</p>
              {editMode && (
                <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
                  📤 Upload First Appendix
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {appendices.map((appendix, index) => (
                <div key={appendix.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-3 flex justify-between items-start">
                    <div className="flex-1">
                      {editMode ? (
                        <input
                          type="text"
                          value={appendix.title}
                          onChange={(e) => updateAppendix(appendix.id, 'title', e.target.value)}
                          className="text-lg font-bold w-full px-2 py-1 border rounded"
                          placeholder="Appendix Title"
                        />
                      ) : (
                        <h3 className="text-lg font-bold">
                          Appendix {String.fromCharCode(65 + index)}: {appendix.title}
                        </h3>
                      )}
                      {appendix.type === 'text' && editMode ? (
                        <textarea
                          value={appendix.content}
                          onChange={(e) => updateAppendix(appendix.id, 'content', e.target.value)}
                          className="w-full mt-2 px-2 py-1 border rounded"
                          placeholder="Appendix content..."
                          rows={4}
                        />
                      ) : appendix.type === 'text' ? (
                        <p className="mt-2">{appendix.content}</p>
                      ) : null}
                    </div>
                    {editMode && (
                      <button
                        onClick={() => deleteAppendix(appendix.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm ml-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {appendix.type === 'image' && appendix.imageUrl && (
                    <div className="p-4 bg-white">
                      <img 
                        src={appendix.imageUrl} 
                        alt={appendix.title}
                        className="w-full h-auto max-h-[600px] object-contain"
                      />
                    </div>
                  )}
                  
                  {appendix.type === 'document' && (
                    <div className="p-4 bg-gray-50">
                      <p className="text-gray-600">{appendix.content}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Type: {appendix.type} • Uploaded: {new Date(appendix.uploadedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* References Tab */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          {editMode && (
            <button
              onClick={addReference}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
            >
              + Add Reference
            </button>
          )}

          {references.length === 0 ? (
            <div className="border-2 border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-500">No references added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {references.map((reference, index) => (
                <div key={reference.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={reference.title}
                            onChange={(e) => updateReference(reference.id, 'title', e.target.value)}
                            className="text-lg font-bold w-full px-2 py-1 border rounded mb-2"
                            placeholder="Reference Title"
                          />
                          <select
                            value={reference.type}
                            onChange={(e) => updateReference(reference.id, 'type', e.target.value)}
                            className="px-2 py-1 border rounded mb-2"
                          >
                            <option value="manual">Manual</option>
                            <option value="plan">Plan</option>
                            <option value="procedure">Procedure</option>
                            <option value="contact">Contact</option>
                            <option value="link">Link</option>
                          </select>
                          <textarea
                            value={reference.content}
                            onChange={(e) => updateReference(reference.id, 'content', e.target.value)}
                            className="w-full px-2 py-1 border rounded mb-2"
                            placeholder="Description..."
                            rows={2}
                          />
                          <input
                            type="url"
                            value={reference.url || ''}
                            onChange={(e) => updateReference(reference.id, 'url', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="URL (optional)"
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold">
                            {index + 1}. {reference.title}
                          </h3>
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 mb-2">
                            {reference.type}
                          </span>
                          <p className="text-gray-700">{reference.content}</p>
                          {reference.url && (
                            <a 
                              href={reference.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              {reference.url}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                    {editMode && (
                      <button
                        onClick={() => deleteReference(reference.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-sm ml-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}