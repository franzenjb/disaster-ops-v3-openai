import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { eventBus, EventType } from '../../services/eventBus';

export function RecoveryServiceLine() {
  const { currentOperation, updateServiceLine } = useOperationStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const recovery = currentOperation?.serviceLines?.recovery || {
    casesOpened: 0,
    casesClosed: 0,
    caseworkContacts: 0,
    financialAssistanceProvided: 0,
    financialAssistanceAmount: 0,
    referralsMade: 0,
    followUpContacts: 0
  };

  const handleUpdate = (field: string, value: any) => {
    updateServiceLine('recovery', {
      ...recovery,
      [field]: value
    });
    
    eventBus.emit(EventType.SERVICE_LINE_UPDATED, {
      serviceLineId: 'recovery',
      field,
      value,
      timestamp: Date.now()
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
          </svg>
          <h2 className="text-lg font-semibold">Individual Assistance / Recovery</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{recovery.casesOpened || 0}</span> open cases
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
          
          {/* Line 31-34: Case Management */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-teal-900 mb-3">Case Management (Lines 31-34)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 31: Cases Opened
                </label>
                <input
                  type="number"
                  value={recovery.casesOpened || 0}
                  onChange={(e) => handleUpdate('casesOpened', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 32: Cases Closed
                </label>
                <input
                  type="number"
                  value={recovery.casesClosed || 0}
                  onChange={(e) => handleUpdate('casesClosed', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 33: Casework Contacts
                </label>
                <input
                  type="number"
                  value={recovery.caseworkContacts || 0}
                  onChange={(e) => handleUpdate('caseworkContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 34: Clients Assisted
                </label>
                <input
                  type="number"
                  value={recovery.financialAssistanceProvided || 0}
                  onChange={(e) => handleUpdate('financialAssistanceProvided', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Line 35-37: Financial Assistance & Referrals */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-3">Financial Assistance & Referrals (Lines 35-37)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 35: Financial Assistance ($)
                </label>
                <input
                  type="number"
                  value={recovery.financialAssistanceAmount || 0}
                  onChange={(e) => handleUpdate('financialAssistanceAmount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Formatted: {formatCurrency(recovery.financialAssistanceAmount || 0)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 36: Referrals Made
                </label>
                <input
                  type="number"
                  value={recovery.referralsMade || 0}
                  onChange={(e) => handleUpdate('referralsMade', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Line 37: Follow-up Contacts
                </label>
                <input
                  type="number"
                  value={recovery.followUpContacts || 0}
                  onChange={(e) => handleUpdate('followUpContacts', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Recovery Dashboard */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recovery Operations Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Active</div>
                  <div className="text-2xl font-bold text-teal-600">
                    {(recovery.casesOpened || 0) - (recovery.casesClosed || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Open Cases</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Closed</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {recovery.casesClosed || 0}
                  </div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Contacts</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(recovery.caseworkContacts || 0) + (recovery.followUpContacts || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Assistance</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(recovery.financialAssistanceAmount || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Distributed</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm text-gray-600">Referrals Made:</span>
                    <span className="ml-2 font-bold text-lg">{recovery.referralsMade || 0}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Avg Assistance:</span>
                    <span className="ml-2 font-bold text-lg">
                      {recovery.financialAssistanceProvided > 0 
                        ? formatCurrency((recovery.financialAssistanceAmount || 0) / recovery.financialAssistanceProvided)
                        : '$0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recovery Notes
            </label>
            <textarea
              value={recovery.notes || ''}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add recovery notes, special cases, partner agency referrals..."
            />
          </div>
        </div>
      )}
    </div>
  );
}