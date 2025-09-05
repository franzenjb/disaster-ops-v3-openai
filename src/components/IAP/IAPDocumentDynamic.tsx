'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { IAPCoverPage } from './IAPCoverPage';
import { DirectorsMessage } from './DirectorsMessage';
import { ContactRoster } from './ContactRoster';
import { OrgChartFlow } from './OrgChartFlow';
import { 
  IAPWorkAssignmentsShelteringResources,
  IAPWorkAssignmentsSheltering, 
  IAPWorkAssignmentsFeedingERV
} from './IAPWorkAssignments';
import { IAPWorkAssignmentsGovernment } from './IAPWorkAssignmentsGovernment';
import { IAPWorkAssignmentsDamageAssessment } from './IAPWorkAssignmentsDamageAssessment';
import { IAPWorkAssignmentsDistribution } from './IAPWorkAssignmentsDistribution';
import { IAPWorkAssignmentsIndividualCare } from './IAPWorkAssignmentsIndividualCare';

interface DynamicSection {
  id: string;
  title: string;
  content: () => React.ReactNode;
  hasData: boolean;
  estimatedPages: number;
}

export function IAPDocumentDynamic() {
  const [expandedSection, setExpandedSection] = useState<string>('cover');
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([]);
  const [facilitiesData, setFacilitiesData] = useState<any>({});
  
  useEffect(() => {
    // Load all data from storage
    const facilities = simpleStore.getFacilities() || [];
    const roster = simpleStore.getContactRoster() || [];
    const workAssignments = simpleStore.getWorkAssignments ? simpleStore.getWorkAssignments() : [];
    
    // Categorize facilities by type
    const shelters = facilities.filter(f => 
      f.type === 'Shelter' || f.type === 'Evacuation Center'
    );
    const staffShelters = facilities.filter(f => 
      f.type === 'Staff Shelter' || f.type === 'Responder Shelter'
    );
    const feedingSites = facilities.filter(f => 
      f.type === 'Feeding' || f.type === 'Kitchen' || f.type === 'ERV'
    );
    const distributionSites = facilities.filter(f => 
      f.type === 'Distribution' || f.type === 'POD' || f.type === 'MRV'
    );
    
    // Check for specific work assignment types
    const hasGovernmentOps = workAssignments.some(w => 
      w.type === 'EOC' || w.category === 'Government Operations'
    );
    const hasDamageAssessment = workAssignments.some(w => 
      w.type === 'DA' || w.category === 'Damage Assessment'
    );
    const hasIndividualCare = workAssignments.some(w => 
      w.type === 'DMH' || w.type === 'DHS' || w.category === 'Individual Care'
    );
    
    setFacilitiesData({
      shelters,
      staffShelters,
      feedingSites,
      distributionSites,
      hasGovernmentOps,
      hasDamageAssessment,
      hasIndividualCare
    });
    
    // Build dynamic sections based on available data
    const sections: DynamicSection[] = [];
    
    // Always include these core sections
    sections.push({
      id: 'cover',
      title: 'Cover Page & Checklist',
      content: () => <IAPCoverPage />,
      hasData: true,
      estimatedPages: 1
    });
    
    sections.push({
      id: 'directors-message',
      title: "Director's Intent/Message",
      content: () => <DirectorsMessage />,
      hasData: true,
      estimatedPages: 2
    });
    
    // Contact roster only if we have data
    if (roster.length > 0) {
      sections.push({
        id: 'contact-roster',
        title: 'Contact Roster DRO HQ',
        content: () => <ContactRoster />,
        hasData: true,
        estimatedPages: Math.ceil(roster.length / 15) // ~15 contacts per page
      });
      
      // Org chart follows contact roster if we have hierarchy data
      const hasReportingStructure = roster.some(r => r.reportsTo);
      if (hasReportingStructure) {
        sections.push({
          id: 'org-chart',
          title: 'Incident Organization Chart',
          content: () => <OrgChartFlow />,
          hasData: true,
          estimatedPages: 2
        });
      }
    }
    
    // Priorities section
    sections.push({
      id: 'priorities',
      title: 'Incident Priorities and Objectives',
      content: () => <PrioritiesObjectives />,
      hasData: true,
      estimatedPages: 2
    });
    
    // Sheltering sections only if we have shelters
    if (staffShelters.length > 0) {
      sections.push({
        id: 'sheltering-resources',
        title: 'DRO - Sheltering Resources',
        content: () => <IAPWorkAssignmentsShelteringResources />,
        hasData: true,
        estimatedPages: Math.ceil(staffShelters.length / 4) // ~4 per page
      });
    }
    
    if (shelters.length > 0) {
      sections.push({
        id: 'sheltering',
        title: 'Work Assignments - Sheltering',
        content: () => <IAPWorkAssignmentsSheltering />,
        hasData: true,
        estimatedPages: Math.ceil(shelters.length / 3) // ~3 shelters per page
      });
    }
    
    // Feeding section only if we have feeding sites
    if (feedingSites.length > 0) {
      sections.push({
        id: 'feeding',
        title: 'Work Assignments - Feeding',
        content: () => <IAPWorkAssignmentsFeedingERV />,
        hasData: true,
        estimatedPages: Math.ceil(feedingSites.length / 5) // ~5 ERVs per page
      });
    }
    
    // Government Operations only if assigned
    if (hasGovernmentOps) {
      sections.push({
        id: 'government-ops',
        title: 'Work Assignments - Government Operations',
        content: () => <IAPWorkAssignmentsGovernment />,
        hasData: true,
        estimatedPages: 3
      });
    }
    
    // Damage Assessment only if teams assigned
    if (hasDamageAssessment) {
      sections.push({
        id: 'damage-assessment',
        title: 'Work Assignments - Damage Assessment',
        content: () => <IAPWorkAssignmentsDamageAssessment />,
        hasData: true,
        estimatedPages: 3
      });
    }
    
    // Distribution only if we have distribution sites
    if (distributionSites.length > 0) {
      sections.push({
        id: 'distribution',
        title: 'Work Assignments - Distribution',
        content: () => <IAPWorkAssignmentsDistribution />,
        hasData: true,
        estimatedPages: Math.ceil(distributionSites.length / 4)
      });
    }
    
    // Individual Care only if assigned
    if (hasIndividualCare) {
      sections.push({
        id: 'individual-care',
        title: 'Work Assignments - Individual Disaster Care',
        content: () => <IAPWorkAssignmentsIndividualCare />,
        hasData: true,
        estimatedPages: 5
      });
    }
    
    // Work Sites table if we have any facilities
    if (facilities.length > 0) {
      sections.push({
        id: 'work-sites',
        title: 'Work Sites and Facilities',
        content: () => <WorkSitesFacilities />,
        hasData: true,
        estimatedPages: Math.ceil(facilities.length / 10) // ~10 facilities per page
      });
    }
    
    // Daily Schedule
    sections.push({
      id: 'daily-schedule',
      title: 'Daily Schedule',
      content: () => <DailySchedule />,
      hasData: true,
      estimatedPages: 2
    });
    
    // Maps section with image upload
    sections.push({
      id: 'maps',
      title: 'Maps and Geographic Information',
      content: () => <MapsWithImageUpload />,
      hasData: true,
      estimatedPages: 3
    });
    
    // Appendices
    sections.push({
      id: 'appendices',
      title: 'Appendices and References',
      content: () => <AppendicesReferences />,
      hasData: true,
      estimatedPages: 2
    });
    
    setDynamicSections(sections);
  }, []);
  
  // Calculate running page numbers
  const calculatePageNumbers = () => {
    let currentPage = 1;
    const pageRanges: { [key: string]: { start: number; end: number } } = {};
    
    dynamicSections.forEach(section => {
      if (section.hasData) {
        pageRanges[section.id] = {
          start: currentPage,
          end: currentPage + section.estimatedPages - 1
        };
        currentPage += section.estimatedPages;
      }
    });
    
    return { pageRanges, totalPages: currentPage - 1 };
  };
  
  const { pageRanges, totalPages } = calculatePageNumbers();
  
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Document Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">
            Incident Action Plan #{V27_IAP_DATA.operation.operationalPeriod.number}
          </h1>
          <p>DR {V27_IAP_DATA.operation.drNumber} - {V27_IAP_DATA.operation.name}</p>
          <p className="text-sm">
            Operational Period: {V27_IAP_DATA.operation.operationalPeriod.start} to{' '}
            {V27_IAP_DATA.operation.operationalPeriod.end}
          </p>
          <p className="text-xs mt-2">
            Total Pages: {totalPages} | Sections with Data: {dynamicSections.filter(s => s.hasData).length}
          </p>
        </div>

        {/* Dynamic Status Bar */}
        <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm">
          <strong>Dynamic Content Status:</strong>
          {facilitiesData.shelters?.length > 0 && ` ${facilitiesData.shelters.length} Shelters |`}
          {facilitiesData.feedingSites?.length > 0 && ` ${facilitiesData.feedingSites.length} Feeding Sites |`}
          {facilitiesData.distributionSites?.length > 0 && ` ${facilitiesData.distributionSites.length} Distribution Sites |`}
          {facilitiesData.hasGovernmentOps && ' Government Ops Active |'}
          {facilitiesData.hasDamageAssessment && ' DA Teams Active |'}
          {facilitiesData.hasIndividualCare && ' Individual Care Active'}
          {Object.keys(facilitiesData).length === 0 && ' No operational data - using sample content'}
        </div>

        {/* Accordion Sections - Only show sections with data */}
        <div className="bg-white border-2 border-gray-200">
          {dynamicSections.filter(section => section.hasData).map((section) => (
            <div key={section.id} className="border-b border-gray-200 last:border-b-0">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{section.title}</span>
                  <span className="text-sm text-gray-500">
                    Pages {pageRanges[section.id]?.start}-{pageRanges[section.id]?.end}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {section.estimatedPages > 1 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {section.estimatedPages} pages
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === section.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Section Content */}
              {expandedSection === section.id && (
                <div className="border-t border-gray-200 bg-white">
                  {section.content()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-lg text-center text-sm text-gray-600">
          <p>
            This IAP contains {totalPages} pages dynamically generated from operational data.
          </p>
          <p className="mt-1">
            Sections without data are automatically hidden. Add facilities and assignments to expand content.
          </p>
        </div>
      </div>
    </div>
  );
}

// Placeholder components - these would be imported from their respective files
const PrioritiesObjectives = () => (
  <div className="p-4">
    <h3 className="font-bold">Incident Priorities and Objectives</h3>
    <p>Content dynamically generated based on operation priorities...</p>
  </div>
);

const WorkSitesFacilities = () => (
  <div className="p-4">
    <h3 className="font-bold">Work Sites and Facilities Table</h3>
    <p>Comprehensive list of all operational facilities...</p>
  </div>
);

const DailySchedule = () => (
  <div className="p-4">
    <h3 className="font-bold">Daily Schedule</h3>
    <p>Operation schedule and briefing times...</p>
  </div>
);

const MapsWithImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages([...uploadedImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">Maps and Geographic Information</h3>
      
      {/* Image Upload Area - Same as Cover Page */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Maps (Situation Maps, County Maps, Evacuation Routes, etc.)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="map-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
              >
                <span>Upload map images</span>
                <input
                  id="map-upload"
                  name="map-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
      
      {/* Display Uploaded Maps */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="border rounded p-2">
              <img src={img} alt={`Map ${idx + 1}`} className="w-full h-auto" />
              <p className="text-xs text-center mt-1">Map {idx + 1}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AppendicesReferences = () => (
  <div className="p-4">
    <h3 className="font-bold">Appendices and References</h3>
    <p>Additional resources and reference materials...</p>
  </div>
);