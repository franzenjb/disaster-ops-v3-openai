'use client';

import React from 'react';

interface CareResource {
  resourceId: string;
  category?: string;
  leader: string;
  phone: string;
  personnel: string[];
  location: string;
  assignment: string;
}

export function IAPWorkAssignmentsIndividualCare() {
  const resources: CareResource[] = [
    {
      resourceId: 'Staff Mental Health Support',
      leader: 'Meghan Cole',
      phone: '(262-388-9777)',
      personnel: ['DMH/SV – 1'],
      location: 'assigned lodging',
      assignment: 'Will handle responder illnesses and injuries\nProviding mental health support to responders'
    },
    {
      resourceId: 'Disaster Mental Health',
      leader: 'Susan Gatzert-Snyder',
      phone: '(610-731-1760)',
      personnel: ['DMH/SV – 1'],
      location: 'virtual',
      assignment: 'Assisting clients and staff with mental health needs'
    },
    {
      resourceId: 'DHS admin',
      leader: 'Diane St. Denis',
      phone: '(408-828-8352)',
      personnel: [],
      location: 'assigned lodging',
      assignment: 'Assisting DHS MN in Orlando location to prepare for post-impact DHS response'
    },
    {
      resourceId: 'Disaster Health Services',
      leader: 'Diane St. Denis',
      phone: '(408-828-8352)',
      personnel: ['DHS/SV – 1', 'DHS/SA – 1'],
      location: 'virtual',
      assignment: 'Providing disaster case work for client health services needs and Staff Health'
    },
    {
      resourceId: 'Itinerating DHS, DMH,and DSC',
      leader: 'Louise Olsheski',
      phone: '484-529-9147',
      personnel: [
        'DMH/SV – 2',
        'DMH/SA – 7',
        'DHS/SV – 1',
        'DHS/SA – 4',
        'DSC/SV – 1',
        'DSC/SA – 1'
      ],
      location: 'Shelters in zones 2-4, District A',
      assignment: 'Providing Mental Health care to support clients and staff in shelters. Providing Spiritual Care Services to clients and staff in shelters. Providing Spiritual Care and Mental Health services to staff and clients at mobile feeding sites.'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gray-600 text-white p-2">
        <h2 className="text-lg font-bold">DRO – Individual Disaster Care</h2>
      </div>
      
      {/* Leadership */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="font-bold mb-2">Operations Leadership</h3>
        <p>AD Operations – Jennifer Carkner (509-859-2374)</p>
        <p>HQ Mass Care Chief – Brenda Bridges (760-987-5452)</p>
        <p>Lead DHS – Diane St. Denis (408-828-8352)</p>
        <p>Lead DMH – Susan Gatzert-Snyder (610-731-1760)</p>
      </div>

      {/* Resources Table */}
      <div className="border border-black">
        <div className="bg-gray-200 p-2 border-b border-black">
          <h3 className="font-bold">DRO – Individual Disaster Care Resources</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/5">Resource ID</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Leader Name & Contact Information</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/5">Total # of Persons</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Reporting Location</th>
              <th className="p-2 text-left bg-gray-100">Reporting Time</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-gray-50">
                  <td className="border-r border-black p-2 align-top" rowSpan={2}>
                    <div className="font-semibold text-sm">{resource.resourceId}</div>
                  </td>
                  <td className="border-r border-black p-2" rowSpan={resource.assignment.includes('\n') ? 1 : 2}>
                    <div className="text-sm">• {resource.leader}</div>
                    <div className="text-xs ml-2">{resource.phone}</div>
                  </td>
                  <td className="border-r border-black p-2">
                    {resource.personnel.map((p, pidx) => (
                      <div key={pidx} className="text-sm">{p}</div>
                    ))}
                  </td>
                  <td className="border-r border-black p-2">
                    <div className="text-sm">{resource.location}</div>
                  </td>
                  <td className="p-2">
                    {/* Reporting time if needed */}
                  </td>
                </tr>
                <tr className="border-b border-black bg-gray-50">
                  <td colSpan={resource.assignment.includes('\n') ? 4 : 3} className="p-2">
                    <div className="font-semibold">Work Assignment</div>
                    <div className="whitespace-pre-wrap text-sm">{resource.assignment}</div>
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