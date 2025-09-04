/**
 * ICS Form 215 Guided Entry V3
 * 
 * Multi-step wizard that includes:
 * 1. Resource Type Selection
 * 2. Location Details  
 * 3. GAP Positions (personnel needs for this location)
 * 4. General Resources (supplies/equipment for this location)
 * 5. Review & Save
 */

import React, { useState } from 'react';
import { useICS215GridStore } from '../../stores/useICS215GridStore';
import { ICSResource, ServiceLineType } from '../../types/ics-215-grid-types';
import { 
  COMMON_GAP_POSITIONS, 
  RC_DIVISIONS, 
  RC_FUNCTIONS, 
  RC_LEVELS,
  GAPPosition 
} from '../../config/redCrossGAPPositions';

interface GAPNeed {
  position: GAPPosition;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

interface ResourceNeed {
  category: 'vehicles' | 'equipment' | 'supplies' | 'facilities';
  type: string;
  required: number;
  have: number;
  need?: number; // Calculated as required - have
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

export function ICS215GuidedEntryV3() {
  const addResource = useICS215GridStore(state => state.addResource);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [savedMessage, setSavedMessage] = useState('');
  
  // Step 1: Resource Type
  const [resourceType, setResourceType] = useState<ServiceLineType | ''>('');
  
  // Step 2: Location Details
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    county: '',
    primaryContact: '',
    phone: '',
    capacity: 0,
    currentOccupancy: 0,
    status: 'green' as 'green' | 'yellow' | 'red',
    notes: ''
  });
  
  // Step 3: GAP Positions
  const [gapNeeds, setGapNeeds] = useState<GAPNeed[]>([]);
  const [currentGAP, setCurrentGAP] = useState<Partial<GAPNeed>>({
    position: undefined,
    quantity: 1,
    priority: 'medium',
    notes: ''
  });
  
  // Step 4: General Resources
  const [resourceNeeds, setResourceNeeds] = useState<ResourceNeed[]>([]);
  const [currentResource, setCurrentResource] = useState<Partial<ResourceNeed>>({
    category: undefined,
    type: '',
    required: 0,
    have: 0,
    priority: 'medium',
    notes: ''
  });

  const steps = [
    { number: 1, title: 'Resource Type', icon: '📍' },
    { number: 2, title: 'Location Details', icon: '📝' },
    { number: 3, title: 'Personnel (GAP)', icon: '👥' },
    { number: 4, title: 'Resources', icon: '📦' },
    { number: 5, title: 'Review & Save', icon: '✅' }
  ];

  const addGAPNeed = () => {
    if (currentGAP.position) {
      setGapNeeds([...gapNeeds, currentGAP as GAPNeed]);
      setCurrentGAP({
        position: undefined,
        quantity: 1,
        priority: 'medium',
        notes: ''
      });
    }
  };

  const addResourceNeed = () => {
    if (currentResource.category && currentResource.type) {
      const need = {
        ...currentResource,
        need: (currentResource.required || 0) - (currentResource.have || 0)
      } as ResourceNeed;
      setResourceNeeds([...resourceNeeds, need]);
      setCurrentResource({
        category: undefined,
        type: '',
        required: 0,
        have: 0,
        priority: 'medium',
        notes: ''
      });
    }
  };

  const saveComplete = () => {
    if (!resourceType) return;
    
    // Create main resource entry
    const resource: ICSResource = {
      id: Date.now().toString(),
      type: resourceType as any,
      name: locationData.name,
      address: locationData.address,
      primaryContact: locationData.primaryContact,
      phone: locationData.phone,
      status: locationData.status,
      notes: `${locationData.notes}\n\nGAP Needs: ${gapNeeds.length}\nResource Needs: ${resourceNeeds.length}`,
      lastUpdated: new Date(),
      dailyData: {}
    } as ICSResource;
    
    // Add type-specific fields
    if (resourceType === 'sheltering') {
      (resource as any).capacity = locationData.capacity;
      (resource as any).currentOccupancy = locationData.currentOccupancy;
      (resource as any).manager = locationData.primaryContact;
    }
    
    addResource(resourceType, resource);
    
    // Also save GAP positions as separate entries
    gapNeeds.forEach((gap, index) => {
      const gapResource: ICSResource = {
        id: `${Date.now()}-gap-${index}`,
        type: 'individual-care' as any,
        name: `${gap.position.code} for ${locationData.name}`,
        primaryContact: '',
        phone: '',
        address: locationData.address,
        notes: `${gap.position.title}\nQuantity Needed: ${gap.quantity}\nPriority: ${gap.priority}\n${gap.notes}`,
        status: gap.priority === 'critical' ? 'red' : gap.priority === 'high' ? 'yellow' : 'green',
        lastUpdated: new Date(),
        dailyData: {}
      } as ICSResource;
      addResource('individual-care', gapResource);
    });
    
    setSavedMessage(`✓ ${locationData.name} saved with ${gapNeeds.length} GAP positions and ${resourceNeeds.length} resources!`);
    setTimeout(() => {
      setSavedMessage('');
      // Reset all fields
      setCurrentStep(1);
      setResourceType('');
      setLocationData({
        name: '',
        address: '',
        county: '',
        primaryContact: '',
        phone: '',
        capacity: 0,
        currentOccupancy: 0,
        status: 'green',
        notes: ''
      });
      setGapNeeds([]);
      setResourceNeeds([]);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Resource Entry Wizard</h1>
            {savedMessage && (
              <div className="text-green-600 font-medium animate-fade-in">
                {savedMessage}
              </div>
            )}
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center ${currentStep === step.number ? 'text-blue-600' : currentStep > step.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step.number ? 'bg-blue-100 border-2 border-blue-600' :
                    currentStep > step.number ? 'bg-green-100 border-2 border-green-600' :
                    'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {currentStep > step.number ? '✓' : step.icon}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className="text-xs font-medium">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${currentStep > step.number ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Resource Type Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              What type of resource are you setting up?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'sheltering' as ServiceLineType, label: 'Emergency Shelter', icon: '🏠', desc: 'Overnight sheltering facility' },
                { type: 'kitchen' as ServiceLineType, label: 'Fixed Feeding Site', icon: '🍽️', desc: 'Kitchen or meal preparation site' },
                { type: 'mobile-feeding' as ServiceLineType, label: 'Mobile Feeding', icon: '🚐', desc: 'ERV or mobile canteen' },
                { type: 'distribution' as ServiceLineType, label: 'Distribution Site', icon: '📦', desc: 'Emergency supplies distribution' }
              ].map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => {
                    setResourceType(type);
                    setCurrentStep(2);
                  }}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-500 text-left"
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="font-semibold text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600 mt-1">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Location Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {resourceType === 'sheltering' ? 'Shelter Name' : 
                       resourceType === 'kitchen' ? 'Kitchen Name' :
                       resourceType === 'mobile-feeding' ? 'ERV/Unit ID' :
                       'Site Name'} *
                    </label>
                    <input
                      type="text"
                      value={locationData.name}
                      onChange={(e) => setLocationData({...locationData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Lee County Civic Center"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      value={locationData.county}
                      onChange={(e) => setLocationData({...locationData, county: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Lee County"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={locationData.address}
                    onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Full street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Contact
                    </label>
                    <input
                      type="text"
                      value={locationData.primaryContact}
                      onChange={(e) => setLocationData({...locationData, primaryContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={locationData.phone}
                      onChange={(e) => setLocationData({...locationData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </div>
                </div>

                {(resourceType === 'sheltering' || resourceType === 'kitchen') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {resourceType === 'sheltering' ? 'Max Capacity' : 'Meals per Day Capacity'}
                      </label>
                      <input
                        type="number"
                        value={locationData.capacity}
                        onChange={(e) => setLocationData({...locationData, capacity: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {resourceType === 'sheltering' ? 'Current Occupancy' : 'Meals Served Today'}
                      </label>
                      <input
                        type="number"
                        value={locationData.currentOccupancy}
                        onChange={(e) => setLocationData({...locationData, currentOccupancy: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operational Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'green', label: 'Operational', color: 'bg-green-500' },
                      { value: 'yellow', label: 'Limited', color: 'bg-yellow-500' },
                      { value: 'red', label: 'Critical', color: 'bg-red-500' }
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setLocationData({...locationData, status: value as any})}
                        className={`py-2 px-4 rounded-lg font-medium transition-all ${
                          locationData.status === value
                            ? `${color} text-white`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!locationData.name}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                Next: Personnel Needs →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: GAP Positions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Personnel Needs (GAP Positions)
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Add Red Cross personnel positions needed for {locationData.name || 'this location'}
              </p>
              
              {/* Current GAP Positions */}
              {gapNeeds.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Added Positions:</div>
                  <div className="space-y-2">
                    {gapNeeds.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-mono font-bold text-sm">{gap.position.code}</span>
                          <span className="ml-2 text-sm text-gray-600">{gap.position.title}</span>
                          <span className="ml-2 text-sm">× {gap.quantity}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          gap.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {gap.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New GAP Position */}
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Add Position:</div>
                
                {/* Quick Select */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-600 mb-2">Quick Select Common Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_GAP_POSITIONS.slice(0, 6).map(gap => (
                      <button
                        key={gap.code}
                        onClick={() => setCurrentGAP({...currentGAP, position: gap})}
                        className={`p-2 text-left rounded border transition-all text-sm ${
                          currentGAP.position?.code === gap.code
                            ? 'bg-red-50 border-red-500'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-mono font-bold text-xs">{gap.code}</div>
                        <div className="text-xs text-gray-600">{gap.title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {currentGAP.position && (
                  <div className="p-3 bg-red-50 rounded mb-4">
                    <div className="font-mono font-bold">{currentGAP.position.code}</div>
                    <div className="text-sm text-gray-700">{currentGAP.position.title}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Quantity Needed</label>
                    <input
                      type="number"
                      value={currentGAP.quantity}
                      onChange={(e) => setCurrentGAP({...currentGAP, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Priority</label>
                    <select
                      value={currentGAP.priority}
                      onChange={(e) => setCurrentGAP({...currentGAP, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addGAPNeed}
                  disabled={!currentGAP.position}
                  className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  Add Position
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next: Resource Needs →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: General Resources */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Resource & Supply Needs
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Add equipment, supplies, and other resources needed for {locationData.name || 'this location'}
              </p>
              
              {/* Current Resources */}
              {resourceNeeds.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Added Resources:</div>
                  <div className="space-y-2">
                    {resourceNeeds.map((res, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-sm">{res.type}</span>
                          <span className="ml-2 text-sm text-gray-600">({res.category})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            <span className="text-gray-600">Req:</span> {res.required} |
                            <span className="text-gray-600 ml-1">Have:</span> {res.have} |
                            <span className={`ml-1 font-medium ${res.need! > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              Need: {res.need}
                            </span>
                          </span>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            res.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            res.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            res.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {res.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Resource */}
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Add Resource:</div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { value: 'vehicles', label: '🚚 Vehicles' },
                    { value: 'equipment', label: '🔧 Equipment' },
                    { value: 'supplies', label: '📦 Supplies' },
                    { value: 'facilities', label: '🏢 Facilities' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCurrentResource({...currentResource, category: value as any})}
                      className={`py-2 px-3 rounded-lg font-medium transition-all ${
                        currentResource.category === value
                          ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Resource Type</label>
                    <input
                      type="text"
                      value={currentResource.type}
                      onChange={(e) => setCurrentResource({...currentResource, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        currentResource.category === 'vehicles' ? 'e.g., Box Truck, ERV' :
                        currentResource.category === 'equipment' ? 'e.g., Generator, Radio' :
                        currentResource.category === 'supplies' ? 'e.g., Cots, Blankets, Water' :
                        'e.g., Warehouse, Staging Area'
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Required (Req)</label>
                      <input
                        type="number"
                        value={currentResource.required}
                        onChange={(e) => setCurrentResource({...currentResource, required: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Have</label>
                      <input
                        type="number"
                        value={currentResource.have}
                        onChange={(e) => setCurrentResource({...currentResource, have: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Need</label>
                      <input
                        type="number"
                        value={(currentResource.required || 0) - (currentResource.have || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-medium"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Priority</label>
                    <select
                      value={currentResource.priority}
                      onChange={(e) => setCurrentResource({...currentResource, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <button
                    onClick={addResourceNeed}
                    disabled={!currentResource.category || !currentResource.type}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    Add Resource
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Save */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Review & Save
              </h2>
              
              {/* Location Summary */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Location Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{locationData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-medium ${
                        locationData.status === 'green' ? 'text-green-600' :
                        locationData.status === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {locationData.status === 'green' ? 'Operational' :
                         locationData.status === 'yellow' ? 'Limited' : 'Critical'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2">{locationData.address || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Contact:</span>
                      <span className="ml-2">{locationData.primaryContact || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GAP Positions Summary */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Personnel Needs ({gapNeeds.length} positions)
                </h3>
                {gapNeeds.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {gapNeeds.map((gap, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            <span className="font-mono font-bold">{gap.position.code}</span>
                            <span className="ml-2 text-gray-600">{gap.position.title}</span>
                          </span>
                          <span>
                            {gap.quantity} needed
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              gap.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {gap.priority}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No personnel positions added</div>
                )}
              </div>

              {/* Resources Summary */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Resource Needs ({resourceNeeds.length} items)
                </h3>
                {resourceNeeds.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {resourceNeeds.map((res, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {res.type}
                            <span className="ml-2 text-gray-600">({res.category})</span>
                          </span>
                          <span>
                            Req: {res.required} | Have: {res.have} | Need: {res.need}
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              res.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              res.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {res.priority}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No resources added</div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={saveComplete}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-lg"
              >
                Save Complete Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}