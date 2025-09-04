'use client';

import { useEffect, useState } from 'react';
import { SetupWizard } from '@/components/SetupWizard/SetupWizard';
import { OperationDashboard } from '@/components/OperationDashboard';
import { eventBus } from '@/lib/sync/EventBus';
import { EventType } from '@/lib/events/types';
import { getLocalStore } from '@/lib/store/LocalStore';
import type { Operation } from '@/types';

export default function Home() {
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbManager, setDbManager] = useState<any>(null);

  useEffect(() => {
    // Initialize local store
    const store = getLocalStore();
    setDbManager(store);

    // Check for active operation
    loadActiveOperation(store);

    // Listen for operation events
    const operationCreated = eventBus.on(EventType.OPERATION_CREATED, async (event) => {
      // Create operation from event
      const operation = {
        id: event.operationId,
        operationNumber: event.payload.operationNumber,
        operationName: event.payload.operationName,
        disasterType: event.payload.disasterType,
        drNumber: event.payload.drNumber,
        status: 'active',
        activationLevel: event.payload.activationLevel,
        createdAt: new Date(event.timestamp),
        createdBy: event.actorId,
        geography: { regions: [], states: [], counties: [], chapters: [] },
        metadata: { serviceLinesActivated: [] },
      };
      
      // Save to local store
      await store.saveOperation(operation);
      setCurrentOperation(operation);
    });

    const operationClosed = eventBus.on(EventType.OPERATION_CLOSED, () => {
      setCurrentOperation(null);
    });

    return () => {
      operationCreated();
      operationClosed();
    };
  }, []);

  const loadActiveOperation = async (db: any) => {
    try {
      const operations = await db.getActiveOperations();
      
      if (operations && operations.length > 0) {
        setCurrentOperation(operations[0]);
      }
    } catch (error) {
      console.error('Failed to load active operation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-cross-red border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading Disaster Operations Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="text-red-cross-red">Red Cross</span>
                <span className="text-gray-900 ml-2">Disaster Operations</span>
              </h1>
              {currentOperation && (
                <div className="ml-6 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  {currentOperation.operationNumber} - {currentOperation.operationName}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Network Status */}
              <NetworkStatus />
              
              {/* Sync Status */}
              <SyncStatus dbManager={dbManager} />
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentOperation ? (
          <SetupWizard onComplete={(operation) => setCurrentOperation(operation)} />
        ) : (
          <OperationDashboard operation={currentOperation} />
        )}
      </main>
    </div>
  );
}

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`} />
      <span className="text-sm text-gray-600">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

function SyncStatus({ dbManager }: { dbManager: any }) {
  const [syncStatus, setSyncStatus] = useState<any>({
    isSyncing: false,
    pendingChanges: 0,
  });

  useEffect(() => {
    if (!dbManager) return;

    const updateStatus = async () => {
      // For now, just show as synced since we don't have remote yet
      setSyncStatus({
        isSyncing: false,
        pendingChanges: 0,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    const syncStarted = eventBus.on(EventType.SYNC_STARTED, updateStatus);
    const syncCompleted = eventBus.on(EventType.SYNC_COMPLETED, updateStatus);
    const syncFailed = eventBus.on(EventType.SYNC_FAILED, updateStatus);

    return () => {
      clearInterval(interval);
      syncStarted();
      syncCompleted();
      syncFailed();
    };
  }, [dbManager]);

  if (!syncStatus) return null;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        syncStatus.isSyncing ? 'bg-yellow-500 animate-pulse' :
        syncStatus.pendingChanges > 0 ? 'bg-orange-500' :
        'bg-green-500'
      }`} />
      <span className="text-sm text-gray-600">
        {syncStatus.isSyncing ? 'Syncing...' :
         syncStatus.pendingChanges > 0 ? `${syncStatus.pendingChanges} pending` :
         'Synced'}
      </span>
    </div>
  );
}

function UserMenu() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkForUserName = () => {
      const name = localStorage.getItem('disaster_ops_user_name') || 'Guest User';
      setUserName(name);
    };

    // Check initially
    checkForUserName();

    // Listen for storage changes (when user fills in their name)
    window.addEventListener('storage', checkForUserName);
    
    // Also check periodically in case storage event doesn't fire
    const interval = setInterval(checkForUserName, 2000);

    return () => {
      window.removeEventListener('storage', checkForUserName);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{userName}</span>
      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </div>
  );
}