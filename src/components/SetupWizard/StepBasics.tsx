'use client';

import { useState, useEffect } from 'react';
import { OperationBasics, DisasterType, ActivationLevel } from '@/types';

interface StepBasicsProps {
  data?: OperationBasics;
  onUpdate: (data: OperationBasics) => void;
  onNext: () => void;
}

interface ExtendedBasics extends OperationBasics {
  creatorName: string;
  creatorEmail: string;
  creatorPhone: string;
}

export function StepBasics({ data, onUpdate, onNext }: StepBasicsProps) {
  const [formData, setFormData] = useState<ExtendedBasics>({
    operationName: '',
    disasterType: 'other',
    activationLevel: 'level_1',
    creatorName: '',
    creatorEmail: '',
    creatorPhone: '',
    ...data,
  });

  useEffect(() => {
    // Load saved user info if available
    const savedName = localStorage.getItem('disaster_ops_user_name');
    const savedEmail = localStorage.getItem('disaster_ops_user_email');
    const savedPhone = localStorage.getItem('disaster_ops_user_phone');
    
    if (savedName) setFormData(prev => ({ ...prev, creatorName: savedName }));
    if (savedEmail) setFormData(prev => ({ ...prev, creatorEmail: savedEmail }));
    if (savedPhone) setFormData(prev => ({ ...prev, creatorPhone: savedPhone }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save user info for next time
    localStorage.setItem('disaster_ops_user_name', formData.creatorName);
    localStorage.setItem('disaster_ops_user_email', formData.creatorEmail);
    localStorage.setItem('disaster_ops_user_phone', formData.creatorPhone);
    
    onUpdate(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Creator Information */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.creatorEmail}
              onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="john.doe@redcross.org"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.creatorPhone}
              onChange={(e) => setFormData({ ...formData, creatorPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Operation Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operation Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation Name *
            </label>
            <input
              type="text"
              required
              value={formData.operationName}
              onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Hurricane Milton Response 2024"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disaster Type *
              </label>
              <select
                value={formData.disasterType}
                onChange={(e) => setFormData({ ...formData, disasterType: e.target.value as DisasterType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="hurricane">Hurricane</option>
                <option value="tornado">Tornado</option>
                <option value="flood">Flood</option>
                <option value="wildfire">Wildfire</option>
                <option value="earthquake">Earthquake</option>
                <option value="winter_storm">Winter Storm</option>
                <option value="pandemic">Pandemic</option>
                <option value="mass_casualty">Mass Casualty</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activation Level *
              </label>
              <select
                value={formData.activationLevel}
                onChange={(e) => setFormData({ ...formData, activationLevel: e.target.value as ActivationLevel })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="level_1">Level 1 - Local Resources</option>
                <option value="level_2">Level 2 - Regional Resources</option>
                <option value="level_3">Level 3 - National Resources</option>
                <option value="level_4">Level 4 - International Assistance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DR Number (if applicable)
              </label>
              <input
                type="text"
                value={formData.drNumber || ''}
                onChange={(e) => setFormData({ ...formData, drNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., DR-4710-FL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Duration (days)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., 14"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Any additional context or special considerations..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
        >
          Next Step →
        </button>
      </div>
    </form>
  );
}