import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../services/eventBus';

export function HealthServicesLine() {
  const { currentOperation, updateServiceLine } = useOperationStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const health = currentOperation?.serviceLines?.health || {
    firstAidContacts: 0,
    nursingContacts: 0,
    emergencyTransports: 0,
    hospitalVisits: 0,
    healthServicesStaff: 0,
    mentalHealthContacts: 0,
    spiritualCareContacts: 0,
    healthEducationContacts: 0
  };

  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('health', {
      ...health,
      [field]: value
    });
    
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'health',
      field,
      value,
      timestamp: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
          <h2 className="text-lg font-semibold">Health Services</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {(health.firstAidContacts || 0) + (health.nursingContacts || 0) + (health.mentalHealthContacts || 0)}
            </span> total contacts
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-6">
          
          {/* Line 49-52: Medical Services */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 mb-3">Medical Services (Lines 49-52)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 49: First Aid Contacts
                </label>
                <input
                  type="number"
                  value={health.firstAidContacts || 0}
                  onChange={(e) => handleUpdate('firstAidContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 50: Nursing Contacts
                </label>
                <input
                  type="number"
                  value={health.nursingContacts || 0}
                  onChange={(e) => handleUpdate('nursingContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 51: Emergency Transports
                </label>
                <input
                  type="number"
                  value={health.emergencyTransports || 0}
                  onChange={(e) => handleUpdate('emergencyTransports', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 52: Hospital Visits
                </label>
                <input
                  type="number"
                  value={health.hospitalVisits || 0}
                  onChange={(e) => handleUpdate('hospitalVisits', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Line 53-56: Mental Health & Support */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Mental Health & Support (Lines 53-56)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 53: Health Staff
                </label>
                <input
                  type="number"
                  value={health.healthServicesStaff || 0}
                  onChange={(e) => handleUpdate('healthServicesStaff', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 54: Mental Health Contacts
                </label>
                <input
                  type="number"
                  value={health.mentalHealthContacts || 0}
                  onChange={(e) => handleUpdate('mentalHealthContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 55: Spiritual Care Contacts
                </label>
                <input
                  type="number"
                  value={health.spiritualCareContacts || 0}
                  onChange={(e) => handleUpdate('spiritualCareContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 56: Health Education
                </label>
                <input
                  type="number"
                  value={health.healthEducationContacts || 0}
                  onChange={(e) => handleUpdate('healthEducationContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Summary Dashboard */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Health Services Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Medical</div>
                  <div className="text-2xl font-bold text-red-600">
                    {(health.firstAidContacts || 0) + (health.nursingContacts || 0)}
                  </div>
                  <div className="text-xs text-gray-600">First Aid + Nursing</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Transport</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {(health.emergencyTransports || 0) + (health.hospitalVisits || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Transports + Hospital</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Support</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(health.mentalHealthContacts || 0) + (health.spiritualCareContacts || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Mental + Spiritual</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Health Contacts Today:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {(health.firstAidContacts || 0) + (health.nursingContacts || 0) + 
                     (health.emergencyTransports || 0) + (health.hospitalVisits || 0) +
                     (health.mentalHealthContacts || 0) + (health.spiritualCareContacts || 0) +
                     (health.healthEducationContacts || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Services Notes
            </label>
            <textarea
              value={health.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Add health-related notes, critical incidents, or special medical needs..."
            />
          </div>
        </div>
      )}
    </div>
  );
}