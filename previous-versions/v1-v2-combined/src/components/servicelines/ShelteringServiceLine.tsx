/**
 * Sheltering Service Line Component
 * Complete Form 5266 Line Items for Sheltering Operations
 */

import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../core/EventBus';

export function ShelteringServiceLine() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateServiceLine = useOperationStore(state => state.updateServiceLine);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedShelter, setSelectedShelter] = useState<string>('');
  
  if (!operation) return null;
  
  const sheltering = operation.serviceLines.sheltering;
  
  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('sheltering', {
      ...sheltering,
      [field]: value
    });
    
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'sheltering',
      field,
      value,
      timestamp: Date.now()
    });
  };
  
  const addShelter = () => {
    const newShelter = {
      id: `shelter-${Date.now()}`,
      name: `Shelter ${(sheltering.sheltersList?.length || 0) + 1}`,
      address: '',
      capacity: 0,
      currentOccupancy: 0,
      type: 'Congregate',
      status: 'Open',
      manager: '',
      phone: '',
      petFriendly: false,
      adaCompliant: true,
      openedDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    
    handleUpdate('sheltersList', [...(sheltering.sheltersList || []), newShelter]);
  };
  
  const updateShelter = (shelterId: string, field: string, value: any) => {
    const updatedShelters = (sheltering.sheltersList || []).map(shelter =>
      shelter.id === shelterId ? { ...shelter, [field]: value } : shelter
    );
    handleUpdate('sheltersList', updatedShelters);
  };
  
  const removeShelter = (shelterId: string) => {
    const updatedShelters = (sheltering.sheltersList || []).filter(s => s.id !== shelterId);
    handleUpdate('sheltersList', updatedShelters);
  };
  
  // Calculate totals
  const calculateTotalCapacity = () => {
    return (sheltering.sheltersList || []).reduce((sum, s) => sum + (s.capacity || 0), 0);
  };
  
  const calculateTotalOccupancy = () => {
    return (sheltering.sheltersList || []).reduce((sum, s) => sum + (s.currentOccupancy || 0), 0);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Sheltering Operations</h3>
            <p className="text-sm text-gray-500">
              Line 38: {sheltering.sheltersOpen || 0} Shelters | 
              Line 44: {sheltering.totalClientsServed || 0} Clients
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Daily Statistics */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Daily Shelter Statistics (Form 5266 Lines 38-44)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 38: Shelters Open
                </label>
                <input
                  type="number"
                  value={sheltering.sheltersOpen || ''}
                  onChange={(e) => handleUpdate('sheltersOpen', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 font-bold"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 39: Shelter Capacity
                </label>
                <input
                  type="number"
                  value={sheltering.shelterCapacity || ''}
                  onChange={(e) => handleUpdate('shelterCapacity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 40: Current Population
                </label>
                <input
                  type="number"
                  value={sheltering.currentPopulation || ''}
                  onChange={(e) => handleUpdate('currentPopulation', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 41: New Registrations
                </label>
                <input
                  type="number"
                  value={sheltering.newRegistrations || ''}
                  onChange={(e) => handleUpdate('newRegistrations', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 42: Overnight Stays
                </label>
                <input
                  type="number"
                  value={(sheltering.overnightStays && sheltering.overnightStays[0]?.value) || ''}
                  onChange={(e) => handleUpdate('overnightStays', [{
                    date: new Date(),
                    value: parseInt(e.target.value) || 0
                  }])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 43: Pet Sheltered
                </label>
                <input
                  type="number"
                  value={sheltering.petsSheltered || ''}
                  onChange={(e) => handleUpdate('petsSheltered', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 44: Total Clients Served (Cumulative)
                </label>
                <input
                  type="number"
                  value={sheltering.totalClientsServed || ''}
                  onChange={(e) => handleUpdate('totalClientsServed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 font-bold text-lg"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Individual Shelter Management */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-semibold text-gray-800">
                Individual Shelter Details
              </h4>
              <button
                onClick={addShelter}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                + Add Shelter
              </button>
            </div>
            
            {/* Shelter List */}
            <div className="space-y-4">
              {(sheltering.sheltersList || []).map((shelter) => (
                <div key={shelter.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      value={shelter.name}
                      onChange={(e) => updateShelter(shelter.id, 'name', e.target.value)}
                      className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-red-500 outline-none"
                      placeholder="Shelter Name"
                    />
                    <button
                      onClick={() => removeShelter(shelter.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                      <input
                        type="text"
                        value={shelter.address}
                        onChange={(e) => updateShelter(shelter.id, 'address', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={shelter.capacity}
                        onChange={(e) => updateShelter(shelter.id, 'capacity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current Occupancy</label>
                      <input
                        type="number"
                        value={shelter.currentOccupancy}
                        onChange={(e) => updateShelter(shelter.id, 'currentOccupancy', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        value={shelter.type}
                        onChange={(e) => updateShelter(shelter.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option>Congregate</option>
                        <option>Non-Congregate</option>
                        <option>Hotel/Motel</option>
                        <option>Dormitory</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                      <select
                        value={shelter.status}
                        onChange={(e) => updateShelter(shelter.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      >
                        <option>Open</option>
                        <option>Full</option>
                        <option>Closing</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Manager</label>
                      <input
                        type="text"
                        value={shelter.manager}
                        onChange={(e) => updateShelter(shelter.id, 'manager', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder="Name"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={shelter.petFriendly}
                        onChange={(e) => updateShelter(shelter.id, 'petFriendly', e.target.checked)}
                        className="mr-2"
                      />
                      Pet Friendly
                    </label>
                    
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={shelter.adaCompliant}
                        onChange={(e) => updateShelter(shelter.id, 'adaCompliant', e.target.checked)}
                        className="mr-2"
                      />
                      ADA Compliant
                    </label>
                  </div>
                  
                  {/* Utilization Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Utilization</span>
                      <span>{Math.round((shelter.currentOccupancy / shelter.capacity) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (shelter.currentOccupancy / shelter.capacity) > 0.9 
                            ? 'bg-red-500' 
                            : (shelter.currentOccupancy / shelter.capacity) > 0.7 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((shelter.currentOccupancy / shelter.capacity) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!sheltering.sheltersList || sheltering.sheltersList.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No shelters added yet. Click "Add Shelter" to begin.
                </div>
              )}
            </div>
            
            {/* Totals Summary */}
            {sheltering.sheltersList && sheltering.sheltersList.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Shelters:</span>
                    <span className="ml-2 font-bold">{sheltering.sheltersList.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Capacity:</span>
                    <span className="ml-2 font-bold">{calculateTotalCapacity()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Occupancy:</span>
                    <span className="ml-2 font-bold">{calculateTotalOccupancy()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Additional Metrics */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Additional Shelter Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 45: Shelter Staff
                </label>
                <input
                  type="number"
                  value={sheltering.shelterStaff || ''}
                  onChange={(e) => handleUpdate('shelterStaff', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 46: Shelter Volunteers
                </label>
                <input
                  type="number"
                  value={sheltering.shelterVolunteers || ''}
                  onChange={(e) => handleUpdate('shelterVolunteers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 47: Hotels Utilized
                </label>
                <input
                  type="number"
                  value={sheltering.hotelsUtilized || ''}
                  onChange={(e) => handleUpdate('hotelsUtilized', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 48: Hotel Rooms
                </label>
                <input
                  type="number"
                  value={sheltering.hotelRooms || ''}
                  onChange={(e) => handleUpdate('hotelRooms', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operational Notes
            </label>
            <textarea
              value={sheltering.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Enter any operational notes, special needs populations, accessibility concerns..."
            />
          </div>
          
          {/* Last Updated */}
          <div className="text-sm text-gray-500 text-right">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}