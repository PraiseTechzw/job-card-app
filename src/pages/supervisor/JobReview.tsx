import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, RotateCcw, ArrowLeft, Clock, User,
  AlertTriangle, FileText, Wrench, Package, MessageSquare, Shield
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

export default function JobReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobCard, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();

  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [supervisorNote, setSupervisorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<'approved' | 'returned' | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const job = id ? getJobCard(id) : undefined;

  if (!job) {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <AlertTriangle size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Job Not Found</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')}>← Dashboard</button>
        </div>
      </div>
    );
  }

  const canReview = job.status === 'Awaiting_SignOff';

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateJobCard(job.id, {
        status: 'Closed',
        closedBy: user?.name,
        closedByDate: new Date().toISOString().split('T')[0],
        closedByTime: new Date().toLocaleTimeString(),
        supervisorComments: supervisorNote.trim() || undefined,
        performedBy: user?.name,
        userRole: user?.role,
      });
      await addAuditLog({
        jobCardId: job.id,
        action: 'JOB_REVIEW_APPROVED',
        performedBy: user?.name || 'Supervisor',
        details: `Final approval by ${user?.name}. Job closed. ${supervisorNote ? 'Note: ' + supervisorNote : ''}`,
      });
      setDone('approved');
      setTimeout(() => navigate('/supervisor/dashboard'), 3000);
    } catch (e: any) {
      alert(e?.message || 'Approval failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!returnReason.trim()) { alert('A return reason is mandatory.'); return; }
    setIsSubmitting(true);
    try {
      await updateJobCard(job.id, {
        status: 'InProgress',
        supervisorComments: returnReason.trim(),
        performedBy: user?.name,
        userRole: user?.role,
      });
      await addAuditLog({
        jobCardId: job.id,
        action: 'JOB_RETURNED_FOR_CORRECTION',
        performedBy: user?.name || 'Supervisor',
        details: `Returned to artisan. Reason: ${returnReason.trim()}`,
      });
      setDone('returned');
      setTimeout(() => navigate('/supervisor/dashboard'), 3000);
    } catch (e: any) {
      alert(e?.message || 'Failed to return job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ maxWidth: 460, margin: '80px auto', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            background: done === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {done === 'approved' ? <CheckCircle2 size={40} color="#10b981" /> : <RotateCcw size={40} color="#f59e0b" />}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: done === 'approved' ? '#10b981' : '#f59e0b', marginBottom: 8 }}>
            {done === 'approved' ? 'Job Approved & Closed' : 'Job Returned for Correction'}
          </h2>
          <p style={{ color: '#64748b' }}>
            {done === 'approved' ? 'This job has been permanently closed.' : 'The artisan has been notified to correct and resubmit.'}
          </p>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 12 }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon size={13} /> {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, value, danger, mono }: { label: string; value?: string | number | boolean; danger?: boolean; mono?: boolean }) => (
    <div style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#475569', width: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: danger ? '#f87171' : '#e2e8f0', fontWeight: value ? 500 : 400, fontStyle: value ? 'normal' : 'italic', fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value === undefined || value === null || value === '' ? '—' : String(value)}
      </span>
    </div>
  );

  const totalCost = (job.sparesWithdrawn || []).reduce((s, sw) => s + (parseFloat(sw.cost) || 0), 0);

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 960, margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')} style={{ marginBottom: 22, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(167,139,250,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Shield size={22} color="#a78bfa" />
            </span>
            Job Quality Review
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Validate completed work before final closure. All decisions are permanent and audit-logged.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            Awaiting Review
          </span>
        </div>
      </div>

      {!canReview && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <div>
            <strong>Review not applicable</strong>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              This job has status <strong>{job.status}</strong>. Only jobs with status <strong>Awaiting_SignOff</strong> can be reviewed here.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: Full work record */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>{job.ticketNumber}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{job.plantDescription} · {job.plantNumber}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#a78bfa' }}>#{job.ticketNumber.slice(-4)}</div>
          </div>

          {/* Request Info */}
          <Section title="Request Information" icon={FileText}>
            <Field label="Requested By" value={job.requestedBy} />
            <Field label="Date Raised" value={job.dateRaised} />
            <Field label="Required Completion" value={job.requiredCompletionDate} />
            <Field label="Plant Status" value={job.plantStatus} />
          </Section>

          {/* Work Execution */}
          <Section title="Work Performed by Artisan" icon={Wrench}>
            <Field label="Assigned Artisan" value={job.issuedTo} />
            <Field label="Date Finished" value={job.dateFinished} />
            <Field label="Start Hours" value={job.startHours} mono />
            <Field label="Machine Downtime" value={job.machineDowntime} />
            <Field label="Is Breakdown?" value={job.isBreakdown ? 'Yes — Breakdown' : 'No'} danger={job.isBreakdown} />
            <Field label="Cause of Failure" value={job.causeOfFailure} />
            <Field label="Further Work Required" value={job.furtherWorkRequired} />
            <Field label="Artisans Used" value={job.numArtisans} />
            <Field label="Apprentices/Assistants" value={`${job.numApprentices || 0} / ${job.numAssistants || 0}`} />
          </Section>

          {/* Work Done Description */}
          {job.workDoneDetails && (
            <Section title="Detailed Work Record" icon={MessageSquare}>
              <div style={{ background: 'rgba(9,11,18,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 16 }}>
                <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.workDoneDetails}</p>
              </div>
            </Section>
          )}

          {/* Materials */}
          <Section title="Spares & Materials" icon={Package}>
            {(job.sparesWithdrawn || []).length > 0 ? (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Qty', 'Description', 'SIV No.', 'Cost', 'Date'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(job.sparesWithdrawn || []).map(sw => (
                      <tr key={sw.id}>
                        <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{sw.qty}</td>
                        <td style={{ padding: '6px 8px', color: '#e2e8f0' }}>{sw.description}</td>
                        <td style={{ padding: '6px 8px', color: '#94a3b8', fontFamily: 'monospace' }}>{sw.sivNo}</td>
                        <td style={{ padding: '6px 8px', color: '#34d399', fontWeight: 700 }}>${parseFloat(sw.cost || '0').toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>{sw.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: 8, fontSize: 13, fontWeight: 700, color: '#34d399' }}>
                  Total Material Cost: ${totalCost.toFixed(2)}
                </div>
              </div>
            ) : (
              <p style={{ color: '#475569', fontSize: 13, fontStyle: 'italic' }}>No materials recorded.</p>
            )}
          </Section>

          {/* Spares Ordered */}
          {(job.sparesOrdered || []).length > 0 && (
            <Section title="Spares Ordered (External)" icon={Package}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(job.sparesOrdered || []).map(so => (
                  <div key={so.id} style={{ display: 'flex', gap: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 12px' }}>
                    <span style={{ color: '#64748b', fontSize: 12 }}>×{so.qty}</span>
                    <span style={{ color: '#e2e8f0', fontSize: 12, flex: 1 }}>{so.description}</span>
                    <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>PR#{so.prNo}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>{so.date}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right: Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          {/* Time Summary */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Clock size={12} /> Time Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Date Finished', job.dateFinished || '—'],
                ['Start Hours', job.startHours || '—'],
                ['Downtime', job.machineDowntime || '—'],
                ['Total Artisans', String(job.numArtisans || '—')],
              ].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Supervisor Notes */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <MessageSquare size={12} /> Supervisor Review Notes (optional)
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add quality notes, observations, or follow-up requirements…"
              value={supervisorNote}
              onChange={e => setSupervisorNote(e.target.value)}
              style={{ resize: 'vertical', fontSize: 13 }}
              disabled={!canReview}
            />
          </div>

          {/* Approve Action */}
          <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>Approve & Close Job</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
              Approving will permanently <strong style={{ color: '#94a3b8' }}>close</strong> this job. This action cannot be undone. Verify all work records are accurate.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '12px', background: 'linear-gradient(135deg,#059669,#047857)' }}
              onClick={handleApprove}
              disabled={isSubmitting || !canReview}
            >
              {isSubmitting ? 'Processing…' : <><CheckCircle2 size={16} /> Approve & Close</>}
            </button>
          </div>

          {/* Return Action */}
          <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <RotateCcw size={18} color="#f59e0b" />
              <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 14 }}>Return for Correction</span>
            </div>

            {!showReturnForm ? (
              <>
                <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                  Return the job to the artisan if the work record is incomplete or inaccurate. A reason is required.
                </p>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                  onClick={() => setShowReturnForm(true)} disabled={!canReview}>
                  <RotateCcw size={14} /> Return Job
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Return Reason <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Specify exactly what needs to be corrected…"
                    style={{ resize: 'vertical', fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setShowReturnForm(false)} style={{ flex: 1, fontSize: 13 }}>Cancel</button>
                  <button
                    onClick={handleReturn}
                    disabled={isSubmitting || !returnReason.trim()}
                    style={{ flex: 2, padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 13, background: 'rgba(245,158,11,0.85)', color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? 'Processing…' : 'Confirm Return'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Audit notice */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
              <User size={10} style={{ display: 'inline', marginRight: 4 }} />
              <strong style={{ color: '#64748b' }}>Audit:</strong> Logged as {user?.name} ({user?.role}) at submission time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
