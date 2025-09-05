'use client';

import React from 'react';

interface IAPPage2Props {
  drNumber: string;
  operationName: string;
  events: string;
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

export function IAPPage2({ 
  drNumber = "220-25",
  operationName = "FLOCOM",
  events = "Hurricane Helene and Milton",
  operationalPeriod = {
    number: 27,
    start: "10/20/2024, 6:00:00 AM",
    end: "10/21/2024, 5:59:00 AM"
  },
  preparedBy = {
    name: "Alyson Gordon",
    title: "Information & Planning Manager"
  },
  approvedBy = {
    name: "Betsy Witthohn", 
    title: "Job Director"
  }
}: IAPPage2Props) {
  return (
    <div className="bg-white p-8 max-w-[8.5in] mx-auto" style={{ minHeight: '11in' }}>
      {/* Main Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">INCIDENT ACTION PLAN</h1>
        <h2 className="text-3xl text-red-600 font-semibold">American Red Cross</h2>
      </div>

      {/* Operation Information Box */}
      <div className="border-4 border-black p-8 mb-12">
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <div>
              <span className="font-bold text-lg">DR Number: </span>
              <span className="text-xl">DR {drNumber}</span>
            </div>
            <div>
              <span className="font-bold text-lg">Operation: </span>
              <span className="text-xl">{operationName}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-bold text-lg mb-2">Event(s):</div>
          <div className="text-xl">{events}</div>
        </div>

        <div className="border-t-2 border-black pt-6">
          <div className="font-bold text-lg mb-4">Operational Period #{operationalPeriod.number}</div>
          <div className="text-xl">
            {operationalPeriod.start} - {operationalPeriod.end}
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-16">
        <div>
          <div className="font-bold text-lg mb-2">Prepared By:</div>
          <div className="text-lg">{preparedBy.name}</div>
          <div className="text-sm text-gray-600">{preparedBy.title}</div>
        </div>
        <div>
          <div className="font-bold text-lg mb-2">Approved By:</div>
          <div className="text-lg">{approvedBy.name}</div>
          <div className="text-sm text-gray-600">{approvedBy.title}</div>
        </div>
      </div>

      {/* Page footer - positioned at bottom */}
      <div className="absolute bottom-8 right-8 text-sm text-gray-600">
        Page 2 of 53
      </div>
    </div>
  );
}