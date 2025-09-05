'use client';

import React, { useEffect, useState } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface ResourceAssignment {
  resourceId: string;
  leaderName: string;
  leaderContact: string;
  nightLeaderName?: string;
  nightLeaderContact?: string;
  totalPersons: string;
  reportingLocation: string;
  reportingTime: string;
  workAssignment: string;
}

interface FacilityData {
  id: string;
  name: string;
  type: string;
  county: string;
  address: string;
  capacity?: number;
  currentOccupancy?: number;
  staffRequired?: number;
  staffAssigned?: number;
  mealsPerDay?: number;
}

// DRO Sheltering Resources - this would come from staff shelter facilities
export function IAPWorkAssignmentsShelteringResources() {
  const [resources, setResources] = useState<ResourceAssignment[]>([]);
  
  useEffect(() => {
    // Load staff shelter facilities from database
    const facilities = simpleStore.getFacilities();
    const staffShelters = facilities
      .filter(f => f.type === 'Staff Shelter' || f.type === 'Responder Shelter')
      .map(f => ({
        resourceId: f.name,
        leaderName: 'TBD', // This would come from personnel assignments
        leaderContact: 'TBD',
        nightLeaderName: 'TBD',
        nightLeaderContact: 'TBD',
        totalPersons: 'TBD',
        reportingLocation: `${f.address}\n${f.county || ''} County`,
        reportingTime: 'Day – 07:00\n\nNight – 19:00',
        workAssignment: 'Operate responder sheltering for assigned responders at location'
      }));
    
    // If no staff shelters, show example data
    if (staffShelters.length === 0) {
      setResources([
        {
          resourceId: 'Adventure Island Base Camp',
          leaderName: 'Sherry Garza-Lopez',
          leaderContact: '(213-735-4683)',
          nightLeaderName: 'Sherry Garza-Lopez',
          nightLeaderContact: '(213-735-4683)',
          totalPersons: 'SH/SV – 1\nSH/SA – 2',
          reportingLocation: '10001 McKinley Dr\nTampa, FL 33612\nHillsborough County',
          reportingTime: 'Day – 07:00\n\nNight – 19:00',
          workAssignment: 'Operate responder sheltering for assigned responders at location'
        },
        {
          resourceId: 'Red Cross of Southwest Florida Staff Shelter',
          leaderName: 'Joyce Cook',
          leaderContact: '(815-579-2893)',
          nightLeaderName: 'Joyce Cook',
          nightLeaderContact: '(815-579-2893)',
          totalPersons: 'SH/SV – 1\nSH/SA – 3',
          reportingLocation: '2001 Cantu CT\nSarasota, FL 34232\nSarasota County',
          reportingTime: 'Day – 07:00\n\nNight – 19:00',
          workAssignment: 'Operate responder sheltering for assigned responders at location'
        }
      ]);
    } else {
      setResources(staffShelters);
    }
  }, []);

  return (
    <div className="p-4">
      {/* Title matching exact IAP format */}
      <div className="border-2 border-black bg-gray-200 p-2 font-bold">
        DRO – Sheltering Resources
      </div>
      
      {/* Table matching exact IAP structure */}
      <table className="w-full border-collapse border-2 border-black">
        <thead>
          <tr>
            <th className="border-2 border-black p-2 text-left" rowSpan={2}>Resource ID</th>
            <th className="border-2 border-black p-2 text-left" rowSpan={2}>Leader Name & Contact Information</th>
            <th className="border-2 border-black p-2 text-center" rowSpan={2}>Total # of Persons</th>
            <th className="border-2 border-black p-2 text-center" colSpan={2}>Reporting</th>
          </tr>
          <tr>
            <th className="border-2 border-black p-2 text-center">Location</th>
            <th className="border-2 border-black p-2 text-center">Time</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, idx) => (
            <React.Fragment key={idx}>
              <tr>
                <td className="border-2 border-black p-2 align-top font-bold" rowSpan={2}>
                  {resource.resourceId}
                </td>
                <td className="border-2 border-black p-2 whitespace-pre-wrap">
                  • Day – {resource.leaderName}
                  <br />
                  {resource.leaderContact}
                  <br />
                  <br />
                  • Night – {resource.nightLeaderName}
                  <br />
                  {resource.nightLeaderContact}
                </td>
                <td className="border-2 border-black p-2 text-center whitespace-pre-wrap">
                  {resource.totalPersons}
                </td>
                <td className="border-2 border-black p-2 whitespace-pre-wrap">
                  {resource.reportingLocation}
                </td>
                <td className="border-2 border-black p-2 text-center whitespace-pre-wrap">
                  {resource.reportingTime}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="border-2 border-black p-2 bg-gray-100">
                  <div className="font-bold">Work Assignment</div>
                  <div>{resource.workAssignment}</div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IAPWorkAssignmentsSheltering() {
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  
  useEffect(() => {
    // Load shelter facilities from database
    const allFacilities = simpleStore.getFacilities();
    const shelters = allFacilities
      .filter(f => f.type === 'Shelter' || f.type === 'Evacuation Center')
      .map(f => {
        // Parse any stored work assignment data
        const workAssignment = simpleStore.getWorkAssignment(f.id);
        return {
          id: f.id,
          name: f.name,
          type: f.type,
          county: f.county || 'Unknown',
          address: f.address,
          capacity: workAssignment?.capacity || 100,
          currentOccupancy: workAssignment?.currentOccupancy || 0,
          staffRequired: workAssignment?.staffRequired || 5,
          staffAssigned: workAssignment?.staffAssigned || 0,
        };
      });
    
    setFacilities(shelters);
  }, []);

  // If no facilities from database, show example data
  const displayFacilities = facilities.length > 0 ? facilities : [
    {
      id: '1',
      name: 'Central High School Shelter',
      type: 'Shelter',
      county: 'Hillsborough',
      address: '',
      capacity: 250,
      currentOccupancy: 187,
      staffRequired: 12,
      staffAssigned: 10
    },
    {
      id: '2', 
      name: 'First Baptist Church',
      type: 'Shelter',
      county: 'Pinellas',
      address: '',
      capacity: 150,
      currentOccupancy: 92,
      staffRequired: 8,
      staffAssigned: 8
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Work Assignments - Sheltering</h2>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border border-black p-2 text-left">Facility</th>
            <th className="border border-black p-2 text-center">County</th>
            <th className="border border-black p-2 text-center">Capacity</th>
            <th className="border border-black p-2 text-center">Current</th>
            <th className="border border-black p-2 text-center">Staff Req</th>
            <th className="border border-black p-2 text-center">Staff Have</th>
            <th className="border border-black p-2 text-center">Gap</th>
          </tr>
        </thead>
        <tbody>
          {displayFacilities.map((facility, idx) => {
            const gap = (facility.staffRequired || 0) - (facility.staffAssigned || 0);
            return (
              <tr key={facility.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="border border-black p-2">{facility.name}</td>
                <td className="border border-black p-2 text-center">{facility.county}</td>
                <td className="border border-black p-2 text-center">{facility.capacity || 0}</td>
                <td className="border border-black p-2 text-center">{facility.currentOccupancy || 0}</td>
                <td className="border border-black p-2 text-center">{facility.staffRequired || 0}</td>
                <td className="border border-black p-2 text-center">{facility.staffAssigned || 0}</td>
                <td className={`border border-black p-2 text-center font-bold ${gap > 0 ? 'text-red-600' : ''}`}>
                  {gap}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Enhanced Feeding Work Assignments with ERV details
export function IAPWorkAssignmentsFeedingERV() {
  interface ERVAssignment {
    resourceId: string;
    crew: { name: string; note?: string }[];
    personnel: string;
    reportingLocation: string;
    reportingTime: string;
    workAssignment: string;
  }

  const ervAssignments: ERVAssignment[] = [
    {
      resourceId: 'ERV 11181',
      crew: [
        { name: 'Jake Gonzales' },
        { name: 'Ben Knight' }
      ],
      personnel: 'FF/SA-ERV – 2',
      reportingLocation: 'BRG - Church of the Palms\n3224 Bee Ridge Rd.\nSarasota Fl',
      reportingTime: '09:00',
      workAssignment: '***VEHICLE IS OUT OF SERVICE with a broken part.*** Crew, report to the kitchen at 9AM to pick up meals and deliver on a route to be assigned by your kitchen manager. The kitchen manager at BRG today is Dianne Heard (610-416-5238).'
    },
    {
      resourceId: 'ERV 31082',
      crew: [
        { name: 'Greg Camacho' },
        { name: '**Please sign the sign-in sheet' }
      ],
      personnel: 'FF/SA-ERV – 2',
      reportingLocation: 'BRG - Church of the Palms\n3224 Bee Ridge Rd.\nSarasota Fl',
      reportingTime: '09:00',
      workAssignment: 'Report to the kitchen at 9AM to pick up meals and deliver to clients on a route to be assigned by your kitchen manager. The kitchen manager at BRG today is Dianne Heard (610-416-5238).'
    },
    {
      resourceId: 'ERV 34076',
      crew: [
        { name: 'Blackshear, Kenneth' },
        { name: 'Horning, James' },
        { name: 'Ohno, Rosa' }
      ],
      personnel: 'FF/SA-ERV – 2',
      reportingLocation: 'Stand by for Assignment',
      reportingTime: '10:30',
      workAssignment: 'Stand by for assignment details from District 4 Feeding Coordinator'
    },
    {
      resourceId: 'ERV 16619',
      crew: [
        { name: 'Fredericksen, Rick' },
        { name: 'Fredericksen, Jackie' }
      ],
      personnel: 'FF/SA-ERV – 2',
      reportingLocation: 'Stand by for Assignment',
      reportingTime: '11:00',
      workAssignment: 'Stand by for assignment details from District 4 Feeding Coordinator'
    },
    {
      resourceId: 'ERV 34084',
      crew: [
        { name: 'Traversa, Janice' },
        { name: 'Crowell, John' }
      ],
      personnel: 'FF/SA-ERV – 2',
      reportingLocation: 'Stand by for Assignment',
      reportingTime: '10:30',
      workAssignment: 'Stand by for assignment details from District 4 Feeding Coordinator'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gray-600 text-white p-2">
        <h2 className="text-lg font-bold">DRO – Feeding</h2>
      </div>
      
      {/* Leadership */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="font-bold mb-2">Operations Leadership</h3>
        <p>AD Operations – Jennifer Carkner (509-859-2374)</p>
        <p>HQ Mass Care Chief – Brenda Bridges (760-987-5452)</p>
        <p>HQ Feeding Manager – Jamie Bonner (518-569-5038)</p>
      </div>

      {/* Resources Table */}
      <div className="border border-black">
        <div className="bg-gray-200 p-2 border-b border-black">
          <h3 className="font-bold">DRO – Feeding Resources</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/5">Resource ID</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Leader Name & Contact Information</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/6">Total # of Persons</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Reporting Location</th>
              <th className="p-2 text-left bg-gray-100">Reporting Time</th>
            </tr>
          </thead>
          <tbody>
            {ervAssignments.map((erv, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 align-top" rowSpan={2}>
                    <div className="font-semibold">{erv.resourceId}</div>
                  </td>
                  <td className="border-r border-black p-2">
                    {erv.crew.map((member, midx) => (
                      <div key={midx} className="text-sm">
                        • {member.name}
                      </div>
                    ))}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {erv.personnel}
                  </td>
                  <td className="border-r border-black p-2">
                    <div className="text-xs whitespace-pre-wrap">{erv.reportingLocation}</div>
                  </td>
                  <td className="p-2 text-center">
                    {erv.reportingTime}
                  </td>
                </tr>
                <tr className="border-b border-black bg-gray-50">
                  <td colSpan={4} className="p-2">
                    <div className="font-semibold">Work Assignment</div>
                    <div className="text-sm">{erv.workAssignment}</div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 22 of 53
        </div>
      </div>
    </div>
  );
}

export function IAPWorkAssignmentsFeeding() {
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  
  useEffect(() => {
    // Load feeding facilities from database
    const allFacilities = simpleStore.getFacilities();
    const feedingSites = allFacilities
      .filter(f => f.type === 'Feeding' || f.type === 'Kitchen' || f.type === 'ERV')
      .map(f => {
        const workAssignment = simpleStore.getWorkAssignment(f.id);
        return {
          id: f.id,
          name: f.name,
          type: f.type,
          county: f.county || 'Unknown',
          address: f.address,
          mealsPerDay: workAssignment?.mealsPerDay || 500,
          staffRequired: workAssignment?.staffRequired || 4,
          staffAssigned: workAssignment?.staffAssigned || 0,
        };
      });
    
    setFacilities(feedingSites);
  }, []);

  // If no facilities from database, show example data
  const displayFacilities = facilities.length > 0 ? facilities : [
    {
      id: '1',
      name: 'ERV Unit 247',
      type: 'Mobile',
      county: 'Hillsborough',
      address: '',
      mealsPerDay: 500,
      staffRequired: 4,
      staffAssigned: 3
    },
    {
      id: '2',
      name: 'Community Center Kitchen',
      type: 'Fixed',
      county: 'Pinellas',
      address: '',
      mealsPerDay: 750,
      staffRequired: 6,
      staffAssigned: 6
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Work Assignments - Feeding</h2>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border border-black p-2 text-left">Site/Unit</th>
            <th className="border border-black p-2 text-center">Type</th>
            <th className="border border-black p-2 text-center">County</th>
            <th className="border border-black p-2 text-center">Meals/Day</th>
            <th className="border border-black p-2 text-center">Staff Req</th>
            <th className="border border-black p-2 text-center">Staff Have</th>
            <th className="border border-black p-2 text-center">Gap</th>
          </tr>
        </thead>
        <tbody>
          {displayFacilities.map((facility, idx) => {
            const gap = (facility.staffRequired || 0) - (facility.staffAssigned || 0);
            return (
              <tr key={facility.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="border border-black p-2">{facility.name}</td>
                <td className="border border-black p-2 text-center">{facility.type}</td>
                <td className="border border-black p-2 text-center">{facility.county}</td>
                <td className="border border-black p-2 text-center">{facility.mealsPerDay || 0}</td>
                <td className="border border-black p-2 text-center">{facility.staffRequired || 0}</td>
                <td className="border border-black p-2 text-center">{facility.staffAssigned || 0}</td>
                <td className={`border border-black p-2 text-center font-bold ${gap > 0 ? 'text-red-600' : ''}`}>
                  {gap}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Page indicator matching real IAP */}
      <div className="text-right mt-4 text-sm text-gray-600">
        8 pages
      </div>
    </div>
  );
}