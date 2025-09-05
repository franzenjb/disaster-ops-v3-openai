'use client';

import React, { useState } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';
import { simpleStore } from '@/lib/simple-store';
import { IAPCoverPage } from './IAPCoverPage';
import { IAPPage2 } from './IAPPage2';

interface RealIAPViewerProps {
  onNavigate?: (view: string) => void;
}

export function RealIAPViewer({ onNavigate }: RealIAPViewerProps = {}) {
  const [currentPage, setCurrentPage] = useState('cover');
  const facilities = simpleStore.getFacilities();
  
  // Pages matching actual Red Cross IAP structure
  const pages = [
    { id: 'cover', label: 'Cover Page (with checklist)', pageNum: 1 },
    { id: 'page2', label: 'Cover Page (clean)', pageNum: 2 },
    { id: 'message', label: "Director's Message", pageNum: 3 },
    { id: 'priorities', label: 'Priorities & Objectives', pageNum: 4 },
    { id: 'org-chart', label: 'Organization Chart', pageNum: 5 },
    { id: 'work-sites', label: 'Work Sites Table', pageNum: 6 },
    { id: 'sheltering', label: 'Sheltering Assignments', pageNum: 8 },
    { id: 'feeding', label: 'Feeding Assignments', pageNum: 15 },
    { id: 'contacts', label: 'Contact Roster', pageNum: 34 },
    { id: 'schedule', label: 'Daily Schedule', pageNum: 45 }
  ];

  const renderCoverPage = () => (
    <IAPCoverPage
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
    />
  );

  const renderWorkSitesTable = () => (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">Work Sites Table</h2>
      <p className="text-sm text-gray-600 mb-4">Page 4 of 53</p>
      
      {/* Combine V27 data with user-created facilities */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border p-2 text-left">Facility</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">County</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">POC</th>
            <th className="border p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {/* V27 Real Data */}
          {V27_IAP_DATA.workSites.map((site, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-2 font-medium">{site.facility}</td>
              <td className="border p-2 text-center">{site.type}</td>
              <td className="border p-2">{site.county}</td>
              <td className="border p-2">{site.address}, {site.zip}</td>
              <td className="border p-2">{site.poc}</td>
              <td className="border p-2">{site.phone}</td>
            </tr>
          ))}
          
          {/* User Created Facilities */}
          {facilities.map((facility, idx) => (
            <tr key={`user-${idx}`} className="bg-yellow-50">
              <td className="border p-2 font-medium">{facility.name}</td>
              <td className="border p-2 text-center">{facility.type}</td>
              <td className="border p-2">{facility.county}</td>
              <td className="border p-2">{facility.address}</td>
              <td className="border p-2">TBD</td>
              <td className="border p-2">TBD</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {facilities.length > 0 && (
        <p className="mt-4 text-sm text-green-600">
          ✓ Showing {facilities.length} user-created facilities (highlighted in yellow)
        </p>
      )}
    </div>
  );

  const renderShelteringAssignments = () => (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">Sheltering Work Assignments</h2>
      <p className="text-sm text-gray-600 mb-4">Pages 6-14 of 53</p>
      
      {/* Combine V27 shelters with user facilities */}
      {[...V27_IAP_DATA.shelteringFacilities, 
        ...facilities.filter(f => f.type === 'Shelter')].map((shelter, idx) => (
        <div key={idx} className="border-2 border-gray-300 rounded mb-6 p-4">
          <div className="bg-red-600 text-white p-2 -m-4 mb-4">
            <h3 className="font-bold text-lg">{shelter.name}</h3>
            <p>{shelter.address} • {shelter.county} County</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Personnel Requirements</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 text-left">Position</th>
                    <th className="p-1">Req</th>
                    <th className="p-1">Have</th>
                    <th className="p-1">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {(('positions' in shelter ? shelter.positions : shelter.personnel?.positions) || []).map((pos: any, pidx: number) => (
                    <tr key={pidx}>
                      <td className="p-1">{pos.title}</td>
                      <td className="p-1 text-center">{pos.required}</td>
                      <td className="p-1 text-center">{pos.have}</td>
                      <td className={`p-1 text-center font-bold ${pos.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {pos.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Resource Requirements</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 text-left">Asset</th>
                    <th className="p-1">Req</th>
                    <th className="p-1">Have</th>
                    <th className="p-1">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {(('assets' in shelter ? shelter.assets : shelter.resources?.assets) || []).map((asset: any, aidx: number) => (
                    <tr key={aidx}>
                      <td className="p-1">{asset.type}</td>
                      <td className="p-1 text-center">{asset.required}</td>
                      <td className="p-1 text-center">{asset.have}</td>
                      <td className={`p-1 text-center font-bold ${asset.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {asset.gap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {'capacity' in shelter && (
            <div className="border-t pt-2">
              <p className="text-sm">
                <span className="font-semibold">Capacity:</span> {shelter.capacity.current}/{shelter.capacity.maximum} 
                <span className="ml-4 font-semibold">Status:</span> 
                <span className={shelter.capacity.current >= shelter.capacity.maximum ? 'text-red-600' : 'text-green-600'}>
                  {' '}{Math.round((shelter.capacity.current / shelter.capacity.maximum) * 100)}% Full
                </span>
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderContactRoster = () => (
    <div className="bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">Contact Roster</h2>
      <p className="text-sm text-gray-600 mb-4">Pages 34-38 of 53</p>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-red-600 mb-3">COMMAND STAFF</h3>
          <table className="w-full text-sm">
            <tbody>
              {V27_IAP_DATA.contacts.command.map((contact, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-xs text-gray-600">{contact.title}</div>
                  </td>
                  <td className="p-2 text-right">
                    <div>{contact.phone}</div>
                    <div className="text-xs text-blue-600">{contact.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div>
          <h3 className="font-bold text-red-600 mb-3">24 HOUR EMERGENCY LINES</h3>
          <table className="w-full text-sm">
            <tbody>
              {V27_IAP_DATA.contacts.emergencyLines.map((line, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">
                    <div className="font-semibold">{line.name}</div>
                    {line.contact && <div className="text-xs text-gray-600">{line.contact}</div>}
                  </td>
                  <td className="p-2 text-right">
                    <div className="font-bold text-red-600">{line.phone}</div>
                    {line.note && <div className="text-xs text-red-500">{line.note}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDirectorsMessage = () => (
    <div className="bg-white p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Director's Message</h2>
      <p className="text-sm text-gray-600 mb-4">Page 2 of 53</p>
      
      <div className="border rounded p-4 min-h-[400px]">
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
          <p className="mb-4">
            Remember to prioritize your safety and well-being. Take your required breaks, 
            stay hydrated, and reach out if you need support.
          </p>
          <p className="mb-4">Thank you for all you do.</p>
          <p>
            {V27_IAP_DATA.operation.approvedBy}<br/>
            {V27_IAP_DATA.operation.approvedByTitle}
          </p>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-500 italic">
        Click in the message area above to edit
      </p>
    </div>
  );

  const renderPage2 = () => (
    <IAPPage2
      drNumber={V27_IAP_DATA.operation.drNumber}
      operationName={V27_IAP_DATA.operation.name}
      events={V27_IAP_DATA.operation.events}
      operationalPeriod={V27_IAP_DATA.operation.operationalPeriod}
      preparedBy={{
        name: "Alyson Gordon",
        title: "Information & Planning Manager"
      }}
      approvedBy={{
        name: "Betsy Witthohn",
        title: "Job Director"
      }}
    />
  );

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'cover': return renderCoverPage();
      case 'page2': return renderPage2();
      case 'message': return renderDirectorsMessage();
      case 'work-sites': return renderWorkSitesTable();
      case 'sheltering': return renderShelteringAssignments();
      case 'contacts': return renderContactRoster();
      default: 
        return (
          <div className="bg-white p-6">
            <h2 className="text-2xl font-bold mb-4">Page Under Construction</h2>
            <p>This section of the IAP is being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="text-white hover:text-gray-200 flex items-center mb-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              IAP Viewer - {V27_IAP_DATA.operation.drNumber} Operational Period #{V27_IAP_DATA.operation.operationalPeriod.number}
            </h1>
            <button className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100">
              Export PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 overflow-x-auto">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  currentPage === page.id 
                    ? 'border-red-600 text-red-600 bg-red-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {page.label}
                <span className="ml-2 text-xs text-gray-500">p.{page.pageNum}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderCurrentPage()}
      </div>
    </div>
  );
}