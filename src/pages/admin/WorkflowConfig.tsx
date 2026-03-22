import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  RefreshCw, ArrowLeft, ShieldCheck, 
  ArrowRight, Save, MessageSquare
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
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await axios.get('/api/admin/config');
        if (res.data.workflow) {
          setConfig(res.data.workflow);
        } else {
          // Default fallback
          setConfig({
            'Pending_Supervisor': {
              label: 'Supervisor Approval',
              requiredRoles: ['Supervisor', 'Admin'],
              nextStatus: 'Approved',
              returnStatus: 'Rejected',
              mandatoryFields: ['Priority', 'Plant Status'],
              emailNotify: true
            }
          });
        }
      } catch (e) {
        console.error('Failed to fetch workflow config', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (confirm('Modifying operational workflow rules can impact mid-process jobs. All changes are logged for forensic audit. Continue?')) {
      try {
        await axios.post('/api/admin/config', { key: 'workflow', value: config });
        setIsEditing(false);
        alert('Workflow configuration synchronized successfully.');
      } catch (e) {
        alert('Failed to save configuration.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={40} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#475569', fontWeight: 600 }}>Loading Transition Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RefreshCw size={24} color="#6366f1" />
              Operational Workflow Governance
            </h1>
            <p className={styles['text-muted']}>Control state transitions, approval thresholds and validation rules.</p>
          </div>
        </div>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Workflow Rules</button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><Save size={16} style={{ marginRight: 6 }} /> Save Configuration</button>
          </div>
        )}
      </header>

      {/* Workflow Visualization Strip */}
      <div className="overflow-x-auto mb-6" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 30px' }}>
        <div className="flex items-center gap-0">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <button 
                onClick={() => setActiveStep(step)}
                style={{ 
                  background: activeStep === step ? '#4f46e5' : 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${activeStep === step ? '#4f46e5' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12, padding: '10px 18px', cursor: 'pointer', transition: 'all 0.2s',
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Step Configuration Detail */}
        <div className="flex flex-col gap-6">
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
              Governance for: {activeStep.replace(/_/g, ' ')}
              <span className="badge badge-info" style={{ opacity: 0.7 }}>Level 1 Validation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Allowed Actors (ACL)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Supervisor', 'Admin', 'Initiator', 'Artisan', 'Planner', 'HOD'].map(role => (
                    <label 
                      key={role} 
                      className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10"
                      style={{ fontSize: 12, color: '#94a3b8' }}
                    >
                      <input type="checkbox" checked={config[activeStep]?.requiredRoles?.includes(role)} disabled={!isEditing} onChange={() => {
                        const current = config[activeStep]?.requiredRoles || [];
                        const updated = current.includes(role) ? current.filter((r:any) => r !== role) : [...current, role];
                        setConfig({...config, [activeStep]: {...config[activeStep], requiredRoles: updated}});
                      }} />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Success Path (Next Status)</label>
                <select className="form-select mt-2" disabled={!isEditing} style={{ fontSize: 13 }} value={config[activeStep]?.nextStatus || ''} onChange={e => setConfig({...config, [activeStep]: {...config[activeStep], nextStatus: e.target.value}})}>
                   <option value="">Select Next Status...</option>
                   {WORKFLOW_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group md:col-span-2">
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Mandatory Fields for Handover</label>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                   {['Priority', 'Plant Status', 'Trade Allocation', 'Target Date', 'Failure Code', 'Artisan Assignee'].map(f => (
                     <label key={f} className="flex items-center gap-2" style={{ fontSize: 12, color: '#64748b' }}>
                       <input type="checkbox" checked={config[activeStep]?.mandatoryFields?.includes(f)} disabled={!isEditing} onChange={() => {
                         const current = config[activeStep]?.mandatoryFields || [];
                         const updated = current.includes(f) ? current.filter((r:any) => r !== f) : [...current, f];
                         setConfig({...config, [activeStep]: {...config[activeStep], mandatoryFields: updated}});
                       }} />
                       {f}
                     </label>
                   ))}
                 </div>
              </div>

              <div className="form-group">
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Termination Path (Regress)</label>
                 <select className="form-select mt-2" disabled={!isEditing} value={config[activeStep]?.returnStatus || ''} onChange={e => setConfig({...config, [activeStep]: {...config[activeStep], returnStatus: e.target.value}})}>
                    <option value="Rejected">Rejected (Terminate)</option>
                    <option value="Draft">Draft (Request Clarification)</option>
                    <option value="Pending_Supervisor">Return to Supervisor</option>
                 </select>
              </div>

              <div className="form-group">
                 <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>System Triggers</label>
                 <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-2" style={{ fontSize: 12, color: '#64748b' }}>
                       <input type="checkbox" checked={config[activeStep]?.emailNotify} disabled={!isEditing} onChange={e => setConfig({...config, [activeStep]: {...config[activeStep], emailNotify: e.target.checked}})} />
                       Automated Email to Role Cluster
                    </label>
                    <label className="flex items-center gap-2" style={{ fontSize: 12, color: '#64748b' }}>
                       <input type="checkbox" checked={true} disabled={true} />
                       Audit Log Entry (Enforced)
                    </label>
                 </div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
             <ShieldCheck size={20} color="#818cf8" />
             <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
               <strong>Resilience Note:</strong> Modifying the <em>Success Path</em> on stages with active job cards will result in re-validation of those cards upon their next action. 
               We maintain a <strong>Versioned Workflow Logic</strong> to ensure historical integrity.
             </div>
          </div>
        </div>

        {/* Sidebar: Metadata & Analytics */}
        <div className="flex flex-col gap-6">
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>SLA Governance</h3>
            <div className="flex flex-col gap-4">
               <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>APPROVAL SLA</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>24.0 Hours</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Total window allowed for Supervisor + HOD review.</div>
               </div>
               <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>PLANNING WINDOW</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>+4 Hours Max</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Target buffer for registration after final approval.</div>
               </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
              <MessageSquare size={13} /> Change History
            </h3>
            <div style={{ fontSize: 11, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 10 }}>
               <div>• 2026-03-19: Schema upgrade applied</div>
               <div>• 2026-03-10: HOD Phase integration</div>
               <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)', color: '#4f46e5', fontWeight: 700 }}>Version 4.2.0-STABLE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
