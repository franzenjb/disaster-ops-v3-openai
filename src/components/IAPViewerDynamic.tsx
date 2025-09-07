'use client';

import React, { useState, useMemo } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { IAPCoverPage } from './IAP/IAPCoverPage';
import { DirectorsMessage } from './IAP/DirectorsMessage';
import { ContactRoster } from './IAP/ContactRoster';
import { OrgChartFlow } from './IAP/OrgChartFlow';
import { PrioritiesObjectives } from './IAP/PrioritiesObjectives';
import { 
  IAPWorkAssignmentsShelteringResources,
  IAPWorkAssignmentsSheltering, 
  IAPWorkAssignmentsFeeding,
  IAPWorkAssignmentsFeedingERV
} from './IAP/IAPWorkAssignments';
import { IAPWorkAssignmentsGovernment } from './IAP/IAPWorkAssignmentsGovernment';
import { IAPWorkAssignmentsDamageAssessment } from './IAP/IAPWorkAssignmentsDamageAssessment';
import { IAPWorkAssignmentsDistribution } from './IAP/IAPWorkAssignmentsDistribution';
import { IAPWorkAssignmentsIndividualCare } from './IAP/IAPWorkAssignmentsIndividualCare';
import { DailySchedule } from './IAP/DailySchedule';
import { MapsGeographic } from './IAP/MapsGeographic';
import { WorkSitesFacilities } from './IAP/WorkSitesFacilities';
import { AppendicesReferences } from './IAP/AppendicesReferences';
import { PDFExport } from './PDFExport';

interface IAPSection {
  id: string;
  title: string;
  component: React.ReactNode;
  hasContent: boolean; // Dynamic check for content
  priority: number; // For ordering
}

export function IAPViewerDynamic() {
  const [currentSection, setCurrentSection] = useState(0);
  const [navOpen, setNavOpen] = useState(true);
  const [zoom, setZoom] = useState(100);

  // Dynamic sections that only appear if they have content
  const allSections: IAPSection[] = useMemo(() => {
    const sections = [
      {
        id: 'cover',
        title: 'Cover Page & Checklist',
        component: <IAPCoverPage 
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
          onPhotoUpdate={() => {}}
        />,
        hasContent: true, // Always include cover page
        priority: 1
      },
      {
        id: 'directors-message',
        title: "Director's Intent/Message",
        component: <DirectorsMessage onContentChange={() => {}} />,
        hasContent: true, // Check if director's message has content
        priority: 2
      },
      {
        id: 'priorities-objectives',
        title: 'Priorities & Objectives',
        component: <PrioritiesObjectives />,
        hasContent: V27_IAP_DATA.priorities && V27_IAP_DATA.priorities.length > 0,
        priority: 3
      },
      {
        id: 'contact-roster',
        title: 'Contact Roster DRO HQ',
        component: <ContactRoster />,
        hasContent: true, // Always include contact roster
        priority: 4
      },
      {
        id: 'org-chart',
        title: 'Incident Organization Chart',
        component: <OrgChartFlow />,
        hasContent: true, // Organization chart is essential
        priority: 5
      },
      {
        id: 'sheltering-resources',
        title: 'Sheltering Resources',
        component: <IAPWorkAssignmentsShelteringResources />,
        hasContent: V27_IAP_DATA.shelteringFacilities && V27_IAP_DATA.shelteringFacilities.length > 0,
        priority: 6
      },
      {
        id: 'sheltering-assignments',
        title: 'Sheltering Work Assignments',
        component: <IAPWorkAssignmentsSheltering />,
        hasContent: V27_IAP_DATA.shelteringFacilities && V27_IAP_DATA.shelteringFacilities.some(f => f.personnel && f.personnel.assignments),
        priority: 7
      },
      {
        id: 'feeding-assignments',
        title: 'Feeding Work Assignments',
        component: <IAPWorkAssignmentsFeeding />,
        hasContent: V27_IAP_DATA.feedingFacilities && V27_IAP_DATA.feedingFacilities.length > 0,
        priority: 8
      },
      {
        id: 'feeding-erv',
        title: 'Feeding ERV Assignments',
        component: <IAPWorkAssignmentsFeedingERV />,
        hasContent: V27_IAP_DATA.feedingFacilities && V27_IAP_DATA.feedingFacilities.some(f => f.erv),
        priority: 9
      },
      {
        id: 'government-ops',
        title: 'Government Operations',
        component: <IAPWorkAssignmentsGovernment />,
        hasContent: V27_IAP_DATA.governmentFacilities && V27_IAP_DATA.governmentFacilities.length > 0,
        priority: 10
      },
      {
        id: 'damage-assessment',
        title: 'Damage Assessment',
        component: <IAPWorkAssignmentsDamageAssessment />,
        hasContent: V27_IAP_DATA.damageAssessment && (V27_IAP_DATA.damageAssessment.teams.length > 0 || V27_IAP_DATA.damageAssessment.assignments.length > 0),
        priority: 11
      },
      {
        id: 'distribution',
        title: 'Distribution Operations',
        component: <IAPWorkAssignmentsDistribution />,
        hasContent: V27_IAP_DATA.distributionFacilities && V27_IAP_DATA.distributionFacilities.length > 0,
        priority: 12
      },
      {
        id: 'individual-care',
        title: 'Individual Care Services',
        component: <IAPWorkAssignmentsIndividualCare />,
        hasContent: V27_IAP_DATA.individualCare && V27_IAP_DATA.individualCare.cases && V27_IAP_DATA.individualCare.cases.length > 0,
        priority: 13
      },
      {
        id: 'daily-schedule',
        title: 'Daily Schedule & Meetings',
        component: <DailySchedule />,
        hasContent: true, // Always include daily schedule
        priority: 14
      },
      {
        id: 'work-sites',
        title: 'Work Sites & Facilities',
        component: <WorkSitesFacilities />,
        hasContent: true, // Always show facilities overview
        priority: 15
      },
      {
        id: 'maps-geographic',
        title: 'Maps & Geographic Info',
        component: <MapsGeographic />,
        hasContent: V27_IAP_DATA.maps && V27_IAP_DATA.maps.length > 0,
        priority: 16
      },
      {
        id: 'appendices',
        title: 'Appendices & References',
        component: <AppendicesReferences />,
        hasContent: V27_IAP_DATA.appendices && V27_IAP_DATA.appendices.length > 0,
        priority: 17
      }
    ];

    // Filter to only include sections with content and sort by priority
    return sections
      .filter(section => section.hasContent)
      .sort((a, b) => a.priority - b.priority);
  }, []);

  const activeSection = allSections[currentSection];
  const totalSections = allSections.length;

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Navigation Sidebar */}
      <div className={`${navOpen ? 'w-80' : 'w-12'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className={navOpen ? '' : 'hidden'}>
              <h2 className="font-bold text-lg">📄 IAP Document</h2>
              <p className="text-red-100 text-sm">{totalSections} sections with content</p>
            </div>
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="text-white hover:bg-red-700 p-1 rounded"
            >
              {navOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        {navOpen && (
          <div className="flex-1 overflow-y-auto">
            {allSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(index)}
                className={`w-full px-4 py-3 text-left border-b hover:bg-gray-50 transition-colors ${
                  currentSection === index 
                    ? 'bg-red-50 border-r-4 border-red-500 text-red-700' 
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="font-semibold text-sm mr-2">{index + 1}.</span>
                  <div>
                    <h3 className="font-medium text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-500">
                      {section.id === 'cover' ? 'Essential' : 
                       section.hasContent ? 'Has content' : 'Empty'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PDF Export */}
        {navOpen && (
          <div className="p-4 border-t">
            <PDFExport 
              title="Complete IAP Document"
              filename={`IAP_${V27_IAP_DATA.operation.drNumber}_OP${V27_IAP_DATA.operation.operationalPeriod.number}`}
            />
            <div className="text-xs text-gray-500 mt-2 text-center">
              Dynamic length: {totalSections} sections
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              {activeSection?.title}
            </h1>
            <span className="text-sm text-gray-500">
              Section {currentSection + 1} of {totalSections}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                −
              </button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                +
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentSection(Math.min(totalSections - 1, currentSection + 1))}
                disabled={currentSection === totalSections - 1}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 bg-gray-100 overflow-auto p-6">
          <div 
            className="max-w-4xl mx-auto bg-white shadow-lg min-h-full"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {activeSection?.component}
          </div>
        </div>

        {/* Bottom Status */}
        <div className="bg-white border-t px-6 py-2 flex items-center justify-between text-sm text-gray-600">
          <div>
            IAP for {V27_IAP_DATA.operation.name} • Operational Period {V27_IAP_DATA.operation.operationalPeriod.number}
          </div>
          <div>
            Generated: {new Date().toLocaleDateString()} • Dynamic length: {totalSections} sections
          </div>
        </div>
      </div>
    </div>
  );
}