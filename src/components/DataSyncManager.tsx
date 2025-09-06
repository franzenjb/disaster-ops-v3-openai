'use client';

import React, { useState, useEffect } from 'react';
import { runDataMigration, needsMigration } from '@/lib/data-migration/iap-to-database';

interface DataSyncManagerProps {
  className?: string;
}

export function DataSyncManager({ className = '' }: DataSyncManagerProps) {
  const [migrationNeeded, setMigrationNeeded] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkMigrationStatus();
    
    // Check for last sync timestamp
    const lastSyncTime = localStorage.getItem('last_data_sync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime).toLocaleString());
    }
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const needed = await needsMigration();
      setMigrationNeeded(needed);
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationNeeded(true);
    }
  };

  const runSync = async () => {
    setIsRunning(true);
    setError(null);
    setProgress('Starting data synchronization...');
    
    try {
      // Monitor progress through console logs
      const originalLog = console.log;
      console.log = (message: string, ...args: any[]) => {
        if (typeof message === 'string' && (message.includes('🔄') || message.includes('✅') || message.includes('📋') || message.includes('👥') || message.includes('🏢') || message.includes('⚠️') || message.includes('📅'))) {
          setProgress(message);
        }
        originalLog(message, ...args);
      };
      
      await runDataMigration();
      
      // Restore original console.log
      console.log = originalLog;
      
      setProgress('✅ Data synchronization completed successfully!');
      setMigrationNeeded(false);
      setLastSync(new Date().toLocaleString());
      localStorage.setItem('last_data_sync', new Date().toISOString());
      
    } catch (error) {
      console.error('Migration failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setProgress('❌ Data synchronization failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getSyncStatusColor = () => {
    if (isRunning) return 'text-blue-600';
    if (error) return 'text-red-600';
    if (migrationNeeded) return 'text-orange-600';
    return 'text-green-600';
  };

  const getSyncStatusIcon = () => {
    if (isRunning) return '🔄';
    if (error) return '❌';
    if (migrationNeeded) return '⚠️';
    return '✅';
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">
          Data Synchronization
        </h3>
        <div className={`flex items-center space-x-2 ${getSyncStatusColor()}`}>
          <span className="text-lg">{getSyncStatusIcon()}</span>
          <span className="font-medium">
            {isRunning ? 'Syncing...' : migrationNeeded ? 'Sync Needed' : 'Up to Date'}
          </span>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          <strong>Purpose:</strong> Synchronizes IAP display data with database tables for bidirectional editing
        </div>
        
        {lastSync && (
          <div className="text-sm text-gray-600">
            <strong>Last Sync:</strong> {lastSync}
          </div>
        )}
        
        {migrationNeeded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="text-sm text-yellow-800">
              <strong>⚠️ Sync Required:</strong> Database tables need to be populated with IAP data including:
              <ul className="mt-2 ml-4 list-disc">
                <li>Personnel from Contact Roster (Betsy Witthohn, Ryan Lock, etc.)</li>
                <li>Facilities from Work Assignments (Central High School, etc.)</li>
                <li>Gaps from Personnel/Asset shortages</li>
                <li>Daily Schedule activities</li>
              </ul>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
      </div>

      {/* Progress Display */}
      {(isRunning || progress) && (
        <div className="mb-4">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-sm font-medium text-gray-900 mb-2">Progress:</div>
            <div className="text-sm text-gray-700">{progress}</div>
            {isRunning && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={runSync}
          disabled={isRunning}
          className={`
            px-4 py-2 rounded font-medium transition-colors
            ${isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : migrationNeeded
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isRunning ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Synchronizing...
            </span>
          ) : (
            migrationNeeded ? '🔄 Run Data Sync' : '🔄 Re-sync Data'
          )}
        </button>
        
        <button
          onClick={checkMigrationStatus}
          disabled={isRunning}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          🔍 Check Status
        </button>
      </div>

      {/* Information Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
        <div className="text-xs text-blue-800">
          <strong>💡 About Data Sync:</strong> This ensures that names, facilities, and data you see in the IAP sections 
          are also available in the Tables & Data Hub for editing. Changes in either location will sync bidirectionally.
        </div>
      </div>
    </div>
  );
}

export default DataSyncManager;