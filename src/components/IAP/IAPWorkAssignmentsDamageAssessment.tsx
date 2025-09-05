'use client';

import React from 'react';

interface DamageAssessmentTeam {
  teamId: string;
  leader: string;
  phone: string;
  personnel: {
    supervisors: number;
    assessors: number;
    ebvLcv?: number;
  };
  county: string;
  assignment: string;
}

export function IAPWorkAssignmentsDamageAssessment() {
  const teams: DamageAssessmentTeam[] = [
    {
      teamId: 'Team 1',
      leader: 'Steve Cotter',
      phone: '305-731-9239',
      personnel: {
        supervisors: 1,
        assessors: 2
      },
      county: 'Columbia County',
      assignment: 'Conducting Detailed Damage Assessment Observe utilizing DA workforce in Taylor county.'
    },
    {
      teamId: 'Team 2',
      leader: 'Terry Hyde',
      phone: '830-743-7841',
      personnel: {
        supervisors: 1,
        assessors: 3,
        ebvLcv: 10
      },
      county: 'Sarasota County',
      assignment: 'Conducting Detailed Damage Assessment Observe utilizing DA workforce in Taylor county.'
    },
    {
      teamId: 'Team 3',
      leader: 'Bob Farr',
      phone: '231-388-0089',
      personnel: {
        supervisors: 1,
        assessors: 3
      },
      county: 'St. Lucie County',
      assignment: ''
    },
    {
      teamId: 'Team 4',
      leader: 'Jerry Salesburg',
      phone: '407-399-1572',
      personnel: {
        supervisors: 1,
        assessors: 1
      },
      county: 'Palm Beach',
      assignment: 'Conduct Detailed Damage Assessment Observe utilizing DA Workforce, LCV, and EBV workforce in Citrus, Pasco and Hernando counties.'
    },
    {
      teamId: 'Team 5',
      leader: 'Lee Seaman',
      phone: '720-237-3856',
      personnel: {
        supervisors: 1,
        assessors: 3,
        ebvLcv: 10
      },
      county: 'Pinellas County',
      assignment: ''
    },
    {
      teamId: 'Team 6',
      leader: 'Gary Dolser',
      phone: '720-771-3121',
      personnel: {
        supervisors: 1,
        assessors: 2,
        ebvLcv: 10
      },
      county: 'Hillsborough County',
      assignment: ''
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gray-600 text-white p-2">
        <h2 className="text-lg font-bold">DRO – Damage Assessment</h2>
      </div>
      
      {/* Leadership */}
      <div className="bg-gray-50 p-3 border border-gray-300">
        <h3 className="font-bold mb-2">Operations Leadership</h3>
        <p>AD Operations – Jennifer Carkner (509-859-2374)</p>
        <p>HQ Mass Care Chief – Brenda Bridges (760-987-5452)</p>
        <p>Lead DA – Lee Seaman (720-237-3856)</p>
      </div>

      {/* Resources Table */}
      <div className="border border-black">
        <div className="bg-gray-200 p-2 border-b border-black">
          <h3 className="font-bold">DRO – Damage Assessment Resources</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/5">Resource ID</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-2/5">Leader Name & Contact Information</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/5">Total # of Persons</th>
              <th className="border-r border-black p-2 text-left bg-gray-100 w-1/4">Reporting Location</th>
              <th className="p-2 text-left bg-gray-100">Reporting Time</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <React.Fragment key={idx}>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 align-top" rowSpan={2}>
                    <div className="font-semibold">{team.teamId}</div>
                  </td>
                  <td className="border-r border-black p-2">
                    <div>• {team.leader} {team.phone}</div>
                  </td>
                  <td className="border-r border-black p-2">
                    <div className="text-sm">DA/SV – {team.personnel.supervisors}</div>
                    <div className="text-sm">DA/SA – {team.personnel.assessors}</div>
                    {team.personnel.ebvLcv && (
                      <div className="text-sm">EBV/LCV – {team.personnel.ebvLcv}</div>
                    )}
                  </td>
                  <td className="border-r border-black p-2">
                    {team.county}
                  </td>
                  <td className="p-2">
                    {/* Reporting time if needed */}
                  </td>
                </tr>
                <tr className="border-b border-black bg-gray-50">
                  <td colSpan={4} className="p-2">
                    <div className="font-semibold">Work Assignment</div>
                    <div>{team.assignment || 'Conducting Detailed Damage Assessment'}</div>
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