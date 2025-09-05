'use client';

import React from 'react';

interface IAPPageTemplateProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
  incidentName?: string;
  drNumber?: string;
  operationalPeriod?: string;
  preparedBy?: string;
  preparedByTitle?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function IAPPageTemplate({ 
  children,
  pageNumber,
  totalPages = 53,
  incidentName = "FLOCOM",
  drNumber = "220-25",
  operationalPeriod = "18:00 20/10/2024 to 17:59 21/10/2024",
  preparedBy = "Gary Pelletier",
  preparedByTitle = "Information & Planning",
  hideHeader = false,
  hideFooter = false
}: IAPPageTemplateProps) {
  return (
    <div className="bg-white w-full" style={{ minHeight: '11in', pageBreakAfter: 'always' }}>
      {/* Consistent Header for all pages except cover */}
      {!hideHeader && pageNumber > 1 && (
        <table className="w-full border-2 border-black">
          <tr>
            <td className="border-r-2 border-black p-1 text-xs w-1/3">
              <div className="font-bold">Incident Name:</div>
              <div>{incidentName}</div>
            </td>
            <td className="border-r-2 border-black p-1 text-xs w-1/3">
              <div className="font-bold">DR Number:</div>
              <div>{drNumber}</div>
            </td>
            <td className="p-1 text-xs w-1/3">
              <div className="font-bold">Operational Period:</div>
              <div>{operationalPeriod}</div>
            </td>
          </tr>
        </table>
      )}

      {/* Page Content */}
      <div className="px-8 py-4" style={{ minHeight: 'calc(11in - 3in)' }}>
        {children}
      </div>

      {/* Consistent Footer for all pages */}
      {!hideFooter && (
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-black px-8 py-2">
          <table className="w-full text-xs">
            <tr>
              <td className="w-1/3">
                <div className="font-bold">Prepared By:</div>
                <div className="ml-4">{preparedBy}</div>
                <div className="ml-4">{preparedByTitle}</div>
              </td>
              <td className="w-1/3 text-center">
                <div className="text-xs text-gray-600">OPS Incident Action Plan Template V.6.0 2023-02-28</div>
              </td>
              <td className="w-1/3 text-right">
                <div className="font-bold">Page {pageNumber} of {totalPages}</div>
              </td>
            </tr>
          </table>
        </div>
      )}
    </div>
  );
}