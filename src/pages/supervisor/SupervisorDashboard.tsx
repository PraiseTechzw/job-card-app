import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle2,
  Search, Eye, UserPlus, RefreshCw, TrendingUp, Activity,
  ChevronRight, Filter, Zap
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';

type FilterKey = 'all' | 'pending' | 'inprogress' | 'review' | 'overdue';

const priorityColor = (p: string) => {
  if (p === 'Critical') return '#ef4444';
  if (p === 'High') return '#f59e0b';
  if (p === 'Medium') return '#0ea5e9';
  return '#64748b';
};

const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
  Pending_Supervisor: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Approved:           { label: 'Approved',         color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Registered:         { label: 'Registered',       color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  Assigned:           { label: 'Assigned',          color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  InProgress:         { label: 'In Progress',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Awaiting_SignOff:   { label: 'Pending Review',    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  Closed:             { label: 'Closed',             color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Rejected:           { label: 'Rejected',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusLabel[status] || { label: status, color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}33`,
      borderRadius: 9999, padding: '2px 10px',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>{s.label}</span>
  );
};

const isOverdue = (card: JobCard) => {
  if (!card.requiredCompletionDate) return false;
  const due = new Date(card.requiredCompletionDate);
  return due < new Date() && !['Closed', 'Awaiting_SignOff'].includes(card.status);
};

export default function SupervisorDashboard() {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEngSupervisor = user?.role === 'EngSupervisor' || user?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const pending   = useMemo(() => jobCards.filter(c => c.status === 'Pending_Supervisor'), [jobCards]);
  const assigned  = useMemo(() => jobCards.filter(c => ['Assigned', 'InProgress'].includes(c.status)), [jobCards]);
  const awaitRev  = useMemo(() => jobCards.filter(c => c.status === 'Awaiting_SignOff'), [jobCards]);
  const overdue   = useMemo(() => jobCards.filter(c => isOverdue(c)), [jobCards]);

  const allVisible = useMemo(() => {
    let cards = [...jobCards].filter(c => !['Closed', 'Draft', 'Rejected'].includes(c.status));

    if (filter === 'pending')    cards = pending;
    if (filter === 'inprogress') cards = assigned;
    if (filter === 'review')     cards = awaitRev;
    if (filter === 'overdue')    cards = overdue;

    if (priorityFilter !== 'all') cards = cards.filter(c => c.priority === priorityFilter);

    if (search) {
      const s = search.toLowerCase();
      cards = cards.filter(c =>
        c.ticketNumber.toLowerCase().includes(s) ||
        c.plantDescription.toLowerCase().includes(s) ||
        (c.issuedTo || '').toLowerCase().includes(s)
      );
    }

    return cards.sort((a, b) => {
      const po = { Critical: 0, High: 1, Medium: 2, Low: 3 } as any;
      return (po[a.priority] ?? 4) - (po[b.priority] ?? 4);
    });
  }, [jobCards, filter, search, priorityFilter, pending, assigned, awaitRev, overdue]);

  const kpis = [
    { label: 'Pending Approval', count: pending.length,   icon: ShieldCheck, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', key: 'pending'    as FilterKey },
    { label: 'In Progress',      count: assigned.length,  icon: Activity,    color: '#6366f1', bg: 'rgba(99,102,241,0.12)', key: 'inprogress' as FilterKey },
    { label: 'Awaiting Review',  count: awaitRev.length,  icon: Eye,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', key: 'review'    as FilterKey },
    { label: 'Overdue Jobs',     count: overdue.length,   icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', key: 'overdue' as FilterKey },
  ];

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all',        label: 'All Active' },
    { key: 'pending',    label: `Pending Approval (${pending.length})` },
    { key: 'inprogress', label: `In Progress (${assigned.length})` },
    { key: 'review',     label: `Awaiting Review (${awaitRev.length})` },
    { key: 'overdue',    label: `Overdue (${overdue.length})` },
  ];

  // Calculate real top performers for supervisor
  const topPerformers = (() => {
    const closedJobs = jobCards.filter(c => c.status === 'Closed' || c.status === 'SignedOff');
    const artisanMap: Record<string, number> = {};
    closedJobs.forEach(job => {
      if (job.issuedTo) artisanMap[job.issuedTo] = (artisanMap[job.issuedTo] || 0) + 1;
    });
    return Object.entries(artisanMap)
      .map(([name, count]) => ({ name, jobs: count }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 3);
  })();

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <ShieldCheck size={22} color="#6366f1" />
            </span>
            Supervisor Control Centre
          </h1>
          <p className={styles['text-muted']}>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/supervisor/reports')} style={{ gap: 6 }}>
            <TrendingUp size={16} /> Reports
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/supervisor/active')} style={{ gap: 6 }}>
            <Zap size={16} /> Live Monitor
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpis.map(k => (
          <button
            key={k.key}
            onClick={() => setFilter(filter === k.key ? 'all' : k.key)}
            style={{
              background: filter === k.key ? k.bg : 'rgba(15,23,42,0.6)',
              border: `1px solid ${filter === k.key ? k.color + '44' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              boxShadow: filter === k.key ? `0 0 0 2px ${k.color}33` : 'none',
              transform: filter === k.key ? 'translateY(-2px)' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: filter === k.key ? k.color : '#f1f5f9', lineHeight: 1 }}>{k.count}</div>
            </div>
            <div style={{ background: k.bg, borderRadius: 12, padding: 12 }}>
              <k.icon size={22} color={k.color} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <div>
          {/* Filters Row */}
          <div style={{
            background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
            display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <input
                type="text" placeholder="Search by job ID, plant, artisan…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(9,11,18,0.7)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8, padding: '8px 12px 8px 36px', color: '#f1f5f9',
                  fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Filter size={14} color="#64748b" style={{ alignSelf: 'center' }} />
              {['all', 'Low', 'Medium', 'High', 'Critical'].map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: priorityFilter === p ? priorityColor(p) + '22' : 'rgba(255,255,255,0.04)',
                    color: priorityFilter === p ? priorityColor(p) : '#64748b',
                    border: `1px solid ${priorityFilter === p ? priorityColor(p) + '44' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 0.15s'
                  }}
                >{p === 'all' ? 'All' : p}</button>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.15s',
                  background: filter === t.key ? '#4f46e5' : 'rgba(255,255,255,0.04)',
                  color: filter === t.key ? '#fff' : '#64748b',
                  border: `1px solid ${filter === t.key ? '#4f46e5' : 'rgba(255,255,255,0.06)'}`,
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* Job Table */}
          {allVisible.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job #</th>
                    <th>Plant / Asset</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVisible.map(card => {
                    const due = card.requiredCompletionDate ? new Date(card.requiredCompletionDate) : null;
                    const over = due && due < new Date() && !['Closed', 'Awaiting_SignOff'].includes(card.status);
                    return (
                      <tr key={card.id} style={{ background: over ? 'rgba(239,68,68,0.04)' : undefined }}>
                        <td>
                          <span className={styles.ticketNumber} style={{ color: over ? '#f87171' : undefined }}>
                            {card.ticketNumber}
                          </span>
                          {over && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase' }}>OVERDUE</span>}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{card.plantDescription}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>ID: {card.plantNumber}</div>
                        </td>
                        <td>
                          <span style={{
                            background: priorityColor(card.priority) + '18',
                            color: priorityColor(card.priority),
                            border: `1px solid ${priorityColor(card.priority)}33`,
                            borderRadius: 9999, padding: '2px 10px',
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
                          }}>{card.priority}</span>
                        </td>
                        <td><StatusBadge status={card.status} /></td>
                        <td style={{ color: card.issuedTo ? '#e2e8f0' : '#475569', fontStyle: card.issuedTo ? 'normal' : 'italic', fontSize: 13 }}>
                          {card.issuedTo || 'Unassigned'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {card.status === 'Pending_Supervisor' && (
                              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, gap: 4 }}
                                onClick={() => navigate(`/supervisor/approve/${card.id}`)}>
                                <ShieldCheck size={13} /> Approve
                              </button>
                            )}
                            {card.status === 'Registered' && (
                              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, background: 'linear-gradient(135deg,#059669,#047857)', gap: 4 }}
                                onClick={() => navigate(`/supervisor/assign/${card.id}`)}>
                                <UserPlus size={13} /> Assign
                              </button>
                            )}
                            {card.status === 'Awaiting_SignOff' && (
                              <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', gap: 4 }}
                                onClick={() => navigate(`/supervisor/review/${card.id}`)}>
                                <CheckCircle2 size={13} /> Review
                              </button>
                            )}
                            {['Assigned', 'InProgress'].includes(card.status) && (
                              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, gap: 4 }}
                                onClick={() => navigate(`/supervisor/assign/${card.id}`)}>
                                <RefreshCw size={13} /> Reassign
                              </button>
                            )}
                            <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                              onClick={() => navigate(`/job-cards/view/${card.id}`)}>
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={56} className="empty-state-icon" />
              <h3 className="empty-state-title">All clear!</h3>
              <p>No jobs match the current filter. Adjust the filters or check back later.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, letterSpacing: '0.05em' }}>Top Performing Artisans</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topPerformers.length > 0 ? topPerformers.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: i < topPerformers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: i === 0 ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 0 ? '#f59e0b' : '#6366f1' }}>
                    {a.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{a.jobs} jobs completed</div>
                  </div>
                  {i === 0 && <Zap size={14} color="#f59e0b" fill="#f59e0b" />}
                </div>
              )) : (
                <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '10px 0' }}>No completion data yet.</p>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, letterSpacing: '0.05em' }}>Supervisor Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => navigate('/supervisor/active')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '10px 12px', gap: 10 }}>
                <Activity size={16} /> Live Job Monitor
              </button>
              {isEngSupervisor && (
                <button onClick={() => navigate('/assignments')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '10px 12px', gap: 10 }}>
                  <UserPlus size={16} /> Bulk Assignments
                </button>
              )}
              <button onClick={() => navigate('/supervisor/reports')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12, padding: '10px 12px', gap: 10 }}>
                <TrendingUp size={16} /> Efficiency Reports
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer summary */}
      <div style={{ marginTop: 18, display: 'flex', gap: 20, color: '#475569', fontSize: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
        <span>Showing <strong style={{ color: '#94a3b8' }}>{allVisible.length}</strong> active job(s)</span>
        <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12, gap: 6 }}
          onClick={() => navigate('/reports')}>
          View Full Insights <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
