/**
 * ICS IAP Cover Page Component
 * Matches exact Red Cross IAP template format
 */

import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { IAPLayout } from './IAPLayout';

interface IAPCoverPageProps {
  onNavigate?: (section: string) => void;
}

export function IAPCoverPage({ onNavigate }: IAPCoverPageProps) {
  const operation = useOperationStore(state => state.currentOperation);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  if (!operation) return null;
  
  const iap = operation.iap;
  
  // Document sections with their status
  const leftDocuments = [
    { name: "Director's Intent/Message", included: true, section: 'directors-message' },
    { name: "Incident Priorities and Objectives", included: true, section: 'priorities' },
    { name: "Status of Previous Operating Period's Objectives", included: true, section: 'previous-status' },
    { name: "Contact Roster DRO HQ", included: true, section: 'contact-roster' },
    { name: "Incident Open Action Tracker", included: true, section: 'action-tracker' }
  ];
  
  const rightDocuments = [
    { name: "Incident Organization Chart", included: true, section: 'org-chart' },
    { name: "Work Assignment", included: true, section: 'work-assignment' },
    { name: "Work Sites", included: true, section: 'work-sites' },
    { name: "Daily Schedule", included: true, section: 'daily-schedule' },
    { name: "General Messages", included: true, section: 'general-messages' }
  ];
  
  const handleDocumentClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };
  
  return (
    <IAPLayout pageNumber={1} totalPages={9}>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">Incident Action Plan #{iap?.meta?.iapNumber || '54'}</h1>
      
      {/* Operation Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl">
          <div className="font-bold">DR {operation.id || '220-25'}</div>
          <div className="text-sm">0600 17/11/2024 to 0559 18/11/2024</div>
        </div>
        <div className="text-xl font-bold text-right">
          {operation.operationName || 'FLOCOM'}
        </div>
      </div>
      
      {/* Photo Section */}
      <div className="mb-6">
        {imageUrl ? (
          <img src={imageUrl} alt="Operation" className="w-full h-[400px] object-cover rounded" />
        ) : (
          <div className="relative">
            <div className="w-full h-[400px] bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">
                  American Red Cross responders deliver clean up supplies after Hurricane Milton impacted Florida 10/31
                </p>
                <label className="cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Menu Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-red-600">Main Menu</h2>
        <table className="w-full border-2 border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Documents Included:</th>
              <th className="border border-black p-2 w-16">Y/N</th>
              <th className="border border-black p-2 text-left">Documents Included:</th>
              <th className="border border-black p-2 w-16">Y/N</th>
            </tr>
          </thead>
          <tbody>
            {leftDocuments.map((doc, index) => (
              <tr key={index}>
                <td className="border border-black p-2">
                  <button
                    onClick={() => handleDocumentClick(doc.section)}
                    className="text-left w-full hover:text-blue-600 hover:underline text-red-600"
                  >
                    {doc.name}
                  </button>
                </td>
                <td className="border border-black p-2 text-center font-bold">
                  {doc.included ? 'Y' : 'N'}
                </td>
                <td className="border border-black p-2">
                  <button
                    onClick={() => handleDocumentClick(rightDocuments[index].section)}
                    className="text-left w-full hover:text-blue-600 hover:underline text-red-600"
                  >
                    {rightDocuments[index].name}
                  </button>
                </td>
                <td className="border border-black p-2 text-center font-bold">
                  {rightDocuments[index].included ? 'Y' : 'N'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Approval Section */}
      <table className="w-full border-2 border-black mb-6">
        <tbody>
          <tr className="bg-gray-200">
            <td className="border-r border-black p-3 w-1/2">
              <div className="font-bold">Prepared By:</div>
              <div>{iap?.meta?.preparedBy?.name || 'Richard Goldfarb'}</div>
              <div className="text-sm">AD Information & Planning</div>
            </td>
            <td className="p-3">
              <div className="font-bold">Approved By:</div>
              <div>{iap?.meta?.approvedBy?.name || 'Virginia Mewborn'}</div>
              <div className="text-sm">Job Director</div>
            </td>
          </tr>
        </tbody>
      </table>
      
    </IAPLayout>
  );
}