import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Tag, Save, AlertTriangle, CheckCircle2,
  FileText, Wrench, Package, Clock, User, Activity,
  StickyNote, ShieldCheck
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

const FAILURE_CATEGORIES = [
  'Mechanical Wear', 'Electrical Fault', 'Operator Error', 'Material Failure',
  'Corrosion / Environmental', 'Lubrication Failure', 'Overload', 'Design Deficiency',
  'Installation Error', 'Normal Maintenance', 'Unknown / Unclassified'
];
const ROOT_CAUSES = [
  'Age / End of Life', 'Improper Setting / Adjustment', 'Contamination',
  'Fatigue / Cyclic Loading', 'Vibration', 'Overheating', 'Moisture / Humidity',
  'Poor Maintenance Practice', 'Incorrect Part', 'Human Error', 'Design Issue', 'Unknown'
];
const MAINTENANCE_TYPES = ['Corrective', 'Preventive', 'Predictive', 'Condition-Based', 'Planned Shutdown'];
const COST_CATEGORIES = ['Routine', 'Emergency', 'Warranty', 'Capital', 'Operational'];
const EQUIPMENT_CLASSES = ['Rotating Equipment', 'Static Equipment', 'Electrical', 'Instrumentation', 'Civil / Structural', 'Utilities / Services'];

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Icon size={14} color="#6366f1" />
      <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>{title}</h2>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, color: '#475569', width: 160, flexShrink: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: value ? '#e2e8f0' : '#334155', fontStyle: value ? 'normal' : 'italic' }}>{value || 'Not recorded'}</span>
    </div>
  );
}

export default function JobClassification() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getJobCard, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();

  const job = id ? getJobCard(id) : undefined;
  const startClassifying = searchParams.get('classify') === '1';

  const [classifyMode, setClassifyMode] = useState(startClassifying);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [failureCategory, setFailureCategory] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [equipmentClass, setEquipmentClass] = useState('');
  const [costCategory, setCostCategory] = useState('');
  const [plannerNotes, setPlannerNotes] = useState('');

  useEffect(() => { if (startClassifying) setClassifyMode(true); }, [startClassifying]);

  if (!job) {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <AlertTriangle size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Job Record Not Found</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/planner/jobs')}>← Job Records</button>
        </div>
      </div>
    );
  }

  const totalMaterialCost = (job.sparesWithdrawn || []).reduce((s, sw) => s + (parseFloat(sw.cost) || 0), 0);
  const totalHours = (job.resourceUsage || []).reduce((s, r) => s + (r.hoursWorked || 0), 0);

  const handleSaveClassification = async () => {
    if (!failureCategory || !maintenanceType) {
      alert('Failure Category and Maintenance Type are required before saving classification.');
      return;
    }
    setIsSaving(true);
    try {
      // Store in maintenanceSchedule field as structured metadata (non-destructive annotation)
      const metadata = [
        `[PLANNER] Classified by ${user?.name} on ${new Date().toLocaleDateString()}`,
        `Failure Category: ${failureCategory}`,
        `Root Cause: ${rootCause || 'Not classified'}`,
        `Maintenance Type: ${maintenanceType}`,
        `Equipment Class: ${equipmentClass || 'Not classified'}`,
        `Cost Category: ${costCategory || 'Not classified'}`,
        plannerNotes ? `Planner Notes: ${plannerNotes}` : '',
      ].filter(Boolean).join(' | ');

      await updateJobCard(job.id, {
        registrationPlanning: user?.name,
        maintenanceSchedule: job.maintenanceSchedule
          ? `${job.maintenanceSchedule} || ${metadata}`
          : metadata,
        performedBy: user?.name,
        userRole: user?.role,
      });
      await addAuditLog({
        jobCardId: job.id,
        action: 'JOB_CLASSIFIED',
        performedBy: user?.name || '',
        details: `Classified: ${failureCategory} / ${maintenanceType}. Root cause: ${rootCause}.`,
      });
      setSaved(true);
      setClassifyMode(false);
    } catch (e: any) {
      alert(e?.message || 'Failed to save classification.');
    } finally {
      setIsSaving(false);
    }
  };

  const isClassified = job.registrationPlanning || (job.maintenanceSchedule || '').includes('[PLANNER]');

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/planner/jobs')} style={{ gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Job Records
        </button>
        <span style={{ color: '#334155' }}>›</span>
        <span style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{job.ticketNumber}</span>
        {isClassified && (
          <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            ✓ Classified
          </span>
        )}
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '12px 18px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span style={{ color: '#34d399', fontWeight: 600, fontSize: 13 }}>Classification saved and audit-logged successfully.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left: Full read-only lifecycle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Request details */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <SectionHeader icon={FileText} title="Request Details" />
            <ReadField label="Ticket Number"   value={job.ticketNumber} />
            <ReadField label="Requested By"    value={job.requestedBy} />
            <ReadField label="Date Raised"      value={`${job.dateRaised} at ${job.timeRaised || '—'}`} />
            <ReadField label="Priority"         value={job.priority} />
            <ReadField label="Required Completion" value={job.requiredCompletionDate} />
            <ReadField label="Plant Number"     value={job.plantNumber} />
            <ReadField label="Plant Description" value={job.plantDescription} />
            <ReadField label="Plant Status"     value={job.plantStatus} />
            <ReadField label="Current Status"   value={job.status.replace(/_/g, ' ')} />
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Defect / Problem</div>
              <div style={{ background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>{job.defect || 'Not recorded'}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Work Requested</div>
              <div style={{ background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14, fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>{job.workRequest || 'Not recorded'}</div>
            </div>
          </div>

          {/* Approval & assignment */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <SectionHeader icon={ShieldCheck} title="Approval & Assignment" />
            <ReadField label="Approved By (Supervisor)" value={job.approvedBySupervisor} />
            <ReadField label="Approved By (HOD)" value={job.approvedByHOD} />
            <ReadField label="Registered (Planning)" value={job.registrationPlanning} />
            <ReadField label="Assigned Artisan" value={job.issuedTo} />
            <ReadField label="Allocated Trades" value={(job.allocatedTrades || []).join(', ') || undefined} />
          </div>

          {/* Work execution */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <SectionHeader icon={Wrench} title="Work Execution Record" />
            <ReadField label="Date Finished"     value={job.dateFinished} />
            <ReadField label="Cause of Failure"  value={job.causeOfFailure} />
            <ReadField label="Machine Downtime"  value={job.machineDowntime} />
            <ReadField label="Is Breakdown"      value={job.isBreakdown ? 'Yes' : 'No'} />
            <ReadField label="Further Work"      value={job.furtherWorkRequired} />
            <ReadField label="Artisan Count"     value={job.numArtisans?.toString()} />
            <ReadField label="Total Labour Hrs"  value={totalHours > 0 ? `${totalHours} hrs` : undefined} />
            {job.workDoneDetails && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Work Done Details</div>
                <div style={{ background: 'rgba(9,11,18,0.4)', borderRadius: 8, padding: 14, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>{job.workDoneDetails}</div>
              </div>
            )}
          </div>

          {/* Materials */}
          {(job.sparesWithdrawn || []).length > 0 && (
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
              <SectionHeader icon={Package} title="Materials & Spares Used" />
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['SIV #', 'Description', 'Qty', 'Date', 'Cost'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(job.sparesWithdrawn || []).map(sw => (
                    <tr key={sw.id}>
                      <td style={{ fontSize: 12, color: '#64748b', padding: '6px 0' }}>{sw.sivNo}</td>
                      <td style={{ fontSize: 12, color: '#e2e8f0', padding: '6px 0' }}>{sw.description}</td>
                      <td style={{ fontSize: 12, color: '#94a3b8', padding: '6px 0' }}>×{sw.qty}</td>
                      <td style={{ fontSize: 12, color: '#64748b', padding: '6px 0' }}>{sw.date}</td>
                      <td style={{ fontSize: 12, color: '#34d399', fontWeight: 700, padding: '6px 0', textAlign: 'right' }}>${parseFloat(sw.cost || '0').toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', padding: '8px 0', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.06)' }}>Total Material Cost</td>
                    <td style={{ fontSize: 14, fontWeight: 800, color: '#34d399', padding: '8px 0', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.06)' }}>${totalMaterialCost.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Sign-off */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <SectionHeader icon={User} title="Closure & Sign-off" />
            <ReadField label="Originator Sign-off" value={job.originatorSignOff} />
            <ReadField label="Sign-off Date"       value={job.originatorSignOffDate} />
            <ReadField label="Closed By"           value={job.closedBy} />
            <ReadField label="Closed Date"         value={job.closedByDate} />
            <ReadField label="Supervisor Comments" value={job.supervisorComments} />
            <ReadField label="Closure Comment"     value={job.closureComment} />
          </div>
        </div>

        {/* Right: Classification panel (sticky) */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status summary */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Status</span>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                color: ({ Closed: '#10b981', Rejected: '#ef4444' } as any)[job.status] || '#f59e0b',
                background: `${({ Closed: '#10b981', Rejected: '#ef4444' } as any)[job.status] || '#f59e0b'}15`,
                border: `1px solid ${({ Closed: '#10b981', Rejected: '#ef4444' } as any)[job.status] || '#f59e0b'}30`,
                borderRadius: 9999, padding: '3px 10px'
              }}>{job.status.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div><div style={{ fontSize: 10, color: '#475569' }}>Raised</div><div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{job.dateRaised}</div></div>
              <div><div style={{ fontSize: 10, color: '#475569' }}>Finished</div><div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{job.dateFinished || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#475569' }}>Cost</div><div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>${totalMaterialCost.toFixed(0)}</div></div>
            </div>
          </div>

          {/* Classification panel */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', display: 'flex', gap: 6, alignItems: 'center' }}>
                <Tag size={12} color="#6366f1" /> Classification
              </h3>
              {!classifyMode && (
                <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, gap: 5 }} onClick={() => setClassifyMode(true)}>
                  <Tag size={12} /> {isClassified ? 'Re-Classify' : 'Classify Job'}
                </button>
              )}
            </div>

            {!classifyMode ? (
              <div>
                {isClassified ? (
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Classified by: <strong style={{ color: '#94a3b8' }}>{job.registrationPlanning}</strong></p>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.8 }}>
                      {(job.maintenanceSchedule || '').split('|').filter(s => s.includes('[PLANNER') || s.includes('Failure') || s.includes('Root') || s.includes('Maintenance') || s.includes('Equipment') || s.includes('Cost') || s.includes('Planner')).map((s, i) => (
                        <div key={i}>{s.trim()}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>Not yet classified. Click "Classify Job" to add structured metadata.</p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Failure Category *</label>
                  <select className="form-select" style={{ fontSize: 12 }} value={failureCategory} onChange={e => setFailureCategory(e.target.value)}>
                    <option value="">Select…</option>
                    {FAILURE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Root Cause</label>
                  <select className="form-select" style={{ fontSize: 12 }} value={rootCause} onChange={e => setRootCause(e.target.value)}>
                    <option value="">Select…</option>
                    {ROOT_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Maintenance Type *</label>
                  <select className="form-select" style={{ fontSize: 12 }} value={maintenanceType} onChange={e => setMaintenanceType(e.target.value)}>
                    <option value="">Select…</option>
                    {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Equipment Class</label>
                  <select className="form-select" style={{ fontSize: 12 }} value={equipmentClass} onChange={e => setEquipmentClass(e.target.value)}>
                    <option value="">Select…</option>
                    {EQUIPMENT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Cost Category</label>
                  <select className="form-select" style={{ fontSize: 12 }} value={costCategory} onChange={e => setCostCategory(e.target.value)}>
                    <option value="">Select…</option>
                    {COST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', display: 'flex', gap: 5, alignItems: 'center' }}>
                    <StickyNote size={10} /> Planner Notes
                  </label>
                  <textarea className="form-textarea" rows={3} style={{ fontSize: 12, resize: 'vertical' }}
                    value={plannerNotes} onChange={e => setPlannerNotes(e.target.value)}
                    placeholder="Internal planning notes, follow-up actions, observations…" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setClassifyMode(false)} style={{ flex: 1, fontSize: 12 }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveClassification} disabled={isSaving} style={{ flex: 1, fontSize: 12, gap: 5 }}>
                    <Save size={13} /> {isSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>

                <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                    ⚠️ Classification adds metadata only. Original job execution data cannot be modified. All actions are audit-logged.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
