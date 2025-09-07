'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { FacilityGate } from '../../lib/auth/RoleGate';

/**
 * Facility Bulk Operations Component - Phase 3 Implementation
 * 
 * Advanced bulk operations for managing multiple facilities simultaneously.
 * Includes batch updates, bulk assignments, and mass operations.
 */

interface FacilityBulkOperationsProps {
  selectedFacilities: string[];
  onSelectionChange: (facilityIds: string[]) => void;
  onBulkUpdate: (updates: BulkUpdate) => Promise<void>;
  onRefresh: () => void;
  facilities: any[]; // Full facility data for context
}

export interface BulkUpdate {
  operation: 'update' | 'assign_personnel' | 'add_resources' | 'change_status' | 'update_capacity' | 'delete';
  data: any;
  facilityIds: string[];
}

interface BulkAssignment {
  personnelIds: string[];
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface BulkResourceUpdate {
  resources: Array<{
    type: string;
    quantity: number;
    unit: string;
  }>;
  mode: 'add' | 'replace' | 'subtract';
}

interface BulkStatusUpdate {
  status: 'open' | 'closed' | 'full' | 'maintenance';
  reason?: string;
  effective_date?: string;
}

interface BulkCapacityUpdate {
  capacity_beds?: number;
  capacity_meals?: number;
  capacity_parking?: number;
  capacity_volunteers?: number;
}

export function FacilityBulkOperations({
  selectedFacilities,
  onSelectionChange,
  onBulkUpdate,
  onRefresh,
  facilities
}: FacilityBulkOperationsProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Form states for different operations
  const [bulkAssignment, setBulkAssignment] = useState<BulkAssignment>({
    personnelIds: [],
    role: '',
    startDate: '',
    endDate: ''
  });
  
  const [bulkResources, setBulkResources] = useState<BulkResourceUpdate>({
    resources: [],
    mode: 'add'
  });
  
  const [bulkStatus, setBulkStatus] = useState<BulkStatusUpdate>({
    status: 'open',
    reason: '',
    effective_date: ''
  });
  
  const [bulkCapacity, setBulkCapacity] = useState<BulkCapacityUpdate>({});

  // Calculate selected facility summary
  const selectedSummary = useMemo(() => {
    const selected = facilities.filter(f => selectedFacilities.includes(f.id));
    
    return {
      count: selected.length,
      types: [...new Set(selected.map(f => f.type))],
      statuses: [...new Set(selected.map(f => f.status))],
      totalCapacity: selected.reduce((sum, f) => sum + (f.capacity_beds || 0), 0),
      totalOccupied: selected.reduce((sum, f) => sum + (f.current_occupancy || 0), 0)
    };
  }, [selectedFacilities, facilities]);

  // Handle bulk update execution
  const executeBulkOperation = async (operation: string, data: any) => {
    if (selectedFacilities.length === 0) {
      alert('Please select facilities first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const bulkUpdate: BulkUpdate = {
        operation: operation as any,
        data,
        facilityIds: selectedFacilities
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onBulkUpdate(bulkUpdate);

      clearInterval(progressInterval);
      setProgress(100);

      // Reset form and close
      setTimeout(() => {
        setActiveOperation(null);
        setIsOpen(false);
        setProgress(0);
        onRefresh();
      }, 1000);

    } catch (error) {
      console.error('Bulk operation failed:', error);
      alert('Bulk operation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Select all facilities with filters
  const selectAllWithFilters = (filters?: {
    type?: string;
    status?: string;
    hasCapacity?: boolean;
  }) => {
    let filtered = facilities;
    
    if (filters?.type) {
      filtered = filtered.filter(f => f.type === filters.type);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(f => f.status === filters.status);
    }
    
    if (filters?.hasCapacity) {
      filtered = filtered.filter(f => (f.capacity_beds || 0) > (f.current_occupancy || 0));
    }
    
    onSelectionChange(filtered.map(f => f.id));
  };

  if (selectedFacilities.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-600">
          <p className="text-sm">Select facilities to perform bulk operations</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => selectAllWithFilters()}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={() => selectAllWithFilters({ type: 'shelter' })}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              All Shelters
            </button>
            <button
              onClick={() => selectAllWithFilters({ status: 'open' })}
              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
            >
              All Open
            </button>
            <button
              onClick={() => selectAllWithFilters({ hasCapacity: true })}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
            >
              Has Capacity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Bulk Operations
            </h3>
            <p className="text-xs text-gray-500">
              {selectedSummary.count} facilities selected
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              {isOpen ? 'Close' : 'Open Panel'}
            </button>
            <button
              onClick={() => onSelectionChange([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
        
        {/* Selection Summary */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {selectedSummary.count} facilities
          </span>
          
          {selectedSummary.types.map(type => (
            <span key={type} className="bg-green-100 text-green-700 px-2 py-1 rounded">
              {type}
            </span>
          ))}
          
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {selectedSummary.totalCapacity} total beds
          </span>
          
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
            {selectedSummary.totalOccupied} occupied
          </span>
        </div>
      </div>

      {/* Operations Panel */}
      {isOpen && (
        <div className="p-4">
          
          {/* Processing Progress */}
          {isProcessing && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Processing bulk operation...
                </span>
                <span className="text-sm text-blue-700">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Operation Selection */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            
            <FacilityGate action="update" showFallback={false}>
              <button
                onClick={() => setActiveOperation('assign_personnel')}
                disabled={isProcessing}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
              >
                <div className="text-sm font-medium text-gray-900">👥 Personnel</div>
                <div className="text-xs text-gray-600">Assign staff</div>
              </button>
            </FacilityGate>

            <FacilityGate action="update" showFallback={false}>
              <button
                onClick={() => setActiveOperation('add_resources')}
                disabled={isProcessing}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
              >
                <div className="text-sm font-medium text-gray-900">📦 Resources</div>
                <div className="text-xs text-gray-600">Add supplies</div>
              </button>
            </FacilityGate>

            <FacilityGate action="update" showFallback={false}>
              <button
                onClick={() => setActiveOperation('change_status')}
                disabled={isProcessing}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
              >
                <div className="text-sm font-medium text-gray-900">🔄 Status</div>
                <div className="text-xs text-gray-600">Change status</div>
              </button>
            </FacilityGate>

            <FacilityGate action="update" showFallback={false}>
              <button
                onClick={() => setActiveOperation('update_capacity')}
                disabled={isProcessing}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
              >
                <div className="text-sm font-medium text-gray-900">🛏️ Capacity</div>
                <div className="text-xs text-gray-600">Update limits</div>
              </button>
            </FacilityGate>
          </div>

          {/* Operation Forms */}
          
          {/* Personnel Assignment */}
          {activeOperation === 'assign_personnel' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-3">Bulk Personnel Assignment</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Personnel Selection
                  </label>
                  <select 
                    multiple
                    value={bulkAssignment.personnelIds}
                    onChange={(e) => setBulkAssignment(prev => ({
                      ...prev,
                      personnelIds: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 h-20"
                  >
                    <option value="person-1">John Smith - Shelter Manager</option>
                    <option value="person-2">Sarah Johnson - Volunteer</option>
                    <option value="person-3">Mike Wilson - Security</option>
                    <option value="person-4">Lisa Brown - Nurse</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={bulkAssignment.role}
                    onChange={(e) => setBulkAssignment(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 mb-3"
                  >
                    <option value="">Select Role</option>
                    <option value="manager">Facility Manager</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="security">Security</option>
                    <option value="medical">Medical Staff</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={bulkAssignment.startDate}
                      onChange={(e) => setBulkAssignment(prev => ({ ...prev, startDate: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="date"
                      placeholder="End Date"
                      value={bulkAssignment.endDate}
                      onChange={(e) => setBulkAssignment(prev => ({ ...prev, endDate: e.target.value }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setActiveOperation(null)}
                  className="text-xs px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeBulkOperation('assign_personnel', bulkAssignment)}
                  disabled={bulkAssignment.personnelIds.length === 0 || !bulkAssignment.role}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign to {selectedFacilities.length} Facilities
                </button>
              </div>
            </div>
          )}

          {/* Resource Management */}
          {activeOperation === 'add_resources' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-3">Bulk Resource Management</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Operation Mode
                  </label>
                  <select
                    value={bulkResources.mode}
                    onChange={(e) => setBulkResources(prev => ({ ...prev, mode: e.target.value as any }))}
                    className="text-xs border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="add">Add to existing</option>
                    <option value="replace">Replace existing</option>
                    <option value="subtract">Subtract from existing</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Resources to Add
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[
                      { type: 'Cots', unit: 'each' },
                      { type: 'Blankets', unit: 'each' },
                      { type: 'Water (gallons)', unit: 'gallons' },
                      { type: 'MREs', unit: 'meals' },
                      { type: 'First Aid Kits', unit: 'kits' }
                    ].map((resource, index) => (
                      <div key={resource.type} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-xs text-gray-700">{resource.type}</span>
                        <input
                          type="number"
                          placeholder="Qty"
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 0;
                            setBulkResources(prev => {
                              const newResources = [...prev.resources];
                              const existingIndex = newResources.findIndex(r => r.type === resource.type);
                              
                              if (existingIndex >= 0) {
                                if (quantity === 0) {
                                  newResources.splice(existingIndex, 1);
                                } else {
                                  newResources[existingIndex].quantity = quantity;
                                }
                              } else if (quantity > 0) {
                                newResources.push({
                                  type: resource.type,
                                  quantity,
                                  unit: resource.unit
                                });
                              }
                              
                              return { ...prev, resources: newResources };
                            });
                          }}
                        />
                        <span className="text-xs text-gray-500">{resource.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setActiveOperation(null)}
                  className="text-xs px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeBulkOperation('add_resources', bulkResources)}
                  disabled={bulkResources.resources.length === 0}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Resources
                </button>
              </div>
            </div>
          )}

          {/* Status Change */}
          {activeOperation === 'change_status' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-3">Bulk Status Change</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={bulkStatus.status}
                    onChange={(e) => setBulkStatus(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="full">Full</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="datetime-local"
                    value={bulkStatus.effective_date}
                    onChange={(e) => setBulkStatus(prev => ({ ...prev, effective_date: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={bulkStatus.reason}
                  onChange={(e) => setBulkStatus(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for status change..."
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 h-16 resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setActiveOperation(null)}
                  className="text-xs px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeBulkOperation('change_status', bulkStatus)}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Change Status
                </button>
              </div>
            </div>
          )}

          {/* Capacity Update */}
          {activeOperation === 'update_capacity' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-3">Bulk Capacity Update</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bed Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Number of beds"
                    value={bulkCapacity.capacity_beds || ''}
                    onChange={(e) => setBulkCapacity(prev => ({ 
                      ...prev, 
                      capacity_beds: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Meal Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Meals per day"
                    value={bulkCapacity.capacity_meals || ''}
                    onChange={(e) => setBulkCapacity(prev => ({ 
                      ...prev, 
                      capacity_meals: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    placeholder="Parking spaces"
                    value={bulkCapacity.capacity_parking || ''}
                    onChange={(e) => setBulkCapacity(prev => ({ 
                      ...prev, 
                      capacity_parking: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Volunteer Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Max volunteers"
                    value={bulkCapacity.capacity_volunteers || ''}
                    onChange={(e) => setBulkCapacity(prev => ({ 
                      ...prev, 
                      capacity_volunteers: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setActiveOperation(null)}
                  className="text-xs px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeBulkOperation('update_capacity', bulkCapacity)}
                  disabled={Object.values(bulkCapacity).every(v => v === undefined)}
                  className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Capacity
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}