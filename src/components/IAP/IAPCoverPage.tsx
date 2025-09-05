'use client';

import React, { useState } from 'react';

interface IAPCoverPageProps {
  drNumber: string;
  operationName: string;
  operationalPeriod: {
    number: number;
    start: string;
    end: string;
  };
  preparedBy: {
    name: string;
    title: string;
  };
  approvedBy: {
    name: string;
    title: string;
  };
}

export function IAPCoverPage({ 
  drNumber = "220-25",
  operationName = "FLOCOM", 
  operationalPeriod = {
    number: 27,
    start: "20/10/2024 18:00",
    end: "21/10/2024 17:59"
  },
  preparedBy = {
    name: "Gary Pelletier",
    title: "Information & Planning"
  },
  approvedBy = {
    name: "Virginia Mewborn", 
    title: "DRO Director"
  }
}: IAPCoverPageProps) {
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
    <div className="bg-white p-8 max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Header Table */}
      <table className="w-full border-2 border-black mb-4">
        <tr>
          <td className="border-2 border-black p-2">
            <div className="text-sm">Incident Name:</div>
            <div className="font-bold">{operationName}</div>
          </td>
          <td className="border-2 border-black p-2">
            <div className="text-sm">DR Number</div>
            <div className="font-bold">{drNumber}</div>
          </td>
          <td className="border-2 border-black p-2">
            <div className="text-sm">Operational Period</div>
            <div className="font-bold">{operationalPeriod.start} to {operationalPeriod.end}</div>
          </td>
        </tr>
      </table>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Incident Action Plan [#{operationalPeriod.number}]</h1>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">DR {drNumber}</div>
          <div className="text-2xl font-bold">{operationName}</div>
        </div>
        <div className="text-lg">{operationalPeriod.start} to {operationalPeriod.end}</div>
      </div>

      {/* Photo Placeholder */}
      <div className="border-2 border-gray-300 h-96 mb-6 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 mb-2">Insert Operation Photo Here</div>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Upload Photo
          </button>
        </div>
      </div>

      {/* Document Checklist */}
      <div className="mb-6">
        <table className="w-full">
          <tr>
            <td className="w-1/2 pr-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <td className="p-2 font-bold" colSpan={2}>Documents Included:</td>
                    <td className="p-2 font-bold text-center">Y/N</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Director's Intent/Message</td>
                    <td className="p-1 text-center">{checklist.directorsIntent ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Priorities and Objectives</td>
                    <td className="p-1 text-center">{checklist.incidentPriorities ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Status of Previous Operating Period's Objectives</td>
                    <td className="p-1 text-center">{checklist.statusOfPrevious ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Contact Roster DRO HQ</td>
                    <td className="p-1 text-center">{checklist.contactRoster ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Open Action Tracker</td>
                    <td className="p-1 text-center">{checklist.incidentOpenAction ? 'Y' : 'N'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="w-1/2 pl-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <td className="p-2 font-bold" colSpan={2}>Documents Included:</td>
                    <td className="p-2 font-bold text-center">Y/N</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Organization Chart</td>
                    <td className="p-1 text-center">{checklist.incidentOrgChart ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Work Assignment</td>
                    <td className="p-1 text-center">{checklist.workAssignment ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Work Sites</td>
                    <td className="p-1 text-center">{checklist.workSites ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Daily Schedule</td>
                    <td className="p-1 text-center">{checklist.dailySchedule ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">General Message</td>
                    <td className="p-1 text-center">{checklist.generalMessage ? 'Y' : 'N'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </div>

      {/* Prepared/Approved By */}
      <table className="w-full border-2 border-black">
        <tr className="bg-gray-200">
          <td className="border-r-2 border-black p-2 w-1/2">
            <div className="font-bold">Prepared By:</div>
            <div>{preparedBy.name}</div>
            <div className="text-sm">{preparedBy.title}</div>
          </td>
          <td className="p-2 w-1/2">
            <div className="font-bold">Approved By:</div>
            <div>{approvedBy.name}</div>
            <div className="text-sm">{approvedBy.title}</div>
          </td>
        </tr>
      </table>

      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-2">
        <table className="w-full text-xs">
          <tr>
            <td>
              <div>Prepared By:</div>
              <div className="ml-4">{preparedBy.name}</div>
              <div className="ml-4">{preparedBy.title}</div>
            </td>
            <td className="text-right">
              <div>Page 1 of 53</div>
            </td>
          </tr>
        </table>
        <div className="text-xs mt-2">OPS Incident Action Plan Template V.6.0 2023-02-28</div>
      </div>
    </div>
  );
}