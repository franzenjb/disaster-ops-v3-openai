'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { IAPCoverPage } from './IAPCoverPage';
import { DirectorsMessage } from './DirectorsMessage';
import { 
  IAPWorkAssignmentsShelteringResources,
  IAPWorkAssignmentsSheltering, 
  IAPWorkAssignmentsFeeding,
  IAPWorkAssignmentsFeedingERV
} from './IAPWorkAssignments';
import { IAPWorkAssignmentsGovernment } from './IAPWorkAssignmentsGovernment';
import { IAPWorkAssignmentsDamageAssessment } from './IAPWorkAssignmentsDamageAssessment';
import { IAPWorkAssignmentsDistribution } from './IAPWorkAssignmentsDistribution';
import { IAPWorkAssignmentsIndividualCare } from './IAPWorkAssignmentsIndividualCare';
import { ContactRoster } from './ContactRoster';
import { OrgChartFlow } from './OrgChartFlow';
import { PrioritiesObjectives } from './PrioritiesObjectives';
import { DailySchedule } from './DailySchedule';
import { MapsGeographic } from './MapsGeographic';
import { AppendicesReferences } from './AppendicesReferences';
import { WorkSitesFacilities } from './WorkSitesFacilities';
import { PDFExport } from '../PDFExport';
import { ClientOnly } from '../ClientOnly';

interface IAPSection {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  content: () => React.ReactNode;
}

export function IAPDocument() {
  const [expandedSection, setExpandedSection] = useState<string>('cover');

  // Listen for navigation events from cover page links
  useEffect(() => {
    const handleNavigateToSection = (event: CustomEvent) => {
      const sectionId = event.detail;
      setExpandedSection(sectionId);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    window.addEventListener('navigateToSection', handleNavigateToSection as EventListener);
    return () => {
      window.removeEventListener('navigateToSection', handleNavigateToSection as EventListener);
    };
  }, []);
  
  // Export to PDF functionality
  const handleExportPDF = () => {
    // Expand all sections for printing
    const printContainer = document.getElementById('iap-print-container');
    if (printContainer) {
      printContainer.classList.add('print-mode');
      // Add all content to print view
      setTimeout(() => {
        window.print();
        printContainer.classList.remove('print-mode');
      }, 100);
    }
  };
  
  const handlePrint = () => {
    handleExportPDF(); // Same functionality
  };
  
  const handleEmail = () => {
    const subject = encodeURIComponent(`IAP #${V27_IAP_DATA.operation.operationalPeriod.number} - DR ${V27_IAP_DATA.operation.drNumber}`);
    const body = encodeURIComponent(`Please find attached the Incident Action Plan for ${V27_IAP_DATA.operation.name}.\n\nOperational Period: ${V27_IAP_DATA.operation.operationalPeriod.start} to ${V27_IAP_DATA.operation.operationalPeriod.end}\n\nPrepared by: ${V27_IAP_DATA.operation.preparedBy}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  const handleReturnToDashboard = () => {
    // Navigate back to main dashboard
    window.location.href = '/disaster-ops-v3';
  };
  
  // Define all 53 pages according to actual IAP structure
  const sections: IAPSection[] = [
    {
      id: 'cover',
      title: 'Cover Page & Checklist',
      startPage: 1,
      endPage: 1,
      content: () => <CoverPage />
    },
    {
      id: 'directors-message',
      title: "Director's Intent/Message",
      startPage: 2,
      endPage: 3,
      content: () => <DirectorsMessageSection />
    },
    {
      id: 'contact-roster',
      title: 'Contact Roster DRO HQ',
      startPage: 4,
      endPage: 6,
      content: () => <ContactRoster />
    },
    {
      id: 'org-chart',
      title: 'Incident Organization Chart',
      startPage: 7,
      endPage: 8,
      content: () => <OrgChartFlow />
    },
    {
      id: 'priorities',
      title: 'Incident Priorities and Objectives',
      startPage: 9,
      endPage: 10,
      content: () => <PrioritiesObjectives />
    },
    {
      id: 'sheltering-resources',
      title: 'DRO - Sheltering Resources',
      startPage: 11,
      endPage: 12,
      content: () => <IAPWorkAssignmentsShelteringResources />
    },
    {
      id: 'feeding',
      title: 'Work Assignments - Feeding',
      startPage: 13,
      endPage: 15,
      content: () => <IAPWorkAssignmentsFeedingERV />
    },
    {
      id: 'government-ops',
      title: 'Work Assignments - Government Operations',
      startPage: 23,
      endPage: 25,
      content: () => <IAPWorkAssignmentsGovernment />
    },
    {
      id: 'damage-assessment',
      title: 'Work Assignments - Damage Assessment',
      startPage: 26,
      endPage: 28,
      content: () => <IAPWorkAssignmentsDamageAssessment />
    },
    {
      id: 'distribution',
      title: 'Work Assignments - Distribution',
      startPage: 29,
      endPage: 31,
      content: () => <IAPWorkAssignmentsDistribution />
    },
    {
      id: 'individual-care',
      title: 'Work Assignments - Individual Disaster Care',
      startPage: 32,
      endPage: 38,
      content: () => <IAPWorkAssignmentsIndividualCare />
    },
    {
      id: 'work-sites',
      title: 'Work Sites and Facilities',
      startPage: 39,
      endPage: 44,
      content: () => <WorkSitesFacilities />
    },
    {
      id: 'daily-schedule',
      title: 'Daily Schedule',
      startPage: 45,
      endPage: 48,
      content: () => (
        <ClientOnly fallback={<div className="p-4 text-gray-500">Loading schedule...</div>}>
          <DailySchedule />
        </ClientOnly>
      )
    },
    {
      id: 'maps',
      title: 'Maps and Geographic Information',
      startPage: 49,
      endPage: 51,
      content: () => <MapsGeographic />
    },
    {
      id: 'appendices',
      title: 'Appendices and References',
      startPage: 52,
      endPage: 53,
      content: () => <AppendicesReferences />
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };

  const expandAllSections = () => {
    // Set expanded to 'all' to indicate all sections should be expanded
    setExpandedSection('all');
  };

  const collapseAllSections = () => {
    setExpandedSection('');
  };

  const isExpanded = (sectionId: string) => {
    return expandedSection === 'all' || expandedSection === sectionId;
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .page-break { page-break-after: always; }
          @page { size: letter; margin: 0.75in; }
          body { font-size: 10pt; }
          h2 { font-size: 14pt; page-break-after: avoid; }
          table { page-break-inside: avoid; }
          .section-content { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div id="iap-print-container" className="max-w-7xl mx-auto p-4 iap-document">
        {/* Document Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Incident Action Plan #{V27_IAP_DATA.operation.operationalPeriod.number}</h1>
              <p>DR {V27_IAP_DATA.operation.drNumber} - {V27_IAP_DATA.operation.name}</p>
              <p className="text-sm">Operational Period: {V27_IAP_DATA.operation.operationalPeriod.start} to {V27_IAP_DATA.operation.operationalPeriod.end}</p>
            </div>
            <div className="flex gap-2 items-center">
              <PDFExport data={V27_IAP_DATA} />
              
              {/* Expand/Collapse All Buttons */}
              <div className="flex gap-1 no-print">
                <button 
                  onClick={expandAllSections}
                  className="bg-white text-red-600 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                  title="Expand All Sections"
                >
                  ⬇ Expand All
                </button>
                <button 
                  onClick={collapseAllSections}
                  className="bg-white text-red-600 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium"
                  title="Collapse All Sections"
                >
                  ⬆ Collapse All
                </button>
              </div>
              
              <button 
                onClick={handleReturnToDashboard}
                className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 font-semibold flex items-center gap-2 no-print"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="bg-white border-2 border-gray-200 screen-only">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-gray-200 last:border-b-0">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                data-section={section.id}
                id={section.id}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors no-print"
              >
                <div className="flex items-center space-x-4">
                  <span className={`transform transition-transform ${isExpanded(section.id) ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <div className="text-left">
                    <div className="font-semibold">{section.title}</div>
                    <div className="text-sm text-gray-500">
                      Pages {section.startPage}-{section.endPage}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {section.endPage - section.startPage + 1} page{section.endPage - section.startPage > 0 ? 's' : ''}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded(section.id) && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50">
                    {section.content()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Print-only content - all sections expanded */}
        <div className="print-only">
          {sections.map((section, index) => {
            // Calculate actual page number based on previous sections
            let startPage = 1;
            for (let i = 0; i < index; i++) {
              startPage += (sections[i].endPage - sections[i].startPage + 1);
            }
            
            return (
              <div key={section.id} className="section-print page-break">
                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                <div className="section-content">
                  {section.content()}
                </div>
                <div className="text-center text-sm mt-8">
                  Page {startPage} of {sections.reduce((total, s) => total + (s.endPage - s.startPage + 1), 0)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="bg-gray-100 p-4 rounded-b-lg flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to PDF
            </button>
            <button 
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button 
              onClick={handleEmail}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <ClientOnly fallback="Last Updated: Loading...">
              Last Updated: {new Date().toLocaleString()}
            </ClientOnly>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// Cover Page Component - Now uses the enhanced component with photo upload
function CoverPage() {
  return (
    <IAPCoverPage 
      drNumber={V27_IAP_DATA.operation.drNumber}
      operationName={V27_IAP_DATA.operation.name}
      operationalPeriod={V27_IAP_DATA.operation.operationalPeriod}
      preparedBy={{
        name: V27_IAP_DATA.operation.preparedBy,
        title: V27_IAP_DATA.operation.preparedByTitle
      }}
      approvedBy={{
        name: V27_IAP_DATA.operation.approvedBy,
        title: V27_IAP_DATA.operation.approvedByTitle
      }}
      onPhotoUpdate={(photo, caption) => {
        console.log('Photo updated:', photo, caption);
        // Here you would save to your data store
      }}
    />
  );
}

// Directors Message Component - Now uses rich text editor
function DirectorsMessageSection() {
  return (
    <DirectorsMessage 
      onContentChange={(content) => {
        console.log('Director message updated:', content);
        // Here you would save to your data store
      }}
    />
  );
}

// Legacy DirectorsMessage for other references
function LegacyDirectorsMessage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Director's Message</h2>
      <div className="border rounded p-4 min-h-[600px]">
        <div contentEditable className="outline-none" suppressContentEditableWarning>
          <p className="mb-4">Team,</p>
          <p className="mb-4">
            As we continue our response to Hurricanes Helene and Milton, I want to express my deepest 
            gratitude for your unwavering dedication and hard work. Your efforts are making a real 
            difference in the lives of those affected by these disasters.
          </p>
          <p className="mb-4">
            <strong>Key Priorities for This Operational Period:</strong>
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Continue shelter operations with focus on reunification</li>
            <li>Maintain feeding operations at current capacity</li>
            <li>Begin transition planning for long-term recovery</li>
            <li>Ensure all staff are taking appropriate rest periods</li>
          </ul>
          <p className="mb-4">Thank you for all you do.</p>
          <p>
            {V27_IAP_DATA.operation.approvedBy}<br/>
            {V27_IAP_DATA.operation.approvedByTitle}
          </p>
        </div>
      </div>
    </div>
  );
}

// PrioritiesObjectives component is now imported from ./PrioritiesObjectives.tsx

// Sheltering Assignments Component
function ShelteringAssignments() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Assignments - Sheltering</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border p-2">Facility</th>
            <th className="border p-2">County</th>
            <th className="border p-2">Capacity</th>
            <th className="border p-2">Current</th>
            <th className="border p-2">Staff Req</th>
            <th className="border p-2">Staff Have</th>
            <th className="border p-2">Gap</th>
          </tr>
        </thead>
        <tbody>
          {V27_IAP_DATA.shelteringFacilities.slice(0, 10).map((facility, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-2">{facility.name}</td>
              <td className="border p-2">{facility.county}</td>
              <td className="border p-2 text-center">{typeof facility.capacity === 'object' ? (facility.capacity as any).maximum : facility.capacity}</td>
              <td className="border p-2 text-center">{typeof facility.capacity === 'object' ? (facility.capacity as any).current : 0}</td>
              <td className="border p-2 text-center">{facility.personnel.required}</td>
              <td className="border p-2 text-center">{facility.personnel.have}</td>
              <td className="border p-2 text-center font-bold text-red-600">
                {facility.personnel.gap}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Feeding Assignments Component
function FeedingAssignments() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Assignments - Feeding</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border p-2">Site/Unit</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">County</th>
            <th className="border p-2">Meals/Day</th>
            <th className="border p-2">Staff Req</th>
            <th className="border p-2">Staff Have</th>
            <th className="border p-2">Gap</th>
          </tr>
        </thead>
        <tbody>
          {V27_IAP_DATA.feedingFacilities.slice(0, 10).map((facility, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-2">{facility.name}</td>
              <td className="border p-2">{facility.type}</td>
              <td className="border p-2">{facility.county}</td>
              <td className="border p-2 text-center">{facility.mealsPerDay}</td>
              <td className="border p-2 text-center">{facility.personnel.required}</td>
              <td className="border p-2 text-center">{facility.personnel.have}</td>
              <td className="border p-2 text-center font-bold text-red-600">
                {facility.personnel.gap}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Placeholder components for other sections
function AssessmentAssignments() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Assignments - Assessment</h2>
      <p>Assessment teams and assignments will be displayed here.</p>
    </div>
  );
}

function ClientServicesAssignments() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Assignments - Client Services</h2>
      <p>Client services assignments and case management details will be displayed here.</p>
    </div>
  );
}

// ContactRoster component is now imported from ./ContactRoster.tsx



