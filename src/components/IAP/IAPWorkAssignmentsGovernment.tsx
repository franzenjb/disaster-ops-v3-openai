'use client';

import React from 'react';

interface EOCAssignment {
  location: string;
  type: string;
  leader: string;
  phone: string;
  additionalStaff?: { name: string; phone: string }[];
  personnel: string;
  address: string;
  assignment: string;
}

export function IAPWorkAssignmentsGovernment() {
  const assignments: EOCAssignment[] = [
    {
      location: 'Sarasota EOC',
      type: '(Virtual)',
      leader: 'Michael Bunch',
      phone: '(615)417-3790',
      personnel: '',
      address: '6050 Porter Way, Sarasota, FL',
      assignment: 'Staff EOC'
    },
    {
      location: 'Hillsborough EOC',
      type: '(In-Person)',
      leader: 'Jose Bueno',
      phone: '(813-295-4249)',
      personnel: 'GO/SA – 1',
      address: '9450 E Columbus Drive, Tampa, FL 33619',
      assignment: 'Staff EOC'
    },
    {
      location: 'FL State EOC',
      type: '(In-Person)',
      leader: 'Ryan Lock',
      phone: '(850-354-2342)',
      additionalStaff: [
        { name: 'Candi Collyer', phone: '(209-968-1884)' }
      ],
      personnel: 'GO/SA – 1',
      address: '2555 Shumard Oak Blvd, Tallahassee, FL, 32399',
      assignment: 'Staff EOC'
    },
    {
      location: 'Citrus EOC',
      type: '(In-Person)',
      leader: 'Randall Yeoman',
      phone: '(931-625-4261)',
      personnel: 'GO/SA – 1',
      address: '3549 Saunders Way, Lecanto, FL 34461',
      assignment: 'Staff EOC'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gray-600 text-white p-2">
        <h2 className="text-lg font-bold">DRO – Government Operations</h2>
      </div>
      
      {/* Leadership */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="font-bold mb-2">External Relations Leadership</h3>
        <p>AD External Relations – Sandi Hughes (615-663-6884)</p>
      </div>

      {/* Resources Table */}
      <div className="border border-black">
        <div className="bg-gray-200 p-2 border-b border-black">
          <h3 className="font-bold">DRO – Government Operations Resources</h3>
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
            {assignments.map((assignment, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 align-top" rowSpan={2}>
                    <div className="font-semibold">{assignment.location}</div>
                    <div className="text-sm">{assignment.type}</div>
                  </td>
                  <td className="border-r border-black p-2">
                    <div>• {assignment.leader}</div>
                    <div className="text-sm">{assignment.phone}</div>
                    {assignment.additionalStaff?.map((staff, sidx) => (
                      <div key={sidx} className="mt-1">
                        <div>• {staff.name}</div>
                        <div className="text-sm">{staff.phone}</div>
                      </div>
                    ))}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {assignment.personnel}
                  </td>
                  <td className="border-r border-black p-2">
                    <div className="text-sm">{assignment.address}</div>
                  </td>
                  <td className="p-2 text-center">
                    {/* Reporting time if needed */}
                  </td>
                </tr>
                <tr className="border-b border-black bg-gray-50">
                  <td colSpan={4} className="p-2">
                    <div className="font-semibold">Work Assignment</div>
                    <div>{assignment.assignment}</div>
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