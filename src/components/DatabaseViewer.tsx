/**
 * Database Viewer - Direct access to all databases and tables
 * 
 * Replaces metrics display with actual database content inspection
 * Shows IndexedDB, Supabase, and direct data sources
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDirectData } from '@/hooks/useDirectData';

// Database types
type DatabaseType = 'permanent' | 'indexeddb' | 'supabase';
type TableName = 
  // Permanent data
  | 'personnel' | 'assets' | 'gaps' | 'facilities' 
  // IndexedDB tables
  | 'events' | 'outbox' | 'inbox' | 'operations' | 'roster' | 'geography' | 'iap' | 'metrics' | 'snapshots' | 'cache'
  // Supabase tables  
  | 'supabase_operations' | 'supabase_facilities' | 'personnel_assignments' | 'iap_documents' | 'work_assignments' | 'user_profiles' | 'user_presence' | 'user_roles';

interface DatabaseTable {
  name: TableName;
  displayName: string;
  description: string;
  type: DatabaseType;
  icon: string;
}

// Database schema definition
const DATABASE_TABLES: DatabaseTable[] = [
  // Permanent Data Sources (Direct JS objects)
  { name: 'personnel', displayName: 'Personnel Database', description: '500+ Red Cross responders with roles and certifications', type: 'permanent', icon: '👥' },
  { name: 'assets', displayName: 'Assets Database', description: 'Vehicles, equipment, and supplies inventory', type: 'permanent', icon: '🚛' },
  { name: 'gaps', displayName: 'GAP Templates', description: '900+ Red Cross GAP codes for resource needs', type: 'permanent', icon: '📋' },
  { name: 'facilities', displayName: 'Facilities Database', description: 'Operational facilities and locations', type: 'permanent', icon: '🏢' },
  
  // IndexedDB Tables (Local browser storage)
  { name: 'events', displayName: 'Event Log', description: 'Append-only event sourcing log', type: 'indexeddb', icon: '📜' },
  { name: 'outbox', displayName: 'Outbox Queue', description: 'Events pending sync to remote', type: 'indexeddb', icon: '📤' },
  { name: 'inbox', displayName: 'Inbox Queue', description: 'Remote events to be processed', type: 'indexeddb', icon: '📥' },
  { name: 'operations', displayName: 'Operations Cache', description: 'Local operation projections', type: 'indexeddb', icon: '🎯' },
  { name: 'roster', displayName: 'Roster Cache', description: 'Personnel assignment projections', type: 'indexeddb', icon: '👫' },
  { name: 'geography', displayName: 'Geography Cache', description: 'Regional and county mappings', type: 'indexeddb', icon: '🗺️' },
  { name: 'iap', displayName: 'IAP Cache', description: 'Incident Action Plan documents', type: 'indexeddb', icon: '📋' },
  { name: 'metrics', displayName: 'Metrics Cache', description: 'Performance and usage metrics', type: 'indexeddb', icon: '📊' },
  { name: 'snapshots', displayName: 'State Snapshots', description: 'Point-in-time state captures', type: 'indexeddb', icon: '📸' },
  { name: 'cache', displayName: 'General Cache', description: 'Temporary data with TTL', type: 'indexeddb', icon: '⚡' },
  
  // Supabase Tables (Remote PostgreSQL)
  { name: 'supabase_operations', displayName: 'Operations (Supabase)', description: 'Remote operations master table', type: 'supabase', icon: '🌐' },
  { name: 'supabase_facilities', displayName: 'Facilities (Supabase)', description: 'Remote facilities with coordinates', type: 'supabase', icon: '🏭' },
  { name: 'personnel_assignments', displayName: 'Personnel Assignments', description: 'Staff assignments to facilities', type: 'supabase', icon: '👤' },
  { name: 'iap_documents', displayName: 'IAP Documents', description: 'Published IAP versions', type: 'supabase', icon: '📄' },
  { name: 'work_assignments', displayName: 'Work Assignments', description: 'Tasks and work orders', type: 'supabase', icon: '✅' },
  { name: 'user_profiles', displayName: 'User Profiles', description: 'Extended user information', type: 'supabase', icon: '👨‍💼' },
  { name: 'user_presence', displayName: 'User Presence', description: 'Real-time online status', type: 'supabase', icon: '🔴' },
  { name: 'user_roles', displayName: 'User Roles', description: 'Role-based access control', type: 'supabase', icon: '🔐' }
];

export function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState<TableName>('personnel');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const directData = useDirectData();

  // Load data for selected table
  useEffect(() => {
    loadTableData(selectedTable);
  }, [selectedTable, directData.loaded]);

  const loadTableData = async (tableName: TableName) => {
    setLoading(true);
    setError(null);
    
    try {
      let data: any[] = [];
      
      // Handle permanent data sources
      if (tableName === 'personnel') {
        data = directData.personnel || [];
      } else if (tableName === 'assets') {
        data = directData.assets || [];
      } else if (tableName === 'gaps') {
        data = directData.gaps || [];
      } else if (tableName === 'facilities') {
        data = directData.facilities || [];
      }
      // Handle IndexedDB tables
      else if (DATABASE_TABLES.find(t => t.name === tableName)?.type === 'indexeddb') {
        data = await loadIndexedDBTable(tableName);
      }
      // Handle Supabase tables
      else if (DATABASE_TABLES.find(t => t.name === tableName)?.type === 'supabase') {
        data = await loadSupabaseTable(tableName);
      }
      
      setTableData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadIndexedDBTable = async (tableName: TableName): Promise<any[]> => {
    // Try to access IndexedDB directly
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('disaster_ops_v3', 1);
        
        request.onerror = () => reject(new Error('Failed to open IndexedDB'));
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(tableName)) {
            resolve([]);
            return;
          }
          
          const transaction = db.transaction([tableName], 'readonly');
          const store = transaction.objectStore(tableName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result || []);
          };
          
          getAllRequest.onerror = () => {
            reject(new Error(`Failed to read ${tableName} table`));
          };
        };
      });
    } catch (err) {
      console.warn(`IndexedDB access failed for ${tableName}:`, err);
      return [];
    }
  };

  const loadSupabaseTable = async (tableName: TableName): Promise<any[]> => {
    // Mock Supabase data for now - in real implementation this would use supabase client
    const mockData: Record<string, any[]> = {
      supabase_operations: [
        { id: '1', name: 'Demo Operation', status: 'active', created_at: new Date().toISOString() }
      ],
      supabase_facilities: [
        { id: '1', name: 'Demo Shelter', type: 'shelter', status: 'operational', capacity: 100 }
      ],
      personnel_assignments: [],
      iap_documents: [],
      work_assignments: [],
      user_profiles: [
        { id: '1', email: 'demo@redcross.org', full_name: 'Demo User', role: 'ip_group' }
      ],
      user_presence: [
        { user_id: '1', status: 'online', last_seen: new Date().toISOString() }
      ],
      user_roles: [
        { id: '1', user_id: '1', operation_id: '1', role: 'ip_group' }
      ]
    };
    
    return mockData[tableName] || [];
  };

  const getTypeColor = (type: DatabaseType) => {
    switch (type) {
      case 'permanent': return 'bg-green-100 text-green-800';
      case 'indexeddb': return 'bg-blue-100 text-blue-800';
      case 'supabase': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: DatabaseType) => {
    switch (type) {
      case 'permanent': return '💾';
      case 'indexeddb': return '🗂️';
      case 'supabase': return '☁️';
      default: return '📊';
    }
  };

  const currentTable = DATABASE_TABLES.find(t => t.name === selectedTable);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Database Inspector</h2>
          <p className="text-sm text-gray-600 mt-1">Direct access to all data sources</p>
        </div>
        
        {/* Database Groups */}
        <div className="p-4">
          {/* Permanent Data Sources */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">💾</span>
              <h3 className="font-semibold text-gray-900">Permanent Data</h3>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Direct JS
              </span>
            </div>
            {DATABASE_TABLES.filter(t => t.type === 'permanent').map(table => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedTable === table.name
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{table.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{table.displayName}</div>
                    <div className="text-xs text-gray-500">{table.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* IndexedDB Tables */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">🗂️</span>
              <h3 className="font-semibold text-gray-900">IndexedDB Tables</h3>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Local
              </span>
            </div>
            {DATABASE_TABLES.filter(t => t.type === 'indexeddb').map(table => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedTable === table.name
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{table.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{table.displayName}</div>
                    <div className="text-xs text-gray-500">{table.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Supabase Tables */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">☁️</span>
              <h3 className="font-semibold text-gray-900">Supabase Tables</h3>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Remote
              </span>
            </div>
            {DATABASE_TABLES.filter(t => t.type === 'supabase').map(table => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedTable === table.name
                    ? 'bg-purple-50 border-2 border-purple-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{table.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{table.displayName}</div>
                    <div className="text-xs text-gray-500">{table.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-3xl mr-4">{currentTable?.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentTable?.displayName}</h1>
                <p className="text-gray-600">{currentTable?.description}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(currentTable?.type || 'permanent')}`}>
              {getTypeIcon(currentTable?.type || 'permanent')} {currentTable?.type.toUpperCase()}
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{tableData.length}</span>
              <span className="ml-1">records</span>
            </div>
            {loading && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {currentTable?.displayName}...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-3">⚠️</span>
                <div>
                  <h3 className="font-medium text-red-800">Error loading data</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-600">This table is currently empty or not accessible.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableData.length > 0 && Object.keys(tableData[0]).slice(0, 6).map(key => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.slice(0, 50).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.entries(row).slice(0, 6).map(([key, value], cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof value === 'object' && value !== null ? (
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {JSON.stringify(value).length > 50 
                                  ? JSON.stringify(value).substring(0, 50) + '...'
                                  : JSON.stringify(value)
                                }
                              </code>
                            ) : (
                              String(value || '').length > 100 
                                ? String(value).substring(0, 100) + '...'
                                : String(value || '')
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {tableData.length > 50 && (
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
                    Showing first 50 of {tableData.length} records
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}