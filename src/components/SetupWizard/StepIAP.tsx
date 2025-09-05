/**
 * Setup Wizard - IAP Configuration Step
 * 
 * This step allows users to configure initial IAP settings during operation setup,
 * including IAP roles, initial facilities, and document preferences.
 */

'use client';

import React, { useState } from 'react';
import { 
  IAPRole, 
  FacilityType, 
  ServiceLine,
  User
} from '../../types';

interface StepIAPProps {
  onNext: (data: IAPSetupData) => void;
  onBack: () => void;
  initialData?: Partial<IAPSetupData>;
  user: User;
}

export interface IAPSetupData {
  enableIAP: boolean;
  userIAPRole: IAPRole;
  initialFacilities: InitialFacility[];
  generateDaily: boolean;
  sixPMSnapshots: boolean;
  distributionList: string[];
  iapPreferences: IAPPreferences;
}

interface InitialFacility {
  name: string;
  type: FacilityType;
  serviceLines: ServiceLine[];
  estimatedPersonnel: number;
}

interface IAPPreferences {
  includePhotos: boolean;
  includeDirectorsMessage: boolean;
  includeAncillaryContent: boolean;
  defaultOperationalPeriod: number; // hours
  autoGenerateContacts: boolean;
}

export const StepIAP: React.FC<StepIAPProps> = ({
  onNext,
  onBack,
  initialData = {},
  user
}) => {
  const [data, setData] = useState<IAPSetupData>({
    enableIAP: initialData.enableIAP ?? true,
    userIAPRole: initialData.userIAPRole ?? 'ip_group',
    initialFacilities: initialData.initialFacilities ?? [],
    generateDaily: initialData.generateDaily ?? true,
    sixPMSnapshots: initialData.sixPMSnapshots ?? true,
    distributionList: initialData.distributionList ?? [],
    iapPreferences: {
      includePhotos: true,
      includeDirectorsMessage: true,
      includeAncillaryContent: true,
      defaultOperationalPeriod: 24,
      autoGenerateContacts: true,
      ...initialData.iapPreferences
    }
  });

  const [showAddFacility, setShowAddFacility] = useState(false);
  const [newFacility, setNewFacility] = useState<InitialFacility>({
    name: '',
    type: 'shelter',
    serviceLines: [],
    estimatedPersonnel: 0
  });

  const facilityTypes: { value: FacilityType; label: string; description: string }[] = [
    { value: 'shelter', label: 'Shelter', description: 'Emergency housing for displaced individuals' },
    { value: 'feeding', label: 'Feeding Site', description: 'Mobile or fixed feeding operations' },
    { value: 'distribution', label: 'Distribution Center', description: 'Relief supply distribution' },
    { value: 'mobile_unit', label: 'Mobile Unit', description: 'Mobile response vehicles' },
    { value: 'warehouse', label: 'Warehouse', description: 'Supply storage and logistics' },
    { value: 'kitchen', label: 'Kitchen', description: 'Food preparation facility' },
    { value: 'command_post', label: 'Command Post', description: 'Operational command center' },
    { value: 'staging_area', label: 'Staging Area', description: 'Personnel and equipment staging' },
    { value: 'reception_center', label: 'Reception Center', description: 'Client intake and processing' },
    { value: 'other', label: 'Other', description: 'Custom facility type' }
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

  const iapRoleOptions: { value: IAPRole; label: string; description: string }[] = [
    { 
      value: 'ip_group', 
      label: 'Information & Planning Group', 
      description: 'Full access to all IAP components and editing' 
    },
    { 
      value: 'discipline', 
      label: 'Discipline Team Member', 
      description: 'Access to specific facilities and assignments' 
    },
    { 
      value: 'field', 
      label: 'Field Team Member', 
      description: 'Read-only access to assignments and schedules' 
    },
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'View-only access to published IAPs' 
    }
  ];

  const handleAddFacility = () => {
    if (newFacility.name && newFacility.serviceLines.length > 0) {
      setData(prev => ({
        ...prev,
        initialFacilities: [...prev.initialFacilities, { ...newFacility }]
      }));
      setNewFacility({
        name: '',
        type: 'shelter',
        serviceLines: [],
        estimatedPersonnel: 0
      });
      setShowAddFacility(false);
    }
  };

  const handleRemoveFacility = (index: number) => {
    setData(prev => ({
      ...prev,
      initialFacilities: prev.initialFacilities.filter((_, i) => i !== index)
    }));
  };

  const handleServiceLineChange = (serviceLine: ServiceLine, checked: boolean) => {
    if (checked) {
      setNewFacility(prev => ({
        ...prev,
        serviceLines: [...prev.serviceLines, serviceLine]
      }));
    } else {
      setNewFacility(prev => ({
        ...prev,
        serviceLines: prev.serviceLines.filter(s => s !== serviceLine)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">IAP Configuration</h2>
          <p className="text-gray-600 mt-2">
            Configure Incident Action Plan generation and management settings
          </p>
        </div>

        {/* Enable IAP */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableIAP"
              checked={data.enableIAP}
              onChange={(e) => setData(prev => ({ ...prev, enableIAP: e.target.checked }))}
              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="enableIAP" className="text-lg font-medium text-gray-900">
                Enable IAP Generation
              </label>
              <p className="text-sm text-gray-600">
                Generate professional 53-page Incident Action Plans from operational data
              </p>
            </div>
          </div>
        </div>

        {data.enableIAP && (
          <>
            {/* IAP Role */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your IAP Role</h3>
              <div className="space-y-3">
                {iapRoleOptions.map(role => (
                  <label key={role.value} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="iapRole"
                      value={role.value}
                      checked={data.userIAPRole === role.value}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        userIAPRole: e.target.value as IAPRole 
                      }))}
                      className="mt-1 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Initial Facilities */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Initial Facilities</h3>
                <button
                  type="button"
                  onClick={() => setShowAddFacility(true)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Add Facility
                </button>
              </div>

              {data.initialFacilities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏢</div>
                  <p>No facilities configured yet</p>
                  <p className="text-sm">Add facilities to get started with IAP generation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.initialFacilities.map((facility, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">{facility.name}</div>
                        <div className="text-sm text-gray-600">
                          {facilityTypes.find(t => t.value === facility.type)?.label} • 
                          {facility.serviceLines.length} service line(s) • 
                          {facility.estimatedPersonnel} personnel
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Facility Modal */}
              {showAddFacility && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Add Initial Facility</h4>
                        <button
                          type="button"
                          onClick={() => setShowAddFacility(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facility Name
                        </label>
                        <input
                          type="text"
                          value={newFacility.name}
                          onChange={(e) => setNewFacility(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., Downtown Shelter"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facility Type
                        </label>
                        <select
                          value={newFacility.type}
                          onChange={(e) => setNewFacility(prev => ({ 
                            ...prev, 
                            type: e.target.value as FacilityType 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {facilityTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Lines
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {serviceLineOptions.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newFacility.serviceLines.includes(option.value)}
                                onChange={(e) => handleServiceLineChange(option.value, e.target.checked)}
                                className="mr-2 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Personnel
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newFacility.estimatedPersonnel}
                          onChange={(e) => setNewFacility(prev => ({ 
                            ...prev, 
                            estimatedPersonnel: parseInt(e.target.value) || 0 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowAddFacility(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddFacility}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Add Facility
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* IAP Generation Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.generateDaily}
                    onChange={(e) => setData(prev => ({ ...prev, generateDaily: e.target.checked }))}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Generate Daily IAPs</div>
                    <div className="text-sm text-gray-600">Automatically create new IAP each operational period</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.sixPMSnapshots}
                    onChange={(e) => setData(prev => ({ ...prev, sixPMSnapshots: e.target.checked }))}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">6PM Official Snapshots</div>
                    <div className="text-sm text-gray-600">Create locked snapshots at 6PM for official distribution</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={data.iapPreferences.autoGenerateContacts}
                    onChange={(e) => setData(prev => ({ 
                      ...prev, 
                      iapPreferences: { ...prev.iapPreferences, autoGenerateContacts: e.target.checked }
                    }))}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Auto-Generate Contact Roster</div>
                    <div className="text-sm text-gray-600">Automatically populate contacts from personnel assignments</div>
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};
