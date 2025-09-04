/**
 * Setup Component
 * Initial configuration required to start disaster operations
 */

import React, { useState, useEffect } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { eventBus, EventType } from '../core/EventBus';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { REGIONS } from '../data/regions';
import { USCountyMap } from './USCountyMap';

interface SetupData {
  droStartDate: string;
  droNumber: string;
  userName: string;
  phoneNumber: string;
  emailAddress: string;
  selectedRegion: string;
  selectedCounties: string[];
  assignedChapters: string[];
}

// Chapter assignments by county (simplified - in production this would be a comprehensive mapping)
const COUNTY_TO_CHAPTER: Record<string, string> = {
  // Florida examples
  'Miami-Dade': 'Greater Miami & The Keys Chapter',
  'Broward': 'Greater Miami & The Keys Chapter',
  'Palm Beach': 'Palm Beach County Chapter',
  'Hillsborough': 'Tampa Bay Chapter',
  'Pinellas': 'Tampa Bay Chapter',
  'Orange': 'Central Florida Chapter',
  'Duval': 'Northeast Florida Chapter',
  'Leon': 'Capital Area Chapter',
  'Escambia': 'Northwest Florida Chapter',
  // Add more county-to-chapter mappings as needed
};

export function Setup() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateOperation = useOperationStore(state => state.updateOperation);
  const selectedCounties = useOperationStore(state => state.selectedCounties);
  const toggleCounty = useOperationStore(state => state.toggleCounty);
  
  const [setupData, setSetupData] = useState<SetupData>({
    droStartDate: operation?.metadata?.droStartDate || '',
    droNumber: operation?.id || '',
    userName: operation?.metadata?.primaryContact?.name || '',
    phoneNumber: operation?.metadata?.primaryContact?.phone || '',
    emailAddress: operation?.metadata?.primaryContact?.email || '',
    selectedRegion: operation?.region || '',
    selectedCounties: selectedCounties,
    assignedChapters: []
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  
  // Auto-assign chapters based on selected counties
  useEffect(() => {
    const chapters = new Set<string>();
    selectedCounties.forEach(county => {
      const chapter = COUNTY_TO_CHAPTER[county];
      if (chapter) {
        chapters.add(chapter);
      }
    });
    
    setSetupData(prev => ({
      ...prev,
      selectedCounties: selectedCounties,
      assignedChapters: Array.from(chapters).sort()
    }));
  }, [selectedCounties]);
  
  // Check if all required fields are filled
  useEffect(() => {
    const required = [
      setupData.droStartDate,
      setupData.droNumber,
      setupData.userName,
      setupData.phoneNumber,
      setupData.emailAddress,
      setupData.selectedRegion
    ];
    
    const allFieldsFilled = required.every(field => field && field.length > 0);
    const hasCounties = selectedCounties.length > 0;
    
    setIsComplete(allFieldsFilled && hasCounties);
  }, [setupData, selectedCounties]);
  
  const handleFieldChange = (field: keyof SetupData, value: string | string[]) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    
    // Update operation metadata
    if (operation) {
      const metadata = {
        ...operation.metadata,
        droStartDate: field === 'droStartDate' ? value : setupData.droStartDate,
        primaryContact: {
          name: field === 'userName' ? value : setupData.userName,
          phone: field === 'phoneNumber' ? value : setupData.phoneNumber,
          email: field === 'emailAddress' ? value : setupData.emailAddress,
        }
      };
      
      const updates: any = { metadata };
      
      if (field === 'droNumber') {
        updates.id = value as string;
      }
      
      if (field === 'selectedRegion') {
        updates.region = value as string;
      }
      
      updateOperation({ ...operation, ...updates });
      
      // Emit event for tracking
      eventBus.emit(EventType.DATA_ENTRY, {
        operationId: operation.id,
        field,
        value,
        timestamp: new Date()
      });
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };
  
  const handleEmailBlur = () => {
    if (setupData.emailAddress && !validateEmail(setupData.emailAddress)) {
      setValidationErrors(prev => ({
        ...prev,
        emailAddress: 'Please enter a valid email address'
      }));
    }
  };
  
  const handlePhoneChange = (value: string) => {
    // Auto-format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    handleFieldChange('phoneNumber', formatted);
  };
  
  return (
    <div className="space-y-6">
      {/* Setup Progress Header */}
      <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-red-900">Initial Setup</h2>
            <p className="text-sm text-red-700 mt-1">
              Complete all required fields to begin disaster operations
            </p>
          </div>
          {isComplete && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="font-medium">Setup Complete</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Section 1: DRO Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">1. DRO Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DRO Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={setupData.droStartDate}
              onChange={(e) => handleFieldChange('droStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Date when the DRO (Disaster Relief Operation) began
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DRO Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={setupData.droNumber}
              onChange={(e) => handleFieldChange('droNumber', e.target.value)}
              placeholder="DR-2025-FL-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: DR-YYYY-ST-###
            </p>
          </div>
        </div>
      </div>
      
      {/* Section 2: Your Contact Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">2. Your Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={setupData.userName}
              onChange={(e) => handleFieldChange('userName', e.target.value)}
              placeholder="First Last"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telephone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={setupData.phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="555-555-5555"
              className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.phoneNumber}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={setupData.emailAddress}
              onChange={(e) => handleFieldChange('emailAddress', e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="name@redcross.org"
              className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                validationErrors.emailAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.emailAddress && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.emailAddress}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Section 3: Region Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">3. Select Region</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Red Cross Region <span className="text-red-500">*</span>
          </label>
          <select
            value={setupData.selectedRegion}
            onChange={(e) => handleFieldChange('selectedRegion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select a region...</option>
            {REGIONS.map(region => (
              <option key={region.id} value={region.name}>{region.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Section 4: County Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">4. Select Affected Counties</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click on the map to select affected counties. Chapters will be automatically assigned based on your selections.
        </p>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">County Map</h4>
            <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <USCountyMap />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click counties to select/deselect them
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">
                Selected Counties ({selectedCounties.length})
              </h4>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                {selectedCounties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCounties.map(county => (
                      <span 
                        key={county.id || county.name}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {county.name}
                        <button
                          onClick={() => toggleCounty(county)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No counties selected</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">
                Auto-Assigned Chapters ({setupData.assignedChapters.length})
              </h4>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-blue-50">
                {setupData.assignedChapters.length > 0 ? (
                  <ul className="space-y-1">
                    {setupData.assignedChapters.map(chapter => (
                      <li key={chapter} className="text-sm text-blue-900">
                        • {chapter}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Chapters will appear here based on county selection
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Setup Summary */}
      <div className={`card ${isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h3 className="text-lg font-semibold mb-3">Setup Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">DRO Start Date:</span>
              <span className="font-medium">{setupData.droStartDate || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">DRO Number:</span>
              <span className="font-medium">{setupData.droNumber || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Your Name:</span>
              <span className="font-medium">{setupData.userName || '—'}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{setupData.phoneNumber || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{setupData.emailAddress || '—'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Region:</span>
              <span className="font-medium">{setupData.selectedRegion || '—'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-gray-600">Counties Selected:</span>
            <span className="font-medium">{selectedCounties.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chapters Assigned:</span>
            <span className="font-medium">{setupData.assignedChapters.length}</span>
          </div>
        </div>
        
        {!isComplete && (
          <div className="mt-4 p-3 bg-white rounded-md border border-yellow-300">
            <p className="text-sm text-yellow-800">
              ⚠️ Please complete all required fields marked with <span className="text-red-500">*</span> and select at least one county to proceed.
            </p>
          </div>
        )}
        
        {isComplete && (
          <div className="mt-4 p-3 bg-white rounded-md border border-green-300">
            <p className="text-sm text-green-800">
              ✅ Setup is complete! You can now proceed with disaster operations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}