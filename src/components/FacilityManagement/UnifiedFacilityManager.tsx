/**
 * Unified Facility Manager
 * 
 * This component consolidates all 4 facility management systems into one
 * unified component that integrates with the new Supabase backend.
 * 
 * PHASE 2 - WEEK 2 IMPLEMENTATION
 * Combines the best features from:
 * - RealFacilityManager: Database integration and real data handling
 * - EnhancedFacilityManager: Superior UI layout and collapsible sidebar
 * - FacilityManager: IAP integration and workflow
 * - FacilityManagerFixed: Bug fixes and performance improvements
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabaseAdapter } from '@/lib/adapters/SupabaseAdapter';
import type { Facility, PersonnelAssignment } from '@/lib/supabase';

// Types
type DisciplineType = 'Sheltering' | 'Feeding' | 'Government Operations' | 
                     'Distribution' | 'Damage Assessment' | 'Individual Care';

type FacilityType = 'shelter' | 'feeding' | 'kitchen' | 'distribution' | 
                    'government' | 'assessment' | 'care' | 'warehouse';

interface UnifiedFacilityProps {
  onNavigate?: (view: string) => void;
  initialDiscipline?: DisciplineType;
  showIAPIntegration?: boolean;
}

interface FacilityFormData {
  name: string;
  type: FacilityType;
  discipline: DisciplineType;
  address: string;
  county: string;
  contactInfo: {
    phone: string;
    manager: string;
    email?: string;
  };
  capacity: {
    maximum?: number;
    current?: number;
    meals?: number;
  };
  notes: string;
}

export function UnifiedFacilityManager({ 
  onNavigate, 
  initialDiscipline = 'Sheltering',
  showIAPIntegration = true 
}: UnifiedFacilityProps) {
  // Supabase integration
  const { 
    facilities, 
    isLoading, 
    error, 
    createFacility, 
    updateFacility, 
    deleteFacility,
    currentOperationId 
  } = useSupabaseAdapter();

  // Local state
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>(initialDiscipline);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status'>('name');

  // Form state for creating/editing facilities
  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    type: 'shelter',
    discipline: activeDiscipline,
    address: '',
    county: '',
    contactInfo: {
      phone: '',
      manager: '',
      email: ''
    },
    capacity: {
      maximum: 0,
      current: 0,
      meals: 0
    },
    notes: ''
  });

  // Discipline configuration
  const disciplineConfig: Record<DisciplineType, { 
    color: string; 
    icon: string; 
    types: FacilityType[];
    defaultCapacity: keyof FacilityFormData['capacity'];
  }> = {
    'Sheltering': { 
      color: 'bg-red-600', 
      icon: '🏠', 
      types: ['shelter'],
      defaultCapacity: 'maximum'
    },
    'Feeding': { 
      color: 'bg-orange-600', 
      icon: '🍽️', 
      types: ['kitchen', 'feeding'],
      defaultCapacity: 'meals'
    },
    'Government Operations': { 
      color: 'bg-blue-600', 
      icon: '🏛️', 
      types: ['government'],
      defaultCapacity: 'maximum'
    },
    'Distribution': { 
      color: 'bg-green-600', 
      icon: '📦', 
      types: ['distribution', 'warehouse'],
      defaultCapacity: 'maximum'
    },
    'Damage Assessment': { 
      color: 'bg-yellow-600', 
      icon: '🔍', 
      types: ['assessment'],
      defaultCapacity: 'maximum'
    },
    'Individual Care': { 
      color: 'bg-purple-600', 
      icon: '❤️', 
      types: ['care'],
      defaultCapacity: 'maximum'
    }
  };

  // Filtered and sorted facilities
  const filteredFacilities = useMemo(() => {
    let filtered = facilities.filter(facility => 
      facility.discipline === activeDiscipline &&
      (searchTerm === '' || 
       facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       facility.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       facility.county?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [facilities, activeDiscipline, searchTerm, sortBy]);

  // Handle facility creation
  const handleCreateFacility = useCallback(async () => {
    if (!currentOperationId) {
      alert('No operation selected. Please select an operation first.');
      return;
    }

    try {
      setIsLoading(true);
      
      const newFacility = await createFacility({
        name: formData.name,
        type: formData.type,
        discipline: formData.discipline,
        address: formData.address,
        county: formData.county,
        operation_id: currentOperationId,
        status: 'active',
        contact_info: formData.contactInfo,
        capacity: formData.capacity,
        notes: formData.notes
      });

      setSelectedFacility(newFacility);
      setIsCreating(false);
      resetForm();
      
      console.log('✅ Facility created successfully:', newFacility.name);

    } catch (err) {
      console.error('❌ Failed to create facility:', err);
      alert(`Failed to create facility: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [formData, currentOperationId, createFacility]);

  // Handle facility update
  const handleUpdateFacility = useCallback(async () => {
    if (!selectedFacility) return;

    try {
      setIsLoading(true);
      
      const updatedFacility = await updateFacility(selectedFacility.id, {
        name: formData.name,
        type: formData.type,
        discipline: formData.discipline,
        address: formData.address,
        county: formData.county,
        contact_info: formData.contactInfo,
        capacity: formData.capacity,
        notes: formData.notes
      });

      setSelectedFacility(updatedFacility);
      setIsEditing(false);
      
      console.log('✅ Facility updated successfully:', updatedFacility.name);

    } catch (err) {
      console.error('❌ Failed to update facility:', err);
      alert(`Failed to update facility: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [selectedFacility, formData, updateFacility]);

  // Handle facility deletion
  const handleDeleteFacility = useCallback(async (facility: Facility) => {
    if (!confirm(`Are you sure you want to delete "${facility.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFacility(facility.id);
      
      if (selectedFacility?.id === facility.id) {
        setSelectedFacility(null);
      }
      
      console.log('✅ Facility deleted successfully:', facility.name);

    } catch (err) {
      console.error('❌ Failed to delete facility:', err);
      alert(`Failed to delete facility: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [selectedFacility, deleteFacility]);

  // Form management
  const resetForm = () => {
    setFormData({
      name: '',
      type: disciplineConfig[activeDiscipline].types[0],
      discipline: activeDiscipline,
      address: '',
      county: '',
      contactInfo: {
        phone: '',
        manager: '',
        email: ''
      },
      capacity: {
        maximum: 0,
        current: 0,
        meals: 0
      },
      notes: ''
    });
  };

  const loadFacilityForEditing = (facility: Facility) => {
    setFormData({
      name: facility.name,
      type: facility.type as FacilityType,
      discipline: facility.discipline as DisciplineType,
      address: facility.address || '',
      county: facility.county || '',
      contactInfo: facility.contact_info || {
        phone: '',
        manager: '',
        email: ''
      },
      capacity: facility.capacity || {
        maximum: 0,
        current: 0,
        meals: 0
      },
      notes: facility.notes || ''
    });
  };

  // Start creating new facility
  const startCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
    setSelectedFacility(null);
  };

  // Start editing existing facility
  const startEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    loadFacilityForEditing(facility);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Cancel form
  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    resetForm();
  };

  // Auto-update form discipline when active discipline changes
  useEffect(() => {
    if (isCreating || isEditing) {
      setFormData(prev => ({
        ...prev,
        discipline: activeDiscipline,
        type: disciplineConfig[activeDiscipline].types[0]
      }));
    }
  }, [activeDiscipline, isCreating, isEditing]);

  // Render facility card
  const renderFacilityCard = (facility: Facility) => {
    const config = disciplineConfig[facility.discipline as DisciplineType];
    const isSelected = selectedFacility?.id === facility.id;

    return (
      <div
        key={facility.id}
        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => setSelectedFacility(facility)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{config.icon}</span>
            <h3 className="font-bold text-lg">{facility.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded text-white text-xs ${config.color}`}>
            {facility.status.toUpperCase()}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-1">
          <strong>Type:</strong> {facility.type} • <strong>County:</strong> {facility.county}
        </p>
        <p className="text-xs text-gray-500 mb-2">{facility.address}</p>
        
        {facility.capacity && (
          <div className="text-sm">
            {facility.capacity.maximum && (
              <span className="text-blue-600">
                Capacity: {facility.capacity.current || 0}/{facility.capacity.maximum}
              </span>
            )}
            {facility.capacity.meals && (
              <span className="text-green-600">
                Meals: {facility.capacity.meals}/day
              </span>
            )}
          </div>
        )}

        {facility.contact_info?.phone && (
          <div className="mt-2">
            <a 
              href={`tel:${facility.contact_info.phone}`}
              className="text-blue-600 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              📞 {facility.contact_info.phone}
            </a>
            {facility.contact_info.manager && (
              <span className="text-sm text-gray-600 ml-2">
                ({facility.contact_info.manager})
              </span>
            )}
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); startEdit(facility); }}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteFacility(facility); }}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // Render facility form
  const renderFacilityForm = () => (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">
        {isCreating ? 'Create New Facility' : 'Edit Facility'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Facility Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter facility name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FacilityType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            {disciplineConfig[activeDiscipline].types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter facility address (Google Places autocomplete coming in Phase 2)"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">County *</label>
          <input
            type="text"
            value={formData.county}
            onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter county name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Manager Phone</label>
          <input
            type="tel"
            value={formData.contactInfo.phone}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contactInfo: { ...prev.contactInfo, phone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="(813) 555-0123"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Manager Name</label>
          <input
            type="text"
            value={formData.contactInfo.manager}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contactInfo: { ...prev.contactInfo, manager: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter manager name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Manager Email</label>
          <input
            type="email"
            value={formData.contactInfo.email}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              contactInfo: { ...prev.contactInfo, email: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="manager@redcross.org"
          />
        </div>
        
        {/* Capacity fields based on discipline */}
        {activeDiscipline === 'Sheltering' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Capacity</label>
              <input
                type="number"
                value={formData.capacity.maximum || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  capacity: { ...prev.capacity, maximum: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Occupancy</label>
              <input
                type="number"
                value={formData.capacity.current || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  capacity: { ...prev.capacity, current: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="45"
              />
            </div>
          </>
        )}
        
        {activeDiscipline === 'Feeding' && (
          <div>
            <label className="block text-sm font-medium mb-1">Meals per Day</label>
            <input
              type="number"
              value={formData.capacity.meals || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                capacity: { ...prev.capacity, meals: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
        )}
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes about this facility..."
          />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={isCreating ? handleCreateFacility : handleUpdateFacility}
          disabled={!formData.name || !formData.address || !formData.county}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Create Facility' : 'Update Facility'}
        </button>
        <button
          onClick={cancelForm}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Collapsible Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-80'} bg-white border-r border-gray-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold">🏢 Facility Manager</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        {!sidebarCollapsed && (
          <>
            {/* Discipline Selector */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(disciplineConfig).map(([discipline, config]) => (
                  <button
                    key={discipline}
                    onClick={() => setActiveDiscipline(discipline as DisciplineType)}
                    className={`p-2 rounded text-xs font-semibold transition-all ${
                      activeDiscipline === discipline
                        ? `${config.color} text-white`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {config.icon} {discipline}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search and Sort */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Search facilities..."
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
            
            {/* Facility Count and Add Button */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">
                  {filteredFacilities.length} {activeDiscipline} facilities
                </span>
                <button
                  onClick={startCreate}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  + Add
                </button>
              </div>
            </div>
            
            {/* Facility List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Loading facilities...
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No {activeDiscipline.toLowerCase()} facilities found.</p>
                  <button
                    onClick={startCreate}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create First Facility
                  </button>
                </div>
              ) : (
                filteredFacilities.map(renderFacilityCard)
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-800">⚠️ Error: {error}</p>
          </div>
        )}
        
        {(isCreating || isEditing) && renderFacilityForm()}
        
        {!isCreating && !isEditing && selectedFacility && (
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {disciplineConfig[selectedFacility.discipline as DisciplineType]?.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedFacility.name}</h2>
                  <p className="text-gray-600">{selectedFacility.type} • {selectedFacility.county} County</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(selectedFacility)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit Facility
                </button>
                <button
                  onClick={() => handleDeleteFacility(selectedFacility)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Facility
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-3">📍 Location Information</h3>
                <p><strong>Address:</strong> {selectedFacility.address}</p>
                <p><strong>County:</strong> {selectedFacility.county}</p>
                <p><strong>Status:</strong> {selectedFacility.status}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-3">📞 Contact Information</h3>
                {selectedFacility.contact_info?.phone && (
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a 
                      href={`tel:${selectedFacility.contact_info.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedFacility.contact_info.phone}
                    </a>
                  </p>
                )}
                {selectedFacility.contact_info?.manager && (
                  <p><strong>Manager:</strong> {selectedFacility.contact_info.manager}</p>
                )}
                {selectedFacility.contact_info?.email && (
                  <p><strong>Email:</strong> {selectedFacility.contact_info.email}</p>
                )}
              </div>
              
              {selectedFacility.capacity && (
                <div>
                  <h3 className="text-lg font-bold mb-3">📊 Capacity Information</h3>
                  {selectedFacility.capacity.maximum && (
                    <p><strong>Max Capacity:</strong> {selectedFacility.capacity.maximum}</p>
                  )}
                  {selectedFacility.capacity.current && (
                    <p><strong>Current:</strong> {selectedFacility.capacity.current}</p>
                  )}
                  {selectedFacility.capacity.meals && (
                    <p><strong>Meals/Day:</strong> {selectedFacility.capacity.meals}</p>
                  )}
                </div>
              )}
              
              {selectedFacility.notes && (
                <div>
                  <h3 className="text-lg font-bold mb-3">📝 Notes</h3>
                  <p>{selectedFacility.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!isCreating && !isEditing && !selectedFacility && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-2">Unified Facility Manager</h2>
            <p className="text-gray-600 mb-6">
              Select a facility from the sidebar or create a new one to get started.
            </p>
            <button
              onClick={startCreate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create New Facility
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedFacilityManager;