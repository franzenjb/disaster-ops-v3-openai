/**
 * IAP Layout Component
 * Provides persistent header and footer for all IAP pages
 * Matches exact Red Cross IAP template format
 */

import React from 'react';
import { useOperationStore } from '../../stores/useOperationStore';

interface IAPLayoutProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
}

export function IAPLayout({ children, pageNumber, totalPages = 9 }: IAPLayoutProps) {
  const operation = useOperationStore(state => state.currentOperation);
  
  if (!operation) return null;
  
  const iap = operation.iap;
  
  const formatOperationalPeriod = () => {
    if (iap?.meta?.operationalPeriod) {
      const start = new Date(iap.meta.operationalPeriod.start);
      const end = new Date(iap.meta.operationalPeriod.end);
      
      const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      };
      
      return `${formatDate(start)} to ${formatDate(end)}`;
    }
    return '0600 17/11/2024 to 0559 18/11/2024';
  };
  
  return (
    <div className="max-w-full mx-auto bg-white shadow-lg">
      {/* Persistent Header */}
      <div className="bg-white border-b-2 border-black p-4">
        <table className="w-full border-2 border-black">
          <tbody>
            <tr>
              <td className="border-r-2 border-black p-2">
                <div className="text-xs font-bold">Incident Name:</div>
                <div className="text-sm">{operation.operationName || 'FLOCOM'}</div>
              </td>
              <td className="border-r-2 border-black p-2">
                <div className="text-xs font-bold">DR Number:</div>
                <div className="text-sm">{operation.id || '220-25'}</div>
              </td>
              <td className="p-2">
                <div className="text-xs font-bold">Operational Period:</div>
                <div className="text-xs">{formatOperationalPeriod()}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Main Content */}
      <div className="p-8 min-h-[9in]">
        {children}
      </div>
      
      {/* Persistent Footer */}
      <div className="bg-white border-t-2 border-gray-400 p-4">
        <div className="flex justify-between items-end">
          <div className="text-sm">
            <div>Prepared By: {iap?.meta?.preparedBy?.name || 'Richard Goldfarb'}</div>
            <div className="text-xs text-gray-600">Information & Planning</div>
          </div>
          <div className="text-xs text-center">
            Account String: 052-37000-2x-4220-xxxxx-0010
          </div>
          <div className="text-sm text-right">
            Page {pageNumber} of {totalPages}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          OPS Incident Action Plan Template V.6.0 2023-02-28
        </div>
      </div>
    </div>
  );
}