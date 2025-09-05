/**
 * Test Page 11 - Work Assignments Table Format
 * 
 * Direct test of the exact IAP Page 11 layout
 */

'use client';

import React from 'react';
import { WorkAssignmentsTable } from '@/components/IAP/WorkAssignmentsTable';
import type { IAPFacility } from '@/types';

export default function TestPage11() {
  // Sample facility data to test the format
  const testFacilities: IAPFacility[] = [
    {
      id: 'shelter-001',
      operationId: 'test-op',
      facilityType: 'shelter',
      name: 'Forest Capital Park',
      address: '2196 Fleischmann Rd',
      city: 'Tallahassee',
      state: 'FL',
      zip: '32308',
      county: 'Leon',
      contact: {
        primaryName: 'John Smith',
        primaryPhone: '(850) 555-0123',
        backupName: 'Jane Doe',
        backupPhone: '(850) 555-0124'
      },
      capacity: {
        totalCapacity: 150,
        currentOccupancy: 0,
        availableSpace: 150
      },
      personnel: [
        {
          id: 'mgr-001',
          personId: 'person-001',
          position: 'Shelter Manager',
          section: 'operations',
          startTime: new Date(),
          contactInfo: { phone: '(850) 555-0125', email: 'mgr@redcross.org' },
          certifications: ['Shelter Operations'],
          isLeader: true
        }
      ],
      resources: [],
      status: 'operational',
      workAssignments: [],
      serviceLines: ['sheltering'],
      operationalPeriod: {
        start: new Date(),
        end: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'test-user'
    },
    {
      id: 'shelter-002',
      operationId: 'test-op',
      facilityType: 'shelter',
      name: 'Leon County Civic Center',
      address: '505 W Pensacola St',
      city: 'Tallahassee',
      state: 'FL',
      zip: '32301',
      county: 'Leon',
      contact: {
        primaryName: 'Sarah Johnson',
        primaryPhone: '(850) 555-0200',
        backupPhone: '(850) 555-0201'
      },
      capacity: {
        totalCapacity: 300,
        currentOccupancy: 0,
        availableSpace: 300
      },
      personnel: [],
      resources: [],
      status: 'operational',
      workAssignments: [],
      serviceLines: ['sheltering'],
      operationalPeriod: {
        start: new Date(),
        end: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'test-user'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test: IAP Page 11 - Work Assignments Format
          </h1>
          <p className="text-gray-600">
            This tests the exact layout specifications you provided for the Work Assignments table.
          </p>
        </div>

        <WorkAssignmentsTable
          facilities={testFacilities}
          incidentName="FLOCOM"
          drNumber="220-25"
          operationalPeriod="18:00 20/10/2024 to 17:59 21/10/2024"
          preparedBy="Gary Pelletier"
          preparedByTitle="Information & Planning"
          pageNumber={11}
          totalPages={53}
        />

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">
            Format Specifications Implemented:
          </h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>Column 1:</strong> Resource ID (20% width) - Shelter names with capacity</li>
            <li>• <strong>Column 2:</strong> Leader Name & Contact (30% width) - Day/Night shifts with phones</li>
            <li>• <strong>Column 3:</strong> Total # of Persons (15% width) - Staff codes (SH/SV-Mgr, SH/SA, etc.)</li>
            <li>• <strong>Column 4:</strong> Reporting Location & Time (35% width) - Address + times right-aligned</li>
            <li>• <strong>Layout:</strong> 8.5" width, Arial font, 1px black borders</li>
            <li>• <strong>Structure:</strong> Nested tables, merged cells for "Work Assignment" rows</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
