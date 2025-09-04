/**
 * System Statistics Component
 * Shows the scale of the Red Cross operation
 */

import React from 'react';
import { getRegionStats } from '../data/regions';

export function SystemStats() {
  const stats = getRegionStats();
  
  return (
    <div className="bg-gradient-to-r from-red-cross-red to-red-700 text-white rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">National Red Cross Coverage</h2>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.regions}</div>
          <div className="text-sm opacity-90">Regions</div>
          <div className="text-xs opacity-75 mt-1">All 50 States + Territories</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.counties.toLocaleString()}</div>
          <div className="text-sm opacity-90">Counties</div>
          <div className="text-xs opacity-75 mt-1">Complete US Coverage</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.chapters}</div>
          <div className="text-sm opacity-90">Chapters</div>
          <div className="text-xs opacity-75 mt-1">Local Response Teams</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm opacity-90">
          This platform serves the entire American Red Cross disaster response network,
          enabling coordinated response across all regions for the next 20 years.
        </p>
      </div>
    </div>
  );
}