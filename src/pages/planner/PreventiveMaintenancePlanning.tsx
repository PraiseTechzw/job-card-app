import { useState, useMemo } from 'react';
import {
  Calendar, Clock, ShieldCheck,
  Plus, Search, Activity, 
  TrendingUp, Trash2
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
}

export default function PreventiveMaintenancePlanning() {
  const { jobCards } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Analyze frequency of failures per plant to suggest PM
  const recurringFailures = useMemo(() => {
    const counts: Record<string, { count: number, name: string, last: string }> = {};
    jobCards.forEach(c => {
      if (c.plantNumber && c.plantDescription) {
        if (!counts[c.plantNumber]) counts[c.plantNumber] = { count: 0, name: c.plantDescription, last: c.dateRaised };
        counts[c.plantNumber].count++;
        if (new Date(c.dateRaised) > new Date(counts[c.plantNumber].last)) {
          counts[c.plantNumber].last = c.dateRaised;
        }
      }
    });
    return Object.entries(counts)
      .filter(([, v]) => v.count >= 3) // More than 3 failures suggests needed PM
      .sort((a, b) => b[1].count - a[1].count);
  }, [jobCards]);

  // Mock initial PM schedules (this would come from a backend)
  const [pmSchedules, setPmSchedules] = useState<PMSchedule[]>([
    { id: '1', plantId: 'P-101', plantName: 'Conveyor Alpha', frequency: 'Monthly', nextRun: '2026-04-15', tasks: ['Check belt tension', 'Lube bearings'], priority: 'High' },
    { id: '2', plantId: 'P-202', plantName: 'Main Compressor', frequency: 'Weekly', nextRun: '2026-03-24', tasks: ['Drain condensate', 'Check oil level'], priority: 'High' },
    { id: '3', plantId: 'P-303', plantName: 'Hydraulic Press', frequency: 'Quarterly', nextRun: '2026-06-01', tasks: ['Filter change', 'Fluid analysis'], priority: 'Medium' },
  ]);

  const filteredPMs = pmSchedules.filter(pm => 
    pm.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pm.plantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className={styles['text-muted']}>Transition from reactive to proactive maintenance schedules.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: 6 }} onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Create PM Schedule
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main Schedule List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Active PM Schedules</h3>
              <div style={{ position: 'relative', width: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search schedules..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input" 
                  style={{ paddingLeft: 30, fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredPMs.map(pm => (
                <div key={pm.id} style={{ 
                  background: 'rgba(9,11,18,0.4)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  borderRadius: 14, 
                  padding: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr 140px 140px 100px',
                  alignItems: 'center',
                  gap: 16
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{pm.plantName}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{pm.plantId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Frequency</div>
                    <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{pm.frequency}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Next Due</div>
                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{pm.nextRun}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" style={{ padding: 6 }}><Activity size={14} /></button>
                    <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setPmSchedules(prev => prev.filter(p => p.id !== pm.id))}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredPMs.length === 0 && (
                <div className="empty-state">
                  <Clock size={48} className="empty-state-icon" />
                  <p>No active schedules found.</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Preventive Templates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { name: 'Standard Lubrication', labor: '1.5 hrs', parts: 'Grease' },
                { name: 'Electrical Panel Inspection', labor: '2.0 hrs', parts: 'Cleaning Solvent' },
                { name: 'Hydraulic Fluid Analysis', labor: '0.5 hrs', parts: 'Sampling Kit' },
              ].map(t => (
                <div key={t.name} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>{t.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ color: '#475569' }}>Labor: {t.labor}</span>
                    <span style={{ color: '#475569' }}>Part: {t.parts}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <TrendingUp size={16} color="#f43f5e" />
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#fb7185' }}>Failure Heatmap</h3>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
              The following assets show high frequency of reactive failure, suggesting a need for scheduled preventive maintenance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recurringFailures.slice(0, 4).map(([id, stats]) => (
                <div key={id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{stats.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#f43f5e' }}>{stats.count} Failures</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#475569', marginBottom: 8 }}>Last Failure: {stats.last}</div>
                  <button className="btn btn-ghost" style={{ width: '100%', fontSize: 10, height: 26, color: '#fb7185', borderColor: 'rgba(244,63,94,0.2)' }}>
                    Auto-Generate PM
                  </button>
                </div>
              ))}
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
                'PM Job Cards are generated 48hrs before "Next Due".'
              ].map((p, idx) => (
                <li key={idx} style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#10b981' }}>•</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
