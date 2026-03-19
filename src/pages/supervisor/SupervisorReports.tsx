import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Clock, CheckCircle2, AlertTriangle, BarChart2,
  User, Calendar, Filter, ArrowLeft, Package,
  Activity, Percent
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';

const avgCompletionDays = (cards: JobCard[]): string => {
  const completed = cards.filter(c => c.dateFinished && c.dateRaised);
  if (!completed.length) return '—';
  const avg = completed.reduce((s, c) => {
    const ms = new Date(c.dateFinished!).getTime() - new Date(c.dateRaised).getTime();
    return s + ms / 86400000;
  }, 0) / completed.length;
  return `${Math.round(avg * 10) / 10}d`;
}

export default function SupervisorReports() {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [plantFilter, setPlantFilter] = useState('');
  const [artisanFilter, setArtisanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    let cards = [...jobCards];
    if (dateFrom) cards = cards.filter(c => new Date(c.dateRaised) >= new Date(dateFrom));
    if (dateTo)   cards = cards.filter(c => new Date(c.dateRaised) <= new Date(dateTo));
    if (plantFilter) cards = cards.filter(c => c.plantDescription.toLowerCase().includes(plantFilter.toLowerCase()));
    if (artisanFilter) cards = cards.filter(c => (c.issuedTo || '').toLowerCase().includes(artisanFilter.toLowerCase()));
    if (statusFilter) cards = cards.filter(c => c.status === statusFilter);
    return cards;
  }, [jobCards, dateFrom, dateTo, plantFilter, artisanFilter, statusFilter]);

  const closed = filtered.filter(c => c.status === 'Closed');
  const open = filtered.filter(c => !['Closed', 'Rejected'].includes(c.status));
  const overdue = filtered.filter(c => {
    if (!c.requiredCompletionDate) return false;
    return new Date(c.requiredCompletionDate) < new Date() && !['Closed', 'Rejected', 'Awaiting_SignOff'].includes(c.status);
  });
  const pending = filtered.filter(c => c.status === 'Pending_Supervisor');
  const awaitReview = filtered.filter(c => c.status === 'Awaiting_SignOff');

  // Priority breakdown
  const priorityBreakdown = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
  filtered.forEach(c => { if (priorityBreakdown[c.priority] !== undefined) priorityBreakdown[c.priority]++; });

  // Per-artisan breakdown
  const artisanMap: Record<string, { total: number; closed: number; overdue: number }> = {};
  filtered.forEach(c => {
    if (!c.issuedTo) return;
    if (!artisanMap[c.issuedTo]) artisanMap[c.issuedTo] = { total: 0, closed: 0, overdue: 0 };
    artisanMap[c.issuedTo].total++;
    if (c.status === 'Closed') artisanMap[c.issuedTo].closed++;
    if (overdue.some(o => o.id === c.id)) artisanMap[c.issuedTo].overdue++;
  });

  // Status flow
  const statusCounts: Record<string, number> = {};
  filtered.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });

  // Plant breakdown
  const plantMap: Record<string, number> = {};
  filtered.forEach(c => { plantMap[c.plantDescription] = (plantMap[c.plantDescription] || 0) + 1; });
  const topPlants = Object.entries(plantMap).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxPlant = topPlants[0]?.[1] || 1;

  const kpis = [
    { label: 'Total Jobs',         value: filtered.length,    color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: BarChart2 },
    { label: 'Completed',          value: closed.length,      color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
    { label: 'Open / Active',      value: open.length,        color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: Activity },
    { label: 'Overdue',            value: overdue.length,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle },
    { label: 'Pending Approval',   value: pending.length,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
    { label: 'Awaiting Review',    value: awaitReview.length, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: Filter },
    { label: 'Avg. Completion',    value: avgCompletionDays(filtered), color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: Percent },
    { label: 'Completion Rate',    value: filtered.length > 0 ? `${Math.round(closed.length / filtered.length * 100)}%` : '—', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', icon: TrendingUp },
  ];

  const priorityColors: Record<string, string> = { Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' };

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setPlantFilter(''); setArtisanFilter(''); setStatusFilter(''); };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <TrendingUp size={22} color="#6366f1" />
            </span>
            Operational Reports
          </h1>
          <p className={styles['text-muted']}>Section-level insights across all job card activities.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')} style={{ gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
      </header>

      {/* Filter Bar */}
      <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 20px', marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Report Filters</span>
          {(dateFrom || dateTo || plantFilter || artisanFilter || statusFilter) && (
            <button onClick={clearFilters} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>
              Clear All
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />From
            </label>
            <input type="date" className="form-input" style={{ padding: '7px 10px', fontSize: 13 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" className="form-input" style={{ padding: '7px 10px', fontSize: 13 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Plant</label>
            <input type="text" className="form-input" placeholder="Filter by plant…" style={{ padding: '7px 10px', fontSize: 13 }} value={plantFilter} onChange={e => setPlantFilter(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Artisan</label>
            <input type="text" className="form-input" placeholder="Filter by artisan…" style={{ padding: '7px 10px', fontSize: 13 }} value={artisanFilter} onChange={e => setArtisanFilter(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status</label>
            <select className="form-select" style={{ padding: '7px 10px', fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['Pending_Supervisor','Approved','Registered','Assigned','InProgress','Awaiting_SignOff','Closed','Rejected'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.color}22`, borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{k.label}</span>
              <k.icon size={14} color={k.color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Priority Breakdown */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Priority Distribution</h3>
          {Object.entries(priorityBreakdown).map(([p, count]) => (
            <div key={p} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: priorityColors[p], fontWeight: 700 }}>{p}</span>
                <span style={{ color: '#64748b' }}>{count} job{count !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{
                  width: filtered.length > 0 ? `${count / filtered.length * 100}%` : '0%',
                  height: '100%', borderRadius: 4,
                  background: priorityColors[p],
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Status Distribution */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Status Breakdown</h3>
          {Object.entries(statusCounts).slice(0, 8).map(([status, count]) => {
            const pct = filtered.length > 0 ? count / filtered.length * 100 : 0;
            return (
              <div key={status} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#64748b', width: 150, flexShrink: 0 }}>{status.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 3, height: 5 }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: '#4f46e5', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 24, textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Problematic Plants */}
      <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Package size={14} /> Most Active Plants / Assets
        </h3>
        {topPlants.length === 0 ? (
          <p style={{ color: '#475569', fontStyle: 'italic', fontSize: 13 }}>No plant data for selected filters.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topPlants.map(([plant, count]) => (
              <div key={plant} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#94a3b8', width: 220, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${count / maxPlant * 100}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', width: 28, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artisan Performance Table */}
      <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <User size={14} /> Artisan Performance
        </h3>
        {Object.keys(artisanMap).length === 0 ? (
          <p style={{ color: '#475569', fontStyle: 'italic', fontSize: 13 }}>No artisan data for selected filters.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Artisan</th>
                  <th style={{ textAlign: 'center' }}>Total Jobs</th>
                  <th style={{ textAlign: 'center' }}>Completed</th>
                  <th style={{ textAlign: 'center' }}>Overdue</th>
                  <th style={{ textAlign: 'center' }}>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(artisanMap)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([name, data]) => {
                    const rate = data.total > 0 ? Math.round(data.closed / data.total * 100) : 0;
                    return (
                      <tr key={name}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {name.charAt(0)}
                            </div>
                            {name}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#e2e8f0' }}>{data.total}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{data.closed}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: data.overdue > 0 ? '#ef4444' : '#64748b' }}>
                          {data.overdue > 0 ? `⚠ ${data.overdue}` : data.overdue}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${rate}%`, height: '100%', background: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
