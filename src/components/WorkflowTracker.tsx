import React from 'react';
import type { JobCardStatus } from '../types';
import { CheckCircle2, Clock } from 'lucide-react';

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
  { status: 'Awaiting_SignOff', label: 'Await Sign-off' },
  { status: 'SignedOff', label: 'Signed Off' },
  { status: 'Closed', label: 'Closed' }
];

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between w-full px-6 py-6 mb-8 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto no-scrollbar shadow-2xl relative">
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-[21px] mx-12"></div>
      
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex || currentStatus === 'Closed';
        const isCurrent = index === currentIndex;
        
        return (
          <React.Fragment key={step.status}>
            <div className={`flex flex-col items-center min-w-[100px] z-10 transition-all duration-500 ${isCurrent ? 'scale-110' : 'opacity-70'}`}>
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-lg border-2
                transition-all duration-700
                ${isCompleted ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 
                  isCurrent ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/40 ring-4 ring-blue-500/20 animate-pulse' : 
                  'bg-slate-800 border-slate-700 text-slate-500'}
              `}>
                {isCompleted ? <CheckCircle2 size={20} className="animate-in zoom-in" /> : isCurrent ? <Clock size={20} className="animate-spin-slow" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
              </div>
              <span className={`text-[9px] uppercase tracking-[0.1em] font-bold whitespace-nowrap text-center
                ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-blue-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="flex-1 min-w-[20px] relative z-0">
                <div className={`h-[2px] w-full transition-all duration-1000 delay-300 -translate-y-[21px]
                  ${index < currentIndex ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} 
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default WorkflowTracker;
