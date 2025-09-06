'use client';

import React, { useState, useEffect } from 'react';
import { ServiceLine } from '@/types';

interface StepResourcesProps {
  data?: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface ServiceLineConfig {
  line: ServiceLine;
  label: string;
  description: string;
  icon: string;
  activated: boolean;
  estimatedDailyCapacity?: number;
  resourcesNeeded: ResourceItem[];
}

interface ResourceItem {
  type: string;
  quantity: number;
  unit: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'available' | 'requested' | 'in_transit' | 'on_site';
}

const SERVICE_LINE_CONFIGS: ServiceLineConfig[] = [
  {
    line: 'sheltering',
    label: 'Sheltering',
    description: 'Emergency shelter operations for displaced populations',
    icon: '🏠',
    activated: false,
    resourcesNeeded: [
      { type: 'Cots', quantity: 0, unit: 'each', priority: 'critical', status: 'requested' },
      { type: 'Blankets', quantity: 0, unit: 'each', priority: 'critical', status: 'requested' },
      { type: 'Comfort Kits', quantity: 0, unit: 'each', priority: 'high', status: 'requested' },
      { type: 'Towels', quantity: 0, unit: 'each', priority: 'medium', status: 'requested' }
    ]
  },
  {
    line: 'feeding',
    label: 'Feeding',
    description: 'Mass feeding services including fixed sites and mobile units',
    icon: '🍽️',
    activated: false,
    resourcesNeeded: [
      { type: 'Meals Ready', quantity: 0, unit: 'meals/day', priority: 'critical', status: 'requested' },
      { type: 'Water', quantity: 0, unit: 'gallons/day', priority: 'critical', status: 'requested' },
      { type: 'Food Service Kits', quantity: 0, unit: 'kits', priority: 'high', status: 'requested' },
      { type: 'Coolers', quantity: 0, unit: 'each', priority: 'medium', status: 'requested' }
    ]
  },
  {
    line: 'distribution',
    label: 'Bulk Distribution',
    description: 'Distribution of emergency supplies to affected populations',
    icon: '📦',
    activated: false,
    resourcesNeeded: [
      { type: 'Cleanup Kits', quantity: 0, unit: 'kits', priority: 'high', status: 'requested' },
      { type: 'Tarps', quantity: 0, unit: 'each', priority: 'high', status: 'requested' },
      { type: 'Work Gloves', quantity: 0, unit: 'pairs', priority: 'medium', status: 'requested' },
      { type: 'Trash Bags', quantity: 0, unit: 'boxes', priority: 'medium', status: 'requested' }
    ]
  },
  {
    line: 'health_services',
    label: 'Health Services',
    description: 'Medical and health support for clients and responders',
    icon: '⚕️',
    activated: false,
    resourcesNeeded: [
      { type: 'First Aid Kits', quantity: 0, unit: 'kits', priority: 'critical', status: 'requested' },
      { type: 'Medical Supplies', quantity: 0, unit: 'boxes', priority: 'critical', status: 'requested' },
      { type: 'PPE Sets', quantity: 0, unit: 'sets', priority: 'high', status: 'requested' },
      { type: 'Hand Sanitizer', quantity: 0, unit: 'gallons', priority: 'medium', status: 'requested' }
    ]
  },
  {
    line: 'mental_health',
    label: 'Mental Health',
    description: 'Disaster mental health services and psychological first aid',
    icon: '🧠',
    activated: false,
    resourcesNeeded: [
      { type: 'DMH Materials', quantity: 0, unit: 'sets', priority: 'medium', status: 'requested' },
      { type: 'Activity Kits', quantity: 0, unit: 'kits', priority: 'low', status: 'requested' }
    ]
  },
  {
    line: 'spiritual_care',
    label: 'Spiritual Care',
    description: 'Spiritual and emotional support services',
    icon: '🙏',
    activated: false,
    resourcesNeeded: [
      { type: 'Care Materials', quantity: 0, unit: 'sets', priority: 'low', status: 'requested' }
    ]
  },
  {
    line: 'reunification',
    label: 'Reunification',
    description: 'Family reunification and Safe & Well services',
    icon: '👨‍👩‍👧‍👦',
    activated: false,
    resourcesNeeded: [
      { type: 'Registration Forms', quantity: 0, unit: 'pads', priority: 'high', status: 'requested' },
      { type: 'ID Badges', quantity: 0, unit: 'boxes', priority: 'medium', status: 'requested' }
    ]
  },
  {
    line: 'logistics',
    label: 'Logistics',
    description: 'Supply chain, warehousing, and transportation',
    icon: '🚚',
    activated: false,
    resourcesNeeded: [
      { type: 'Box Trucks', quantity: 0, unit: 'vehicles', priority: 'critical', status: 'requested' },
      { type: 'Forklifts', quantity: 0, unit: 'units', priority: 'high', status: 'requested' },
      { type: 'Pallets', quantity: 0, unit: 'each', priority: 'medium', status: 'requested' },
      { type: 'Fuel Cards', quantity: 0, unit: 'cards', priority: 'critical', status: 'requested' }
    ]
  },
  {
    line: 'it_telecom',
    label: 'IT & Telecommunications',
    description: 'Communications and technology support',
    icon: '💻',
    activated: false,
    resourcesNeeded: [
      { type: 'Satellite Phones', quantity: 0, unit: 'units', priority: 'high', status: 'requested' },
      { type: 'Radios', quantity: 0, unit: 'units', priority: 'high', status: 'requested' },
      { type: 'Laptops', quantity: 0, unit: 'units', priority: 'medium', status: 'requested' },
      { type: 'WiFi Hotspots', quantity: 0, unit: 'units', priority: 'medium', status: 'requested' }
    ]
  }
];

export function StepResources({ data, onUpdate, onNext, onPrev }: StepResourcesProps) {
  const [serviceLines, setServiceLines] = useState<ServiceLineConfig[]>(
    data?.serviceLines || SERVICE_LINE_CONFIGS
  );
  const [estimatedDuration, setEstimatedDuration] = useState(data?.estimatedDuration || 7);
  const [estimatedPopulation, setEstimatedPopulation] = useState(data?.estimatedPopulation || 1000);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    onUpdate({ 
      serviceLines, 
      estimatedDuration, 
      estimatedPopulation,
      activatedServiceLines: serviceLines.filter(sl => sl.activated).map(sl => sl.line)
    });
  }, [serviceLines, estimatedDuration, estimatedPopulation]);

  const toggleServiceLine = (line: ServiceLine) => {
    setServiceLines(prev => prev.map(sl => {
      if (sl.line === line) {
        return { ...sl, activated: !sl.activated };
      }
      return sl;
    }));
  };

  const updateCapacity = (line: ServiceLine, capacity: number) => {
    setServiceLines(prev => prev.map(sl => {
      if (sl.line === line) {
        return { ...sl, estimatedDailyCapacity: capacity };
      }
      return sl;
    }));
  };

  const updateResource = (line: ServiceLine, resourceType: string, field: string, value: any) => {
    setServiceLines(prev => prev.map(sl => {
      if (sl.line === line) {
        const updatedResources = sl.resourcesNeeded.map(r => {
          if (r.type === resourceType) {
            return { ...r, [field]: value };
          }
          return r;
        });
        return { ...sl, resourcesNeeded: updatedResources };
      }
      return sl;
    }));
  };

  const validateAndNext = () => {
    const newErrors: string[] = [];
    const activatedLines = serviceLines.filter(sl => sl.activated);
    
    if (activatedLines.length === 0) {
      newErrors.push('Please activate at least one service line');
    }
    
    // Check critical resources for activated service lines
    activatedLines.forEach(sl => {
      const criticalResources = sl.resourcesNeeded.filter(r => r.priority === 'critical' && r.quantity === 0);
      if (criticalResources.length > 0) {
        newErrors.push(`${sl.label}: Please specify quantities for critical resources`);
      }
    });
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);
    onNext();
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'text-green-600';
      case 'requested': return 'text-yellow-600';
      case 'in_transit': return 'text-blue-600';
      case 'on_site': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Service Lines & Resources</h3>
        <p className="text-gray-600">
          Select service lines to activate and specify resource requirements.
        </p>
      </div>

      {/* Operation Parameters */}
      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Duration (days)</label>
          <input
            type="number"
            min="1"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Population Affected</label>
          <input
            type="number"
            min="0"
            value={estimatedPopulation}
            onChange={(e) => setEstimatedPopulation(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Service Lines */}
      <div className="space-y-4">
        {serviceLines.map(serviceLine => (
          <div
            key={serviceLine.line}
            className={`border rounded-lg overflow-hidden transition-all ${
              serviceLine.activated ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
            }`}
          >
            {/* Service Line Header */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{serviceLine.icon}</span>
                  <div>
                    <h4 className="font-medium text-lg">{serviceLine.label}</h4>
                    <p className="text-sm text-gray-600">{serviceLine.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleServiceLine(serviceLine.line)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    serviceLine.activated
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {serviceLine.activated ? 'Activated' : 'Activate'}
                </button>
              </div>
              
              {serviceLine.activated && (serviceLine.line === 'sheltering' || serviceLine.line === 'feeding') && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">
                    Estimated Daily Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={serviceLine.line === 'sheltering' ? 'Beds/night' : 'Meals/day'}
                    value={serviceLine.estimatedDailyCapacity || ''}
                    onChange={(e) => updateCapacity(serviceLine.line, parseInt(e.target.value) || 0)}
                    className="w-full md:w-48 px-3 py-2 border rounded-md"
                  />
                </div>
              )}
            </div>
            
            {/* Resources Table */}
            {serviceLine.activated && (
              <div className="border-t bg-white/50 p-4">
                <h5 className="font-medium mb-3">Resource Requirements</h5>
                <div className="space-y-2">
                  {serviceLine.resourcesNeeded.map(resource => (
                    <div key={resource.type} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <div className="font-medium">{resource.type}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={resource.quantity}
                          onChange={(e) => updateResource(serviceLine.line, resource.type, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <span className="text-sm text-gray-600">{resource.unit}</span>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(resource.priority)}`}>
                          {resource.priority.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <select
                          value={resource.status}
                          onChange={(e) => updateResource(serviceLine.line, resource.type, 'status', e.target.value)}
                          className={`text-sm px-2 py-1 border rounded ${getStatusColor(resource.status)}`}
                        >
                          <option value="requested">Requested</option>
                          <option value="available">Available</option>
                          <option value="in_transit">In Transit</option>
                          <option value="on_site">On Site</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Resource Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Service Lines Activated:</span>
            <span className="ml-2 font-medium">{serviceLines.filter(sl => sl.activated).length}</span>
          </div>
          <div>
            <span className="text-gray-600">Critical Resources:</span>
            <span className="ml-2 font-medium">
              {serviceLines
                .filter(sl => sl.activated)
                .reduce((sum, sl) => sum + sl.resourcesNeeded.filter(r => r.priority === 'critical').length, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Resources:</span>
            <span className="ml-2 font-medium">
              {serviceLines
                .filter(sl => sl.activated)
                .reduce((sum, sl) => sum + sl.resourcesNeeded.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Please correct the following:</h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button 
          onClick={onPrev} 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
        >
          ← Previous
        </button>
        <button 
          onClick={validateAndNext} 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}