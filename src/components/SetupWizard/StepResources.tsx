'use client';

interface StepResourcesProps {
  data?: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepResources({ data, onUpdate, onNext, onPrev }: StepResourcesProps) {
  return (
    <div className="space-y-6">
      <p>Resource requirements will go here (service lines, supplies)</p>
      
      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          ← Previous
        </button>
        <button onClick={onNext} className="btn-primary">
          Next Step →
        </button>
      </div>
    </div>
  );
}