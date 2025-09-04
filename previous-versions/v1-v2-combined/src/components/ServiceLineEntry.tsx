/**
 * Service Line Entry Component
 * Complete Form 5266 Data Entry with Rich Accordions
 */

import React from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { FeedingServiceLine } from './servicelines/FeedingServiceLine';
import { ShelteringServiceLine } from './servicelines/ShelteringServiceLine';
import { MassCareServiceLine } from './servicelines/MassCareServiceLine';
import { HealthServicesLine } from './servicelines/HealthServicesLine';
import { RecoveryServiceLine } from './servicelines/RecoveryServiceLine';
import { LogisticsServiceLine } from './servicelines/LogisticsServiceLine';

export function ServiceLineEntry() {
  const operation = useOperationStore(state => state.currentOperation);
  
  if (!operation) {
    return <div>No active operation</div>;
  }
  
  // Calculate summary statistics
  const totalMeals = operation.serviceLines.feeding?.totalMealsToDate || 0;
  const sheltersOpen = operation.serviceLines.sheltering?.sheltersOpen || 0;
  const clientsSheltered = operation.serviceLines.sheltering?.totalClientsServed || 0;
  const totalStaff = (operation.serviceLines.logistics?.totalStaff || 0);
  const totalVolunteers = (operation.serviceLines.logistics?.totalVolunteers || 0);
  const healthContacts = (operation.serviceLines.health?.firstAidContacts || 0) +
                         (operation.serviceLines.health?.nursingContacts || 0) +
                         (operation.serviceLines.health?.mentalHealthContacts || 0);
  const activeCases = (operation.serviceLines.recovery?.casesOpened || 0) - 
                     (operation.serviceLines.recovery?.casesClosed || 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Form 5266 Service Line Data Entry
        </h2>
        <p className="text-gray-600">
          Enter daily operational data for all service lines. Data auto-saves as you type.
          All line items match the official Red Cross Form 5266.
        </p>
      </div>
      
      {/* Quick Stats Dashboard */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Operation Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold">{totalMeals.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Meals (Line 9)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{sheltersOpen}</div>
            <div className="text-sm opacity-90">Shelters Open (Line 38)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{clientsSheltered.toLocaleString()}</div>
            <div className="text-sm opacity-90">Clients Sheltered (Line 44)</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{(totalStaff + totalVolunteers).toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Personnel</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{healthContacts.toLocaleString()}</div>
            <div className="text-sm opacity-90">Health Contacts</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{activeCases}</div>
            <div className="text-sm opacity-90">Active Cases</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{operation.serviceLines.logistics?.ervCount || 0}</div>
            <div className="text-sm opacity-90">ERVs Deployed</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{operation.serviceLines.distribution?.distributionSites || 0}</div>
            <div className="text-sm opacity-90">Distribution Sites</div>
          </div>
        </div>
      </div>
      
      {/* Service Line Accordions */}
      <div className="space-y-4">
        <FeedingServiceLine />
        <ShelteringServiceLine />
        <MassCareServiceLine />
        <RecoveryServiceLine />
        <HealthServicesLine />
        <LogisticsServiceLine />
        
        {/* Government Liaison - Lines 26-30 - Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🏛️ Government Liaison (Lines 26-30)
          </h3>
          <p className="text-sm text-gray-500">EOC Status, FEMA Coordination - Coming soon...</p>
        </div>
      </div>
      
      {/* Export/Print Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            📄 Export to PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            📊 Export to Excel
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            🖨️ Print Report
          </button>
        </div>
      </div>
    </div>
  );
}