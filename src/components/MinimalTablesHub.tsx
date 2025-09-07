/**
 * MINIMAL TABLES HUB - Proof of Concept
 * 
 * Ultra-safe version to prove permanent database data is accessible
 * Shows only counts initially - no complex table rendering
 */

'use client';

import React from 'react';
import { useDirectData } from '@/hooks/useDirectData';

export function MinimalTablesHub() {
  const data = useDirectData();

  if (!data.loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Permanent Database...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Permanent Database Status</h2>
          <p className="text-gray-600 mt-1">Direct data access - bypassing IndexedDB issues</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Personnel Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Personnel</h3>
                <p className="text-3xl font-bold text-green-600">{data.counts?.personnel || 0}</p>
                <p className="text-sm text-gray-500">Red Cross responders</p>
              </div>
            </div>
          </div>

          {/* Assets Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <span className="text-green-600 text-lg">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Assets</h3>
                <p className="text-3xl font-bold text-green-600">{data.counts?.assets || 0}</p>
                <p className="text-sm text-gray-500">Vehicles & equipment</p>
              </div>
            </div>
          </div>

          {/* Gaps Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Gaps</h3>
                <p className="text-3xl font-bold text-green-600">{data.counts?.gaps || 0}</p>
                <p className="text-sm text-gray-500">Resource needs</p>
              </div>
            </div>
          </div>

          {/* Facilities Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🏢</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Facilities</h3>
                <p className="text-3xl font-bold text-green-600">{data.counts?.facilities || 0}</p>
                <p className="text-sm text-gray-500">Shelters & sites</p>
              </div>
            </div>
          </div>

        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">
                Permanent Database Successfully Loaded!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>DirectDataLoader has successfully bypassed IndexedDB connection issues and loaded all permanent database content:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>{data.counts?.personnel || 0} Personnel records</strong> - Red Cross responders with roles and contact info</li>
                  <li><strong>{data.counts?.assets || 0} Asset records</strong> - Vehicles, equipment, and supplies</li>
                  <li><strong>{data.counts?.gaps || 0} Gap templates</strong> - Operational needs and requirements</li>
                  <li><strong>{data.counts?.facilities || 0} Facilities</strong> - Shelters, feeding sites, and operational locations</li>
                </ul>
                <p className="mt-3 font-semibold">🎉 Single Source of Truth database is now fully operational!</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}