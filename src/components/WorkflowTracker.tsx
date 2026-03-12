import React from 'react';
import type { JobCardStatus } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface WorkflowTrackerProps {
  currentStatus: JobCardStatus;
}

const STEPS: { status: JobCardStatus; label: string }[] = [
  { status: 'Draft', label: 'Draft' },
  { status: 'Pending_Supervisor', label: 'Pending Appr' },
  { status: 'Approved', label: 'Approved' },
  { status: 'Registered', label: 'Registered' },
  { status: 'Assigned', label: 'Assigned' },
  { status: 'InProgress', label: 'In Progress' },
  { status: 'Completed', label: 'Completed' },
  { status: 'SignedOff', label: 'Signed Off' },
  { status: 'Closed', label: 'Closed' }
];

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between w-full px-4 py-6 mb-8 bg-slate-800/50 rounded-xl border border-white/10 overflow-x-auto">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex || currentStatus === 'Closed';
        const isCurrent = index === currentIndex;
        
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10
                ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' : 'bg-slate-700 text-slate-400'}
              `}>
                {isCompleted ? <CheckCircle2 size={18} /> : isCurrent ? <Clock size={18} /> : <Circle size={18} />}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-6 ${index < currentIndex ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowTracker;
