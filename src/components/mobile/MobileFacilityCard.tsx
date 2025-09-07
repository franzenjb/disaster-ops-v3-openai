'use client';

import React, { useState } from 'react';
import { ClickablePhone } from '../shared/GooglePlacesAutocomplete';
import { useAuth } from '../../lib/auth/AuthProvider';
import { FacilityGate } from '../../lib/auth/RoleGate';

/**
 * Mobile Facility Card Component - Phase 3 Implementation
 * 
 * Optimized facility display for mobile field operations.
 * Touch-friendly interface with essential information at a glance.
 */

interface MobileFacilityCardProps {
  facility: any;
  onUpdate?: (facilityId: string, updates: any) => Promise<void>;
  onSelect?: (facilityId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function MobileFacilityCard({
  facility,
  onUpdate,
  onSelect,
  isSelected = false,
  showActions = true
}: MobileFacilityCardProps) {
  const { profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickUpdate, setQuickUpdate] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate occupancy percentage
  const occupancyPercent = facility.capacity_beds > 0 
    ? Math.round((facility.current_occupancy || 0) / facility.capacity_beds * 100)
    : 0;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      case 'full': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Get occupancy color
  const getOccupancyColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    if (percent >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Handle quick status update
  const handleQuickStatusUpdate = async (newStatus: string) => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(facility.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle quick occupancy update
  const handleOccupancyUpdate = async (increment: number) => {
    if (!onUpdate) return;
    
    const newOccupancy = Math.max(0, Math.min(
      facility.capacity_beds || 0,
      (facility.current_occupancy || 0) + increment
    ));
    
    setIsUpdating(true);
    try {
      await onUpdate(facility.id, { current_occupancy: newOccupancy });
    } catch (error) {
      console.error('Failed to update occupancy:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className={`bg-white border-2 rounded-xl shadow-sm transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect && onSelect(facility.id)}
    >
      
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {facility.name}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {facility.type} • {facility.county}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(facility.status)}`}>
            {facility.status?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {/* Address */}
        <div className="mt-2 text-sm text-gray-700">
          📍 {facility.address}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-3">
          
          {/* Occupancy */}
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {facility.current_occupancy || 0}
            </div>
            <div className="text-xs text-gray-600">
              / {facility.capacity_beds || 0}
            </div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getOccupancyColor(occupancyPercent)}`}
                  style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{occupancyPercent}%</div>
            </div>
          </div>

          {/* Staff Status */}
          <div className="text-center">
            <div className="text-lg">
              {facility.has_manager ? '👤' : '❌'}
            </div>
            <div className="text-xs text-gray-600">
              {facility.has_manager ? 'Staffed' : 'No Manager'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {facility.staff_count || 0} total
            </div>
          </div>

          {/* Last Update */}
          <div className="text-center">
            <div className="text-lg">🕐</div>
            <div className="text-xs text-gray-600">Last Update</div>
            <div className="text-xs text-gray-500">
              {facility.updated_at 
                ? new Date(facility.updated_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Unknown'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {facility.phone && (
        <div className="px-4 pb-3">
          <ClickablePhone 
            phone={facility.phone}
            className="text-blue-600 font-medium text-sm block w-full text-center py-2 bg-blue-50 rounded-lg border border-blue-200"
            showIcon={true}
          />
        </div>
      )}

      {/* Quick Actions */}
      {showActions && (
        <div className="border-t border-gray-100 p-3">
          
          <FacilityGate action="update" showFallback={false}>
            
            {/* Quick Status Updates */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Quick Status:</div>
              <div className="grid grid-cols-4 gap-1">
                {['open', 'closed', 'full', 'maintenance'].map(status => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(status);
                    }}
                    disabled={isUpdating || facility.status === status}
                    className={`text-xs py-2 px-1 rounded border transition-all ${
                      facility.status === status
                        ? getStatusColor(status)
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {status === 'maintenance' ? 'Maint' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Occupancy Controls */}
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Occupancy:</div>
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccupancyUpdate(-1);
                  }}
                  disabled={isUpdating || (facility.current_occupancy || 0) <= 0}
                  className="w-10 h-10 bg-red-100 text-red-600 rounded-full border border-red-200 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                
                <div className="text-center">
                  <div className="text-sm font-bold">
                    {facility.current_occupancy || 0} / {facility.capacity_beds || 0}
                  </div>
                  <div className="text-xs text-gray-500">{occupancyPercent}% full</div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOccupancyUpdate(1);
                  }}
                  disabled={isUpdating || (facility.current_occupancy || 0) >= (facility.capacity_beds || 0)}
                  className="w-10 h-10 bg-green-100 text-green-600 rounded-full border border-green-200 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </FacilityGate>

          {/* Expand/Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full text-xs text-gray-600 hover:text-gray-800 py-2"
          >
            {isExpanded ? 'Show Less ↑' : 'Show More ↓'}
          </button>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          
          {/* Additional Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            
            <div>
              <div className="font-medium text-gray-700 mb-2">Capacity Details</div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Beds: {facility.capacity_beds || 0}</div>
                <div>Meals: {facility.capacity_meals || 0}/day</div>
                <div>Parking: {facility.capacity_parking || 0}</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-2">Features</div>
              <div className="space-y-1 text-xs">
                <div className={facility.pet_friendly ? 'text-green-600' : 'text-gray-400'}>
                  🐕 Pet Friendly
                </div>
                <div className={facility.accessibility_compliant ? 'text-green-600' : 'text-gray-400'}>
                  ♿ ADA Compliant
                </div>
                <div className={facility.has_generator ? 'text-green-600' : 'text-gray-400'}>
                  ⚡ Backup Power
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="font-medium text-gray-700 mb-2">Resources</div>
              <div className="flex flex-wrap gap-1">
                {facility.resources?.slice(0, 4).map((resource: any, index: number) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {resource.quantity} {resource.type}
                  </span>
                )) || (
                  <span className="text-xs text-gray-500">No resources logged</span>
                )}
                {(facility.resources?.length || 0) > 4 && (
                  <span className="text-xs text-gray-500">
                    +{(facility.resources?.length || 0) - 4} more
                  </span>
                )}
              </div>
            </div>

            {facility.notes && (
              <div className="col-span-2">
                <div className="font-medium text-gray-700 mb-2">Notes</div>
                <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                  {facility.notes}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement detailed edit modal
                alert('Detailed editing will open full facility form');
              }}
              className="text-xs bg-blue-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              📝 Edit Details
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement map view
                if (facility.latitude && facility.longitude) {
                  window.open(`https://maps.google.com/?q=${facility.latitude},${facility.longitude}`, '_blank');
                } else {
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(facility.address)}`, '_blank');
                }
              }}
              className="text-xs bg-green-600 text-white py-3 px-4 rounded-lg font-medium"
            >
              🗺️ Directions
            </button>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-600 mt-2">Updating...</p>
          </div>
        </div>
      )}
    </div>
  );
}