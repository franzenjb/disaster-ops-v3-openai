'use client';

import React from 'react';

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

// DRO Sheltering Resources data matching exact IAP format
const shelteringResources: ResourceAssignment[] = [
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
];

export function IAPWorkAssignmentsShelteringResources() {
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
          {shelteringResources.map((resource, idx) => (
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
  // Exact format from the real IAP document
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
          <tr>
            <td className="border border-black p-2">Central High School Shelter</td>
            <td className="border border-black p-2 text-center">Hillsborough</td>
            <td className="border border-black p-2 text-center">250</td>
            <td className="border border-black p-2 text-center">187</td>
            <td className="border border-black p-2 text-center">12</td>
            <td className="border border-black p-2 text-center">10</td>
            <td className="border border-black p-2 text-center font-bold text-red-600">2</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-black p-2">First Baptist Church</td>
            <td className="border border-black p-2 text-center">Pinellas</td>
            <td className="border border-black p-2 text-center">150</td>
            <td className="border border-black p-2 text-center">92</td>
            <td className="border border-black p-2 text-center">8</td>
            <td className="border border-black p-2 text-center">8</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function IAPWorkAssignmentsFeeding() {
  // Exact format from the real IAP document
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
          <tr>
            <td className="border border-black p-2">ERV Unit 247</td>
            <td className="border border-black p-2 text-center">Mobile</td>
            <td className="border border-black p-2 text-center">Hillsborough</td>
            <td className="border border-black p-2 text-center">500</td>
            <td className="border border-black p-2 text-center">4</td>
            <td className="border border-black p-2 text-center">3</td>
            <td className="border border-black p-2 text-center font-bold text-red-600">1</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="border border-black p-2">Community Center Kitchen</td>
            <td className="border border-black p-2 text-center">Fixed</td>
            <td className="border border-black p-2 text-center">Pinellas</td>
            <td className="border border-black p-2 text-center">750</td>
            <td className="border border-black p-2 text-center">6</td>
            <td className="border border-black p-2 text-center">6</td>
            <td className="border border-black p-2 text-center font-bold">0</td>
          </tr>
        </tbody>
      </table>
      
      {/* Page indicator matching real IAP */}
      <div className="text-right mt-4 text-sm text-gray-600">
        8 pages
      </div>
    </div>
  );
}