'use client';

interface StepReviewProps {
  data: any;
  onComplete: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
}

export function StepReview({ data, onComplete, onPrev, onEdit }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Setup</h3>
      
      <div className="space-y-4">
        {data.basics && (
          <div className="card">
            <h4 className="font-medium mb-2">Operation Basics</h4>
            <p>Name: {data.basics.operationName}</p>
            <p>Type: {data.basics.disasterType}</p>
            <p>Level: {data.basics.activationLevel}</p>
            <button onClick={() => onEdit(1)} className="text-sm text-blue-600 hover:underline">
              Edit
            </button>
          </div>
        )}
        
        {data.geography && (
          <div className="card">
            <h4 className="font-medium mb-2">Geographic Scope</h4>
            <p>Details to be shown here</p>
            <button onClick={() => onEdit(2)} className="text-sm text-blue-600 hover:underline">
              Edit
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary">
          ← Previous
        </button>
        <button onClick={onComplete} className="btn-primary">
          Create Operation
        </button>
      </div>
    </div>
  );
}