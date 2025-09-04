/**
 * Operation Dashboard
 * 
 * This is the main operational view once an operation is started.
 * Notice how everything is reactive - no manual updates needed!
 */

import React, { useState } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { UnifiedIAP } from './iap/UnifiedIAP';
import { EventLog } from './EventLog';
import { AreaSetupSimple } from './AreaSetupSimple';

type TabType = 'area' | 'iap' | 'events';

export function OperationDashboard() {
  const operation = useOperationStore(state => state.currentOperation);
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const [activeTab, setActiveTab] = useState<TabType>('iap');
  
  if (!operation) return null;
  
  return (
    <>
      {/* Tab Navigation - Fixed at top below main header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'area', label: 'Area Setup', icon: '🗺️' },
            { id: 'iap', label: 'Live IAP', icon: '📋' },
            { id: 'events', label: 'Event Log', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-red-cross-red text-red-cross-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          </nav>
        </div>
      </div>

      {/* Main Content Container - with padding for fixed nav */}
      <div className="pt-16 space-y-6">
        {/* Operation Header */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {operation.operationName}
              </h1>
              <p className="text-gray-600">{operation.id}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(operation.metadata.created).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-red-cross-red">
                {selectedCounties.length}
              </div>
              <div className="text-sm text-gray-600">Counties Affected</div>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[600px]">
        {activeTab === 'area' && <AreaSetupSimple />}
        
        {activeTab === 'iap' && (
          <UnifiedIAP operationId={operation.id} />
        )}
        
        {activeTab === 'events' && <EventLog />}
        </div>
      </div>
      
      {/* Real-time Indicator */}
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">
            All changes auto-saved
          </span>
        </div>
      </div>
    </>
  );
}