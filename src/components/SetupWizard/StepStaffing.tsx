'use client';

interface StepStaffingProps {
  data?: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepStaffing({ data, onUpdate, onNext, onPrev }: StepStaffingProps) {
  return (
    <div className="space-y-6">
      <p>Initial staffing assignments will go here (IC, section chiefs)</p>
      
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