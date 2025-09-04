/**
 * ICS Form 215 Guided Entry Interface
 * 
 * A simplified, focused interface for entering one resource at a time
 * Designed for stressed, non-technical users who need clear guidance
 */

import React, { useState, useEffect } from 'react';
import { 
  ServiceLineType,
  ICSResource,
  ShelterResource,
  KitchenResource,
  MobileFeedingResource,
  DistributionResource
} from '../../types/ics-215-grid-types';
import { getServiceLineDisplayName } from '../../config/ics215-service-lines';
import { useICS215GridStore } from '../../stores/useICS215GridStore';

interface Props {
  onSave?: (resource: ICSResource) => void;
  onCancel?: () => void;
  existingResource?: ICSResource;
}

export function ICS215GuidedEntry({ onSave, onCancel, existingResource }: Props) {
  // Connect to central store
  const addResource = useICS215GridStore(state => state.addResource);
  const updateResource = useICS215GridStore(state => state.updateResource);
  
  // State
  const [step, setStep] = useState(1);
  const [resourceType, setResourceType] = useState<ServiceLineType | null>(null);
  const [formData, setFormData] = useState<Partial<ICSResource>>({
    status: 'green',
    lastUpdated: new Date()
  });
  const [savedMessage, setSavedMessage] = useState('');

  // Auto-save indicator
  useEffect(() => {
    if (savedMessage) {
      const timer = setTimeout(() => setSavedMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [savedMessage]);

  // Handle resource type selection
  const selectResourceType = (type: ServiceLineType) => {
    setResourceType(type);
    setStep(2);
    
    // Initialize with appropriate defaults
    switch (type) {
      case 'sheltering':
        setFormData({
          type: 'shelter',
          status: 'green',
          capacity: 0,
          currentOccupancy: 0,
          dailyData: {},
          lastUpdated: new Date()
        } as Partial<ShelterResource>);
        break;
      case 'kitchen':
        setFormData({
          type: 'kitchen',
          status: 'green',
          mealsCapacity: 0,
          mealsServed: 0,
          dailyData: {},
          lastUpdated: new Date()
        } as Partial<KitchenResource>);
        break;
      case 'mobile-feeding':
        setFormData({
          type: 'mobile-feeding',
          status: 'green',
          crewSize: 3,
          dailyData: {},
          lastUpdated: new Date()
        } as Partial<MobileFeedingResource>);
        break;
      case 'distribution':
        setFormData({
          type: 'distribution',
          status: 'green',
          distributionType: 'bulk',
          dailyData: {},
          lastUpdated: new Date()
        } as Partial<DistributionResource>);
        break;
      default:
        setFormData({
          status: 'green',
          lastUpdated: new Date()
        });
    }
  };

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save and continue
  const saveAndContinue = () => {
    setSavedMessage('✓ Saved');
    if (step < 4) {
      setStep(step + 1);
    }
  };

  // Final save
  const handleFinalSave = () => {
    if (!resourceType) return;
    
    const resource: ICSResource = {
      id: existingResource?.id || Date.now().toString(),
      ...formData,
      lastUpdated: new Date()
    } as ICSResource;
    
    // Save to central store
    if (existingResource) {
      updateResource(resourceType, existingResource.id, resource);
    } else {
      addResource(resourceType, resource);
    }
    
    // Call optional onSave callback
    if (onSave) {
      onSave(resource);
    }
    
    // Show success message
    setSavedMessage('✓ Resource saved successfully!');
    
    // Reset for next entry after delay
    setTimeout(() => {
      setStep(1);
      setResourceType(null);
      setFormData({ status: 'green', lastUpdated: new Date() });
      setSavedMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Resource
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 4 • {resourceType ? getServiceLineDisplayName(resourceType) : 'Select Type'}
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={`w-12 h-2 rounded-full transition-colors ${
                      s <= step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              {savedMessage && (
                <div className="text-green-600 font-medium animate-fade-in">
                  {savedMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Choose Resource Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What type of resource are you adding?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectResourceType('sheltering')}
                  className="p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-500 border-2 border-gray-200 transition-all text-left"
                >
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="font-semibold text-gray-900">Shelter</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Emergency housing facility
                  </div>
                </button>
                
                <button
                  onClick={() => selectResourceType('kitchen')}
                  className="p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-500 border-2 border-gray-200 transition-all text-left"
                >
                  <div className="text-2xl mb-2">🍳</div>
                  <div className="font-semibold text-gray-900">Kitchen</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Fixed feeding location
                  </div>
                </button>
                
                <button
                  onClick={() => selectResourceType('mobile-feeding')}
                  className="p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-500 border-2 border-gray-200 transition-all text-left"
                >
                  <div className="text-2xl mb-2">🚐</div>
                  <div className="font-semibold text-gray-900">Mobile Feeding</div>
                  <div className="text-sm text-gray-600 mt-1">
                    ERV or mobile kitchen unit
                  </div>
                </button>
                
                <button
                  onClick={() => selectResourceType('distribution')}
                  className="p-6 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-500 border-2 border-gray-200 transition-all text-left"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold text-gray-900">Distribution</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Supply distribution point
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && resourceType && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {resourceType === 'mobile-feeding' ? 'Unit Name' : 'Site Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={resourceType === 'sheltering' ? 'e.g., Fort Myers Convention Center' : 'Enter name'}
                    autoFocus
                  />
                </div>

                {resourceType !== 'mobile-feeding' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <select
                      value={formData.county || ''}
                      onChange={(e) => updateField('county', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select County</option>
                      <option value="Lee">Lee</option>
                      <option value="Charlotte">Charlotte</option>
                      <option value="Collier">Collier</option>
                      <option value="Sarasota">Sarasota</option>
                      <option value="Hardee">Hardee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Contact
                  </label>
                  <input
                    type="text"
                    value={formData.primaryContact || ''}
                    onChange={(e) => updateField('primaryContact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contact person name"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={saveAndContinue}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!formData.name}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Capacity Information */}
        {step === 3 && resourceType && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Capacity & Operations
              </h2>
              
              <div className="space-y-4">
                {resourceType === 'sheltering' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Capacity
                        </label>
                        <input
                          type="number"
                          value={(formData as ShelterResource).capacity || 0}
                          onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Number of beds"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Occupancy
                        </label>
                        <input
                          type="number"
                          value={(formData as ShelterResource).currentOccupancy || 0}
                          onChange={(e) => updateField('currentOccupancy', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Current residents"
                        />
                      </div>
                    </div>
                    
                    {(formData as ShelterResource).capacity > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">
                          Occupancy Rate: {Math.round(((formData as ShelterResource).currentOccupancy / (formData as ShelterResource).capacity) * 100)}%
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          {(formData as ShelterResource).capacity - (formData as ShelterResource).currentOccupancy} beds available
                        </div>
                      </div>
                    )}
                  </>
                )}

                {resourceType === 'kitchen' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meals per Day Capacity
                      </label>
                      <input
                        type="number"
                        value={(formData as KitchenResource).mealsCapacity || 0}
                        onChange={(e) => updateField('mealsCapacity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Total meals"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meal Types Served
                      </label>
                      <select
                        value={(formData as KitchenResource).mealType || 'all'}
                        onChange={(e) => updateField('mealType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Meals</option>
                        <option value="breakfast">Breakfast Only</option>
                        <option value="lunch">Lunch Only</option>
                        <option value="dinner">Dinner Only</option>
                      </select>
                    </div>
                  </div>
                )}

                {resourceType === 'mobile-feeding' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vehicle Number
                        </label>
                        <input
                          type="text"
                          value={(formData as MobileFeedingResource).vehicleNumber || ''}
                          onChange={(e) => updateField('vehicleNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ERV-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Crew Size
                        </label>
                        <input
                          type="number"
                          value={(formData as MobileFeedingResource).crewSize || 3}
                          onChange={(e) => updateField('crewSize', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route/Area
                      </label>
                      <input
                        type="text"
                        value={(formData as MobileFeedingResource).routeName || ''}
                        onChange={(e) => updateField('routeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., North Fort Myers Route"
                      />
                    </div>
                  </>
                )}

                {resourceType === 'distribution' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distribution Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          value="bulk"
                          checked={(formData as DistributionResource).distributionType === 'bulk'}
                          onChange={(e) => updateField('distributionType', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Bulk Distribution</div>
                          <div className="text-sm text-gray-600">Large quantities to organizations</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          value="individual"
                          checked={(formData as DistributionResource).distributionType === 'individual'}
                          onChange={(e) => updateField('distributionType', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Individual</div>
                          <div className="text-sm text-gray-600">Direct to disaster survivors</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={saveAndContinue}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Status & Notes */}
        {step === 4 && resourceType && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Status & Notes
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Current Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.status === 'green' 
                        ? 'bg-green-50 border-green-500' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        value="green"
                        checked={formData.status === 'green'}
                        onChange={(e) => updateField('status', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium">Operational</div>
                        <div className="text-xs text-gray-600">Fully functional</div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.status === 'yellow' 
                        ? 'bg-yellow-50 border-yellow-500' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        value="yellow"
                        checked={formData.status === 'yellow'}
                        onChange={(e) => updateField('status', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium">Limited</div>
                        <div className="text-xs text-gray-600">Some issues</div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.status === 'red' 
                        ? 'bg-red-50 border-red-500' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        value="red"
                        checked={formData.status === 'red'}
                        onChange={(e) => updateField('status', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-medium">Critical</div>
                        <div className="text-xs text-gray-600">Needs attention</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions or important information..."
                  />
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Review Your Entry</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Type:</span>
                  <span className="font-medium text-blue-900">{getServiceLineDisplayName(resourceType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Name:</span>
                  <span className="font-medium text-blue-900">{formData.name || 'Not set'}</span>
                </div>
                {formData.address && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Location:</span>
                    <span className="font-medium text-blue-900">{formData.county || 'Unknown County'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className={`font-medium capitalize ${
                    formData.status === 'green' ? 'text-green-600' :
                    formData.status === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setResourceType(null);
                    setFormData({ status: 'green', lastUpdated: new Date() });
                  }}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Add Another
                </button>
                <button
                  onClick={handleFinalSave}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ Save Resource
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}