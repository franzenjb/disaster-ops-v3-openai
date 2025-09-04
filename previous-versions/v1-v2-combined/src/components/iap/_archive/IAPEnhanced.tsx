/**
 * Enhanced IAP Builder with Photo Upload and Rich Text Editing
 * Integrates the best features from the old IAP system while maintaining
 * the clean architecture of the new platform
 */

import React, { useState, useEffect, useRef } from 'react';
import { IAPDocument } from '../../core/DisasterOperation';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../core/EventBus';
import { PhotoUploadCrop } from './PhotoUploadCrop';
import { RichTextEditor } from './RichTextEditor';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SectionStatus {
  id: string;
  name: string;
  status: 'complete' | 'in-progress' | 'empty';
  lastModified?: Date;
}

export function IAPEnhanced() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateIAPSection = useOperationStore(state => state.updateIAPSection);
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set(['basic']));
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [sectionStatuses, setSectionStatuses] = useState<Map<string, SectionStatus>>(new Map());
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  
  if (!operation?.iap) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-500">Initializing IAP Builder...</div>
    </div>;
  }
  
  const iap = operation.iap;
  
  // Auto-save effect
  useEffect(() => {
    const handleAutoSave = () => {
      if (autoSaveStatus === 'saving') {
        // Save to localStorage
        localStorage.setItem(`iap-draft-${operation.id}`, JSON.stringify({
          iap,
          coverPhoto,
          timestamp: new Date().toISOString()
        }));
        
        // Emit save event
        eventBus.emit(EventType.IAP_SECTION_UPDATE, {
          operationId: operation.id,
          data: iap
        });
        
        setAutoSaveStatus('saved');
      }
    };
    
    if (autoSaveStatus === 'saving') {
      autoSaveTimerRef.current = setTimeout(handleAutoSave, 2000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveStatus, iap, coverPhoto, operation.id]);
  
  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(`iap-draft-${operation.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.coverPhoto) {
          setCoverPhoto(parsed.coverPhoto);
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [operation.id]);
  
  const toggleSection = (sectionId: string) => {
    const newActiveSections = new Set(activeSections);
    if (newActiveSections.has(sectionId)) {
      newActiveSections.delete(sectionId);
    } else {
      newActiveSections.add(sectionId);
    }
    setActiveSections(newActiveSections);
  };
  
  const handleSectionUpdate = (sectionId: string, content: any) => {
    setAutoSaveStatus('saving');
    updateIAPSection(sectionId, content);
    
    // Update section status
    const newStatus = new Map(sectionStatuses);
    newStatus.set(sectionId, {
      id: sectionId,
      name: getSectionName(sectionId),
      status: content ? 'complete' : 'empty',
      lastModified: new Date()
    });
    setSectionStatuses(newStatus);
  };
  
  const getSectionName = (sectionId: string): string => {
    const sectionNames: Record<string, string> = {
      basic: 'Basic Information',
      directorsMessage: "Director's Message",
      objectives: 'Primary Objectives',
      priorities: 'Operational Priorities',
      safety: 'Safety & Security',
      external: 'External Coordination',
      ancillary: 'Ancillary Notes',
      contacts: 'Contact Roster',
      orgChart: 'Organization Chart',
      geography: 'Geography',
      serviceDelivery: 'Service Delivery',
      workAssignments: 'Work Assignments',
      schedule: 'Daily Schedule'
    };
    return sectionNames[sectionId] || sectionId;
  };
  
  const getSectionStatusIcon = (status: 'complete' | 'in-progress' | 'empty') => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'empty':
        return <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = async () => {
    // Will implement with jsPDF
    alert('PDF export coming soon - use Print for now');
  };
  
  const handleExportWord = async () => {
    // Will implement with docx
    alert('Word export coming soon');
  };
  
  return (
    <div className="iap-enhanced bg-gray-50 min-h-screen">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                IAP Builder
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  IAP #{iap.meta.iapNumber} • {operation.operationName}
                </span>
                <span className="text-sm text-gray-500">
                  {autoSaveStatus === 'saving' ? (
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Print
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportWord}
                className="px-4 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Export Word
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs text-gray-600">
                {Array.from(sectionStatuses.values()).filter(s => s.status === 'complete').length} of {14} sections complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-cross-red h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Array.from(sectionStatuses.values()).filter(s => s.status === 'complete').length / 14) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {/* Cover Photo Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('coverPhoto')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(coverPhoto ? 'complete' : 'empty')}
                <span className="font-semibold text-lg">Cover Photo</span>
              </div>
              {activeSections.has('coverPhoto') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('coverPhoto') && (
              <div className="px-6 pb-6">
                <PhotoUploadCrop
                  imageUrl={coverPhoto}
                  onImageChange={(url) => {
                    setCoverPhoto(url);
                    setAutoSaveStatus('saving');
                  }}
                  aspectRatio={16/9}
                />
              </div>
            )}
          </div>
          
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon('complete')}
                <span className="font-semibold text-lg">Basic Information</span>
              </div>
              {activeSections.has('basic') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('basic') && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IAP Number
                    </label>
                    <input
                      type="text"
                      value={iap.meta.iapNumber}
                      onChange={(e) => handleSectionUpdate('meta', { ...iap.meta, iapNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DR Number
                    </label>
                    <input
                      type="text"
                      value={operation.id}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Name
                    </label>
                    <input
                      type="text"
                      value={operation.operationName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Type
                    </label>
                    <select
                      value={operation.type}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    >
                      <option value="hurricane">Hurricane</option>
                      <option value="flood">Flood</option>
                      <option value="wildfire">Wildfire</option>
                      <option value="tornado">Tornado</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operational Period Start
                    </label>
                    <input
                      type="datetime-local"
                      value={new Date(iap.meta.operationalPeriod.start).toISOString().slice(0, 16)}
                      onChange={(e) => handleSectionUpdate('meta', { 
                        ...iap.meta, 
                        operationalPeriod: { 
                          ...iap.meta.operationalPeriod, 
                          start: new Date(e.target.value).toISOString() 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operational Period End
                    </label>
                    <input
                      type="datetime-local"
                      value={new Date(iap.meta.operationalPeriod.end).toISOString().slice(0, 16)}
                      onChange={(e) => handleSectionUpdate('meta', { 
                        ...iap.meta, 
                        operationalPeriod: { 
                          ...iap.meta.operationalPeriod, 
                          end: new Date(e.target.value).toISOString() 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Director's Message Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('directorsMessage')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('directorsMessage')?.status || 'empty')}
                <span className="font-semibold text-lg">Director's Message</span>
              </div>
              {activeSections.has('directorsMessage') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('directorsMessage') && (
              <div className="px-6 pb-6">
                <RichTextEditor
                  content={iap.sections.directorsIntent?.content || ''}
                  onChange={(content) => handleSectionUpdate('directorsIntent', { content, lastModified: new Date() })}
                  placeholder="Enter the Director's message, intent, and guidance for this operational period..."
                />
              </div>
            )}
          </div>
          
          {/* Primary Objectives Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('objectives')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('objectives')?.status || 'empty')}
                <span className="font-semibold text-lg">Primary Objectives</span>
              </div>
              {activeSections.has('objectives') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('objectives') && (
              <div className="px-6 pb-6">
                <RichTextEditor
                  content={iap.sections.objectives?.content || ''}
                  onChange={(content) => handleSectionUpdate('objectives', { content, lastModified: new Date() })}
                  placeholder="List the primary objectives for this operational period..."
                />
              </div>
            )}
          </div>
          
          {/* Operational Priorities Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('priorities')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('priorities')?.status || 'empty')}
                <span className="font-semibold text-lg">Operational Priorities</span>
              </div>
              {activeSections.has('priorities') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('priorities') && (
              <div className="px-6 pb-6">
                <RichTextEditor
                  content={iap.sections.priorities?.content || ''}
                  onChange={(content) => handleSectionUpdate('priorities', { content, lastModified: new Date() })}
                  placeholder="Define the operational priorities for this period..."
                />
              </div>
            )}
          </div>
          
          {/* Safety & Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('safety')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('safety')?.status || 'empty')}
                <span className="font-semibold text-lg">Safety & Security</span>
              </div>
              {activeSections.has('safety') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('safety') && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Concerns & Hazards
                  </label>
                  <RichTextEditor
                    content={iap.sections.safety?.hazards || ''}
                    onChange={(content) => handleSectionUpdate('safety', { 
                      ...iap.sections.safety,
                      hazards: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Identify safety concerns and hazards..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weather Forecast
                  </label>
                  <RichTextEditor
                    content={iap.sections.safety?.weather || ''}
                    onChange={(content) => handleSectionUpdate('safety', { 
                      ...iap.sections.safety,
                      weather: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Enter weather forecast and conditions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Information
                  </label>
                  <RichTextEditor
                    content={iap.sections.safety?.security || ''}
                    onChange={(content) => handleSectionUpdate('safety', { 
                      ...iap.sections.safety,
                      security: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Provide security guidance and information..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Plan
                  </label>
                  <RichTextEditor
                    content={iap.sections.safety?.medical || ''}
                    onChange={(content) => handleSectionUpdate('safety', { 
                      ...iap.sections.safety,
                      medical: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Outline medical support and procedures..."
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* External Coordination Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('external')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('external')?.status || 'empty')}
                <span className="font-semibold text-lg">External Coordination</span>
              </div>
              {activeSections.has('external') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('external') && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EOC Status
                  </label>
                  <RichTextEditor
                    content={iap.sections.external?.eoc || ''}
                    onChange={(content) => handleSectionUpdate('external', { 
                      ...iap.sections.external,
                      eoc: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Current EOC activation status and coordination..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Organizations
                  </label>
                  <RichTextEditor
                    content={iap.sections.external?.partners || ''}
                    onChange={(content) => handleSectionUpdate('external', { 
                      ...iap.sections.external,
                      partners: content,
                      lastModified: new Date() 
                    })}
                    placeholder="List partner organizations and coordination points..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Schedules
                  </label>
                  <RichTextEditor
                    content={iap.sections.external?.meetings || ''}
                    onChange={(content) => handleSectionUpdate('external', { 
                      ...iap.sections.external,
                      meetings: content,
                      lastModified: new Date() 
                    })}
                    placeholder="External coordination meetings and schedules..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coordination Notes
                  </label>
                  <RichTextEditor
                    content={iap.sections.external?.notes || ''}
                    onChange={(content) => handleSectionUpdate('external', { 
                      ...iap.sections.external,
                      notes: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Additional coordination notes and requirements..."
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Ancillary Notes Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('ancillary')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getSectionStatusIcon(sectionStatuses.get('ancillary')?.status || 'empty')}
                <span className="font-semibold text-lg">Ancillary Notes</span>
              </div>
              {activeSections.has('ancillary') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('ancillary') && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <RichTextEditor
                    content={iap.sections.ancillary?.special || ''}
                    onChange={(content) => handleSectionUpdate('ancillary', { 
                      ...iap.sections.ancillary,
                      special: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Special instructions for this operational period..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <RichTextEditor
                    content={iap.sections.ancillary?.additional || ''}
                    onChange={(content) => handleSectionUpdate('ancillary', { 
                      ...iap.sections.ancillary,
                      additional: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Any additional notes or information..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <RichTextEditor
                    content={iap.sections.ancillary?.attachments || ''}
                    onChange={(content) => handleSectionUpdate('ancillary', { 
                      ...iap.sections.ancillary,
                      attachments: content,
                      lastModified: new Date() 
                    })}
                    placeholder="List any attachments or supplemental documents..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lessons Learned
                  </label>
                  <RichTextEditor
                    content={iap.sections.ancillary?.lessons || ''}
                    onChange={(content) => handleSectionUpdate('ancillary', { 
                      ...iap.sections.ancillary,
                      lessons: content,
                      lastModified: new Date() 
                    })}
                    placeholder="Document lessons learned from previous periods..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Section Status Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Section Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(sectionStatuses.values()).map((status) => (
              <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  {getSectionStatusIcon(status.status)}
                  <span className="text-sm font-medium">{status.name}</span>
                </div>
                {status.lastModified && (
                  <span className="text-xs text-gray-500">
                    {new Date(status.lastModified).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .iap-enhanced {
            background: white;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .border {
            border-color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}