import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, User, CheckCircle2,
  AlertTriangle, FileText, Edit2, RefreshCw, Wrench,
  Package, MessageSquare, ChevronRight
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

const WORKFLOW_STEPS = [
  { status: 'Draft',              label: 'Draft Created',        color: '#64748b' },
  { status: 'Pending_Supervisor', label: 'Submitted for Review', color: '#f59e0b' },
  { status: 'Approved',           label: 'Approved',             color: '#10b981' },
  { status: 'Registered',         label: 'Registered by Planning', color: '#0ea5e9' },
  { status: 'Assigned',           label: 'Assigned to Artisan',  color: '#6366f1' },
  { status: 'InProgress',         label: 'Work In Progress',     color: '#f59e0b' },
  { status: 'Awaiting_SignOff',   label: 'Awaiting Your Sign-Off', color: '#a78bfa' },
  { status: 'Closed',             label: 'Completed & Closed',   color: '#10b981' },
  { status: 'Rejected',           label: 'Rejected',             color: '#ef4444' },
];

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#475569', width: 180, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? '#e2e8f0' : '#3f4f6a', fontStyle: value ? 'normal' : 'italic', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: value ? 500 : 400 }}>
        {value || '—'}
      </span>
    </div>
  );
}

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobCard } = useJobCards();
  const { user } = useAuth();

  const job = id ? getJobCard(id) : undefined;

  if (!job) {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <AlertTriangle size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Request Not Found</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')}>← Dashboard</button>
        </div>
      </div>
    );
  }

  // Enforce: initiator can only see their own jobs
  const isOwner = job.requestedBy === user?.name || user?.role === 'Admin';
  if (!isOwner) {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <AlertTriangle size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Access Denied</h3>
          <p>You can only view requests you have raised.</p>
          <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')}>← Dashboard</button>
        </div>
      </div>
    );
  }

  const canEdit = job.status === 'Draft';
  const canResubmit = job.status === 'Rejected';
  const needsSignOff = job.status === 'Awaiting_SignOff';

  // Find current step index in the workflow
  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.status === job.status);
  const isTerminated = job.status === 'Rejected';

  const priorityColor = ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' } as any)[job.priority] || '#64748b';

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')} style={{ marginBottom: 22, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', marginBottom: 4 }}>
            {job.ticketNumber}
          </h1>
          <div className={styles.heroSubtitle}>{job.plantDescription} · {job.plantNumber}</div>
        </div>
        <div className={styles.heroActions}>
          {canEdit && (
            <button className="btn btn-primary" onClick={() => navigate(`/initiator/edit/${job.id}`)} style={{ gap: 6, fontSize: 13 }}>
              <Edit2 size={14} /> Edit Draft
            </button>
          )}
          {canResubmit && (
            <button className="btn btn-primary" onClick={() => navigate(`/initiator/edit/${job.id}`)} style={{ gap: 6, background: 'linear-gradient(135deg,#d97706,#b45309)', fontSize: 13 }}>
              <RefreshCw size={14} /> Resubmit
            </button>
          )}
          {needsSignOff && (
            <button className="btn btn-primary" onClick={() => navigate(`/job-cards/view/${job.id}`)} style={{ gap: 6, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', fontSize: 13 }}>
              <CheckCircle2 size={14} /> Sign Off Job
            </button>
          )}
        </div>
      </div>

      {/* Rejection / return alert */}
      {(job.status === 'Rejected') && job.supervisorComments && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 22, display: 'flex', gap: 14 }}>
          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171', marginBottom: 6 }}>Supervisor Feedback on Rejection</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{job.supervisorComments}</div>
            <button className="btn btn-ghost" style={{ marginTop: 10, gap: 6, fontSize: 12, color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
              onClick={() => navigate(`/initiator/edit/${job.id}`)}>
              <RefreshCw size={12} /> Resubmit Corrected Request <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {needsSignOff && (
        <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 22, display: 'flex', gap: 14, alignItems: 'center' }}>
          <CheckCircle2 size={20} color="#a78bfa" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#a78bfa', marginBottom: 4 }}>Work complete — your sign-off is needed</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>The artisan has completed the work. Please review and confirm the job was satisfactorily resolved.</div>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* Left: full request detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Request Details */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 16, display: 'flex', gap: 7, alignItems: 'center' }}>
              <FileText size={13} /> Request Information
            </h2>
            <Field label="Requested By" value={job.requestedBy} />
            <Field label="Date Raised" value={`${job.dateRaised} at ${job.timeRaised || '—'}`} />
            <Field label="Required Completion" value={job.requiredCompletionDate} />
            <Field label="Priority" value={job.priority} />
            <Field label="Plant Number" value={job.plantNumber} mono />
            <Field label="Plant Description" value={job.plantDescription} />
            <Field label="Plant Status" value={job.plantStatus} />
          </div>

          {/* Fault & Work */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 16, display: 'flex', gap: 7, alignItems: 'center' }}>
              <AlertTriangle size={13} /> Fault & Work Description
            </h2>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', marginBottom: 8 }}>Defect / Problem Observed</div>
              <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.8, background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14 }}>{job.defect || '—'}</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', marginBottom: 8 }}>Work Requested</div>
              <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.8, background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14 }}>{job.workRequest || '—'}</p>
            </div>
            {job.maintenanceSchedule && (
              <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 6 }}>Additional Context</div>
                <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.7 }}>{job.maintenanceSchedule}</p>
              </div>
            )}
          </div>

          {/* Work outcome — only visible once in progress/completed */}
          {['InProgress', 'Awaiting_SignOff', 'Closed'].includes(job.status) && (
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 16, display: 'flex', gap: 7, alignItems: 'center' }}>
                <Wrench size={13} /> Maintenance Work Record
              </h2>
              <Field label="Assigned Artisan" value={job.issuedTo} />
              <Field label="Date Completed" value={job.dateFinished} />
              <Field label="Machine Downtime" value={job.machineDowntime} />
              {job.workDoneDetails && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Work Done (Artisan Record)</div>
                  <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8, background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14, fontStyle: 'italic' }}>
                    {job.workDoneDetails}
                  </p>
                </div>
              )}
              {(job.sparesWithdrawn ?? []).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                    <Package size={11} /> Materials Used
                  </div>
                  {(job.sparesWithdrawn ?? []).map(sw => (
                    <div key={sw.id} style={{ fontSize: 12, color: '#64748b', padding: '4px 0' }}>• ×{sw.qty} {sw.description}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Status timeline */}
        <div className={`${styles.asideColumn} ${styles.stickyAside}`}>
          {/* Priority + status summary */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>Priority</span>
              <span style={{
                background: `${priorityColor}18`, color: priorityColor,
                border: `1px solid ${priorityColor}33`, borderRadius: 9999,
                padding: '3px 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase'
              }}>{job.priority}</span>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', display: 'block', marginBottom: 8 }}>Current Status</span>
              <div style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'center', fontWeight: 800, fontSize: 14,
                background: currentIdx >= 0 ? `${WORKFLOW_STEPS[currentIdx]?.color}18` : 'rgba(255,255,255,0.04)',
                color: currentIdx >= 0 ? WORKFLOW_STEPS[currentIdx]?.color : '#94a3b8',
                border: `1px solid ${currentIdx >= 0 ? WORKFLOW_STEPS[currentIdx]?.color + '33' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {WORKFLOW_STEPS[currentIdx]?.label || job.status.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Workflow timeline */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 18 }}>Workflow Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {WORKFLOW_STEPS.filter(s => s.status !== 'Rejected').map((step, i) => {
                const pastIdx = WORKFLOW_STEPS.findIndex(s => s.status === job.status);
                const stepIdx = WORKFLOW_STEPS.findIndex(s => s.status === step.status);
                const isDone = !isTerminated && stepIdx <= pastIdx && stepIdx !== currentIdx;
                const isActive = step.status === job.status && !isTerminated;

                return (
                  <div key={step.status} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < WORKFLOW_STEPS.length - 2 ? 14 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                        background: isDone ? '#10b981' : isActive ? step.color : 'rgba(255,255,255,0.08)',
                        border: `2px solid ${isDone ? '#10b981' : isActive ? step.color : 'rgba(255,255,255,0.1)'}`,
                      }} />
                      {i < WORKFLOW_STEPS.length - 2 && (
                        <div style={{ width: 2, flex: 1, minHeight: 12, background: isDone ? '#10b98166' : 'rgba(255,255,255,0.06)', marginTop: 2 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? step.color : isDone ? '#94a3b8' : '#475569' }}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTerminated && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', border: '2px solid #ef4444', flexShrink: 0 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>Rejected</div>
                </div>
              )}
            </div>
          </div>

          {/* Supervisor comment card */}
          {job.supervisorComments && (
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <MessageSquare size={11} /> Supervisor Comments
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{job.supervisorComments}</p>
            </div>
          )}

          {/* Artisan info */}
          {job.issuedTo && (
            <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <User size={11} /> Assigned Artisan
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 700 }}>
                  {job.issuedTo.charAt(0)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{job.issuedTo}</div>
              </div>
            </div>
          )}

          <button className="btn btn-ghost" onClick={() => navigate('/initiator/history')} style={{ gap: 6, fontSize: 13, width: '100%', justifyContent: 'center' }}>
            <Clock size={13} /> View Full History
          </button>
        </div>
      </div>
    </div>
  );
}
