import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, AlertTriangle, CheckCircle2,
  MapPin, Activity, RefreshCw,
  ClipboardList, Info
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import { useRuntimeConfig } from '../../context/RuntimeConfigContext';
import type { JobCard, Trade } from '../../types';
import styles from '../JobCards.module.css';

const TRADE_OPTIONS: Trade[] = ['Fitting','Tooling','Electrical','B/ Making','Inst & Cntrl','Machine Shop','Build & Maint','Project'];
const JOB_CATEGORIES = ['Defect','Maintenance Schedule','Installation','Modification','Inspection'];
const SAFETY_LEVELS = ['None – No risk','Low – Minor hazard','Medium – Moderate risk','High – Serious risk','Critical – Stop production immediately'];

function StepHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{n}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', lineHeight: 1 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <div style={{ fontSize: 11, color: '#f87171', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
    <AlertTriangle size={10} />{msg}
  </div>;
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return <label className="form-label" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>
    {text}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
  </label>;
}

export default function CreateJobRequest() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { jobCards, addJobCard, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();
  const { masterData } = useRuntimeConfig();

  const editing = id ? jobCards.find(c => c.id === id) : undefined;
  const editableStatuses: Array<JobCard['status']> = ['Draft', 'Rejected', 'Pending_Supervisor'];

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

  const [form, setForm] = useState<Partial<JobCard>>({
    requestedBy: editing?.requestedBy ?? user?.name ?? '',
    dateRaised:  editing?.dateRaised  ?? today,
    timeRaised:  editing?.timeRaised  ?? nowTime,
    priority:    editing?.priority    ?? 'Medium',
    requiredCompletionDate: editing?.requiredCompletionDate ?? '',
    plantNumber:       editing?.plantNumber       ?? '',
    plantDescription:  editing?.plantDescription  ?? '',
    plantStatus:       editing?.plantStatus       ?? 'Run',
    defect:            editing?.defect            ?? '',
    workRequest:       editing?.workRequest       ?? '',
    maintenanceSchedule: editing?.maintenanceSchedule ?? '',
    allocatedTrades:   editing?.allocatedTrades   ?? [],
    status:            editing?.status            ?? 'Draft',
    supervisorComments: editing?.supervisorComments ?? '',
  });

  // Extra initiator-only local fields (not in JobCard type, stored in maintenanceSchedule + defect for now)
  const [jobCategory, setJobCategory]     = useState('Defect');
  const [location, setLocation]           = useState('');
  const [safetyLevel, setSafetyLevel]     = useState('None – No risk');
  const [productionAffected, setProductionAffected] = useState<'Yes'|'No'>('No');
  const [repeatFailure, setRepeatFailure] = useState<'Yes'|'No'>('No');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const machineOptions = useMemo(() => {
    const fromMaster = Array.isArray(masterData?.['Plants / Assets'])
      ? masterData['Plants / Assets']
          .filter((item: any) => item?.active !== false)
          .map((item: any) => ({
            code: String(item.code || item.name || '').trim(),
            name: String(item.name || item.code || '').trim(),
          }))
      : [];

    return fromMaster.reduce<Array<{ code: string; name: string }>>((acc, item) => {
      const key = `${item.code}::${item.name}`.toLowerCase();
      if (!acc.some((existing) => `${existing.code}::${existing.name}`.toLowerCase() === key)) {
        acc.push(item);
      }
      return acc;
    }, []).sort((a, b) => a.name.localeCompare(b.name));
  }, [masterData]);

  const selectMachine = (selectedValue: string) => {
    if (!selectedValue) {
      f('plantNumber', '');
      f('plantDescription', '');
      return;
    }

    const selected = machineOptions.find((item) => `${item.code}__${item.name}` === selectedValue);
    if (selected) {
      f('plantNumber', selected.code);
      f('plantDescription', selected.name);
    }
  };

  const f = (field: keyof JobCard, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => { const n = { ...p }; delete n[field as string]; return n; });
  };

  // Duplicate detection
  const duplicates = useMemo(() =>
    jobCards.filter(c =>
      c.id !== editing?.id &&
      c.plantNumber === form.plantNumber &&
      !['Closed', 'Rejected'].includes(c.status)
    ),
    [jobCards, form.plantNumber, editing?.id]
  );

  // Validation per step
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.requestedBy?.trim()) e.requestedBy = 'Your name is required';
    if (!form.priority) e.priority = 'Select a priority level';
    if (!form.requiredCompletionDate) e.requiredCompletionDate = 'Select required completion date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.plantNumber?.trim()) e.plantNumber = 'Plant number / asset ID is required';
    if (!form.plantDescription?.trim()) e.plantDescription = 'Describe the plant or equipment';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.defect?.trim() || form.defect.trim().length < 15)
      e.defect = 'Please describe the fault in at least 15 characters. Vague entries like "not working" will be rejected.';
    if (!form.workRequest?.trim())
      e.workRequest = 'Describe what maintenance work needs to be done';
    if (!form.allocatedTrades || form.allocatedTrades.length === 0)
      e.allocatedTrades = 'Select at least one Trade Allocation before submitting.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(s => Math.min(s + 1, 4));
    window.scrollTo(0, 0);
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        status: 'Draft' as const,
        performedBy: user?.name,
        userRole: user?.role,
      };
      if (editing) {
        await updateJobCard(editing.id, payload);
        await addAuditLog({ jobCardId: editing.id, action: 'DRAFT_EDITED', performedBy: user?.name || '', details: 'Draft updated by initiator' });
      } else {
        await addJobCard(payload);
      }
      navigate('/initiator/dashboard');
    } catch (e: any) {
      alert(e?.message || 'Save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const step1Ok = validateStep1();
    const step2Ok = step1Ok ? validateStep2() : false;
    const step3Ok = step1Ok && step2Ok ? validateStep3() : false;
    if (!step1Ok || !step2Ok || !step3Ok) {
      if (!step1Ok) setStep(1);
      else if (!step2Ok) setStep(2);
      else setStep(3);
      alert('Please complete all required fields before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        status: 'Pending_Supervisor' as const,
        maintenanceSchedule: [
          `Category: ${jobCategory}`,
          location ? `Location: ${location}` : '',
          `Safety: ${safetyLevel}`,
          `Production affected: ${productionAffected}`,
          `Repeat failure: ${repeatFailure}`,
        ].filter(Boolean).join(' | ') + (form.maintenanceSchedule ? ' | ' + form.maintenanceSchedule : ''),
        performedBy: user?.name,
        userRole: user?.role,
      };
      if (editing) {
        await updateJobCard(editing.id, payload);
        await addAuditLog({ jobCardId: editing.id, action: editing.status === 'Rejected' ? 'REQUEST_RESUBMITTED' : 'REQUEST_SUBMITTED', performedBy: user?.name || '', details: 'Submitted for supervisor approval' });
      } else {
        await addJobCard(payload);
      }
      navigate('/initiator/dashboard');
    } catch (e: any) {
      alert(e?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TOTAL_STEPS = 4;
  const isEdit = !!editing;
  const isResubmit = editing?.status === 'Rejected';
  const isCorrectionEdit = editing?.status === 'Pending_Supervisor';

  if (editing && !editableStatuses.includes(editing.status)) {
    return (
      <div className={styles.pageContainer} style={{ maxWidth: 780, margin: '0 auto' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')} style={{ marginBottom: 20, gap: 6, fontSize: 13 }}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <div className={styles.notice} style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)' }}>
          This request cannot be edited at its current status: <strong>{editing.status}</strong>.
        </div>
      </div>
    );
  }

  const panelStyle = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 28,
    marginBottom: 20
  };

  return (
    <div className={styles.pageContainer} style={{ maxWidth: 780, margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')} style={{ marginBottom: 20, gap: 6, fontSize: 13 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <div className={styles.heroContent} style={{ marginBottom: 26 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 6 }}>
          {isResubmit ? '🔄 Resubmit Request' : isCorrectionEdit ? '🛠️ Edit Submitted Request' : isEdit ? '✏️ Edit Draft Request' : '📋 New Maintenance Request'}
        </h1>
        <p className={styles.heroSubtitle}>
          {isResubmit
            ? 'Your previous request was returned. Review the supervisor comments and resubmit with corrections.'
            : isCorrectionEdit
              ? 'Update required fields for supervisor review and submit the correction.'
              : 'Fill out each section carefully. Vague or incomplete requests will be returned.'}
        </p>
      </div>

      {isResubmit && editing?.supervisorComments && (
        <div className={`${styles.notice} ${styles.noticeDanger}`} style={{ marginBottom: 24 }}>
          <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171', marginBottom: 6 }}>Supervisor Return Reason</div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{editing.supervisorComments}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 30, position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
        {['Your Details', 'Plant Info', 'Fault & Work', 'Review & Submit'].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} style={{ flex: '1 0 160px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', minWidth: 140 }}>
              {i < TOTAL_STEPS - 1 && (
                <div style={{ position: 'absolute', right: '-50%', top: 14, width: '100%', height: 2, background: done ? '#4f46e5' : 'rgba(255,255,255,0.08)', zIndex: 0 }} />
              )}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', zIndex: 1,
                background: done ? '#4f46e5' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done ? '#4f46e5' : active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                color: done ? '#fff' : active ? '#818cf8' : '#475569',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700
              }}>
                {done ? <CheckCircle2 size={14} color="#fff" /> : n}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: active ? '#818cf8' : done ? '#6366f1' : '#475569', marginTop: 6, letterSpacing: '0.04em', textAlign: 'center' }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* ===================== STEP 1 ===================== */}
      {step === 1 && (
        <div style={panelStyle}>
          <StepHeader n={1} title="Your Details & Priority" subtitle="Tell us who is raising this request and how urgent it is." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
            <div>
              <Label text="Requested By" required />
              <input className="form-input" value={form.requestedBy} onChange={e => f('requestedBy', e.target.value)} placeholder="Your full name" />
              <FieldError msg={errors.requestedBy} />
            </div>
            <div>
              <Label text="Department / Section" />
              <input className="form-input" value={form.maintenanceSchedule?.split('|')?.[0] || ''} onChange={e => f('maintenanceSchedule', e.target.value)} placeholder="e.g. Production, Engineering" />
            </div>
            <div>
              <Label text="Date Raised" />
              <input className="form-input" type="date" value={form.dateRaised} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div>
              <Label text="Time Raised" />
              <input className="form-input" type="time" value={form.timeRaised} readOnly style={{ opacity: 0.7 }} />
            </div>
          </div>

          {/* Priority selector — large visual buttons */}
          <div style={{ marginTop: 20 }}>
            <Label text="Priority Level" required />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
              {[
                { val: 'Low',      color: '#64748b', label: 'Low',      desc: 'Non-urgent, routine' },
                { val: 'Medium',   color: '#0ea5e9', label: 'Medium',   desc: 'Normal operations' },
                { val: 'High',     color: '#f59e0b', label: 'High',     desc: 'Urgent, affects output' },
                { val: 'Critical', color: '#ef4444', label: 'Critical', desc: 'Breakdown / Stop work' },
              ].map(p => (
                <button
                  key={p.val} type="button"
                  onClick={() => f('priority', p.val)}
                  style={{
                    background: form.priority === p.val ? p.color + '20' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.priority === p.val ? p.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, padding: '12px 8px', cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 800, fontSize: 12, color: form.priority === p.val ? p.color : '#94a3b8' }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 3, lineHeight: 1.3 }}>{p.desc}</div>
                </button>
              ))}
            </div>
            <FieldError msg={errors.priority} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Label text="Required Completion Date" required />
            <input className="form-input" type="date" value={form.requiredCompletionDate} onChange={e => f('requiredCompletionDate', e.target.value)} min={today} style={{ maxWidth: 240 }} />
            <FieldError msg={errors.requiredCompletionDate} />
          </div>
        </div>
      )}

      {/* ===================== STEP 2 ===================== */}
      {step === 2 && (
        <div style={panelStyle}>
          <StepHeader n={2} title="Plant & Asset Information" subtitle="Identify the exact equipment or area with the problem." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
            <div>
              <Label text="Select Machine / Asset" required />
              <select
                className="form-select"
                value={form.plantNumber && form.plantDescription ? `${form.plantNumber}__${form.plantDescription}` : ''}
                onChange={(e) => selectMachine(e.target.value)}
              >
                <option value="">Choose a machine / asset...</option>
                {machineOptions.map((item) => (
                  <option key={`${item.code}__${item.name}`} value={`${item.code}__${item.name}`}>
                    {item.name || item.code}
                  </option>
                ))}
              </select>
              {!machineOptions.length && (
                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>
                  No machine registry found. Add plant / asset master data first.
                </div>
              )}
              <FieldError msg={errors.plantNumber} />
            </div>
            <div>
              <Label text="Selected Machine Description" required />
              <input className="form-input" value={form.plantDescription} readOnly placeholder="Select a machine above" />
              <FieldError msg={errors.plantDescription} />
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicates.length > 0 && form.plantNumber && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '14px 18px', marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>
                  Active job exists for this plant ({duplicates.length} open)
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {duplicates.slice(0, 2).map(d => (
                    <div key={d.id}>• {d.ticketNumber} — {d.status.replace(/_/g, ' ')} — {d.defect?.slice(0, 50)}</div>
                  ))}
                  <div style={{ marginTop: 6 }}>Proceed only if this is a <strong>different</strong> issue.</div>
                </div>
              </div>
            </div>
          )}

          {/* Plant status */}
          <div style={{ marginTop: 20 }}>
            <Label text="Plant Status at Time of Request" required />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {[
                { val: 'Run', label: '🟢 Running', desc: 'Plant is operational' },
                { val: 'Shut', label: '🔴 Stopped', desc: 'Plant is shut down' },
              ].map(s => (
                <button key={s.val} type="button" onClick={() => f('plantStatus', s.val)}
                  style={{
                    flex: 1, background: form.plantStatus === s.val ? (s.val === 'Run' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${form.plantStatus === s.val ? (s.val === 'Run' ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, padding: '14px', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location + job category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 18 }}>
            <div>
              <Label text="Exact Location / Area" />
              <div style={{ position: 'relative' }}>
                <MapPin size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="form-input" style={{ paddingLeft: 30 }} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Section B, Pit 3" />
              </div>
            </div>
            <div>
              <Label text="Job Category" />
              <select className="form-select" value={jobCategory} onChange={e => setJobCategory(e.target.value)}>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STEP 3 ===================== */}
      {step === 3 && (
        <div style={panelStyle}>
          <StepHeader n={3} title="Fault Description & Work Required" subtitle="Be specific. Vague descriptions get returned for clarification." />

          <div style={{ marginBottom: 18 }}>
            <Label text="Defect / Problem Observed" required />
            <textarea
              className="form-textarea"
              rows={4}
              style={{ resize: 'vertical', minHeight: 100 }}
              value={form.defect}
              onChange={e => f('defect', e.target.value)}
              placeholder="Describe exactly what you observed. Include: sounds, smells, visual damage, error codes, frequency of occurrence, when it started…"
            />
            <div style={{ fontSize: 11, color: form.defect && form.defect.length < 15 ? '#f87171' : '#64748b', marginTop: 4 }}>
              {form.defect?.length || 0} characters {form.defect && form.defect.length < 15 ? '— too short' : '— good level of detail'}
            </div>
            <FieldError msg={errors.defect} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label text="Work Request — What Needs to Be Done" required />
            <textarea
              className="form-textarea"
              rows={3}
              style={{ resize: 'vertical', minHeight: 80 }}
              value={form.workRequest}
              onChange={e => f('workRequest', e.target.value)}
              placeholder="e.g. Inspect and replace worn bearing on primary pump shaft. Check alignment."
            />
            <FieldError msg={errors.workRequest} />
          </div>

          {/* Guided optional fields */}
          <div style={{ background: 'rgba(9,11,18,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Info size={14} color="#6366f1" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Additional Safety & Risk Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label text="Safety Risk Level" />
                <select className="form-select" value={safetyLevel} onChange={e => setSafetyLevel(e.target.value)}>
                  {SAFETY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <Label text="Is Production Affected?" />
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  {(['Yes', 'No'] as const).map(o => (
                    <button key={o} type="button" onClick={() => setProductionAffected(o)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                        background: productionAffected === o ? (o === 'Yes' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)') : 'rgba(255,255,255,0.04)',
                        color: productionAffected === o ? (o === 'Yes' ? '#f87171' : '#34d399') : '#64748b',
                        border: `1px solid ${productionAffected === o ? (o === 'Yes' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)') : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label text="Is This a Repeat Failure?" />
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  {(['Yes', 'No'] as const).map(o => (
                    <button key={o} type="button" onClick={() => setRepeatFailure(o)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                        background: repeatFailure === o ? (o === 'Yes' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.04)',
                        color: repeatFailure === o ? (o === 'Yes' ? '#fbbf24' : '#94a3b8') : '#64748b',
                        border: `1px solid ${repeatFailure === o ? (o === 'Yes' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label text="Trade Allocation" required />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {TRADE_OPTIONS.map(t => {
                    const sel = (form.allocatedTrades || []).includes(t);
                    return (
                      <button key={t} type="button"
                        onClick={() => {
                          const cur = form.allocatedTrades || [];
                          f('allocatedTrades', sel ? cur.filter(x => x !== t) : [...cur, t]);
                        }}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                          color: sel ? '#818cf8' : '#64748b',
                          border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >{t}</button>
                    );
                  })}
                </div>
                <FieldError msg={errors.allocatedTrades} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== STEP 4 — Review ===================== */}
      {step === 4 && (
        <div style={panelStyle}>
          <StepHeader n={4} title="Review & Submit" subtitle="Check all details before submitting. You cannot edit after submission unless the request is returned." />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Requested By', form.requestedBy],
              ['Date Raised', form.dateRaised + ' at ' + form.timeRaised],
              ['Priority', form.priority],
              ['Required Completion', form.requiredCompletionDate],
              ['Plant Number', form.plantNumber],
              ['Plant Description', form.plantDescription],
              ['Plant Status', form.plantStatus],
              ['Job Category', jobCategory],
              ['Safety Risk', safetyLevel],
              ['Production Affected', productionAffected],
              ['Repeat Failure', repeatFailure],
              ['Trade Allocation', (form.allocatedTrades || []).join(', ')],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: '#475569', width: 180, flexShrink: 0 }}>{l}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, background: 'rgba(9,11,18,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Fault Description</div>
            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7 }}>{form.defect || '—'}</p>
          </div>
          <div style={{ marginTop: 10, background: 'rgba(9,11,18,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Work Requested</div>
            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7 }}>{form.workRequest || '—'}</p>
          </div>

          <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: 14, marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              <strong style={{ color: '#fbbf24' }}>Confirm before submitting.</strong> Once submitted, this request will be reviewed by the Supervisor.
              You will not be able to edit it unless it is returned for clarification. Ensure all details are accurate.
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }} style={{ gap: 6 }}>
              <ArrowLeft size={14} /> Previous
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleSaveDraft} disabled={isSubmitting} style={{ gap: 6 }}>
            <Save size={14} /> Save Draft
          </button>
        </div>
        {step < TOTAL_STEPS ? (
          <button className="btn btn-primary" onClick={nextStep} style={{ gap: 6 }}>
            Continue <Activity size={14} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}
            style={{ gap: 8, background: isResubmit ? 'linear-gradient(135deg,#d97706,#b45309)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '10px 24px' }}>
            {isSubmitting ? 'Submitting…' : isResubmit ? <><RefreshCw size={15} /> Resubmit Request</> : <><Send size={15} /> Submit for Approval</>}
          </button>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 14 }}>
        <ClipboardList size={10} style={{ display: 'inline', marginRight: 4 }} />
        Step {step} of {TOTAL_STEPS}
      </p>
    </div>
  );
}
