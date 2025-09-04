/**
 * Enhanced IAP Builder with Edit/View Mode Toggle
 * Similar to ICS Form 215's edit/view functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { IAPDocument } from '../../core/DisasterOperation';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../core/EventBus';
import { PhotoUploadCrop } from './PhotoUploadCrop';
import { RichTextEditor } from './RichTextEditor';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SectionStatus {
  id: string;
  name: string;
  status: 'complete' | 'in-progress' | 'empty';
  lastModified?: Date;
}

export function IAPWithEditMode() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateIAPSection = useOperationStore(state => state.updateIAPSection);
  
  // Mode state - View or Edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set(['basic']));
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [sectionStatuses, setSectionStatuses] = useState<Map<string, SectionStatus>>(new Map());
  
  // Form data state for edit mode
  const [formData, setFormData] = useState({
    iapNumber: '',
    operationalPeriodStart: '',
    operationalPeriodEnd: '',
    directorsMessage: '',
    objectives: '',
    priorities: '',
    safety: '',
    external: '',
    ancillary: '',
    contactRoster: [] as Array<{
      id: string;
      name: string;
      role: string;
      phone: string;
      email: string;
      organization: string;
    }>
  });
  
  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  
  if (!operation?.iap) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-500">Initializing IAP Builder...</div>
    </div>;
  }
  
  const iap = operation.iap;
  
  // Initialize form data
  useEffect(() => {
    setFormData({
      iapNumber: iap.meta.iapNumber || '1',
      operationalPeriodStart: iap.meta.operationalPeriod?.start 
        ? new Date(iap.meta.operationalPeriod.start).toISOString().slice(0, 16) 
        : new Date().toISOString().slice(0, 16),
      operationalPeriodEnd: iap.meta.operationalPeriod?.end 
        ? new Date(iap.meta.operationalPeriod.end).toISOString().slice(0, 16)
        : new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16),
      directorsMessage: iap.sections.directorsMessage?.content || '',
      objectives: iap.sections.objectives?.content || '',
      priorities: iap.sections.priorities?.content || '',
      safety: iap.sections.safety?.content || '',
      external: iap.sections.external?.content || '',
      ancillary: iap.sections.ancillary?.content || '',
      contactRoster: (iap.sections as any).contactRoster?.contacts || []
    });
  }, [iap, isEditMode]);
  
  // Auto-save effect
  useEffect(() => {
    const handleAutoSave = () => {
      if (autoSaveStatus === 'saving') {
        localStorage.setItem(`iap-draft-${operation.id}`, JSON.stringify({
          iap,
          coverPhoto,
          formData,
          timestamp: new Date().toISOString()
        }));
        
        eventBus.emit(EventType.IAP_SECTION_UPDATE, {
          operationId: operation.id,
          data: iap
        });
        
        setAutoSaveStatus('saved');
      }
    };
    
    if (autoSaveStatus === 'saving' && isEditMode) {
      autoSaveTimerRef.current = setTimeout(handleAutoSave, 2000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveStatus, iap, coverPhoto, formData, operation.id, isEditMode]);
  
  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(`iap-draft-${operation.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.coverPhoto) {
          setCoverPhoto(parsed.coverPhoto);
        }
        if (parsed.formData) {
          setFormData(parsed.formData);
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
  
  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setAutoSaveStatus('saving');
  };
  
  const addContactToRoster = () => {
    const newContact = {
      id: Date.now().toString(),
      name: '',
      role: '',
      phone: '',
      email: '',
      organization: 'American Red Cross'
    };
    handleFieldChange('contactRoster', [...(formData.contactRoster || []), newContact]);
  };
  
  const updateContact = (id: string, field: string, value: string) => {
    const updated = (formData.contactRoster || []).map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    );
    handleFieldChange('contactRoster', updated);
  };
  
  const removeContact = (id: string) => {
    const filtered = (formData.contactRoster || []).filter(contact => contact.id !== id);
    handleFieldChange('contactRoster', filtered);
  };
  
  const handleSave = () => {
    // Save all form data to store
    updateIAPSection('meta', {
      ...iap.meta,
      iapNumber: formData.iapNumber,
      operationalPeriod: {
        start: new Date(formData.operationalPeriodStart).toISOString(),
        end: new Date(formData.operationalPeriodEnd).toISOString()
      }
    });
    
    updateIAPSection('directorsMessage', { content: formData.directorsMessage });
    updateIAPSection('objectives', { content: formData.objectives });
    updateIAPSection('priorities', { content: formData.priorities });
    updateIAPSection('safety', { content: formData.safety });
    updateIAPSection('external', { content: formData.external });
    updateIAPSection('ancillary', { content: formData.ancillary });
    updateIAPSection('contactRoster' as any, { contacts: formData.contactRoster });
    
    setIsEditMode(false);
    setAutoSaveStatus('saved');
  };
  
  const getSectionStatusIcon = (sectionId: string) => {
    const hasContent = formData[sectionId as keyof typeof formData];
    if (hasContent && hasContent.length > 10) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else if (hasContent && hasContent.length > 0) {
      return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
    return <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />;
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = async () => {
    alert('PDF export coming soon - use Print for now');
  };
  
  const handleExportWord = async () => {
    alert('Word export coming soon');
  };
  
  const completedSections = Object.entries(formData)
    .filter(([key, value]) => value && value.length > 10)
    .length;
  const totalSections = 14;
  
  return (
    <div className="iap-enhanced bg-gray-50 min-h-screen">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                IAP Builder
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  IAP #{formData.iapNumber} • {operation.operationName}
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
                onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isEditMode 
                    ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {isEditMode ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                    Edit Mode
                  </>
                )}
              </button>
              
              {isEditMode && (
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              
              <div className="border-l pl-2 ml-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <PrinterIcon className="w-4 h-4 inline mr-1" />
                  Print
                </button>
                <button
                  onClick={handleExportPDF}
                  className="ml-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportWord}
                  className="ml-2 px-3 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Export Word
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs text-gray-600">
                {completedSections} of {totalSections} sections complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-cross-red h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSections / totalSections) * 100}%` }}
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
                {coverPhoto ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-600" /> : 
                  <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />
                }
                <span className="font-semibold text-lg">Cover Photo</span>
              </div>
              {activeSections.has('coverPhoto') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('coverPhoto') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <PhotoUploadCrop
                    imageUrl={coverPhoto}
                    onImageChange={(url) => {
                      setCoverPhoto(url);
                      setAutoSaveStatus('saving');
                    }}
                    aspectRatio={16/9}
                  />
                ) : (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    {coverPhoto ? (
                      <img src={coverPhoto} alt="Cover" className="w-full h-auto" />
                    ) : (
                      <div className="bg-gray-100 h-64 flex items-center justify-center text-gray-500">
                        No cover photo uploaded
                      </div>
                    )}
                  </div>
                )}
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
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
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
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.iapNumber}
                        onChange={(e) => handleFieldChange('iapNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md">
                        {formData.iapNumber}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DR Number
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md">
                      {operation.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md">
                      {operation.operationName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-md capitalize">
                      {operation.type || 'Hurricane'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operational Period Start
                    </label>
                    {isEditMode ? (
                      <input
                        type="datetime-local"
                        value={formData.operationalPeriodStart}
                        onChange={(e) => handleFieldChange('operationalPeriodStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md">
                        {new Date(formData.operationalPeriodStart).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operational Period End
                    </label>
                    {isEditMode ? (
                      <input
                        type="datetime-local"
                        value={formData.operationalPeriodEnd}
                        onChange={(e) => handleFieldChange('operationalPeriodEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md">
                        {new Date(formData.operationalPeriodEnd).toLocaleString()}
                      </div>
                    )}
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
                {getSectionStatusIcon('directorsMessage')}
                <span className="font-semibold text-lg">Director's Message</span>
              </div>
              {activeSections.has('directorsMessage') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('directorsMessage') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.directorsMessage}
                    onChange={(value) => handleFieldChange('directorsMessage', value)}
                    placeholder="Enter the Director's message for this operational period..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.directorsMessage ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.directorsMessage }} />
                    ) : (
                      <p className="text-gray-500 italic">No message entered</p>
                    )}
                  </div>
                )}
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
                {getSectionStatusIcon('objectives')}
                <span className="font-semibold text-lg">Primary Objectives</span>
              </div>
              {activeSections.has('objectives') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('objectives') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.objectives}
                    onChange={(value) => handleFieldChange('objectives', value)}
                    placeholder="List the primary objectives for this operational period..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.objectives ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.objectives }} />
                    ) : (
                      <p className="text-gray-500 italic">No objectives entered</p>
                    )}
                  </div>
                )}
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
                {getSectionStatusIcon('priorities')}
                <span className="font-semibold text-lg">Operational Priorities</span>
              </div>
              {activeSections.has('priorities') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('priorities') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.priorities}
                    onChange={(value) => handleFieldChange('priorities', value)}
                    placeholder="Define operational priorities..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.priorities ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.priorities }} />
                    ) : (
                      <p className="text-gray-500 italic">No priorities entered</p>
                    )}
                  </div>
                )}
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
                {getSectionStatusIcon('safety')}
                <span className="font-semibold text-lg">Safety & Security</span>
              </div>
              {activeSections.has('safety') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('safety') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.safety}
                    onChange={(value) => handleFieldChange('safety', value)}
                    placeholder="Enter safety and security considerations..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.safety ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.safety }} />
                    ) : (
                      <p className="text-gray-500 italic">No safety information entered</p>
                    )}
                  </div>
                )}
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
                {getSectionStatusIcon('external')}
                <span className="font-semibold text-lg">External Coordination</span>
              </div>
              {activeSections.has('external') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('external') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.external}
                    onChange={(value) => handleFieldChange('external', value)}
                    placeholder="Describe external coordination requirements..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.external ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.external }} />
                    ) : (
                      <p className="text-gray-500 italic">No coordination information entered</p>
                    )}
                  </div>
                )}
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
                {getSectionStatusIcon('ancillary')}
                <span className="font-semibold text-lg">Ancillary Notes</span>
              </div>
              {activeSections.has('ancillary') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('ancillary') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <RichTextEditor
                    value={formData.ancillary}
                    onChange={(value) => handleFieldChange('ancillary', value)}
                    placeholder="Add any additional notes..."
                  />
                ) : (
                  <div className="prose max-w-none">
                    {formData.ancillary ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.ancillary }} />
                    ) : (
                      <p className="text-gray-500 italic">No notes entered</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Contact Roster Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('contactRoster')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {(formData.contactRoster?.length || 0) > 0 ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-600" /> : 
                  <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />
                }
                <span className="font-semibold text-lg">Contact Roster</span>
                <span className="text-sm text-gray-500">({formData.contactRoster?.length || 0} contacts)</span>
              </div>
              {activeSections.has('contactRoster') ? 
                <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              }
            </button>
            {activeSections.has('contactRoster') && (
              <div className="px-6 pb-6">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Key personnel and contacts for this operation</p>
                      <button
                        onClick={addContactToRoster}
                        className="px-3 py-1 bg-red-cross-red text-white rounded-md hover:bg-red-700 text-sm font-medium"
                      >
                        + Add Contact
                      </button>
                    </div>
                    {(!formData.contactRoster || formData.contactRoster.length === 0) ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No contacts added yet</p>
                        <button
                          onClick={addContactToRoster}
                          className="mt-2 text-red-cross-red hover:underline text-sm"
                        >
                          Add your first contact
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role/Title</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                              <th className="px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(formData.contactRoster || []).map(contact => (
                              <tr key={contact.id}>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={contact.name}
                                    onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                    placeholder="Full name"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={contact.role}
                                    onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                                    placeholder="Role/Title"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="tel"
                                    value={contact.phone}
                                    onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                                    placeholder="(555) 555-5555"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                                    placeholder="email@redcross.org"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={contact.organization}
                                    onChange={(e) => updateContact(contact.id, 'organization', e.target.value)}
                                    placeholder="Organization"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => removeContact(contact.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {(!formData.contactRoster || formData.contactRoster.length === 0) ? (
                      <p className="text-gray-500 italic">No contacts in roster</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role/Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(formData.contactRoster || []).map(contact => (
                              <tr key={contact.id}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{contact.name || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{contact.role || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{contact.phone || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {contact.email ? (
                                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                      {contact.email}
                                    </a>
                                  ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{contact.organization || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Section Status Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Section Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { id: 'coverPhoto', name: 'Cover Photo', hasContent: !!coverPhoto },
              { id: 'basic', name: 'Basic Information', hasContent: true },
              { id: 'directorsMessage', name: "Director's Message", hasContent: !!formData.directorsMessage },
              { id: 'objectives', name: 'Primary Objectives', hasContent: !!formData.objectives },
              { id: 'priorities', name: 'Operational Priorities', hasContent: !!formData.priorities },
              { id: 'safety', name: 'Safety & Security', hasContent: !!formData.safety },
              { id: 'external', name: 'External Coordination', hasContent: !!formData.external },
              { id: 'ancillary', name: 'Ancillary Notes', hasContent: !!formData.ancillary },
              { id: 'contactRoster', name: 'Contact Roster', hasContent: (formData.contactRoster?.length || 0) > 0 }
            ].map(section => (
              <div key={section.id} className="flex items-center gap-2">
                {section.hasContent ? 
                  <CheckCircleIcon className="w-5 h-5 text-green-600" /> : 
                  <ExclamationCircleIcon className="w-5 h-5 text-gray-400" />
                }
                <span className={`text-sm ${section.hasContent ? 'text-gray-900' : 'text-gray-500'}`}>
                  {section.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}