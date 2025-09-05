'use client';

import React, { useState } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface IAPSection {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  content: () => React.ReactNode;
}

export function IAPDocument() {
  const [expandedSection, setExpandedSection] = useState<string>('cover');
  
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
      content: () => <DirectorsMessage />
    },
    {
      id: 'priorities',
      title: 'Incident Priorities and Objectives',
      startPage: 4,
      endPage: 5,
      content: () => <PrioritiesObjectives />
    },
    {
      id: 'sheltering',
      title: 'Work Assignments - Sheltering',
      startPage: 6,
      endPage: 14,
      content: () => <ShelteringAssignments />
    },
    {
      id: 'feeding',
      title: 'Work Assignments - Feeding',
      startPage: 15,
      endPage: 22,
      content: () => <FeedingAssignments />
    },
    {
      id: 'assessment',
      title: 'Work Assignments - Assessment',
      startPage: 23,
      endPage: 28,
      content: () => <AssessmentAssignments />
    },
    {
      id: 'client-services',
      title: 'Work Assignments - Client Services',
      startPage: 29,
      endPage: 33,
      content: () => <ClientServicesAssignments />
    },
    {
      id: 'contact-roster',
      title: 'Contact Roster',
      startPage: 34,
      endPage: 38,
      content: () => <ContactRoster />
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
      content: () => <DailySchedule />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Document Header */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Incident Action Plan #{V27_IAP_DATA.operation.operationalPeriod.number}</h1>
          <p>DR {V27_IAP_DATA.operation.drNumber} - {V27_IAP_DATA.operation.name}</p>
          <p className="text-sm">Operational Period: {V27_IAP_DATA.operation.operationalPeriod.start} to {V27_IAP_DATA.operation.operationalPeriod.end}</p>
        </div>

        {/* Accordion Sections */}
        <div className="bg-white border-2 border-gray-200">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-gray-200 last:border-b-0">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className={`transform transition-transform ${expandedSection === section.id ? 'rotate-90' : ''}`}>
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
              {expandedSection === section.id && (
                <div className="border-t border-gray-200">
                  <div className="p-4 bg-gray-50">
                    {section.content()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="bg-gray-100 p-4 rounded-b-lg flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Export to PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Print
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Email
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cover Page Component
function CoverPage() {
  const [checklist] = useState({
    directorsIntent: true,
    incidentPriorities: true,
    statusOfPrevious: true,
    contactRoster: true,
    incidentOpenAction: true,
    incidentOrgChart: true,
    workAssignment: true,
    workSites: true,
    dailySchedule: true,
    generalMessage: true
  });

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Incident Action Plan [#{V27_IAP_DATA.operation.operationalPeriod.number}]</h1>
        <h2 className="text-2xl">DR {V27_IAP_DATA.operation.drNumber} - {V27_IAP_DATA.operation.name}</h2>
        <p className="text-lg mt-2">{V27_IAP_DATA.operation.operationalPeriod.start} to {V27_IAP_DATA.operation.operationalPeriod.end}</p>
      </div>

      {/* Photo Placeholder */}
      <div className="border-2 border-gray-300 h-64 mb-6 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Operation Photo</div>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Upload Photo
          </button>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <td className="p-2 font-bold">Documents Included:</td>
                <td className="p-2 font-bold text-center">Y/N</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">Director's Intent/Message</td>
                <td className="p-1 text-center">{checklist.directorsIntent ? 'Y' : 'N'}</td>
              </tr>
              <tr>
                <td className="p-1">Incident Priorities and Objectives</td>
                <td className="p-1 text-center">{checklist.incidentPriorities ? 'Y' : 'N'}</td>
              </tr>
              <tr>
                <td className="p-1">Contact Roster DRO HQ</td>
                <td className="p-1 text-center">{checklist.contactRoster ? 'Y' : 'N'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <td className="p-2 font-bold">Documents Included:</td>
                <td className="p-2 font-bold text-center">Y/N</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">Work Assignment</td>
                <td className="p-1 text-center">{checklist.workAssignment ? 'Y' : 'N'}</td>
              </tr>
              <tr>
                <td className="p-1">Work Sites</td>
                <td className="p-1 text-center">{checklist.workSites ? 'Y' : 'N'}</td>
              </tr>
              <tr>
                <td className="p-1">Daily Schedule</td>
                <td className="p-1 text-center">{checklist.dailySchedule ? 'Y' : 'N'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Directors Message Component
function DirectorsMessage() {
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

// Priorities and Objectives Component
function PrioritiesObjectives() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Incident Priorities and Objectives</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Incident Priorities</h3>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Life Safety - Ensure safety of all responders and affected populations</li>
            <li>Incident Stabilization - Provide shelter, feeding, and essential services</li>
            <li>Property/Environmental Conservation - Support recovery efforts</li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Operational Period Objectives</h3>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Maintain 24/7 shelter operations at all active sites</li>
            <li>Provide 3 meals per day to all shelter residents</li>
            <li>Complete damage assessments in priority zones</li>
            <li>Process client assistance requests within 48 hours</li>
            <li>Coordinate with state/federal partners on resource requests</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

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

function ContactRoster() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Roster</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Position</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">Job Director</td>
            <td className="p-2">{V27_IAP_DATA.operation.approvedBy}</td>
            <td className="p-2">(555) 123-4567</td>
            <td className="p-2">director@redcross.org</td>
          </tr>
          <tr>
            <td className="p-2">I&P Manager</td>
            <td className="p-2">{V27_IAP_DATA.operation.preparedBy}</td>
            <td className="p-2">(555) 123-4568</td>
            <td className="p-2">planning@redcross.org</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WorkSitesFacilities() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Work Sites and Facilities</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Facility</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">County</th>
          </tr>
        </thead>
        <tbody>
          {V27_IAP_DATA.workSites.slice(0, 10).map((site, idx) => (
            <tr key={idx}>
              <td className="p-2">{site.facility}</td>
              <td className="p-2">{site.type}</td>
              <td className="p-2">{site.address}</td>
              <td className="p-2">{site.county}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailySchedule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Daily Schedule</h2>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Activity</th>
            <th className="p-2 text-left">Location</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-2">0600</td><td className="p-2">Shift Change</td><td className="p-2">All Sites</td></tr>
          <tr><td className="p-2">0700</td><td className="p-2">Morning Briefing</td><td className="p-2">DRO HQ</td></tr>
          <tr><td className="p-2">1200</td><td className="p-2">Situation Update</td><td className="p-2">Virtual</td></tr>
          <tr><td className="p-2">1300</td><td className="p-2">Tactics Meeting</td><td className="p-2">DRO HQ</td></tr>
          <tr><td className="p-2">1600</td><td className="p-2">Planning Meeting</td><td className="p-2">DRO HQ</td></tr>
          <tr><td className="p-2">1800</td><td className="p-2">IAP Distribution</td><td className="p-2">All Sites</td></tr>
          <tr><td className="p-2">1800</td><td className="p-2">Shift Change</td><td className="p-2">All Sites</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function MapsGeographic() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Maps and Geographic Information</h2>
      <div className="border-2 border-gray-300 h-96 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Operational area maps and facility locations</p>
      </div>
    </div>
  );
}

function AppendicesReferences() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appendices and References</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Reference Documents:</h3>
          <ul className="list-disc ml-6">
            <li>Red Cross Disaster Operations Manual</li>
            <li>State Emergency Response Plan</li>
            <li>County EOC Coordination Procedures</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Important Links:</h3>
          <ul className="list-disc ml-6">
            <li>RCView Dashboard</li>
            <li>WebEOC Portal</li>
            <li>FEMA Resource Portal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}