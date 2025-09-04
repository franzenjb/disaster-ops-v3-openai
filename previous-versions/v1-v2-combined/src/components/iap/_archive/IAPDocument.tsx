/**
 * Unified IAP Document Component
 * Combines cover page with all IAP sections using consistent layout
 */

import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { IAPCoverPage } from './IAPCoverPage';
import { IAPLayout } from './IAPLayout';
import { 
  PrinterIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

type IAPSection = 
  | 'cover'
  | 'directors-message'
  | 'priorities'
  | 'previous-status'
  | 'action-tracker'
  | 'contact-roster'
  | 'org-chart'
  | 'work-assignment'
  | 'work-sites'
  | 'daily-schedule'
  | 'general-messages';

interface SectionConfig {
  id: IAPSection;
  title: string;
  pageNumber: number;
}

const sections: SectionConfig[] = [
  { id: 'cover', title: 'Cover Page', pageNumber: 1 },
  { id: 'directors-message', title: "Director's Intent/Message", pageNumber: 2 },
  { id: 'priorities', title: 'Incident Priorities and Objectives', pageNumber: 3 },
  { id: 'previous-status', title: "Status of Previous Operating Period's Objectives", pageNumber: 4 },
  { id: 'action-tracker', title: 'Incident Open Action Tracker', pageNumber: 5 },
  { id: 'contact-roster', title: 'Contact Roster DRO HQ', pageNumber: 6 },
  { id: 'org-chart', title: 'Incident Organization Chart', pageNumber: 7 },
  { id: 'work-assignment', title: 'Work Assignment', pageNumber: 8 },
  { id: 'work-sites', title: 'Work Sites', pageNumber: 9 },
  { id: 'daily-schedule', title: 'Daily Schedule', pageNumber: 10 },
  { id: 'general-messages', title: 'General Messages', pageNumber: 11 }
];

export function IAPDocument() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateIAPSection = useOperationStore(state => state.updateIAPSection);
  const [currentSection, setCurrentSection] = useState<IAPSection>('cover');
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  
  if (!operation?.iap) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-500">Loading IAP Document...</div>
    </div>;
  }
  
  const iap = operation.iap;
  
  const handleNavigate = (sectionId: string) => {
    setCurrentSection(sectionId as IAPSection);
  };
  
  const currentSectionConfig = sections.find(s => s.id === currentSection);
  const currentIndex = sections.findIndex(s => s.id === currentSection);
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = () => {
    alert('PDF export coming soon - use Print for now');
  };
  
  const handleSectionEdit = (sectionId: string, content: any) => {
    updateIAPSection(sectionId, content);
  };
  
  const renderSection = () => {
    switch (currentSection) {
      case 'cover':
        return <IAPCoverPage onNavigate={handleNavigate} />;
      
      case 'directors-message':
        return (
          <IAPLayout pageNumber={2} totalPages={11}>
            <DirectorsMessageSection 
              iap={iap} 
              isEditing={isEditing['directors-message']}
              onEdit={(content) => handleSectionEdit('directorsIntent', content)}
              onToggleEdit={() => setIsEditing(prev => ({ 
                ...prev, 
                'directors-message': !prev['directors-message'] 
              }))}
            />
          </IAPLayout>
        );
      
      case 'priorities':
        return (
          <IAPLayout pageNumber={3} totalPages={11}>
            <PrioritiesSection 
              iap={iap}
              isEditing={isEditing['priorities']}
              onEdit={(content) => handleSectionEdit('priorities', content)}
              onToggleEdit={() => setIsEditing(prev => ({ 
                ...prev, 
                'priorities': !prev['priorities'] 
              }))}
            />
          </IAPLayout>
        );
      
      case 'previous-status':
        return (
          <IAPLayout pageNumber={4} totalPages={11}>
            <PreviousStatusSection 
              iap={iap}
              isEditing={isEditing['previous-status']}
              onEdit={(content) => handleSectionEdit('previousStatus', content)}
              onToggleEdit={() => setIsEditing(prev => ({ 
                ...prev, 
                'previous-status': !prev['previous-status'] 
              }))}
            />
          </IAPLayout>
        );
      
      case 'action-tracker':
        return (
          <IAPLayout pageNumber={5} totalPages={11}>
            <ActionTrackerSection 
              iap={iap}
              isEditing={isEditing['action-tracker']}
              onEdit={(content) => handleSectionEdit('actionTracker', content)}
              onToggleEdit={() => setIsEditing(prev => ({ 
                ...prev, 
                'action-tracker': !prev['action-tracker'] 
              }))}
            />
          </IAPLayout>
        );
      
      case 'contact-roster':
        return (
          <IAPLayout pageNumber={6} totalPages={11}>
            <ContactRosterSection 
              operation={operation}
              isEditing={isEditing['contact-roster']}
              onEdit={(content) => handleSectionEdit('contactRoster', content)}
              onToggleEdit={() => setIsEditing(prev => ({ 
                ...prev, 
                'contact-roster': !prev['contact-roster'] 
              }))}
            />
          </IAPLayout>
        );
      
      default:
        return (
          <IAPLayout pageNumber={currentSectionConfig?.pageNumber || 1} totalPages={11}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">{currentSectionConfig?.title}</h2>
              <p className="text-gray-500">This section is under development</p>
            </div>
          </IAPLayout>
        );
    }
  };
  
  return (
    <div className="iap-document">
      {/* Control Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                IAP #{iap.meta.iapNumber} - {operation.operationName}
              </h2>
              <span className="text-sm text-gray-500">
                {currentSectionConfig?.title}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handlePrint} className="btn-secondary">
                <PrinterIcon className="w-4 h-4 inline mr-1" />
                Print
              </button>
              <button onClick={handleExportPDF} className="btn-primary">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Export PDF
              </button>
            </div>
          </div>
          
          {/* Section Navigation */}
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentIndex === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex gap-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`px-2 py-1 text-xs rounded ${
                    currentSection === section.id
                      ? 'bg-red-cross-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={section.title}
                >
                  {section.pageNumber}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === sections.length - 1}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentIndex === sections.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Section Content */}
      <div className="py-8">
        {renderSection()}
      </div>
    </div>
  );
}

// Section Components

function DirectorsMessageSection({ iap, isEditing, onEdit, onToggleEdit }: any) {
  const [content, setContent] = useState(iap.sections.directorsIntent?.content || '');
  
  const handleSave = () => {
    onEdit({ content, lastModified: new Date() });
    onToggleEdit();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Director's Intent/Message</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          DRO Brief Link (RC View) – [Link]
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Account String: 052-37000-2x-4220-xxxxx-0010
        </p>
      </div>
      
      {isEditing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border rounded"
            placeholder="Enter Director's message..."
          />
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={onToggleEdit} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div
            onClick={onToggleEdit}
            className="min-h-[400px] p-4 border rounded cursor-pointer hover:bg-gray-50"
          >
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-gray-400">Click to add Director's message...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PrioritiesSection({ iap, isEditing, onEdit, onToggleEdit }: any) {
  const [priorities, setPriorities] = useState(iap.sections.priorities?.priorities || [
    { order: 1, text: '' },
    { order: 2, text: '' },
    { order: 3, text: '' },
    { order: 4, text: '' },
    { order: 5, text: '' }
  ]);
  
  const handlePriorityChange = (index: number, text: string) => {
    const updated = [...priorities];
    updated[index].text = text;
    setPriorities(updated);
  };
  
  const handleSave = () => {
    onEdit({ priorities });
    onToggleEdit();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Incident Priorities and Objectives</h2>
      
      <div className="mb-6">
        <h3 className="font-bold mb-3">Incident Priorities:</h3>
        {isEditing ? (
          <>
            <table className="w-full">
              <tbody>
                {priorities.map((p, i) => (
                  <tr key={i}>
                    <td className="w-12 font-bold">{i + 1}.</td>
                    <td>
                      <input
                        type="text"
                        value={p.text}
                        onChange={(e) => handlePriorityChange(i, e.target.value)}
                        className="w-full p-2 border-b"
                        placeholder={`Priority ${i + 1}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={onToggleEdit} className="btn-secondary">Cancel</button>
            </div>
          </>
        ) : (
          <div onClick={onToggleEdit} className="cursor-pointer hover:bg-gray-50 p-4 rounded">
            {priorities.some(p => p.text) ? (
              <ol className="list-decimal list-inside">
                {priorities.filter(p => p.text).map((p, i) => (
                  <li key={i} className="mb-2">{p.text}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-400">Click to add priorities...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviousStatusSection({ iap, isEditing, onEdit, onToggleEdit }: any) {
  const [content, setContent] = useState(iap.sections.previousStatus?.content || '');
  
  const handleSave = () => {
    onEdit({ content, lastModified: new Date() });
    onToggleEdit();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Status of Previous Operating Period's Objectives</h2>
      
      {isEditing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border rounded"
            placeholder="Enter status of previous objectives..."
          />
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={onToggleEdit} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div
          onClick={onToggleEdit}
          className="min-h-[400px] p-4 border rounded cursor-pointer hover:bg-gray-50"
        >
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-gray-400">Click to add status of previous objectives...</p>
          )}
        </div>
      )}
    </div>
  );
}

function ActionTrackerSection({ iap, isEditing, onEdit, onToggleEdit }: any) {
  const [actions, setActions] = useState(iap.sections.actionTracker?.actions || []);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Incident Open Action Tracker</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Action Item</th>
              <th className="border p-2 text-left">Responsible</th>
              <th className="border p-2 text-left">Due Date</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.length > 0 ? (
              actions.map((action: any, i: number) => (
                <tr key={i}>
                  <td className="border p-2">{action.item}</td>
                  <td className="border p-2">{action.responsible}</td>
                  <td className="border p-2">{action.dueDate}</td>
                  <td className="border p-2">{action.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border p-4 text-center text-gray-500">
                  No action items tracked
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactRosterSection({ operation, isEditing, onEdit, onToggleEdit }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Roster DRO HQ</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Position</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Richard Goldfarb</td>
              <td className="border p-2">AD Information & Planning</td>
              <td className="border p-2">(555) 555-5555</td>
              <td className="border p-2">rgoldfarb@redcross.org</td>
            </tr>
            <tr>
              <td className="border p-2">Virginia Mewborn</td>
              <td className="border p-2">Job Director</td>
              <td className="border p-2">(555) 555-5556</td>
              <td className="border p-2">vmewborn@redcross.org</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}