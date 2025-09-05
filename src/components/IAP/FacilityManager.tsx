/**
 * Facility Manager - Core IAP facility management interface
 * 
 * This component handles the creation and management of facilities,
 * which are the foundation of the IAP system. Each facility becomes
 * part of the Work Sites Table and Work Assignments sections.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  IAPFacility, 
  FacilityType, 
  FacilityStatus,
  ServiceLine,
  User 
} from '../../types';
import { iapProjector } from '../../lib/projections/IAPProjector';
import { EventType, createEvent } from '../../lib/events/types';

interface FacilityManagerProps {
  operationId: string;
  user: User;
}

export const FacilityManager: React.FC<FacilityManagerProps> = ({
  operationId,
  user
}) => {
  const [facilities, setFacilities] = useState<IAPFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<IAPFacility | null>(null);

  useEffect(() => {
    loadFacilities();
  }, [operationId]);

  const loadFacilities = async () => {
    try {
      const facilityList = iapProjector.getFacilitiesForOperation(operationId);
      setFacilities(facilityList);
    } catch (error) {
      console.error('Error loading facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFacility = async (facilityData: Partial<IAPFacility>) => {
    try {
      const event = createEvent(
        EventType.FACILITY_CREATED,
        {
          facilityType: facilityData.facilityType,
          name: facilityData.name,
          address: facilityData.address,
          city: facilityData.city,
          state: facilityData.state,
          zip: facilityData.zip,
          county: facilityData.county,
          primaryContact: facilityData.contact?.primaryName,
          primaryPhone: facilityData.contact?.primaryPhone,
          serviceLines: facilityData.serviceLines || []
        },
        {
          actorId: user.id,
          operationId
        }
      );

      await iapProjector.processEvent(event);
      await loadFacilities();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating facility:', error);
      alert('Failed to create facility');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-gray-600 mt-1">
            Manage operational facilities and their assignments
          </p>
        </div>
        
        {user.iapRole !== 'field' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Add New Facility
          </button>
        )}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            user={user}
            onClick={() => setSelectedFacility(facility)}
          />
        ))}
        
        {facilities.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Facilities Yet
            </h2>
            <p className="text-gray-600 mb-4">
              Create your first facility to start building the IAP
            </p>
            {user.iapRole !== 'field' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Create First Facility
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Facility Modal */}
      {showCreateForm && (
        <CreateFacilityModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateFacility}
        />
      )}

      {/* Facility Details Modal */}
      {selectedFacility && (
        <FacilityDetailsModal
          facility={selectedFacility}
          user={user}
          onClose={() => setSelectedFacility(null)}
          onUpdate={loadFacilities}
        />
      )}
    </div>
  );
};

interface FacilityCardProps {
  facility: IAPFacility;
  user: User;
  onClick: () => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, user, onClick }) => {
  const canAccess = iapProjector.checkFacilityAccess(user.id, user.iapRole, facility.id);
  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-800',
    setup: 'bg-blue-100 text-blue-800',
    operational: 'bg-green-100 text-green-800',
    closing: 'bg-orange-100 text-orange-800',
    closed: 'bg-gray-100 text-gray-800',
    standby: 'bg-purple-100 text-purple-800'
  };

  return (
    <button
      onClick={onClick}
      disabled={!canAccess}
      className={`bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow ${
        !canAccess ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{facility.name}</h3>
          <p className="text-sm text-gray-600 capitalize">
            {facility.facilityType.replace('_', ' ')}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[facility.status]}`}>
          {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          {facility.city}, {facility.county} County
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">👥</span>
          {facility.personnel.length} Personnel
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🏠</span>
          {facility.capacity.currentOccupancy || 0} / {facility.capacity.totalCapacity || 0} Capacity
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-1">
          {facility.serviceLines.slice(0, 3).map((service) => (
            <span
              key={service}
              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
            >
              {service.replace('_', ' ')}
            </span>
          ))}
          {facility.serviceLines.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{facility.serviceLines.length - 3} more
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

interface CreateFacilityModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<IAPFacility>) => void;
}

const CreateFacilityModal: React.FC<CreateFacilityModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    facilityType: 'shelter' as FacilityType,
    address: '',
    city: '',
    state: '',
    zip: '',
    county: '',
    primaryContact: '',
    primaryPhone: '',
    serviceLines: [] as ServiceLine[]
  });

  const facilityTypes: { value: FacilityType; label: string }[] = [
    { value: 'shelter', label: 'Shelter' },
    { value: 'feeding', label: 'Feeding Site' },
    { value: 'distribution', label: 'Distribution Center' },
    { value: 'mobile_unit', label: 'Mobile Unit' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'command_post', label: 'Command Post' },
    { value: 'staging_area', label: 'Staging Area' },
    { value: 'reception_center', label: 'Reception Center' },
    { value: 'other', label: 'Other' }
  ];

  const serviceLineOptions: { value: ServiceLine; label: string }[] = [
    { value: 'feeding', label: 'Feeding' },
    { value: 'sheltering', label: 'Sheltering' },
    { value: 'distribution', label: 'Distribution' },
    { value: 'health_services', label: 'Health Services' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'spiritual_care', label: 'Spiritual Care' },
    { value: 'reunification', label: 'Reunification' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'it_telecom', label: 'IT/Telecom' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      contact: {
        primaryName: formData.primaryContact,
        primaryPhone: formData.primaryPhone
      }
    });
  };

  const handleServiceLineChange = (serviceLine: ServiceLine, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        serviceLines: [...prev.serviceLines, serviceLine]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        serviceLines: prev.serviceLines.filter(s => s !== serviceLine)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Facility</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Type *
              </label>
              <select
                required
                value={formData.facilityType}
                onChange={(e) => setFormData(prev => ({ ...prev, facilityType: e.target.value as FacilityType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {facilityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                required
                value={formData.zip}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County *
              </label>
              <input
                type="text"
                required
                value={formData.county}
                onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Contact *
              </label>
              <input
                type="text"
                required
                value={formData.primaryContact}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.primaryPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Lines
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {serviceLineOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.serviceLines.includes(option.value)}
                    onChange={(e) => handleServiceLineChange(option.value, e.target.checked)}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Create Facility
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FacilityDetailsModalProps {
  facility: IAPFacility;
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

const FacilityDetailsModal: React.FC<FacilityDetailsModalProps> = ({ 
  facility, 
  user, 
  onClose, 
  onUpdate 
}) => {
  const canEdit = user.iapRole === 'ip_group' || 
    (user.iapRole === 'discipline' && 
     iapProjector.checkFacilityAccess(user.id, user.iapRole, facility.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{facility.name}</h2>
              <p className="text-gray-600 capitalize">
                {facility.facilityType.replace('_', ' ')} • {facility.status}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{facility.address}</p>
                <p>{facility.city}, {facility.state} {facility.zip}</p>
                <p>{facility.county} County</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{facility.contact.primaryName}</p>
                <p>{facility.contact.primaryPhone}</p>
                {facility.contact.primaryEmail && (
                  <p>{facility.contact.primaryEmail}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Capacity</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Total: {facility.capacity.totalCapacity || 0}</p>
                <p>Current: {facility.capacity.currentOccupancy || 0}</p>
                <p>Available: {facility.capacity.availableSpace || 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Personnel</h3>
              <div className="space-y-2">
                {facility.personnel.length === 0 ? (
                  <p className="text-sm text-gray-500">No personnel assigned</p>
                ) : (
                  facility.personnel.map(person => (
                    <div key={person.id} className="text-sm text-gray-600">
                      {person.position} {person.isLeader && '(Leader)'}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Service Lines</h3>
            <div className="flex flex-wrap gap-2">
              {facility.serviceLines.map(service => (
                <span
                  key={service}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full"
                >
                  {service.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {canEdit && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Edit Facility
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
