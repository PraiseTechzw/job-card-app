import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2,
  XCircle, ArrowRight, Settings, Info, 
  AlertTriangle, Save, MessageSquare
} from 'lucide-react';
import styles from '../JobCards.module.css';

const WORKFLOW_STEPS = [
  'Draft', 'Pending_Supervisor', 'Pending_HOD', 'Approved', 
  'Registered', 'Assigned', 'InProgress', 'Awaiting_SignOff', 
  'SignedOff', 'Closed', 'Rejected'
];

export default function WorkflowConfig() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('Pending_Supervisor');
  const [isEditing, setIsEditing] = useState(false);

  // Mock rules for the active step
  const [config, setConfig] = useState<any>({
    'Pending_Supervisor': {
      label: 'Supervisor Approval',
      requiredRoles: ['Supervisor', 'Admin'],
      nextStatus: 'Approved',
      returnStatus: 'Rejected',
      mandatoryFields: ['Plant Status', 'Priority'],
      emailNotify: true,
      requiresHOD: false,
    },
    'Approved': {
      label: 'Planning Registration',
      requiredRoles: ['PlanningOffice', 'Admin'],
      nextStatus: 'Registered',
      mandatoryFields: ['Classification'],
      emailNotify: true,
    }
  });

  const handleUpdate = () => {
    if (confirm('Modifying workflow rules can impact mid-process jobs. This action will be audit-logged. Proceed?')) {
      setIsEditing(false);
      alert('Workflow configuration updated and audit-logged.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={24} color="#6366f1" />
              Workflow Configuration
            </h1>
            <p className={styles['text-muted']}>Manage operational rules, transition logic, and approval chains.</p>
          </div>
        </div>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Workflow Rules</button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdate}><Save size={16} style={{ marginRight: 6 }} /> Save Configuration</button>
          </div>
        )}
      </header>

      {/* Workflow Visualization Strip */}
      <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 30px', marginBottom: 24, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveStep(step)}
                style={{ 
                  background: activeStep === step ? '#4f46e5' : 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${activeStep === step ? '#4f46e5' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12, padding: '10px 18px', cursor: 'pointer', transition: 'all 0.2s',
                  transform: activeStep === step ? 'scale(1.05)' : 'scale(1)',
                  zIndex: activeStep === step ? 2 : 1
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: activeStep === step ? '#fff' : '#64748b', opacity: 0.6, marginBottom: 2 }}>Stage {i+1}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: activeStep === step ? '#fff' : '#e2e8f0', whiteSpace: 'nowrap' }}>{step.replace(/_/g, ' ')}</div>
              </button>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{ width: 30, height: 2, background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                  <ArrowRight size={10} color="#475569" style={{ position: 'absolute', top: -4, right: 3 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Step Configuration Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
              Rules for Stage: {activeStep.replace(/_/g, ' ')}
              <span style={{ color: '#6366f1', opacity: 0.7 }}>Active Configuration</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Allowed Actors</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {['Supervisor', 'Admin', 'Initiator', 'Artisan', 'Planner', 'HOD'].map(role => (
                    <div 
                      key={role} 
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, 
                        padding: '6px 12px', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 
                      }}
                    >
                      <input type="checkbox" checked={['Supervisor', 'Admin'].includes(role) && activeStep === 'Pending_Supervisor'} disabled={!isEditing} />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Forward Transition</label>
                <select className="form-select" disabled={!isEditing} style={{ fontSize: 13, background: 'rgba(9,11,18,0.7)', padding: '10px' }}>
                   <option>Approved</option>
                   <option>Registered</option>
                   <option>Awaiting Sign-Off</option>
                   <option>Closed</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Required Data Fields</label>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 8 }}>
                   {['Priority', 'Plant Status', 'Trade Allocation', 'Completion Date', 'Failure Code', 'Material Cost'].map(f => (
                     <div key={f} style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                       <input type="checkbox" checked={['Priority', 'Plant Status'].includes(f)} disabled={!isEditing} />
                       {f}
                     </div>
                   ))}
                 </div>
              </div>

              <div className="form-group">
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Notification Triggers</label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                       <input type="checkbox" checked={true} disabled={!isEditing} /> Notify Primary Actor (Email)
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                       <input type="checkbox" checked={true} disabled={!isEditing} /> Push notification to designated group
                    </div>
                 </div>
              </div>

              <div className="form-group">
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Return Path</label>
                 <select className="form-select" disabled={!isEditing} style={{ fontSize: 13, background: 'rgba(9,11,18,0.7)', padding: '10px' }}>
                    <option>Rejected (Terminate)</option>
                    <option>Draft (Request Correction)</option>
                    <option>Pending Supervisor (Escalate)</option>
                 </select>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
             <ShieldCheck size={20} color="#818cf8" />
             <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
               <strong>Workflow Guard:</strong> Changes to the approval chain require Admin role confirmation. 
               We enforce <strong>Non-Destructive Transitions</strong>: jobs currently in InProgress will not be impacted by changing the Pending_Supervisor branch to avoid operational deadlocks.
             </div>
          </div>
        </div>

        {/* Status Help / Glossary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Operational Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>Time-to-Approval Threshold</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>24 Hours</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Escalation triggers if approval is not granted within this window.</div>
               </div>
               <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>Overdue Definition</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>+4 Hours Past Target</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Jobs are tagged "Overdue" when finish time exceeds required by 4hrs.</div>
               </div>
               <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>Multi-Artisan Allowed</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>YES</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>System permits multiple resources to be logged against a single card.</div>
               </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
              <MessageSquare size={13} /> Config History
            </h3>
            <div style={{ fontSize: 11, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 8 }}>
               <div>• Last change: 2026-03-10 by [Admin]</div>
               <div>• Reason: Implementation of HOD Approval phase for Critical Jobs.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
