import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ArrowLeft, ThumbsUp,
  ThumbsDown, MessageSquare, Wrench, Package, Clock
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

export default function CompletionFeedback() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobCard, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();

  const [satisfaction, setSatisfaction] = useState<'satisfied' | 'unsatisfied' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  // Only the owner can submit feedback
  const isOwner = job.requestedBy === user?.name || user?.role === 'Admin';
  const canFeedback = isOwner && job.status === 'Awaiting_SignOff';

  const handleSubmit = async () => {
    if (!satisfaction) { alert('Please indicate whether the work was satisfactory.'); return; }
    setIsSubmitting(true);
    try {
      if (satisfaction === 'satisfied') {
        // Close the job from initiator side — sets originatorSignOff
        await updateJobCard(job.id, {
          originatorSignOff: user?.name,
          closedBy: user?.name,
          closedByDate: new Date().toISOString().split('T')[0],
          supervisorComments: feedback.trim() || undefined,
          performedBy: user?.name,
          userRole: user?.role,
        });
        await addAuditLog({
          jobCardId: job.id,
          action: 'COMPLETION_FEEDBACK_SUBMITTED',
          performedBy: user?.name || '',
          details: `Initiator confirmed satisfactory completion. Feedback: ${feedback || 'None'}`,
        });
      } else {
        // Flag an issue — log it, leave status for supervisor to review
        await addAuditLog({
          jobCardId: job.id,
          action: 'COMPLETION_ISSUE_RAISED',
          performedBy: user?.name || '',
          details: `Initiator raised issue with completion. Reason: ${feedback || 'No reason given'}`,
        });
      }
      setDone(true);
    } catch (e: any) {
      alert(e?.message || 'Submission failed. Please try again.');
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
            background: satisfaction === 'satisfied' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {satisfaction === 'satisfied'
              ? <CheckCircle2 size={40} color="#10b981" />
              : <AlertTriangle size={40} color="#f59e0b" />}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: satisfaction === 'satisfied' ? '#10b981' : '#f59e0b', marginBottom: 12 }}>
            {satisfaction === 'satisfied' ? 'Feedback Submitted — Thank You' : 'Issue Flagged'}
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            {satisfaction === 'satisfied'
              ? 'Your sign-off has been recorded. The job card will be closed by the supervisor.'
              : 'Your concern has been logged. The supervisor will review and follow up.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/initiator/dashboard')} style={{ marginTop: 24 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalCost = (job.sparesWithdrawn || []).reduce((s, sw) => s + (parseFloat(sw.cost) || 0), 0);

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 820, margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')} style={{ marginBottom: 22, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: 26 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 4 }}>✅ Confirm Work Completion</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          The maintenance team has recorded work completed for your request. Please review the work summary below and confirm whether the issue has been resolved.
        </p>
      </div>

      {!isOwner && (
        <div className="alert-card alert-card-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <div>You can only submit feedback for requests you raised.</div>
        </div>
      )}

      {!canFeedback && isOwner && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <div>
            This job card has status <strong>{job.status}</strong>.
            Feedback can only be submitted when the job is <strong>Awaiting Sign-Off</strong>.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left: Work record summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Job summary */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 18 }}>Your Original Request</h2>
            {[
              ['Job Card', job.ticketNumber],
              ['Plant', `${job.plantDescription} (${job.plantNumber})`],
              ['Date Raised', job.dateRaised],
              ['Priority', job.priority],
              ['Your Request', job.workRequest],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: '#475569', width: 130, flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          {/* Work done record */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 18, display: 'flex', gap: 7, alignItems: 'center' }}>
              <Wrench size={13} /> What the Artisan Did
            </h2>
            <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: '#475569', width: 130, flexShrink: 0 }}>Artisan</span>
              <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{job.issuedTo || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: '#475569', width: 130, flexShrink: 0 }}>Date Finished</span>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>{job.dateFinished || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: '#475569', width: 130, flexShrink: 0 }}>Machine Downtime</span>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>{job.machineDowntime || '—'}</span>
            </div>

            {job.workDoneDetails && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Work Done Record</div>
                <div style={{ background: 'rgba(9,11,18,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 9, padding: 14 }}>
                  <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>{job.workDoneDetails}</p>
                </div>
              </div>
            )}

            {(job.sparesWithdrawn || []).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <Package size={11} /> Materials Used
                </div>
                {(job.sparesWithdrawn || []).map(sw => (
                  <div key={sw.id} style={{ display: 'flex', gap: 12, padding: '4px 0', fontSize: 12, color: '#64748b' }}>
                    <span>×{sw.qty}</span>
                    <span style={{ flex: 1, color: '#94a3b8' }}>{sw.description}</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>${parseFloat(sw.cost || '0').toFixed(2)}</span>
                  </div>
                ))}
                {totalCost > 0 && (
                  <div style={{ textAlign: 'right', marginTop: 8, fontSize: 13, fontWeight: 700, color: '#34d399' }}>
                    Total: ${totalCost.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Feedback action panel */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Was the Issue Resolved?</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Your response helps us close the loop and track maintenance quality. Be honest.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => setSatisfaction('satisfied')}
                disabled={!canFeedback}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', borderRadius: 12, cursor: canFeedback ? 'pointer' : 'not-allowed',
                  background: satisfaction === 'satisfied' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${satisfaction === 'satisfied' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.15s', opacity: canFeedback ? 1 : 0.5,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: satisfaction === 'satisfied' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ThumbsUp size={18} color={satisfaction === 'satisfied' ? '#10b981' : '#64748b'} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: satisfaction === 'satisfied' ? '#10b981' : '#94a3b8' }}>Yes, issue resolved</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Work was satisfactorily completed</div>
                </div>
              </button>

              <button
                onClick={() => setSatisfaction('unsatisfied')}
                disabled={!canFeedback}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', borderRadius: 12, cursor: canFeedback ? 'pointer' : 'not-allowed',
                  background: satisfaction === 'unsatisfied' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${satisfaction === 'unsatisfied' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.15s', opacity: canFeedback ? 1 : 0.5,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: satisfaction === 'unsatisfied' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ThumbsDown size={18} color={satisfaction === 'unsatisfied' ? '#f59e0b' : '#64748b'} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: satisfaction === 'unsatisfied' ? '#f59e0b' : '#94a3b8' }}>No, problem persists</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Flag the issue for the supervisor</div>
                </div>
              </button>
            </div>

            {satisfaction && (
              <div style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, fontSize: 12 }}>
                  <MessageSquare size={11} />
                  {satisfaction === 'satisfied' ? 'Additional Comments (optional)' : 'Describe the Remaining Issue *'}
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder={satisfaction === 'satisfied' ? 'Any comments on the quality of the maintenance work…' : 'Describe exactly what still needs to be fixed…'}
                  style={{ resize: 'vertical', fontSize: 13 }}
                />
              </div>
            )}

            {satisfaction === 'unsatisfied' && (
              <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
                  ⚠️ This will NOT close the job. A flag will be logged and the supervisor will review.
                  You cannot close jobs yourself. Only the supervisor can take further action.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canFeedback || !satisfaction || (satisfaction === 'unsatisfied' && !feedback.trim())}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '12px',
                background: satisfaction === 'satisfied' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#d97706,#b45309)',
                opacity: (!canFeedback || !satisfaction || (satisfaction === 'unsatisfied' && !feedback.trim())) ? 0.5 : 1,
              }}
            >
              {isSubmitting ? 'Submitting…' : satisfaction === 'satisfied'
                ? <><CheckCircle2 size={16} /> Confirm & Submit Sign-Off</>
                : <><AlertTriangle size={16} /> Flag Issue to Supervisor</>}
            </button>

            <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
              Your response is permanently audit-logged with your name and timestamp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
