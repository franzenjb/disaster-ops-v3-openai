/**
 * Feeding Service Line Component
 * Complete Form 5266 Line Items for Feeding Operations
 */

import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../core/EventBus';

export function FeedingServiceLine() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateServiceLine = useOperationStore(state => state.updateServiceLine);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  if (!operation) return null;
  
  const feeding = operation.serviceLines.feeding;
  
  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('feeding', {
      ...feeding,
      [field]: value
    });
    
    // Emit event for audit trail
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'feeding',
      field,
      value,
      timestamp: Date.now()
    });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        handleUpdate('feedingPhoto', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Calculate totals
  const calculateDailyTotal = () => {
    return (feeding.breakfastServed || 0) + 
           (feeding.lunchServed || 0) + 
           (feeding.dinnerServed || 0) +
           (feeding.snacksServed || 0);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">Feeding Operations</h3>
            <p className="text-sm text-gray-500">
              Line 9: {feeding.totalMealsToDate || 0} Total Meals | 
              Today: {calculateDailyTotal()} Meals
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
          {/* Daily Meal Service */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Daily Meal Service (Form 5266 Lines 6-9)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 6: Breakfast
                </label>
                <input
                  type="number"
                  value={feeding.breakfastServed || ''}
                  onChange={(e) => handleUpdate('breakfastServed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 7: Lunch
                </label>
                <input
                  type="number"
                  value={feeding.lunchServed || ''}
                  onChange={(e) => handleUpdate('lunchServed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 8: Dinner
                </label>
                <input
                  type="number"
                  value={feeding.dinnerServed || ''}
                  onChange={(e) => handleUpdate('dinnerServed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 8a: Snacks
                </label>
                <input
                  type="number"
                  value={feeding.snacksServed || ''}
                  onChange={(e) => handleUpdate('snacksServed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            {/* Daily Total */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Daily Total:</span>
                <span className="text-xl font-bold text-blue-600">{calculateDailyTotal()}</span>
              </div>
            </div>
          </div>
          
          {/* Feeding Sites */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Feeding Sites (Lines 10-13)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 10: Fixed Sites
                </label>
                <input
                  type="number"
                  value={feeding.fixedFeedingSites || ''}
                  onChange={(e) => handleUpdate('fixedFeedingSites', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 11: Mobile Units (ERVs)
                </label>
                <input
                  type="number"
                  value={feeding.mobileFeedingUnits || ''}
                  onChange={(e) => handleUpdate('mobileFeedingUnits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 12: Total Feeding Staff
                </label>
                <input
                  type="number"
                  value={feeding.feedingStaff || ''}
                  onChange={(e) => handleUpdate('feedingStaff', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 13: Feeding Volunteers
                </label>
                <input
                  type="number"
                  value={feeding.feedingVolunteers || ''}
                  onChange={(e) => handleUpdate('feedingVolunteers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Cumulative Totals */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Cumulative Operation Totals
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 9: Total Meals To Date
                </label>
                <input
                  type="number"
                  value={feeding.totalMealsToDate || ''}
                  onChange={(e) => handleUpdate('totalMealsToDate', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 font-bold text-lg"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 14: Bulk Distribution Items
                </label>
                <input
                  type="number"
                  value={feeding.bulkDistributionItems || ''}
                  onChange={(e) => handleUpdate('bulkDistributionItems', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line 15: Partner Meals Provided
                </label>
                <input
                  type="number"
                  value={feeding.partnerMealsProvided || ''}
                  onChange={(e) => handleUpdate('partnerMealsProvided', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Photo Documentation */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Photo Documentation
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Feeding Site Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100"
                />
              </div>
              
              {photoPreview && (
                <div className="mt-4">
                  <img
                    src={photoPreview}
                    alt="Feeding site"
                    className="max-w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operational Notes
            </label>
            <textarea
              value={feeding.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Enter any operational notes, challenges, or special circumstances..."
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