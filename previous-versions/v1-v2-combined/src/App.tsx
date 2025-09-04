/**
 * Main Application Component
 * 
 * This demonstrates the power of the event-driven architecture.
 * Notice how clean this is compared to the old system!
 */

import React, { useState, useEffect } from 'react';
import { useOperationStore } from './stores/useOperationStore';
import { StartOperation } from './components/StartOperation';
import { OperationDashboard } from './components/OperationDashboard';
import { SystemStats } from './components/SystemStats';
import { ICS215Demo } from './components/ics215/ICS215Demo';
import { OrgChartGenerator } from './components/org-chart/OrgChartGenerator';
import { eventBus, EventType } from './core/EventBus';
// import { useSupabaseSync } from './hooks/useSupabaseSync'; // Disabled until Supabase is configured

export function App() {
  const currentOperation = useOperationStore(state => state.currentOperation);
  const [currentView, setCurrentView] = useState<'dashboard' | 'ics215' | 'orgchart'>('dashboard');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );
  
  // Initialize Supabase sync (disabled for now)
  const isConfigured = false;
  const isSyncing = false;
  const pendingUpdates = 0;
  
  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    eventBus.on(EventType.ONLINE_MODE, handleOnline);
    eventBus.on(EventType.OFFLINE_MODE, handleOffline);
    
    return () => {
      // Cleanup would go here
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Always visible */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-red-cross-red">Red Cross</span> Disaster Operations
              </h1>
              {currentOperation && (
                <span className="ml-4 text-sm text-gray-600">
                  {currentOperation.id} - {currentOperation.operationName}
                </span>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-red-cross-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('ics215')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'ics215'
                    ? 'bg-red-cross-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ICS Form 215
              </button>
              <button
                onClick={() => setCurrentView('orgchart')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'orgchart'
                    ? 'bg-red-cross-red text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Org Chart
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Database Sync Status */}
              {isConfigured && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isSyncing ? 'bg-yellow-500 animate-pulse' : 
                    pendingUpdates > 0 ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {isSyncing ? 'Syncing...' : 
                     pendingUpdates > 0 ? `${pendingUpdates} pending` : 'Synced'}
                  </span>
                </div>
              )}
              
              {/* Network Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  networkStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600">
                  {networkStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'ics215' ? (
          <ICS215Demo />
        ) : currentView === 'orgchart' ? (
          <OrgChartGenerator />
        ) : (
          !currentOperation ? (
            <>
              <SystemStats />
              <StartOperation />
            </>
          ) : (
            <OperationDashboard />
          )
        )}
      </main>
    </div>
  );
}