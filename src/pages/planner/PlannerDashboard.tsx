import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Activity, Database,
  Archive, Calendar, Filter, RefreshCw, Eye
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';

function isThisWeek(d: string) {
  const t = new Date(d); const now = new Date();
  const w = new Date(now); w.setDate(w.getDate() - 7);
  return t >= w && t <= now;
}
function isThisMonth(d: string) {
  const t = new Date(d); const now = new Date();
  return t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
}
function isOverdue(c: JobCard) {
  if (!c.requiredCompletionDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(c.requiredCompletionDate);
  due.setHours(0, 0, 0, 0);
  return due < today && !['Closed', 'Rejected'].includes(c.status);
}

// Tiny bar: renders a normalized horizontal bar
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 3, height: 6, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
    </div>
  );
}

export default function PlannerDashboard() {
  const { jobCards, isLoading, refreshData } = useJobCards();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const now = new Date().toISOString().split('T')[0];
  const scoped = useMemo(() => {
    if (period === 'today') return jobCards.filter(c => c.dateRaised === now);
    if (period === 'week')  return jobCards.filter(c => isThisWeek(c.dateRaised));
    if (period === 'month') return jobCards.filter(c => isThisMonth(c.dateRaised));
    return jobCards;
  }, [jobCards, period, now]);

  const total     = scoped.length;
  const completed = scoped.filter(c => c.status === 'Closed').length;
  const outstanding = scoped.filter(c => !['Closed', 'Rejected', 'Draft'].includes(c.status)).length;
  const overdue   = scoped.filter(isOverdue).length;
  const awaiting  = scoped.filter(c => c.status === 'Awaiting_SignOff').length;
  const pending   = scoped.filter(c => c.status === 'Pending_Supervisor').length;
  const inprog    = scoped.filter(c => ['Assigned', 'InProgress'].includes(c.status)).length;

  const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;

  // Breakdown BY STATUS
  const byStatus: Record<string, number> = {};
  scoped.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

  // By department/plant — top 8
  const byPlant: Record<string, number> = {};
  scoped.forEach(c => { if (c.plantDescription) byPlant[c.plantDescription] = (byPlant[c.plantDescription] || 0) + 1; });
  const topPlants = Object.entries(byPlant).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxPlant = topPlants[0]?.[1] || 1;

  // By priority
  const byPriority: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  scoped.forEach(c => { if (c.priority in byPriority) byPriority[c.priority]++; });

  // By artisan (top performers)
  const byArtisan: Record<string, { total: number; closed: number }> = {};
  jobCards.filter(c => c.issuedTo && c.status === 'Closed').forEach(c => {
    const a = c.issuedTo!;
    if (!byArtisan[a]) byArtisan[a] = { total: 0, closed: 0 };
    byArtisan[a].total++;
    byArtisan[a].closed++;
  });
  const topArtisans = Object.entries(byArtisan).sort(([, a], [, b]) => b.closed - a.closed).slice(0, 5);

  // Monthly trend: last 6 months
  const monthTrend = useMemo(() => {
    const months: { label: string; raised: number; closed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.getMonth(); const y = d.getFullYear();
      months.push({
        label: d.toLocaleDateString('en', { month: 'short' }),
        raised: jobCards.filter(c => { const cd = new Date(c.dateRaised); return cd.getMonth() === m && cd.getFullYear() === y; }).length,
        closed: jobCards.filter(c => c.status === 'Closed' && c.closedByDate && (() => { const cd = new Date(c.closedByDate!); return cd.getMonth() === m && cd.getFullYear() === y; })()).length,
      });
    }
    return months;
  }, [jobCards]);
  const maxTrend = Math.max(...monthTrend.map(m => Math.max(m.raised, m.closed)), 1);

  const STATUS_COLORS: Record<string, string> = {
    Draft: '#64748b', Pending_Supervisor: '#f59e0b', Approved: '#10b981',
    Registered: '#0ea5e9', Assigned: '#6366f1', InProgress: '#f59e0b',
    Awaiting_SignOff: '#a78bfa', Closed: '#10b981', Rejected: '#ef4444',
  };
  const PRIORITY_COLORS: Record<string, string> = { Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <BarChart2 size={22} color="#6366f1" />
            </span>
            Planning Dashboard
          </h1>
          <p className={styles['text-muted']}>System-wide maintenance intelligence. {jobCards.length} total records loaded.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Period selector */}
          <div style={{ display: 'flex', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
            {(['today', 'week', 'month', 'all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: period === p ? '#4f46e5' : 'transparent',
                color: period === p ? '#fff' : '#64748b', border: 'none', textTransform: 'capitalize'
              }}>{p}</button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={refreshData} style={{ gap: 5, fontSize: 12 }}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate('/planner/reports')} style={{ gap: 5, fontSize: 12 }}><TrendingUp size={14} /> Reports</button>
        </div>
      </header>

      {/* Quick nav links */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {[
          { label: 'Job Records', icon: Database, to: '/planner/jobs' },
          { label: 'Reports', icon: TrendingUp, to: '/planner/reports' },
          { label: 'Equip. History', icon: Activity, to: '/planner/history' },
          { label: 'PM Planning', icon: Calendar, to: '/planner/preventive' },
          { label: 'Archive', icon: Archive, to: '/planner/archive' },
        ].map(n => (
          <button key={n.to} onClick={() => navigate(n.to)} className="btn btn-ghost"
            style={{ gap: 6, fontSize: 12, padding: '6px 12px' }}>
            <n.icon size={13} /> {n.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="empty-state"><Activity size={40} className="empty-state-icon" /><h3>Loading data…</h3></div>
      ) : (
        <>
          {/* KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
            {[
              { l: 'Total (Scope)',  v: total,         c: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: BarChart2 },
              { l: 'Completed',      v: completed,     c: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
              { l: 'Outstanding',    v: outstanding,   c: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: Clock },
              { l: 'Overdue',        v: overdue,       c: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle },
              { l: 'In Progress',    v: inprog,        c: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Activity },
              { l: 'Awaiting Review',v: awaiting,      c: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: Eye },
              { l: 'Pending Appr.',  v: pending,       c: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
              { l: 'Completion %',   v: `${completionRate}%`, c: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: TrendingUp },
            ].map(k => (
              <div key={k.l} style={{ background: k.bg, border: `1px solid ${k.c}22`, borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{k.l}</span>
                  <k.icon size={13} color={k.c} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.c, lineHeight: 1 }}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 22 }}>
            {/* Monthly trend */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 18 }}>6-Month Trend</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
                {monthTrend.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 96 }}>
                      <div style={{ flex: 1, background: 'rgba(99,102,241,0.6)', borderRadius: '3px 3px 0 0', height: `${(m.raised / maxTrend) * 96}px`, minHeight: m.raised > 0 ? 3 : 0 }} title="Raised" />
                      <div style={{ flex: 1, background: 'rgba(16,185,129,0.7)', borderRadius: '3px 3px 0 0', height: `${(m.closed / maxTrend) * 96}px`, minHeight: m.closed > 0 ? 3 : 0 }} title="Closed" />
                    </div>
                    <div style={{ fontSize: 9, color: '#475569', fontWeight: 700 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <span style={{ fontSize: 10, display: 'flex', gap: 5, alignItems: 'center' }}><span style={{ width: 10, height: 10, background: 'rgba(99,102,241,0.6)', borderRadius: 2, display: 'inline-block' }} />Raised</span>
                <span style={{ fontSize: 10, display: 'flex', gap: 5, alignItems: 'center' }}><span style={{ width: 10, height: 10, background: 'rgba(16,185,129,0.7)', borderRadius: 2, display: 'inline-block' }} />Closed</span>
              </div>
            </div>

            {/* Priority distribution */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 18 }}>Priority Distribution</h3>
              {Object.entries(byPriority).map(([p, count]) => (
                <div key={p} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: PRIORITY_COLORS[p], fontWeight: 700 }}>{p}</span>
                    <span style={{ color: '#64748b' }}>{count} ({total > 0 ? Math.round(count / total * 100) : 0}%)</span>
                  </div>
                  <Bar value={count} max={total} color={PRIORITY_COLORS[p]} />
                </div>
              ))}
            </div>

            {/* Status flow */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 18 }}>Status Distribution</h3>
              {Object.entries(byStatus).sort(([, a], [, b]) => b - a).slice(0, 8).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 9 }}>
                  <span style={{ fontSize: 10, color: '#64748b', width: 130, flexShrink: 0 }}>{status.replace(/_/g, ' ')}</span>
                  <Bar value={count} max={total} color={STATUS_COLORS[status] || '#6366f1'} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: Plants + artisans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {/* Top active assets */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Most Active Assets</h3>
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px', gap: 4 }} onClick={() => navigate('/planner/history')}>
                  <Activity size={11} /> History
                </button>
              </div>
              {topPlants.length === 0 ? (
                <p style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>No data.</p>
              ) : topPlants.map(([plant, count]) => (
                <div key={plant} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 11 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', width: 180, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant}</span>
                  <Bar value={count} max={maxPlant} color="linear-gradient(90deg,#4f46e5,#7c3aed)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Top artisans by completion */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: 18 }}>Top Artisans by Completion</h3>
              {topArtisans.length === 0 ? (
                <p style={{ color: '#475569', fontSize: 12, fontStyle: 'italic' }}>No completed job data.</p>
              ) : topArtisans.map(([name, d], i) => (
                <div key={name} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: '#e2e8f0', flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{d.closed} jobs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue alerts */}
          {overdue > 0 && (
            <div style={{ marginTop: 18, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: '#f87171', fontSize: 13 }}>{overdue} overdue job{overdue > 1 ? 's' : ''}</span>
                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>require immediate attention — past required completion date</span>
              </div>
              <button className="btn btn-ghost" onClick={() => navigate('/planner/jobs?status=overdue')} style={{ fontSize: 12, color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', gap: 5 }}>
                <Filter size={12} /> View Overdue
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
