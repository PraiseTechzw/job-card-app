import React from 'react';
import type { JobCardStatus } from '../types';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface WorkflowTrackerProps {
  currentStatus: JobCardStatus;
}

const STEPS: { status: JobCardStatus; label: string }[] = [
  { status: 'Draft', label: 'Draft' },
  { status: 'Pending_Supervisor', label: 'Pending Appr' },
  { status: 'Pending_HOD', label: 'HOD Appr' },
  { status: 'Approved', label: 'Approved' },
  { status: 'Registered', label: 'Registered' },
  { status: 'Assigned', label: 'Assigned' },
  { status: 'InProgress', label: 'In Progress' },
  { status: 'Awaiting_SignOff', label: 'Review' },
  { status: 'SignedOff', label: 'Signed Off' },
  { status: 'Closed', label: 'Closed' }
];

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ currentStatus }) => {
  // If status is Pending_HOD, it might not be in the original list. Added above.
  let currentIndex = STEPS.findIndex(s => s.status === currentStatus);
  
  // Fallbacks if not perfectly matched
  if (currentIndex === -1) {
    if (currentStatus === 'Rejected') {
      // Show as stopped or error. Let's just highlight the first part
      currentIndex = 0;
    } else {
      currentIndex = 0;
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '24px',
      marginBottom: '32px',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
      overflowX: 'auto',
      position: 'relative'
    }} className="no-scrollbar">

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex || currentStatus === 'Closed';
        const isCurrent = index === currentIndex && currentStatus !== 'Closed';
        const isPending = index > currentIndex;

        // Define colors
        const completedBg = 'linear-gradient(135deg, #10b981, #059669)';
        const completedBorder = '#34d399';
        const completedText = '#34d399';
        const completedShadow = '0 0 15px rgba(16,185,129,0.4)';
        
        const currentBg = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        const currentBorder = '#60a5fa';
        const currentText = '#60a5fa';
        const currentShadow = '0 0 20px rgba(59,130,246,0.5)';
        
        const pendingBg = 'rgba(30, 41, 59, 1)';
        const pendingBorder = 'rgba(255, 255, 255, 0.1)';
        const pendingText = '#64748b';
        const pendingShadow = 'none';

        // Apply dynamically
        let iconBg, iconBorder, iconText, iconShadow, textCol;
        if (isCompleted) {
          iconBg = completedBg; iconBorder = completedBorder; iconText = '#fff'; iconShadow = completedShadow; textCol = completedText;
        } else if (isCurrent) {
          iconBg = currentBg; iconBorder = currentBorder; iconText = '#fff'; iconShadow = currentShadow; textCol = currentText;
        } else {
          iconBg = pendingBg; iconBorder = pendingBorder; iconText = '#475569'; iconShadow = pendingShadow; textCol = pendingText;
        }

        return (
          <React.Fragment key={step.status}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '80px',
              zIndex: 10,
              flex: 1,
              transition: 'all 0.4s ease',
              opacity: isPending ? 0.6 : 1,
              transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
            }}>
              
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                background: iconBg,
                border: `2px solid ${iconBorder}`,
                color: iconText,
                boxShadow: iconShadow,
                transition: 'all 0.5s ease',
                position: 'relative'
              }}>
                {isCompleted ? (
                   <CheckCircle2 size={18} />
                ) : isCurrent ? (
                   <>
                     <div style={{
                       position: 'absolute',
                       inset: '-6px',
                       borderRadius: '50%',
                       border: '2px solid rgba(59,130,246,0.3)',
                       animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                     }} />
                     <Clock size={16} style={{ animation: 'spin 4s linear infinite' }} />
                   </>
                ) : (
                   <Circle size={10} fill="currentColor" />
                )}
              </div>
              
              <span style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                textAlign: 'center',
                color: textCol,
                transition: 'color 0.3s ease'
              }}>
                {step.label}
              </span>
            </div>

            {/* Connecting Line */}
            {index < STEPS.length - 1 && (
              <div style={{ flex: '1 1 auto', position: 'relative', zIndex: 0 }}>
                <div style={{
                  height: '3px',
                  width: '100%',
                  position: 'absolute',
                  top: '-32px', 
                  left: 0,
                  transition: 'all 0.8s ease',
                  background: index < currentIndex ? 'linear-gradient(90deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                  boxShadow: index < currentIndex ? '0 0 10px rgba(16,185,129,0.5)' : 'none'
                }} />
              </div>
            )}
          </React.Fragment>
        );
      })}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WorkflowTracker;
