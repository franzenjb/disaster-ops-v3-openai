/**
 * Start Operation Component
 * 
 * Notice how clean this is! No manual DOM manipulation,
 * no localStorage juggling, just pure reactive state.
 */

import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { eventBus, EventType } from '../core/EventBus';
import { REGIONS } from '../data/regions';

export function StartOperation() {
  const initOperation = useOperationStore(state => state.initOperation);
  const selectRegion = useOperationStore(state => state.selectRegion);
  const toggleCounty = useOperationStore(state => state.toggleCounty);
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  
  const [formData, setFormData] = useState({
    drNumber: '',
    operationName: '',
    startDate: new Date().toISOString().split('T')[0],
    selectedRegion: ''
  });
  
  const [availableCounties, setAvailableCounties] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Load counties when region changes
  useEffect(() => {
    if (formData.selectedRegion) {
      const region = REGIONS.find(r => r.name === formData.selectedRegion);
      if (region) {
        setAvailableCounties(region.counties);
        selectRegion(formData.selectedRegion);
      }
    } else {
      setAvailableCounties([]);
    }
  }, [formData.selectedRegion, selectRegion]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.drNumber || !formData.operationName) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsCreating(true);
    
    // Initialize the operation
    initOperation(formData.drNumber, formData.operationName);
    
    // The dashboard will automatically appear because we're watching currentOperation!
    // No manual navigation needed!
  };
  
  const handleCountyToggle = (county: string) => {
    toggleCounty(county);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Start New Disaster Operation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DR Number */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="drNumber" className="label">
                DR Number <span className="text-red-500">*</span>
              </label>
              <input
                id="drNumber"
                type="text"
                className="input-field"
                placeholder="DR-2024-FL-001"
                value={formData.drNumber}
                onChange={(e) => setFormData({...formData, drNumber: e.target.value})}
                pattern="DR-\d{4}-[A-Z]{2}-\d{3}"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Format: DR-YYYY-ST-###</p>
            </div>
            
            {/* Operation Name */}
            <div>
              <label htmlFor="operationName" className="label">
                Operation Name <span className="text-red-500">*</span>
              </label>
              <input
                id="operationName"
                type="text"
                className="input-field"
                placeholder="Hurricane Response - Florida"
                value={formData.operationName}
                onChange={(e) => setFormData({...formData, operationName: e.target.value})}
                required
              />
            </div>
          </div>
          
          {/* Start Date and Region */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="label">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label htmlFor="region" className="label">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                className="input-field"
                value={formData.selectedRegion}
                onChange={(e) => setFormData({...formData, selectedRegion: e.target.value})}
                required
              >
                <option value="">Select Region</option>
                {REGIONS.map(region => (
                  <option key={region.id} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* County Selection */}
          {availableCounties.length > 0 && (
            <div>
              <label className="label">
                Select Affected Counties
                <span className="ml-2 text-sm text-gray-500">
                  ({selectedCounties.length} selected)
                </span>
              </label>
              
              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCounties.map(county => {
                    const isSelected = selectedCounties.includes(county);
                    return (
                      <label
                        key={county}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCountyToggle(county)}
                          className="w-4 h-4 text-red-cross-red border-gray-300 rounded 
                                   focus:ring-red-cross-red"
                        />
                        <span className="text-sm">{county}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="btn-primary"
            >
              {isCreating ? 'Creating Operation...' : 'Start Operation'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Clean Architecture Benefits</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ No manual DOM updates - React handles everything</li>
          <li>✅ Counties automatically save when selected</li>
          <li>✅ Maps will auto-update via event subscriptions</li>
          <li>✅ Works offline - syncs when connected</li>
          <li>✅ Every action creates an audit event</li>
        </ul>
      </div>
    </div>
  );
}