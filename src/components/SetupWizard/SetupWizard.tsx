'use client';

import { useState } from 'react';
import { StepBasics } from './StepBasics';
import { StepGeography } from './StepGeography';
import { StepStaffing } from './StepStaffing';
import { StepResources } from './StepResources';
import { StepReview } from './StepReview';
import { eventBus } from '@/lib/sync/EventBus';
import { EventType } from '@/lib/events/types';
import type { SetupWizardState, Operation } from '@/types';

interface SetupWizardProps {
  onComplete: (operation: Operation) => void;
}

const WIZARD_STEPS = [
  { id: 1, name: 'Operation Basics', description: 'Name, type, and activation level' },
  { id: 2, name: 'Geographic Scope', description: 'Affected regions and counties' },
  { id: 3, name: 'Initial Staffing', description: 'Command structure and key positions' },
  { id: 4, name: 'Resource Requirements', description: 'Service lines and initial needs' },
  { id: 5, name: 'Review & Launch', description: 'Confirm and create operation' },
];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [state, setState] = useState<SetupWizardState>({
    currentStep: 1,
    totalSteps: 5,
    completedSteps: [],
    data: {},
    validation: {},
  });

  const goToStep = async (step: number) => {
    if (step >= 1 && step <= state.totalSteps) {
      setState(prev => ({ ...prev, currentStep: step }));
      await eventBus.emit(EventType.SETUP_STEP_COMPLETED, { 
        step: state.currentStep,
        nextStep: step 
      }, {});
    }
  };

  const nextStep = () => {
    if (state.currentStep < state.totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])],
      }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  const updateData = (stepData: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...stepData },
    }));
  };

  const handleComplete = async () => {
    try {
      // Create the operation
      const operationId = generateId();
      const operation: Operation = {
        id: operationId,
        operationNumber: state.data.basics?.operationNumber || generateOperationNumber(),
        operationName: state.data.basics?.operationName || '',
        disasterType: state.data.basics?.disasterType || 'other',
        drNumber: state.data.basics?.drNumber,
        status: 'active',
        activationLevel: state.data.basics?.activationLevel || 'level_1',
        createdAt: new Date(),
        createdBy: getCurrentUserId(),
        geography: state.data.geography || { regions: [], states: [], counties: [], chapters: [] },
        metadata: {
          estimatedDuration: state.data.resources?.expectedDuration,
          serviceLinesActivated: state.data.resources?.serviceLinesNeeded || [],
        },
      };

      console.log('Creating operation:', operation);

      // Store creator info in metadata
      const creatorInfo = {
        name: state.data.basics?.creatorName,
        email: state.data.basics?.creatorEmail,
        phone: state.data.basics?.creatorPhone,
      };

      // Emit event (which will handle storage)
      await eventBus.emit(EventType.OPERATION_CREATED, {
        operationNumber: operation.operationNumber,
        operationName: operation.operationName,
        disasterType: operation.disasterType,
        activationLevel: operation.activationLevel,
        drNumber: operation.drNumber,
        creator: creatorInfo,
        estimatedDuration: state.data.basics?.estimatedDuration,
        notes: state.data.basics?.notes,
      }, { operationId });
      
      await eventBus.emit(EventType.SETUP_COMPLETED, { operationId }, { operationId });

      console.log('Operation created successfully');

      // Notify parent
      onComplete(operation);
    } catch (error) {
      console.error('Failed to create operation:', error);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <StepBasics
            data={state.data.basics}
            onUpdate={(data) => updateData({ basics: data })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <StepGeography
            data={state.data.geography}
            onUpdate={(data) => updateData({ geography: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StepStaffing
            data={state.data.staffing}
            onUpdate={(data) => updateData({ staffing: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <StepResources
            data={state.data.resources}
            onUpdate={(data) => updateData({ resources: data })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <StepReview
            data={state.data}
            onComplete={handleComplete}
            onPrev={prevStep}
            onEdit={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">New Operation Setup</h2>
        <p className="text-gray-600">
          Follow this guided process to ensure all critical elements are configured for your operation.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {WIZARD_STEPS.map((step, index) => (
              <li key={step.id} className={index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''}>
                <div className="flex items-center">
                  <button
                    onClick={() => state.completedSteps.includes(step.id) && goToStep(step.id)}
                    disabled={!state.completedSteps.includes(step.id) && step.id !== state.currentStep}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full
                      ${step.id === state.currentStep
                        ? 'bg-red-cross-red text-white'
                        : state.completedSteps.includes(step.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                      ${state.completedSteps.includes(step.id) ? 'cursor-pointer hover:bg-green-700' : ''}
                      transition-colors
                    `}
                  >
                    {state.completedSteps.includes(step.id) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-2
                      ${state.completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                <div className="mt-2">
                  <p className={`text-sm font-medium ${
                    step.id === state.currentStep ? 'text-red-cross-red' : 'text-gray-900'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStep()}
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Setup Tips</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>You can return to previous steps to make changes</li>
                <li>All fields with asterisks (*) are required</li>
                <li>The operation will be immediately active once created</li>
                <li>Additional staff and resources can be added after setup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateId(): string {
  return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateOperationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000);
  return `${year}${month}${day}-${random}`;
}

function getCurrentUserId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('disaster_ops_user_id') || 'system';
  }
  return 'system';
}