import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldX, ArrowLeft, Clock, User, AlertTriangle,
  Building2, CalendarDays, FileText, MessageSquare, CheckCircle2
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from '../JobCards.module.css';

const priorityColor = (p: string) => {
  if (p === 'Critical') return '#ef4444';
  if (p === 'High') return '#f59e0b';
  if (p === 'Medium') return '#0ea5e9';
  return '#64748b';
};

export default function JobApproval() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobCard, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);

  const job = id ? getJobCard(id) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!job) {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <AlertTriangle size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Job Not Found</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const canReviewRole = user?.role === 'Supervisor' || user?.role === 'EngSupervisor' || user?.role === 'Admin';
  const notApprovable = !canReviewRole || !['Pending_Supervisor', 'Draft'].includes(job.status);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateJobCard(job.id, {
        status: 'Pending_HOD',
        approvedBySupervisor: user?.name,
        performedBy: user?.name,
        userRole: user?.role,
      });
      await addAuditLog({
        jobCardId: job.id,
        action: 'JOB_APPROVED',
        performedBy: user?.name || 'Supervisor',
        details: `Approved by ${user?.name} at ${new Date().toLocaleTimeString()}`,
      });
      setDone('approved');
      setTimeout(() => navigate('/supervisor/dashboard'), 2500);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Approval failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateJobCard(job.id, {
        status: 'Rejected',
        supervisorComments: rejectionReason.trim(),
        performedBy: user?.name,
        userRole: user?.role,
      });
      await addAuditLog({
        jobCardId: job.id,
        action: 'JOB_REJECTED',
        performedBy: user?.name || 'Supervisor',
        details: `Rejected: ${rejectionReason.trim()}`,
      });
      setDone('rejected');
      setTimeout(() => navigate('/supervisor/dashboard'), 2500);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Rejection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            background: done === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {done === 'approved' ? <CheckCircle2 size={40} color="#10b981" /> : <ShieldX size={40} color="#ef4444" />}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: done === 'approved' ? '#10b981' : '#ef4444' }}>
            Job {done === 'approved' ? 'Approved' : 'Rejected'}
          </h2>
          <p style={{ color: '#64748b' }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value, warn }: { icon: any; label: string; value?: string; warn?: boolean }) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ color: '#475569', marginTop: 2, flexShrink: 0 }}><Icon size={15} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 3 }}>{label}</div>
        <div style={{ color: warn ? '#f87171' : '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Back nav */}
      <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')}
        style={{ marginBottom: 24, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.pageTitle}>Review Job Request</h1>
          <p className={styles.heroSubtitle}>
            Approve or reject this maintenance request. All actions are audit-logged.
          </p>
        </div>
        <div className={styles.heroActions}>
          <span style={{
            background: `${priorityColor(job.priority)}18`,
            color: priorityColor(job.priority),
            border: `1px solid ${priorityColor(job.priority)}33`,
            borderRadius: 9999, padding: '4px 14px',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>{job.priority}</span>
          <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Approval
          </span>
        </div>
      </div>

      {notApprovable && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <div>
            <strong>This job cannot be approved</strong>
            <p style={{ fontSize: 12, marginTop: 2, color: '#94a3b8' }}>
              Current status: <strong>{job.status}</strong>. Only Supervisors, EngSupervisors, or Admin can review jobs pending supervisor approval.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Left: Details */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#f1f5f9' }}>
            {job.ticketNumber}
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Submitted for supervisor approval</p>

          <InfoRow icon={User} label="Requested By" value={job.requestedBy} />
          <InfoRow icon={CalendarDays} label="Date Raised" value={job.dateRaised} />
          <InfoRow icon={CalendarDays} label="Required Completion" value={job.requiredCompletionDate}
            warn={job.requiredCompletionDate ? new Date(job.requiredCompletionDate) < new Date() : false} />
          <InfoRow icon={Building2} label="Plant / Asset" value={`${job.plantDescription} (ID: ${job.plantNumber})`} />
          <InfoRow icon={Clock} label="Plant Status" value={job.plantStatus} />

          <div style={{ marginTop: 20, padding: '16px', background: 'rgba(9,11,18,0.4)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8, letterSpacing: '0.05em' }}>
              <FileText size={12} style={{ display: 'inline', marginRight: 5 }} />
              Defect / Job Description
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{job.defect || '—'}</p>
          </div>

          {job.workRequest && (
            <div style={{ marginTop: 12, padding: '16px', background: 'rgba(9,11,18,0.4)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8, letterSpacing: '0.05em' }}>
                Work Request
              </div>
              <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{job.workRequest}</p>
            </div>
          )}

          {job.allocatedTrades?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8, letterSpacing: '0.05em' }}>Allocated Trades</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {job.allocatedTrades.map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Approval card */}
          <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldCheck size={20} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>Approve Job</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
              Approving will move this request to <strong style={{ color: '#94a3b8' }}>Pending HOD</strong> for final approval.
              Your name and timestamp will be recorded.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '12px', background: 'linear-gradient(135deg,#059669,#047857)' }}
              onClick={handleApprove}
              disabled={isSubmitting || notApprovable}
            >
              {isSubmitting ? 'Processing…' : <><ShieldCheck size={16} /> Approve Job</>}
            </button>
          </div>

          {/* Rejection card */}
          <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShieldX size={20} color="#ef4444" />
              <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 15 }}>Reject Job</span>
            </div>

            {!showRejectForm ? (
              <>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                  Rejection requires a mandatory reason. The requester will be notified.
                </p>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                  onClick={() => setShowRejectForm(true)} disabled={notApprovable}>
                  <ShieldX size={15} /> Reject this Job
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', gap: 5 }}>
                    <MessageSquare size={13} /> Rejection Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="form-textarea"
                    rows={4}
                    placeholder="Explain clearly why this request is being rejected…"
                    style={{ resize: 'vertical', minHeight: 80 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowRejectForm(false)} style={{ flex: 1 }}>Cancel</button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectionReason.trim()}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                      background: isSubmitting ? '#374151' : 'rgba(239,68,68,0.9)',
                      color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Processing…' : 'Confirm Reject'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Audit note */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
            <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
              <strong style={{ color: '#64748b' }}>Audit Notice:</strong><br />
              This action will be logged with your name ({user?.name}), role ({user?.role}), and timestamp for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
