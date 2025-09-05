'use client';

import React from 'react';

interface DistributionResource {
  resourceId: string;
  vehicleType: string;
  location?: string;
  leaders: { name: string; phone?: string; role?: string }[];
  personnel: string;
  reportingLocation: string;
  reportingTime: string;
  assignment: string;
}

export function IAPWorkAssignmentsDistribution() {
  const resources: DistributionResource[] = [
    {
      resourceId: 'ZONE 3 - MRV 31293',
      vehicleType: 'MRV',
      location: '(Hillsborough)',
      leaders: [
        { name: 'Kellie Coward', role: 'EBV' },
        { name: 'Cynthia Woiderski', phone: '(989-430-3526)' },
        { name: 'Julio Medina' }
      ],
      personnel: 'DES/SA – 2',
      reportingLocation: '15340 Citrus County Drive, Dade City, FL 33523',
      reportingTime: '08:00',
      assignment: 'Standby Team - serving community of Winterhaven'
    },
    {
      resourceId: 'ZONE 3 - MRV 31299',
      vehicleType: 'MRV',
      location: '(Lee County)',
      leaders: [
        { name: 'Joseph Scott Brown', phone: '(440-281-6082)' },
        { name: 'Chris Schepers', phone: '(270-993-6830)' }
      ],
      personnel: 'DES/SA – 2',
      reportingLocation: '15340 Citrus County Drive, Dade City, FL 33523',
      reportingTime: '08:00',
      assignment: 'Standby Team - serving community of Bradenton'
    },
    {
      resourceId: 'ZONE 3 - MRV 31453',
      vehicleType: 'MRV',
      location: '(Lee)',
      leaders: [
        { name: 'Anthony Lessa', phone: '(508-689-8018)' },
        { name: 'Stanley Pierre Louis', phone: '(857-222-1096)' }
      ],
      personnel: 'DES/SA – 2',
      reportingLocation: '15340 Citrus County Drive, Dade City, FL 33523',
      reportingTime: '08:00',
      assignment: 'Standby Team - serving community of St Petersburg'
    },
    {
      resourceId: 'ZONE 3 - BOX TRUCK 517872 - 16\'',
      vehicleType: 'BOX TRUCK',
      location: '(Lee)',
      leaders: [],
      personnel: '',
      reportingLocation: '15340 Citrus County Drive, Dade City, FL 33523',
      reportingTime: '08:00',
      assignment: 'Standby Team'
    },
    {
      resourceId: 'ZONE 3 - BOX 810290 - 16\'',
      vehicleType: 'BOX',
      location: '(Polk)',
      leaders: [],
      personnel: '',
      reportingLocation: '15340 Citrus County Drive, Dade City, FL 33523',
      reportingTime: '08:00',
      assignment: ''
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gray-600 text-white p-2">
        <h2 className="text-lg font-bold">DRO – Distribution of Emergency Supplies</h2>
      </div>
      
      {/* Leadership */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="font-bold mb-2">Operations Leadership</h3>
        <p>AD Operations – Jennifer Carkner (509-859-2374)</p>
        <p>HQ Mass Care Chief – Brenda Bridges (760-987-5452)</p>
        <p>HQ Distribution Manager – Cynthia Woiderski (989-430-3526)</p>
      </div>

      {/* Resources Table */}
      <div className="border border-black">
        <div className="bg-gray-200 p-2 border-b border-black">
          <h3 className="font-bold">DRO – Distribution of Emergency Supplies Resources</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Resource ID</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Leader Name & Contact Information</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/6">Total # of Persons</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Reporting Location</th>
              <th className="p-2 text-left bg-gray-100">Reporting Time</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 align-top" rowSpan={2}>
                    <div className="font-semibold text-sm">{resource.resourceId}</div>
                    {resource.location && (
                      <div className="text-xs">{resource.location}</div>
                    )}
                  </td>
                  <td className="border-r border-black p-2">
                    {resource.leaders.map((leader, lidx) => (
                      <div key={lidx} className="text-sm">
                        • {leader.name} {leader.role || ''}
                        {leader.phone && <div className="ml-2 text-xs">{leader.phone}</div>}
                      </div>
                    ))}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {resource.personnel}
                  </td>
                  <td className="border-r border-black p-2">
                    <div className="text-xs">{resource.reportingLocation}</div>
                  </td>
                  <td className="p-2 text-center">
                    {resource.reportingTime}
                  </td>
                </tr>
                <tr className="border-b border-black bg-gray-50">
                  <td colSpan={4} className="p-2">
                    <div className="font-semibold">Work Assignment</div>
                    <div>{resource.assignment || 'Standby Team'}</div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}