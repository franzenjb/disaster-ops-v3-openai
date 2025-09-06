'use client';

import React, { useState } from 'react';
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
  startPage: number;
  endPage: number;
  pages: IAPPage[];
}

interface IAPPage {
  pageNumber: number;
  component: React.ReactNode;
}

export function IAPViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [navOpen, setNavOpen] = useState(true);
  const [zoom, setZoom] = useState(100);

  // Define all sections with their page ranges
  const sections: IAPSection[] = [
    {
      id: 'cover',
      title: 'Cover Page & Checklist',
      startPage: 1,
      endPage: 1,
      pages: [{
        pageNumber: 1,
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
        />
      }]
    },
    {
      id: 'directors-message',
      title: "Director's Intent/Message",
      startPage: 2,
      endPage: 3,
      pages: [
        { pageNumber: 2, component: <DirectorsMessage onContentChange={() => {}} /> },
        { pageNumber: 3, component: <div className="p-8">Director's Message continues...</div> }
      ]
    },
    {
      id: 'contact-roster',
      title: 'Contact Roster DRO HQ',
      startPage: 4,
      endPage: 6,
      pages: [
        { pageNumber: 4, component: <ContactRoster /> },
        { pageNumber: 5, component: <div className="p-8">Contact Roster Page 2</div> },
        { pageNumber: 6, component: <div className="p-8">Contact Roster Page 3</div> }
      ]
    },
    {
      id: 'org-chart',
      title: 'Incident Organization Chart',
      startPage: 7,
      endPage: 8,
      pages: [
        { pageNumber: 7, component: <OrgChartFlow /> },
        { pageNumber: 8, component: <div className="p-8">Organization Chart Details</div> }
      ]
    },
    {
      id: 'priorities',
      title: 'Incident Priorities and Objectives',
      startPage: 9,
      endPage: 10,
      pages: [
        { pageNumber: 9, component: <PrioritiesObjectives /> },
        { pageNumber: 10, component: <div className="p-8">Additional Objectives</div> }
      ]
    },
    {
      id: 'sheltering-resources',
      title: 'DRO - Sheltering Resources',
      startPage: 11,
      endPage: 12,
      pages: [
        { pageNumber: 11, component: <IAPWorkAssignmentsShelteringResources /> },
        { pageNumber: 12, component: <div className="p-8">Sheltering Resources Page 2</div> }
      ]
    },
    {
      id: 'feeding',
      title: 'Work Assignments - Feeding',
      startPage: 13,
      endPage: 22,
      pages: [
        { pageNumber: 13, component: <IAPWorkAssignmentsFeeding /> },
        { pageNumber: 14, component: <div className="p-8">Feeding Assignments Page 2</div> },
        { pageNumber: 15, component: <div className="p-8">Feeding Assignments Page 3</div> },
        { pageNumber: 16, component: <IAPWorkAssignmentsFeedingERV /> },
        { pageNumber: 17, component: <div className="p-8">ERV Assignments Page 2</div> },
        { pageNumber: 18, component: <div className="p-8">ERV Assignments Page 3</div> },
        { pageNumber: 19, component: <div className="p-8">ERV Assignments Page 4</div> },
        { pageNumber: 20, component: <div className="p-8">ERV Assignments Page 5</div> },
        { pageNumber: 21, component: <div className="p-8">ERV Assignments Page 6</div> },
        { pageNumber: 22, component: <div className="p-8">ERV Assignments Page 7</div> }
      ]
    },
    {
      id: 'government-ops',
      title: 'Work Assignments - Government Operations',
      startPage: 23,
      endPage: 25,
      pages: [
        { pageNumber: 23, component: <IAPWorkAssignmentsGovernment /> },
        { pageNumber: 24, component: <div className="p-8">Government Operations Page 2</div> },
        { pageNumber: 25, component: <div className="p-8">Government Operations Page 3</div> }
      ]
    },
    {
      id: 'damage-assessment',
      title: 'Work Assignments - Damage Assessment',
      startPage: 26,
      endPage: 28,
      pages: [
        { pageNumber: 26, component: <IAPWorkAssignmentsDamageAssessment /> },
        { pageNumber: 27, component: <div className="p-8">Damage Assessment Page 2</div> },
        { pageNumber: 28, component: <div className="p-8">Damage Assessment Page 3</div> }
      ]
    },
    {
      id: 'distribution',
      title: 'Work Assignments - Distribution',
      startPage: 29,
      endPage: 31,
      pages: [
        { pageNumber: 29, component: <IAPWorkAssignmentsDistribution /> },
        { pageNumber: 30, component: <div className="p-8">Distribution Page 2</div> },
        { pageNumber: 31, component: <div className="p-8">Distribution Page 3</div> }
      ]
    },
    {
      id: 'individual-care',
      title: 'Work Assignments - Individual Disaster Care',
      startPage: 32,
      endPage: 38,
      pages: [
        { pageNumber: 32, component: <IAPWorkAssignmentsIndividualCare /> },
        { pageNumber: 33, component: <div className="p-8">Individual Care Page 2</div> },
        { pageNumber: 34, component: <div className="p-8">Individual Care Page 3</div> },
        { pageNumber: 35, component: <div className="p-8">Individual Care Page 4</div> },
        { pageNumber: 36, component: <div className="p-8">Individual Care Page 5</div> },
        { pageNumber: 37, component: <div className="p-8">Individual Care Page 6</div> },
        { pageNumber: 38, component: <div className="p-8">Individual Care Page 7</div> }
      ]
    },
    {
      id: 'work-sites',
      title: 'Work Sites and Facilities',
      startPage: 39,
      endPage: 44,
      pages: [
        { pageNumber: 39, component: <WorkSitesFacilities /> },
        { pageNumber: 40, component: <div className="p-8">Work Sites Page 2</div> },
        { pageNumber: 41, component: <div className="p-8">Work Sites Page 3</div> },
        { pageNumber: 42, component: <div className="p-8">Work Sites Page 4</div> },
        { pageNumber: 43, component: <div className="p-8">Work Sites Page 5</div> },
        { pageNumber: 44, component: <div className="p-8">Work Sites Page 6</div> }
      ]
    },
    {
      id: 'daily-schedule',
      title: 'Daily Schedule',
      startPage: 45,
      endPage: 48,
      pages: [
        { pageNumber: 45, component: <DailySchedule /> },
        { pageNumber: 46, component: <div className="p-8">Daily Schedule Page 2</div> },
        { pageNumber: 47, component: <div className="p-8">Daily Schedule Page 3</div> },
        { pageNumber: 48, component: <div className="p-8">Daily Schedule Page 4</div> }
      ]
    },
    {
      id: 'maps',
      title: 'Maps and Geographic Information',
      startPage: 49,
      endPage: 51,
      pages: [
        { pageNumber: 49, component: <MapsGeographic /> },
        { pageNumber: 50, component: <div className="p-8">Maps Page 2</div> },
        { pageNumber: 51, component: <div className="p-8">Maps Page 3</div> }
      ]
    },
    {
      id: 'appendices',
      title: 'Appendices and References',
      startPage: 52,
      endPage: 53,
      pages: [
        { pageNumber: 52, component: <AppendicesReferences /> },
        { pageNumber: 53, component: <div className="p-8">Additional References</div> }
      ]
    }
  ];

  // Find current page component
  const getCurrentPageComponent = () => {
    for (const section of sections) {
      const page = section.pages.find(p => p.pageNumber === currentPage);
      if (page) return page.component;
    }
    return <div className="p-8 text-center text-gray-500">Page {currentPage} - Content Loading...</div>;
  };

  // Find current section
  const getCurrentSection = () => {
    return sections.find(s => currentPage >= s.startPage && currentPage <= s.endPage);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation Panel */}
      <div className={`${navOpen ? 'w-80' : 'w-12'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        {/* Navigation Header */}
        <div className="bg-red-600 text-white">
          <div className={`p-4 flex items-center justify-between ${!navOpen && 'px-2'}`}>
            {navOpen && (
              <div>
                <h3 className="font-bold text-lg">IAP Document</h3>
                <p className="text-sm opacity-90">Page {currentPage} of 53</p>
              </div>
            )}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="text-white hover:bg-red-700 p-2 rounded transition-colors"
              title={navOpen ? 'Collapse navigation' : 'Expand navigation'}
            >
              {navOpen ? '◁' : '▷'}
            </button>
          </div>
        </div>

        {navOpen && (
          <>
            {/* Quick Navigation */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="flex-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Cover
                </button>
                <button
                  onClick={() => setCurrentPage(9)}
                  className="flex-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Priorities
                </button>
                <button
                  onClick={() => setCurrentPage(39)}
                  className="flex-1 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Sites
                </button>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex-1 overflow-y-auto">
              {sections.map(section => {
                const isCurrentSection = currentPage >= section.startPage && currentPage <= section.endPage;
                return (
                  <div key={section.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => setCurrentPage(section.startPage)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        isCurrentSection ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isCurrentSection ? 'font-semibold text-blue-600' : ''}`}>
                          {section.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {section.startPage === section.endPage 
                            ? `p.${section.startPage}`
                            : `p.${section.startPage}-${section.endPage}`
                          }
                        </span>
                      </div>
                    </button>
                    
                    {/* Show page numbers when section is active */}
                    {isCurrentSection && section.pages.length > 1 && (
                      <div className="bg-gray-50 px-4 py-2 flex flex-wrap gap-1">
                        {section.pages.map(page => (
                          <button
                            key={page.pageNumber}
                            onClick={() => setCurrentPage(page.pageNumber)}
                            className={`px-2 py-1 text-xs rounded ${
                              currentPage === page.pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-gray-100 border'
                            }`}
                          >
                            {page.pageNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Main Document Area */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Page</span>
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value) || 1;
                      setCurrentPage(Math.min(53, Math.max(1, page)));
                    }}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min="1"
                    max="53"
                  />
                  <span className="text-sm text-gray-600">of 53</span>
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(53, currentPage + 1))}
                  disabled={currentPage === 53}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 border-l pl-4">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
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
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  Fit
                </button>
              </div>

              {/* Current Section */}
              <div className="border-l pl-4">
                <span className="text-sm text-gray-600">
                  {getCurrentSection()?.title || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                🖨️ Print
              </button>
              <PDFExport data={V27_IAP_DATA} />
            </div>
          </div>
        </div>

        {/* Page Container */}
        <div className="flex justify-center py-8 px-4">
          <div 
            className="bg-white shadow-2xl transition-transform"
            style={{
              width: '8.5in',
              minHeight: '11in',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Page Header */}
            <div className="border-b-2 border-gray-800 px-8 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold">INCIDENT ACTION PLAN</h1>
                  <p className="text-sm text-gray-700">
                    {V27_IAP_DATA.operation.drNumber} • {V27_IAP_DATA.operation.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Operational Period #{V27_IAP_DATA.operation.operationalPeriod.number}
                  </p>
                  <p className="text-xs text-gray-600">
                    {V27_IAP_DATA.operation.operationalPeriod.start} - {V27_IAP_DATA.operation.operationalPeriod.end}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="min-h-[9in] overflow-auto">
              {getCurrentPageComponent()}
            </div>

            {/* Page Footer */}
            <div className="border-t-2 border-gray-800 px-8 py-3 bg-gray-50">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>For Official Use Only</span>
                <span className="font-semibold">Page {currentPage} of 53</span>
                <span>Generated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}