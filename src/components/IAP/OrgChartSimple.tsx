'use client';

import React, { useEffect, useState } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface OrgPosition {
  id: string;
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  category: string;
  reportsTo?: string;
}

export function OrgChartSimple() {
  const [roster, setRoster] = useState<OrgPosition[]>([]);
  
  useEffect(() => {
    const savedRoster = simpleStore.getContactRoster();
    if (savedRoster && savedRoster.length > 0) {
      // Filter to only positions with names
      const filledPositions = savedRoster.filter((p: OrgPosition) => p.name);
      setRoster(filledPositions);
    }
  }, []);
  
  const formatEmail = (email?: string) => {
    if (!email) return '';
    return email.replace('@redcross.org', '');
  };
  
  // Group positions by who they report to
  const getDirectReports = (positionId: string | null) => {
    if (positionId === null) {
      // Get top-level positions (those that don't report to anyone)
      return roster.filter(p => !p.reportsTo || !roster.find(r => r.id === p.reportsTo));
    }
    return roster.filter(p => p.reportsTo === positionId);
  };
  
  const renderPosition = (position: OrgPosition, level: number = 0) => {
    const directReports = getDirectReports(position.id);
    const bgColor = position.category === 'Command' ? 'bg-red-50 border-red-600' :
                    position.category === 'Operations' ? 'bg-blue-50 border-blue-600' :
                    position.category === 'Logistics Section' ? 'bg-green-50 border-green-600' :
                    'bg-gray-50 border-gray-600';
    
    return (
      <div key={position.id} className={`${level > 0 ? 'ml-8' : ''} mb-4`}>
        <div className={`border-2 ${bgColor} rounded-lg p-3 shadow-md inline-block`}>
          <div className="font-bold text-sm">{position.title}</div>
          {position.name && (
            <>
              <div className="text-sm font-semibold mt-1">{position.name}</div>
              {position.phone && (
                <a 
                  href={`tel:${position.phone}`} 
                  className="text-xs text-blue-600 hover:underline block"
                >
                  📞 {position.phone}
                </a>
              )}
              {position.email && (
                <a 
                  href={`mailto:${position.email}`} 
                  className="text-xs text-blue-600 hover:underline block"
                >
                  ✉️ {formatEmail(position.email)}
                </a>
              )}
            </>
          )}
        </div>
        
        {/* Render direct reports */}
        {directReports.length > 0 && (
          <div className="ml-4 mt-2 border-l-2 border-gray-400 pl-4">
            {directReports.map(report => renderPosition(report, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // Get top-level positions
  const topLevelPositions = getDirectReports(null);
  
  if (roster.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg">No organizational data available.</p>
        <p className="text-sm mt-2">Please fill out the Contact Roster first with names and "Reports To" relationships.</p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded text-left max-w-2xl mx-auto">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Go to the Contact Roster section</li>
            <li>Add names to positions (click on name field)</li>
            <li>Set "Reports To" relationships using the dropdown</li>
            <li>The org chart will automatically generate from this data</li>
          </ol>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {/* Header matching IAP format */}
      <div className="border-b-2 border-black pb-2 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <span className="font-bold">Incident Name:</span> FLOCOM
            </div>
            <div>
              <span className="font-bold">DR Number:</span> 220-25
            </div>
          </div>
          <div>
            <span className="font-bold">Operational Period:</span> 18:00 20/10/2024 to 17:59 21/10/2024
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-4">Incident Organization Chart</h2>
      
      <div className="bg-yellow-50 border border-yellow-300 p-3 mb-4 text-sm">
        <strong>Note:</strong> This chart is automatically generated from the Contact Roster. 
        Use the "Reports To" field in Contact Roster to define reporting relationships. 
        Click phone numbers to call, email addresses to send emails.
      </div>
      
      {/* Display the org chart */}
      <div className="p-4 bg-white border-2 border-gray-300 rounded overflow-x-auto">
        {topLevelPositions.length > 0 ? (
          topLevelPositions.map(position => renderPosition(position))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No top-level positions found.</p>
            <p className="text-sm">Make sure to set reporting relationships in the Contact Roster.</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border-2 border-red-600 rounded"></div>
          <span className="text-sm">Command</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
          <span className="text-sm">Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border-2 border-green-600 rounded"></div>
          <span className="text-sm">Logistics</span>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Organization Summary:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Total Positions Filled:</span> {roster.length}
          </div>
          <div>
            <span className="font-semibold">Command:</span> {roster.filter(r => r.category === 'Command').length}
          </div>
          <div>
            <span className="font-semibold">Operations:</span> {roster.filter(r => r.category === 'Operations').length}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 8 of 53
        </div>
      </div>
    </div>
  );
}