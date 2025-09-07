'use client';

import React, { useMemo } from 'react';

/**
 * Facility Analytics Component - Phase 3 Implementation
 * 
 * Real-time analytics and insights for facility operations.
 * Provides KPIs, trends, and operational intelligence.
 */

interface FacilityAnalyticsProps {
  facilities: any[];
  timeRange?: 'today' | '7days' | '30days' | 'operation';
}

interface AnalyticsData {
  kpis: {
    totalFacilities: number;
    openFacilities: number;
    totalCapacity: number;
    currentOccupancy: number;
    occupancyRate: number;
    averageCapacityUtilization: number;
    facilitiesAtCapacity: number;
    facilitiesNeedingStaff: number;
  };
  
  trends: {
    capacityTrend: 'up' | 'down' | 'stable';
    occupancyTrend: 'up' | 'down' | 'stable';
    newFacilitiesToday: number;
    statusChangesToday: number;
  };
  
  breakdown: {
    byType: Record<string, { count: number; capacity: number; occupancy: number }>;
    byStatus: Record<string, number>;
    byCounty: Record<string, number>;
    byOccupancyLevel: Record<string, number>;
  };
  
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    count: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export function FacilityAnalytics({ facilities, timeRange = '7days' }: FacilityAnalyticsProps) {
  
  // Calculate analytics data
  const analytics = useMemo(() => {
    const data: AnalyticsData = {
      kpis: {
        totalFacilities: facilities.length,
        openFacilities: facilities.filter(f => f.status === 'open').length,
        totalCapacity: facilities.reduce((sum, f) => sum + (f.capacity_beds || 0), 0),
        currentOccupancy: facilities.reduce((sum, f) => sum + (f.current_occupancy || 0), 0),
        occupancyRate: 0,
        averageCapacityUtilization: 0,
        facilitiesAtCapacity: 0,
        facilitiesNeedingStaff: facilities.filter(f => !f.has_manager).length
      },
      
      trends: {
        capacityTrend: 'stable',
        occupancyTrend: 'up',
        newFacilitiesToday: facilities.filter(f => {
          const created = new Date(f.created_at || Date.now());
          const today = new Date();
          return created.toDateString() === today.toDateString();
        }).length,
        statusChangesToday: 0 // Would need status change log
      },
      
      breakdown: {
        byType: {},
        byStatus: {},
        byCounty: {},
        byOccupancyLevel: {
          'Empty (0%)': 0,
          'Low (1-25%)': 0,
          'Medium (26-75%)': 0,
          'High (76-99%)': 0,
          'Full (100%)': 0,
          'Over Capacity': 0
        }
      },
      
      alerts: []
    };

    // Calculate occupancy rate
    if (data.kpis.totalCapacity > 0) {
      data.kpis.occupancyRate = (data.kpis.currentOccupancy / data.kpis.totalCapacity) * 100;
    }

    // Calculate average utilization
    const facilitiesWithCapacity = facilities.filter(f => (f.capacity_beds || 0) > 0);
    if (facilitiesWithCapacity.length > 0) {
      data.kpis.averageCapacityUtilization = facilitiesWithCapacity.reduce((sum, f) => {
        const utilization = ((f.current_occupancy || 0) / (f.capacity_beds || 1)) * 100;
        return sum + utilization;
      }, 0) / facilitiesWithCapacity.length;
    }

    // Count facilities at capacity
    data.kpis.facilitiesAtCapacity = facilities.filter(f => 
      (f.current_occupancy || 0) >= (f.capacity_beds || 0)
    ).length;

    // Build breakdowns
    facilities.forEach(facility => {
      // By type
      const type = facility.type || 'unknown';
      if (!data.breakdown.byType[type]) {
        data.breakdown.byType[type] = { count: 0, capacity: 0, occupancy: 0 };
      }
      data.breakdown.byType[type].count++;
      data.breakdown.byType[type].capacity += (facility.capacity_beds || 0);
      data.breakdown.byType[type].occupancy += (facility.current_occupancy || 0);

      // By status
      const status = facility.status || 'unknown';
      data.breakdown.byStatus[status] = (data.breakdown.byStatus[status] || 0) + 1;

      // By county
      const county = facility.county || 'Unknown';
      data.breakdown.byCounty[county] = (data.breakdown.byCounty[county] || 0) + 1;

      // By occupancy level
      const capacity = facility.capacity_beds || 0;
      const occupancy = facility.current_occupancy || 0;
      
      if (capacity === 0) {
        return; // Skip facilities with no capacity data
      }

      const occupancyPercent = (occupancy / capacity) * 100;
      
      if (occupancyPercent === 0) {
        data.breakdown.byOccupancyLevel['Empty (0%)']++;
      } else if (occupancyPercent <= 25) {
        data.breakdown.byOccupancyLevel['Low (1-25%)']++;
      } else if (occupancyPercent <= 75) {
        data.breakdown.byOccupancyLevel['Medium (26-75%)']++;
      } else if (occupancyPercent <= 99) {
        data.breakdown.byOccupancyLevel['High (76-99%)']++;
      } else if (occupancyPercent === 100) {
        data.breakdown.byOccupancyLevel['Full (100%)']++;
      } else {
        data.breakdown.byOccupancyLevel['Over Capacity']++;
      }
    });

    // Generate alerts
    if (data.kpis.facilitiesAtCapacity > 0) {
      data.alerts.push({
        type: 'warning',
        message: 'Facilities at capacity',
        count: data.kpis.facilitiesAtCapacity,
        priority: 'high'
      });
    }

    if (data.kpis.facilitiesNeedingStaff > 0) {
      data.alerts.push({
        type: 'error',
        message: 'Facilities without managers',
        count: data.kpis.facilitiesNeedingStaff,
        priority: 'high'
      });
    }

    if (data.kpis.occupancyRate > 85) {
      data.alerts.push({
        type: 'warning',
        message: 'High overall occupancy rate',
        count: 1,
        priority: 'medium'
      });
    }

    const lowOccupancyFacilities = facilities.filter(f => {
      const rate = (f.current_occupancy || 0) / (f.capacity_beds || 1);
      return f.status === 'open' && rate < 0.25 && (f.capacity_beds || 0) > 0;
    }).length;

    if (lowOccupancyFacilities > 0) {
      data.alerts.push({
        type: 'info',
        message: 'Underutilized facilities',
        count: lowOccupancyFacilities,
        priority: 'low'
      });
    }

    return data;
  }, [facilities, timeRange]);

  // Format number with suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Facilities */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.kpis.totalFacilities}</p>
              </div>
              <div className="text-2xl">🏢</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.kpis.openFacilities} currently open
            </p>
          </div>

          {/* Total Capacity */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(analytics.kpis.totalCapacity)}</p>
              </div>
              <div className="text-2xl">🛏️</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(analytics.kpis.currentOccupancy)} occupied ({analytics.kpis.occupancyRate.toFixed(1)}%)
            </p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.kpis.occupancyRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-2xl">{getTrendIcon(analytics.trends.occupancyTrend)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Avg utilization: {analytics.kpis.averageCapacityUtilization.toFixed(1)}%
            </p>
          </div>

          {/* Facilities at Capacity */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Capacity</p>
                <p className="text-2xl font-bold text-red-600">{analytics.kpis.facilitiesAtCapacity}</p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.kpis.facilitiesNeedingStaff} need staff
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
          
          <div className="space-y-2">
            {analytics.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {alert.type === 'error' ? '🚨' : 
                     alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      Priority: {alert.priority}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-bold ${
                  alert.type === 'error' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {alert.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Facility Types */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-900 mb-3">By Facility Type</h4>
          
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.byType).map(([type, data]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                  <span className="text-sm text-gray-600">
                    {data.count} facilities ({data.capacity} capacity)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(data.count / analytics.kpis.totalFacilities) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.occupancy}/{data.capacity} occupied ({
                    data.capacity > 0 ? ((data.occupancy / data.capacity) * 100).toFixed(1) : 0
                  }%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-900 mb-3">By Status</h4>
          
          <div className="space-y-3">
            {Object.entries(analytics.breakdown.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  <span className="text-sm text-gray-600">{count} facilities</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      status === 'open' ? 'bg-green-500' :
                      status === 'closed' ? 'bg-red-500' :
                      status === 'full' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${(count / analytics.kpis.totalFacilities) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Levels */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Occupancy Levels</h4>
          
          <div className="space-y-2">
            {Object.entries(analytics.breakdown.byOccupancyLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{level}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level.includes('Empty') ? 'bg-gray-400' :
                        level.includes('Low') ? 'bg-green-500' :
                        level.includes('Medium') ? 'bg-yellow-500' :
                        level.includes('High') ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(count / analytics.kpis.totalFacilities) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-900 mb-3">By County</h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(analytics.breakdown.byCounty)
              .sort(([,a], [,b]) => b - a)
              .map(([county, count]) => (
                <div key={county} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{county}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / analytics.kpis.totalFacilities) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}