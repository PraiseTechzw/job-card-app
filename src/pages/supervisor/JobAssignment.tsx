import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UserPlus, ArrowLeft, AlertTriangle, RefreshCw, CheckCircle2,
  User, Building2, CalendarDays, Clock, StickyNote
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

// We strictly fetch from backend database now. No hardcoded users.


export default function JobAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobCard, updateJobCard, addAssignment, addAuditLog, assignments } = useJobCards();
  const { user } = useAuth();

  const [artisanRoster, setArtisanRoster] = useState<string[]>([]);
  const [artisanName, setArtisanName] = useState('');
  const [section, setSection] = useState('');
  const [priority, setPriority] = useState('');
  const [expectedStart, setExpectedStart] = useState('');
  const [expectedEnd, setExpectedEnd] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function fetchArtisans() {
      try {
        const res = await axios.get('/api/users?role=Artisan');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setArtisanRoster(res.data.map((u: any) => u.name));
        } else {
          setArtisanRoster([]);
        }
      } catch (e) {
        console.error('Failed to load DB artisans', e);
        setArtisanRoster([]);
      }
    }
    fetchArtisans();
  }, []);

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

  const isReassign = ['Assigned', 'InProgress'].includes(job.status);
  const canAssign = ['Registered', 'Approved', 'Assigned', 'InProgress'].includes(job.status);

  // Build artisan workload from assignments context
  const workloadMap: Record<string, number> = {};
  assignments.forEach(a => {
    if (['Assigned', 'InProgress'].includes(a.status)) {
      workloadMap[a.artisanName] = (workloadMap[a.artisanName] || 0) + 1;
    }
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanName.trim()) { alert('Please select or enter an artisan name.'); return; }
    setIsSubmitting(true);
    try {
      await addAssignment({
        jobCardId: job.id,
        artisanName: artisanName.trim(),
        section: section.trim(),
        assignedBy: user?.name || 'Supervisor',
        assignedDate: new Date().toISOString().split('T')[0],
        expectedStartDate: expectedStart,
        expectedCompletionDate: expectedEnd,
        notes: instructions.trim(),
        status: 'Assigned',
      });

      await updateJobCard(job.id, {
        status: 'Assigned',
        issuedTo: artisanName.trim(),
        priority: (priority as any) || job.priority,
        performedBy: user?.name,
        userRole: user?.role,
      });

      await addAuditLog({
        jobCardId: job.id,
        action: isReassign ? 'JOB_REASSIGNED' : 'JOB_ASSIGNED',
        performedBy: user?.name || 'Supervisor',
        details: `${isReassign ? 'Reassigned' : 'Assigned'} to ${artisanName} by ${user?.name}. Instructions: ${instructions || 'None'}`,
      });

      setDone(true);
      setTimeout(() => navigate('/supervisor/dashboard'), 2500);
    } catch (e: any) {
      alert(e?.message || 'Assignment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ maxWidth: 460, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={38} color="#10b981" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
            {isReassign ? 'Job Reassigned' : 'Job Assigned'}
          </h2>
          <p style={{ color: '#64748b' }}>{artisanName} has been assigned to {job.ticketNumber}.</p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const priorityColor = (p: string) => ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9' } as any)[p] || '#64748b';

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 860, margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')} style={{ marginBottom: 22, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isReassign ? <><RefreshCw size={20} color="#f59e0b" /> Reassign Job</> : <><UserPlus size={20} color="#10b981" /> Assign Job</>}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {isReassign ? 'Reassign this job to a different artisan.' : 'Allocate this approved job to an artisan for execution.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            background: `${priorityColor(job.priority)}18`, color: priorityColor(job.priority),
            border: `1px solid ${priorityColor(job.priority)}33`,
            borderRadius: 9999, padding: '4px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase'
          }}>{job.priority}</span>
        </div>
      </div>

      {!canAssign && (
        <div className="alert-card alert-card-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <div>
            <strong>Assignment not allowed</strong>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              This job has status <strong>{job.status}</strong>. Only Registered or Approved jobs can be assigned here.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Job Summary */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 18 }}>Job Details</h2>

          {([
            [Building2, 'Job Card', job.ticketNumber],
            [User, 'Requested By', job.requestedBy],
            [Building2, 'Plant', `${job.plantDescription} (${job.plantNumber})`],
            [CalendarDays, 'Required Completion', job.requiredCompletionDate],
            [User, 'Currently Assigned To', job.issuedTo || 'Unassigned'],
          ] as any[]).map(([Icon, label, val], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
              <Icon size={14} color="#475569" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{val || '—'}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 14, background: 'rgba(9,11,18,0.4)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: 6 }}>Defect Description</div>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{job.defect || '—'}</p>
          </div>
        </div>

        {/* Assignment Form */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 18 }}>
            {isReassign ? 'Reassignment Details' : 'Assignment Details'}
          </h2>

          <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Artisan Selector */}
            <div>
              <label className="form-label">Artisan / Technician <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="form-select"
                value={artisanName}
                onChange={e => setArtisanName(e.target.value)}
                required
              >
                <option value="">— Select Artisan —</option>
                {artisanRoster.length === 0 && <option value="" disabled>No Artisans found in Database</option>}
                {artisanRoster.map(a => (
                  <option key={a} value={a}>
                    {a}{workloadMap[a] ? ` (${workloadMap[a]} active job${workloadMap[a] > 1 ? 's' : ''})` : ''}
                  </option>
                ))}
                <option value="__custom">Other (type below)</option>
              </select>
              {artisanName === '__custom' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter artisan name"
                  onChange={e => setArtisanName(e.target.value)}
                />
              )}
            </div>

            {/* Section */}
            <div>
              <label className="form-label">Section / Trade</label>
              <input
                type="text" className="form-input"
                placeholder="e.g. Fitting, Electrical, Machine Shop"
                value={section} onChange={e => setSection(e.target.value)}
              />
            </div>

            {/* Priority override */}
            <div>
              <label className="form-label">Adjust Priority (optional)</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="">Keep current: {job.priority}</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="form-label"><CalendarDays size={11} style={{ display: 'inline', marginRight: 4 }} />Expected Start</label>
                <input type="date" className="form-input" value={expectedStart} onChange={e => setExpectedStart(e.target.value)} />
              </div>
              <div>
                <label className="form-label"><CalendarDays size={11} style={{ display: 'inline', marginRight: 4 }} />Expected Finish</label>
                <input type="date" className="form-input" value={expectedEnd} onChange={e => setExpectedEnd(e.target.value)} />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="form-label"><StickyNote size={11} style={{ display: 'inline', marginRight: 4 }} />Supervisor Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Any specific notes, precautions, or instructions for the artisan…"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !canAssign}
                style={{ flex: 2, justifyContent: 'center', gap: 8, background: isReassign ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#059669,#047857)' }}>
                {isSubmitting ? 'Processing…' : isReassign
                  ? <><RefreshCw size={16} /> Confirm Reassignment</>
                  : <><UserPlus size={16} /> Confirm Assignment</>
                }
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
              <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
              This action will be audit-logged with your name and timestamp.
            </p>
          </form>
        </div>
      </div>

      {/* Artisan Workload Summary */}
      {Object.keys(workloadMap).length > 0 && (
        <div style={{ marginTop: 20, background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 14 }}>Current Artisan Workload</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(workloadMap).map(([name, count]) => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 13, fontWeight: 700 }}>
                  {name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{name}</div>
                  <div style={{ fontSize: 10, color: count >= 3 ? '#f59e0b' : '#64748b' }}>
                    {count} active job{count > 1 ? 's' : ''}
                    {count >= 3 && <span style={{ marginLeft: 4, color: '#f59e0b' }}>⚠ Busy</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
