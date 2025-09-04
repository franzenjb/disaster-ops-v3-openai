import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useOperationStore } from '../../stores/useOperationStore';

interface IAPSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IAPSettingsModal({ isOpen, onClose }: IAPSettingsModalProps) {
  const operation = useOperationStore(state => state.currentOperation);
  const updateOperation = useOperationStore(state => state.updateOperation);
  
  const [settings, setSettings] = useState({
    operationId: operation?.id || 'DR 220-25',
    operationName: operation?.operationName || 'FLOCOM',
    iapNumber: operation?.iap?.meta?.iapNumber || '54',
    operationalPeriodStart: '18:00 15/10/2024',
    operationalPeriodEnd: '17:59 16/10/2024',
    preparedBy: operation?.iap?.meta?.preparedBy || '',
    approvedBy: operation?.iap?.meta?.approvedBy || '',
    distributionTime: '5:00 PM'
  });

  if (!isOpen) return null;

  const handleSave = () => {
    // Update the operation store with new settings
    if (operation) {
      updateOperation({
        ...operation,
        id: settings.operationId,
        operationName: settings.operationName,
        iap: {
          ...operation.iap,
          meta: {
            ...operation.iap.meta,
            iapNumber: parseInt(settings.iapNumber),
            preparedBy: settings.preparedBy,
            approvedBy: settings.approvedBy,
            operationalPeriod: {
              start: settings.operationalPeriodStart,
              end: settings.operationalPeriodEnd
            }
          }
        }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">IAP Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Operation Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Operation Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation ID
                  </label>
                  <input
                    type="text"
                    value={settings.operationId}
                    onChange={(e) => setSettings({ ...settings, operationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Name
                  </label>
                  <input
                    type="text"
                    value={settings.operationName}
                    onChange={(e) => setSettings({ ...settings, operationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* IAP Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">IAP Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IAP Number
                  </label>
                  <input
                    type="text"
                    value={settings.iapNumber}
                    onChange={(e) => setSettings({ ...settings, iapNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distribution Time
                  </label>
                  <input
                    type="text"
                    value={settings.distributionTime}
                    onChange={(e) => setSettings({ ...settings, distributionTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Operational Period */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Operational Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date/Time
                  </label>
                  <input
                    type="text"
                    value={settings.operationalPeriodStart}
                    onChange={(e) => setSettings({ ...settings, operationalPeriodStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="18:00 15/10/2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date/Time
                  </label>
                  <input
                    type="text"
                    value={settings.operationalPeriodEnd}
                    onChange={(e) => setSettings({ ...settings, operationalPeriodEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="17:59 16/10/2024"
                  />
                </div>
              </div>
            </div>

            {/* Prepared/Approved By */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Authorization</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prepared By
                  </label>
                  <input
                    type="text"
                    value={settings.preparedBy}
                    onChange={(e) => setSettings({ ...settings, preparedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Name and title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={settings.approvedBy}
                    onChange={(e) => setSettings({ ...settings, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Name and title"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}