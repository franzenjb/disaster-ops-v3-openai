'use client';

import React, { useState, useEffect } from 'react';
import { MobileFacilityCard } from './MobileFacilityCard';
import { useAuth } from '../../lib/auth/AuthProvider';

/**
 * Mobile Dashboard Component - Phase 3 Implementation
 * 
 * Touch-optimized dashboard for field operations staff.
 * Provides quick access to critical facility information and actions.
 */

interface MobileDashboardProps {
  facilities: any[];
  onFacilityUpdate?: (facilityId: string, updates: any) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function MobileDashboard({
  facilities,
  onFacilityUpdate,
  onRefresh
}: MobileDashboardProps) {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'my_assignments' | 'needs_attention' | 'high_occupancy'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'occupancy' | 'updated' | 'distance'>('occupancy');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Filter and sort facilities
  const filteredFacilities = facilities
    .filter(facility => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!facility.name.toLowerCase().includes(search) &&
            !facility.address.toLowerCase().includes(search) &&
            !facility.county.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Status filters
      switch (filter) {
        case 'my_assignments':
          return facility.staff?.some((staff: any) => 
            staff.user_id === profile?.id || staff.email === profile?.email
          );
        case 'needs_attention':
          return facility.status === 'full' || 
                 !facility.has_manager || 
                 (facility.current_occupancy || 0) > (facility.capacity_beds || 0) * 0.9;
        case 'high_occupancy':
          return ((facility.current_occupancy || 0) / (facility.capacity_beds || 1)) > 0.75;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'occupancy':
          const aPercent = ((a.current_occupancy || 0) / (a.capacity_beds || 1)) * 100;
          const bPercent = ((b.current_occupancy || 0) / (b.capacity_beds || 1)) * 100;
          return bPercent - aPercent;
        case 'updated':
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        case 'distance':
          // TODO: Implement distance calculation when location services are available
          return 0;
        default:
          return 0;
      }
    });

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get summary stats
  const stats = {
    total: facilities.length,
    open: facilities.filter(f => f.status === 'open').length,
    full: facilities.filter(f => f.status === 'full').length,
    needsAttention: facilities.filter(f => 
      f.status === 'full' || !f.has_manager || 
      (f.current_occupancy || 0) > (f.capacity_beds || 0) * 0.9
    ).length,
    totalOccupancy: facilities.reduce((sum, f) => sum + (f.current_occupancy || 0), 0),
    totalCapacity: facilities.reduce((sum, f) => sum + (f.capacity_beds || 0), 0)
  };

  const occupancyRate = stats.totalCapacity > 0 
    ? Math.round((stats.totalOccupancy / stats.totalCapacity) * 100)
    : 0;

  // Handle pull-to-refresh on mobile
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      if (pullDistance > 80 && !isRefreshing) {
        handleRefresh();
        isPulling = false;
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* Bottom padding for mobile nav */}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        
        {/* Title Bar */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Field Operations</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <div className={isRefreshing ? 'animate-spin' : ''}>🔄</div>
            </button>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.open}</div>
              <div className="text-xs text-gray-600">Open</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{stats.full}</div>
              <div className="text-xs text-gray-600">Full</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{stats.needsAttention}</div>
              <div className="text-xs text-gray-600">Attention</div>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Occupancy</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  occupancyRate >= 90 ? 'bg-red-500' :
                  occupancyRate >= 75 ? 'bg-yellow-500' :
                  occupancyRate >= 50 ? 'bg-blue-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalOccupancy} / {stats.totalCapacity} occupied
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-base"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex overflow-x-auto space-x-1 -mx-1">
          {[
            { key: 'all', label: 'All', count: facilities.length },
            { key: 'my_assignments', label: 'My Sites', count: facilities.filter(f => 
              f.staff?.some((s: any) => s.user_id === profile?.id || s.email === profile?.email)
            ).length },
            { key: 'needs_attention', label: 'Alerts', count: stats.needsAttention },
            { key: 'high_occupancy', label: 'High Occ.', count: facilities.filter(f => 
              ((f.current_occupancy || 0) / (f.capacity_beds || 1)) > 0.75
            ).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === tab.key
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Sort:</span>
          {[
            { key: 'occupancy', label: 'Occupancy' },
            { key: 'name', label: 'Name' },
            { key: 'updated', label: 'Updated' }
            // { key: 'distance', label: 'Distance' } // TODO: Enable when location services are available
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className={`${
                sortBy === option.key
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facility List */}
      <div className="p-4 space-y-4">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Refreshing facilities...</p>
          </div>
        )}

        {filteredFacilities.length === 0 && !isRefreshing && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="text-lg font-medium text-gray-900">No facilities found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'No facilities are currently available'
              }
            </p>
          </div>
        )}

        {filteredFacilities.map(facility => (
          <MobileFacilityCard
            key={facility.id}
            facility={facility}
            onUpdate={onFacilityUpdate}
            showActions={true}
          />
        ))}
      </div>

      {/* Quick Action FAB (Floating Action Button) */}
      <div className="fixed bottom-6 right-4 z-20">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        >
          {showQuickActions ? '×' : '+'}
        </button>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-48">
            <button
              onClick={() => {
                // TODO: Implement quick facility creation
                alert('Quick facility creation will be implemented');
                setShowQuickActions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
            >
              <span className="mr-2">🏢</span>
              Add New Facility
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement incident reporting
                alert('Incident reporting will be implemented');
                setShowQuickActions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
            >
              <span className="mr-2">⚠️</span>
              Report Incident
            </button>
            
            <button
              onClick={() => {
                handleRefresh();
                setShowQuickActions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
            >
              <span className="mr-2">🔄</span>
              Sync Data
            </button>
            
            <button
              onClick={() => {
                // TODO: Implement offline mode
                alert('Offline mode will be implemented');
                setShowQuickActions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
            >
              <span className="mr-2">📱</span>
              Offline Mode
            </button>
          </div>
        )}
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-30">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Syncing data...
          </div>
        </div>
      )}
    </div>
  );
}