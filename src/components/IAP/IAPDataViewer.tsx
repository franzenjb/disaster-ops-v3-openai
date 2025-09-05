/**
 * IAP Data Viewer
 * Shows the actual IAP data structure in a readable format
 */

'use client';

import React, { useState } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface IAPDataViewerProps {
  onNavigate?: (view: string) => void;
}

export function IAPDataViewer({ onNavigate }: IAPDataViewerProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="text-red-600 hover:text-red-800 flex items-center mb-4"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">IAP Data Structure</h1>
          <p className="text-gray-600 mt-2">
            Viewing actual data from {V27_IAP_DATA.operation.drNumber} - Operational Period #{V27_IAP_DATA.operation.operationalPeriod.number}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-medium text-gray-900 mb-3">IAP Sections</h2>
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: '📋' },
                  { id: 'message', label: "Director's Message", icon: '💬' },
                  { id: 'priorities', label: 'Priorities', icon: '🎯' },
                  { id: 'sheltering', label: 'Sheltering', icon: '🏠' },
                  { id: 'feeding', label: 'Feeding', icon: '🍽️' },
                  { id: 'contacts', label: 'Contact Roster', icon: '📞' },
                  { id: 'sites', label: 'Work Sites', icon: '📍' },
                  { id: 'schedule', label: 'Daily Schedule', icon: '📅' },
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 ${
                      activeSection === section.id 
                        ? 'bg-red-50 text-red-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {activeSection === 'overview' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Operation Overview</h2>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">DR Number</dt>
                      <dd className="mt-1 text-lg font-semibold">{V27_IAP_DATA.operation.drNumber}</dd>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Operation Name</dt>
                      <dd className="mt-1 text-lg font-semibold">{V27_IAP_DATA.operation.name}</dd>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Events</dt>
                      <dd className="mt-1 text-lg font-semibold">{V27_IAP_DATA.operation.events}</dd>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500">Operational Period</dt>
                      <dd className="mt-1 text-lg font-semibold">#{V27_IAP_DATA.operation.operationalPeriod.number}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Prepared By</p>
                      <p className="font-medium">{V27_IAP_DATA.operation.preparedBy}</p>
                      <p className="text-sm text-gray-600">{V27_IAP_DATA.operation.preparedByTitle}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Approved By</p>
                      <p className="font-medium">{V27_IAP_DATA.operation.approvedBy}</p>
                      <p className="text-sm text-gray-600">{V27_IAP_DATA.operation.approvedByTitle}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'message' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Director's Message</h2>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                      {V27_IAP_DATA.directorsMessage}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'priorities' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Incident Priorities</h2>
                  <ol className="space-y-2">
                    {V27_IAP_DATA.priorities.map((priority, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center justify-center mr-3">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{priority}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {activeSection === 'sheltering' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Sheltering Facilities</h2>
                  <div className="space-y-4">
                    {V27_IAP_DATA.shelteringFacilities.map((facility) => (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{facility.name}</h3>
                            <p className="text-sm text-gray-600">{facility.type} • {facility.county}</p>
                            <p className="text-sm text-gray-500">{facility.address}</p>
                          </div>
                          {facility.capacity && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Occupancy</p>
                              <p className="text-lg font-medium">
                                {facility.capacity.current}/{facility.capacity.maximum}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded p-3">
                          <div>
                            <p className="text-xs text-gray-500">Personnel</p>
                            <p className="font-medium">
                              {facility.personnel.have}/{facility.personnel.required}
                              {facility.personnel.gap > 0 && (
                                <span className="text-red-600 text-sm ml-1">(-{facility.personnel.gap})</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Positions</p>
                            <p className="font-medium">{facility.positions.length} types</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Assets</p>
                            <p className="font-medium">{facility.assets.length} types</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'feeding' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Feeding Operations</h2>
                  <div className="space-y-4">
                    {V27_IAP_DATA.feedingFacilities.map((facility) => (
                      <div key={facility.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{facility.name}</h3>
                            <p className="text-sm text-gray-600">{facility.type} • {facility.county}</p>
                            {facility.route && (
                              <p className="text-sm text-gray-500">Route: {facility.route}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Meals/Day</p>
                            <p className="text-lg font-medium">{facility.mealsPerDay.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded p-3">
                          <div>
                            <p className="text-xs text-gray-500">Personnel</p>
                            <p className="font-medium">
                              {facility.personnel.have}/{facility.personnel.required}
                              {facility.personnel.gap > 0 && (
                                <span className="text-red-600 text-sm ml-1">(-{facility.personnel.gap})</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Positions</p>
                            <p className="font-medium">{facility.positions.length} types</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Assets</p>
                            <p className="font-medium">{facility.assets.length} types</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'contacts' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Contact Roster</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">24-Hour Emergency Lines</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                        {V27_IAP_DATA.contacts.emergencyLines.map((line, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-sm font-medium">{line.name}</span>
                            <span className="text-sm font-mono">{line.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Command</h3>
                      <div className="space-y-2">
                        {V27_IAP_DATA.contacts.command.map((contact, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{contact.name}</p>
                              <p className="text-xs text-gray-600">{contact.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono">{contact.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'sites' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Work Sites</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Facility</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">POC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {V27_IAP_DATA.workSites.map((site, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-sm">{site.facility}</td>
                            <td className="px-3 py-2 text-sm">{site.type}</td>
                            <td className="px-3 py-2 text-sm">{site.county}</td>
                            <td className="px-3 py-2 text-sm">{site.poc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'schedule' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Daily Schedule</h2>
                  <div className="space-y-2">
                    {V27_IAP_DATA.dailySchedule.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded">
                        <span className="text-sm font-mono font-medium text-red-600 w-20">{item.time}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.event}</p>
                          <p className="text-xs text-gray-600">{item.location} • {item.audience}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}