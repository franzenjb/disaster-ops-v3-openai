/**
 * ICS Form 215 Guided Entry V2
 * 
 * Redesigned with two main paths:
 * 1. GAP Positions - Red Cross personnel with 2-letter codes
 * 2. General Resources - Supplies, equipment, vehicles that vary by location
 */

import React, { useState } from 'react';
import { useICS215GridStore } from '../../stores/useICS215GridStore';
import { ICSResource } from '../../types/ics-215-grid-types';
import { 
  COMMON_GAP_POSITIONS, 
  RC_DIVISIONS, 
  RC_FUNCTIONS, 
  RC_LEVELS,
  generateGAPCode,
  GAPPosition 
} from '../../config/redCrossGAPPositions';

type EntryMode = 'choice' | 'gap' | 'resource';
type ResourceCategory = 'vehicles' | 'equipment' | 'supplies' | 'facilities';

export function ICS215GuidedEntryV2() {
  const addResource = useICS215GridStore(state => state.addResource);
  
  // State
  const [mode, setMode] = useState<EntryMode>('choice');
  const [savedMessage, setSavedMessage] = useState('');
  
  // GAP Position state
  const [selectedGAP, setSelectedGAP] = useState<GAPPosition | null>(null);
  const [gapData, setGapData] = useState({
    personName: '',
    phone: '',
    email: '',
    location: '',
    status: 'requested' as 'requested' | 'assigned' | 'deployed' | 'available',
    quantity: 1,
    notes: ''
  });
  
  // Resource state
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory | null>(null);
  const [resourceData, setResourceData] = useState({
    resourceType: '',
    description: '',
    quantity: 0,
    quantityNeeded: 0,
    location: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    notes: ''
  });

  // Save GAP position
  const saveGAPPosition = () => {
    if (!selectedGAP) return;
    
    const resource: ICSResource = {
      id: Date.now().toString(),
      type: 'individual-care' as any, // GAPs go under individual care
      name: `${selectedGAP.code} - ${gapData.personName || 'Position Needed'}`,
      primaryContact: gapData.personName,
      phone: gapData.phone,
      address: gapData.location,
      notes: `${selectedGAP.title}\n${gapData.notes}`,
      status: gapData.status === 'deployed' ? 'green' : 
              gapData.status === 'assigned' ? 'yellow' : 'red',
      lastUpdated: new Date(),
      dailyData: {}
    } as ICSResource;
    
    addResource('individual-care', resource);
    
    setSavedMessage(`✓ GAP Position ${selectedGAP.code} saved!`);
    setTimeout(() => {
      setSavedMessage('');
      setMode('choice');
      setSelectedGAP(null);
      setGapData({
        personName: '',
        phone: '',
        email: '',
        location: '',
        status: 'requested',
        quantity: 1,
        notes: ''
      });
    }, 2000);
  };

  // Save general resource
  const saveResource = () => {
    if (!resourceCategory || !resourceData.resourceType) return;
    
    const resource: ICSResource = {
      id: Date.now().toString(),
      type: 'distribution' as any, // General resources go under distribution
      name: resourceData.resourceType,
      address: resourceData.location,
      notes: `${resourceData.description}\nPriority: ${resourceData.priority}\n${resourceData.notes}`,
      status: resourceData.priority === 'critical' ? 'red' : 
              resourceData.priority === 'high' ? 'yellow' : 'green',
      lastUpdated: new Date(),
      dailyData: {}
    } as ICSResource;
    
    addResource('distribution', resource);
    
    setSavedMessage(`✓ ${resourceData.resourceType} saved!`);
    setTimeout(() => {
      setSavedMessage('');
      setMode('choice');
      setResourceCategory(null);
      setResourceData({
        resourceType: '',
        description: '',
        quantity: 0,
        quantityNeeded: 0,
        location: '',
        priority: 'medium',
        notes: ''
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resource Entry
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'gap' && 'Red Cross GAP Positions'}
                {mode === 'resource' && 'General Resources & Supplies'}
                {mode === 'choice' && 'Select Entry Type'}
              </p>
            </div>
            
            {savedMessage && (
              <div className="text-green-600 font-medium animate-fade-in">
                {savedMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Initial Choice */}
        {mode === 'choice' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setMode('gap')}
                className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border-2 border-gray-200 hover:border-red-500 text-left"
              >
                <div className="text-3xl mb-3">👥</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">
                  GAP Positions
                </div>
                <div className="text-sm text-gray-600">
                  Red Cross personnel positions with standard 2-letter codes
                  (DM/OP/SV, MC/CO/SP, etc.)
                </div>
                <div className="mt-4 text-xs text-red-600 font-medium">
                  For staffing needs and assignments
                </div>
              </button>
              
              <button
                onClick={() => setMode('resource')}
                className="p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-500 text-left"
              >
                <div className="text-3xl mb-3">📦</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">
                  General Resources
                </div>
                <div className="text-sm text-gray-600">
                  Vehicles, equipment, supplies, facilities that vary by location
                </div>
                <div className="mt-4 text-xs text-blue-600 font-medium">
                  For logistics and supply needs
                </div>
              </button>
            </div>
          </div>
        )}

        {/* GAP Position Entry */}
        {mode === 'gap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                GAP Position Request
              </h2>
              
              {/* Quick Select Common Positions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Select Common Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_GAP_POSITIONS.slice(0, 8).map(gap => (
                    <button
                      key={gap.code}
                      onClick={() => setSelectedGAP(gap)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedGAP?.code === gap.code
                          ? 'bg-red-50 border-red-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-mono font-bold text-sm">{gap.code}</div>
                      <div className="text-xs text-gray-600 mt-1">{gap.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Build Custom GAP Code */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Or Build Custom GAP Code
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Division</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      onChange={(e) => {
                        const div = e.target.value;
                        if (div) {
                          setSelectedGAP({
                            code: generateGAPCode(div, 'XX', 'XX'),
                            title: 'Custom Position',
                            division: RC_DIVISIONS[div] || div,
                            function: '',
                            level: ''
                          });
                        }
                      }}
                    >
                      <option value="">Select...</option>
                      {Object.entries(RC_DIVISIONS).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Function</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                      <option value="">Select...</option>
                      {Object.entries(RC_FUNCTIONS).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                      <option value="">Select...</option>
                      {Object.entries(RC_LEVELS).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Selected Position Details */}
              {selectedGAP && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <div className="font-mono font-bold text-lg text-red-900">{selectedGAP.code}</div>
                  <div className="text-sm text-red-700">{selectedGAP.title}</div>
                  {selectedGAP.description && (
                    <div className="text-xs text-red-600 mt-1">{selectedGAP.description}</div>
                  )}
                </div>
              )}

              {/* Person Assignment */}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Person Name (if assigned)
                    </label>
                    <input
                      type="text"
                      value={gapData.personName}
                      onChange={(e) => setGapData({...gapData, personName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Leave blank if requesting"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={gapData.status}
                      onChange={(e) => setGapData({...gapData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="requested">Requested (Need to Fill)</option>
                      <option value="assigned">Assigned (Person Identified)</option>
                      <option value="deployed">Deployed (On Site)</option>
                      <option value="available">Available (Standby)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={gapData.phone}
                      onChange={(e) => setGapData({...gapData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="(xxx) xxx-xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={gapData.email}
                      onChange={(e) => setGapData({...gapData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="email@redcross.org"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location/Assignment
                  </label>
                  <input
                    type="text"
                    value={gapData.location}
                    onChange={(e) => setGapData({...gapData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., Fort Myers EOC, Shelter #3, Mobile Unit Alpha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={gapData.notes}
                    onChange={(e) => setGapData({...gapData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Special requirements, certifications needed, shift information..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setMode('choice')}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={saveGAPPosition}
                disabled={!selectedGAP}
                className="px-8 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save GAP Position
              </button>
            </div>
          </div>
        )}

        {/* General Resource Entry */}
        {mode === 'resource' && (
          <div className="space-y-6">
            {/* Category Selection */}
            {!resourceCategory ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Select Resource Category
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setResourceCategory('vehicles')}
                    className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-semibold">Vehicles</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ERVs, trucks, vans, mobile units
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setResourceCategory('equipment')}
                    className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">🔧</div>
                    <div className="font-semibold">Equipment</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Generators, radios, medical equipment
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setResourceCategory('supplies')}
                    className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-semibold">Supplies</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Food, water, cots, blankets, kits
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setResourceCategory('facilities')}
                    className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-500"
                  >
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="font-semibold">Facilities</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Warehouses, staging areas, offices
                    </div>
                  </button>
                </div>
                
                <button
                  onClick={() => setMode('choice')}
                  className="mt-6 px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Back
                </button>
              </div>
            ) : (
              /* Resource Details */
              <div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {resourceCategory === 'vehicles' && '🚚 Vehicle Resource'}
                    {resourceCategory === 'equipment' && '🔧 Equipment Resource'}
                    {resourceCategory === 'supplies' && '📦 Supply Resource'}
                    {resourceCategory === 'facilities' && '🏢 Facility Resource'}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Type *
                      </label>
                      <input
                        type="text"
                        value={resourceData.resourceType}
                        onChange={(e) => setResourceData({...resourceData, resourceType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={
                          resourceCategory === 'vehicles' ? 'e.g., ERV, Box Truck, 15-passenger Van' :
                          resourceCategory === 'equipment' ? 'e.g., 10kW Generator, Portable Radio' :
                          resourceCategory === 'supplies' ? 'e.g., Cots, Blankets, MREs, Water (cases)' :
                          'e.g., Warehouse, Staging Area, Command Post'
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={resourceData.description}
                        onChange={(e) => setResourceData({...resourceData, description: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Specific details, model numbers, capacities..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity Available
                        </label>
                        <input
                          type="number"
                          value={resourceData.quantity}
                          onChange={(e) => setResourceData({...resourceData, quantity: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity Needed
                        </label>
                        <input
                          type="number"
                          value={resourceData.quantityNeeded}
                          onChange={(e) => setResourceData({...resourceData, quantityNeeded: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resourceData.location}
                        onChange={(e) => setResourceData({...resourceData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Current location or where needed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['low', 'medium', 'high', 'critical'].map((level) => (
                          <button
                            key={level}
                            onClick={() => setResourceData({...resourceData, priority: level as any})}
                            className={`py-2 px-3 rounded-lg font-medium transition-all ${
                              resourceData.priority === level
                                ? level === 'critical' ? 'bg-red-600 text-white' :
                                  level === 'high' ? 'bg-orange-500 text-white' :
                                  level === 'medium' ? 'bg-yellow-500 text-white' :
                                  'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={resourceData.notes}
                        onChange={(e) => setResourceData({...resourceData, notes: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Special requirements, vendor information, delivery details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setResourceCategory(null)}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={saveResource}
                    disabled={!resourceData.resourceType}
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Resource
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}