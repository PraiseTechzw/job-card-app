import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Search,
  PenLine,
  TrendingUp,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

interface PMSchedule {
  id: string;
  plantId: string;
  plantName: string;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  lastRun?: string;
  nextRun: string;
  tasks: string[];
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

interface PMScheduleForm {
  plantId: string;
  plantName: string;
  frequency: PMSchedule['frequency'];
  nextRun: string;
  tasks: string[];
  priority: PMSchedule['priority'];
  notes: string;
}

const emptyForm: PMScheduleForm = {
  plantId: '',
  plantName: '',
  frequency: 'Monthly',
  nextRun: '',
  tasks: [],
  priority: 'Medium',
  notes: '',
};

export default function PreventiveMaintenancePlanning() {
  const { jobCards } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pmSchedules, setPmSchedules] = useState<PMSchedule[]>([]);
  const [form, setForm] = useState<PMScheduleForm>(emptyForm);
  const [taskInput, setTaskInput] = useState('');

  const recurringFailures = useMemo(() => {
    const counts: Record<string, { count: number; name: string; last: string }> = {};
    jobCards.forEach((card) => {
      if (!card.plantNumber || !card.plantDescription) return;
      if (!counts[card.plantNumber]) {
        counts[card.plantNumber] = {
          count: 0,
          name: card.plantDescription,
          last: card.dateRaised,
        };
      }
      counts[card.plantNumber].count += 1;
      if (new Date(card.dateRaised) > new Date(counts[card.plantNumber].last)) {
        counts[card.plantNumber].last = card.dateRaised;
      }
    });

    return Object.entries(counts)
      .filter(([, value]) => value.count >= 3)
      .sort((a, b) => b[1].count - a[1].count);
  }, [jobCards]);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/pm-schedules');
      setPmSchedules(response.data || []);
    } catch (error) {
      console.error('Failed to fetch PM schedules', error);
      toast.error('Failed to load PM schedules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const filteredPMs = pmSchedules.filter((schedule) =>
    schedule.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.plantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setForm(emptyForm);
    setTaskInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddTask = () => {
    const nextTask = taskInput.trim();
    if (!nextTask) return;
    if (form.tasks.includes(nextTask)) {
      toast.error('That task is already in the schedule.');
      return;
    }
    setForm((prev) => ({ ...prev, tasks: [...prev.tasks, nextTask] }));
    setTaskInput('');
  };

  const handleRemoveTask = (task: string) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((item) => item !== task),
    }));
  };

  const handleEdit = (schedule: PMSchedule) => {
    setEditingId(schedule.id);
    setShowForm(true);
    setTaskInput('');
    setForm({
      plantId: schedule.plantId,
      plantName: schedule.plantName,
      frequency: schedule.frequency,
      nextRun: schedule.nextRun,
      tasks: Array.isArray(schedule.tasks) ? schedule.tasks : [],
      priority: schedule.priority,
      notes: schedule.notes || '',
    });
  };

  const handleSubmit = async () => {
    if (!form.plantId || !form.plantName || !form.nextRun || form.tasks.length === 0) {
      toast.error('Plant, next run date, and at least one task are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const response = await axios.patch(`/api/pm-schedules/${editingId}`, form);
        setPmSchedules((prev) => prev.map((schedule) => (schedule.id === editingId ? response.data : schedule)));
        toast.success('PM schedule updated.');
      } else {
        const response = await axios.post('/api/pm-schedules', form);
        setPmSchedules((prev) => [...prev, response.data]);
        toast.success('PM schedule created.');
      }
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to save PM schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this PM schedule?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/pm-schedules/${id}`);
      setPmSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      if (editingId === id) resetForm();
      toast.success('PM schedule removed.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete PM schedule.');
    }
  };

  const handleAutoGenerate = async (plantId: string) => {
    try {
      const response = await axios.post('/api/pm-schedules/generate', { plantId });
      setPmSchedules((prev) => [...prev, response.data]);
      toast.success('PM schedule generated from failure history.');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to auto-generate schedule.');
    }
  };

  const hasScheduleForPlant = (plantId: string) => pmSchedules.some((schedule) => schedule.plantId === plantId);

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Calendar size={22} color="#6366f1" />
            </span>
            Preventive Maintenance Planning
          </h1>
          <p className={styles['text-muted']}>Create, update, and auto-generate live preventive schedules from failure history.</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ gap: 6 }}
          onClick={() => {
            if (showForm && !editingId) {
              resetForm();
              return;
            }
            setEditingId(null);
            setForm(emptyForm);
            setTaskInput('');
            setShowForm(true);
          }}
        >
          <Plus size={16} /> {showForm && !editingId ? 'Close Form' : 'Create PM Schedule'}
        </button>
      </header>

      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {showForm && (
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>
                {editingId ? 'Update PM Schedule' : 'Create PM Schedule'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="form-input" placeholder="Plant ID" value={form.plantId} onChange={(e) => setForm((prev) => ({ ...prev, plantId: e.target.value }))} />
                <input className="form-input" placeholder="Plant name" value={form.plantName} onChange={(e) => setForm((prev) => ({ ...prev, plantName: e.target.value }))} />
                <select className="form-select" value={form.frequency} onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value as PMSchedule['frequency'] }))}>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                <select className="form-select" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as PMSchedule['priority'] }))}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <input className="form-input" type="date" value={form.nextRun} onChange={(e) => setForm((prev) => ({ ...prev, nextRun: e.target.value }))} />
                <div className="flex gap-2">
                  <input
                    className="form-input"
                    placeholder="Add task"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTask();
                      }
                    }}
                  />
                  <button className="btn btn-ghost" onClick={handleAddTask}>Add</button>
                </div>
                <div className="form-group md:col-span-2">
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Maintenance notes, inspection scope, or planning guidance..."
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              {form.tasks.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.tasks.map((task) => (
                    <button
                      key={task}
                      className="btn btn-ghost"
                      style={{ fontSize: 11, color: '#cbd5e1', background: 'rgba(99,102,241,0.12)', borderRadius: 9999, padding: '6px 10px', gap: 6 }}
                      onClick={() => handleRemoveTask(task)}
                    >
                      {task} <X size={12} />
                    </button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving} style={{ gap: 6 }}>
                  <Save size={14} /> {isSaving ? 'Saving...' : editingId ? 'Update Schedule' : 'Save Schedule'}
                </button>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Active PM Schedules</h3>
              <div className="search-container" style={{ width: '100%', maxWidth: 240 }}>
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isLoading && (
                <div className="empty-state">
                  <Clock size={48} className="empty-state-icon" />
                  <p>Loading PM schedules...</p>
                </div>
              )}
              {!isLoading && filteredPMs.map((schedule) => (
                <div
                  key={schedule.id}
                  style={{
                    background: 'rgba(9,11,18,0.4)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: 14,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    alignItems: 'start',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{schedule.plantName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{schedule.plantId}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {(schedule.tasks || []).slice(0, 3).map((task) => (
                        <span key={task} style={{ fontSize: 10, color: '#cbd5e1', background: 'rgba(99,102,241,0.12)', padding: '4px 8px', borderRadius: 9999 }}>
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Frequency</div>
                    <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{schedule.frequency}</div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginTop: 10, marginBottom: 2 }}>Priority</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{schedule.priority}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Next Due</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{schedule.nextRun}</div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginTop: 10, marginBottom: 2 }}>Last Run</div>
                    <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{schedule.lastRun || 'Not yet executed'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', gap: 6 }} onClick={() => handleEdit(schedule)}>
                      <PenLine size={14} /> Edit
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', gap: 6 }} onClick={() => handleDelete(schedule.id)}>
                      <Trash2 size={14} color="#ef4444" /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {!isLoading && filteredPMs.length === 0 && (
                <div className="empty-state">
                  <Clock size={48} className="empty-state-icon" />
                  <p>No active schedules found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.asideColumn}>
          <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <TrendingUp size={16} color="#f43f5e" />
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#fb7185' }}>Failure Heatmap</h3>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
              Assets with repeated failure patterns can generate a preventive schedule directly from job history.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recurringFailures.slice(0, 4).map(([id, stats]) => (
                <div key={id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{stats.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#f43f5e' }}>{stats.count} Failures</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#475569', marginBottom: 8 }}>Last Failure: {stats.last}</div>
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', fontSize: 10, height: 26, color: '#fb7185', borderColor: 'rgba(244,63,94,0.2)' }}
                    onClick={() => handleAutoGenerate(id)}
                    disabled={hasScheduleForPlant(id)}
                  >
                    {hasScheduleForPlant(id) ? 'Schedule Already Exists' : 'Auto-Generate PM'}
                  </button>
                </div>
              ))}
              {recurringFailures.length === 0 && (
                <div style={{ fontSize: 11, color: '#94a3b8' }}>No high-frequency failure clusters detected yet.</div>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ShieldCheck size={16} color="#10b981" />
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Policy Rules</h3>
            </div>
            <ul style={{ padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'High-priority plant requires Monthly PM minimum.',
                'Safety equipment requires Quarterly inspections.',
                'Rotating equipment PM threshold: 500 operating hrs.',
                'PM job cards should be raised at least 48 hours before next due date.',
              ].map((policy) => (
                <li key={policy} style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#10b981' }}>•</span> {policy}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
