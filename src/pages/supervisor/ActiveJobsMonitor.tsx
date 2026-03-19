import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, RefreshCw, Eye, AlertTriangle, Clock,
  User, Zap, ChevronUp, ChevronDown, Search
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';

type SortKey = 'priority' | 'elapsed' | 'due';

const PRIORITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function elapsedHours(card: JobCard): number {
  if (!card.updatedAt) return 0;
  const ms = Date.now() - new Date(card.updatedAt).getTime();
  return Math.round(ms / 3600000 * 10) / 10;
}

function daysUntilDue(card: JobCard): number {
  if (!card.requiredCompletionDate) return 999;
  const diff = new Date(card.requiredCompletionDate).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

const PriorityBadge = ({ p }: { p: string }) => {
  const colors: Record<string, [string, string]> = {
    Critical: ['#ef4444', 'rgba(239,68,68,0.12)'],
    High:     ['#f59e0b', 'rgba(245,158,11,0.12)'],
    Medium:   ['#0ea5e9', 'rgba(14,165,233,0.12)'],
    Low:      ['#64748b', 'rgba(100,116,139,0.12)'],
  };
  const [c, bg] = colors[p] || ['#64748b', 'rgba(100,116,139,0.12)'];
  return <span style={{ background: bg, color: c, border: `1px solid ${c}33`, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p}</span>;
};

export default function ActiveJobsMonitor() {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [search, setSearch] = useState('');

  const jobs = useMemo(() => {
    let list = jobCards.filter(c => ['Assigned', 'InProgress'].includes(c.status));

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.ticketNumber.toLowerCase().includes(s) ||
        (c.issuedTo || '').toLowerCase().includes(s) ||
        c.plantDescription.toLowerCase().includes(s)
      );
    }

    list = [...list].sort((a, b) => {
      if (sort === 'priority') return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * sortDir;
      if (sort === 'elapsed') return (elapsedHours(a) - elapsedHours(b)) * sortDir;
      if (sort === 'due') return (daysUntilDue(a) - daysUntilDue(b)) * sortDir;
      return 0;
    });

    return list;
  }, [jobCards, sort, sortDir, search]);

  const overdue = jobs.filter(c => daysUntilDue(c) < 0);
  const critical = jobs.filter(c => c.priority === 'Critical');
  const inProgress = jobs.filter(c => c.status === 'InProgress');

  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir(d => d === 1 ? -1 : 1);
    else { setSort(key); setSortDir(1); }
  };

  const SortIcon = ({ key: k }: { key: SortKey }) => (
    <span style={{ marginLeft: 4, opacity: sort === k ? 1 : 0.3 }}>
      {sort === k && sortDir === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </span>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Activity size={22} color="#6366f1" />
            </span>
            Live Job Monitor
          </h1>
          <p className={styles['text-muted']} style={{ marginTop: 4 }}>
            Real-time view of all jobs currently in execution. Auto-highlights overdue and critical jobs.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/supervisor/dashboard')} style={{ gap: 6, fontSize: 13 }}>
          ← Dashboard
        </button>
      </header>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Active', count: jobs.length, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'In Progress', count: inProgress.length, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
          { label: 'Critical', count: critical.length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Overdue', count: overdue.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <div className="alert-card alert-card-danger" style={{ marginBottom: 16 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <div>
            <strong style={{ color: '#f87171' }}>{overdue.length} overdue job{overdue.length > 1 ? 's' : ''} detected</strong>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {overdue.map(c => c.ticketNumber).join(', ')} — consider reassignment or escalation.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 420 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
        <input
          type="text" placeholder="Search by job, plant, artisan…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: 'rgba(9,11,18,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '8px 12px 8px 34px', color: '#e2e8f0', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <Activity size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">No active jobs</h3>
          <p>All jobs are either completed or not yet started.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table} style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Job #</th>
                <th>Plant / Asset</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('priority')}>
                  Priority <SortIcon key="priority" />
                </th>
                <th>Status</th>
                <th><User size={12} style={{ display: 'inline', marginRight: 4 }} />Artisan</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('elapsed')}>
                  Elapsed <SortIcon key="elapsed" />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('due')}>
                  Due In <SortIcon key="due" />
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(card => {
                const days = daysUntilDue(card);
                const hours = elapsedHours(card);
                const over = days < 0;
                const urgent = days >= 0 && days <= 1;
                return (
                  <tr key={card.id} style={{
                    background: over ? 'rgba(239,68,68,0.04)' :
                      card.priority === 'Critical' ? 'rgba(239,68,68,0.02)' : undefined,
                    borderLeft: over ? '3px solid #ef444460' :
                      card.priority === 'Critical' ? '3px solid #ef444430' : '3px solid transparent',
                  }}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13, color: over ? '#f87171' : '#e2e8f0', fontFamily: 'monospace' }}>
                        {card.ticketNumber}
                      </div>
                      {over && <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginTop: 2 }}>⚠ OVERDUE</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{card.plantDescription}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{card.plantNumber}</div>
                    </td>
                    <td><PriorityBadge p={card.priority} /></td>
                    <td>
                      <span style={{
                        background: card.status === 'InProgress' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)',
                        color: card.status === 'InProgress' ? '#f59e0b' : '#818cf8',
                        border: `1px solid ${card.status === 'InProgress' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`,
                        borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        {card.status === 'InProgress' ? 'In Progress' : 'Assigned'}
                      </span>
                    </td>
                    <td style={{ color: card.issuedTo ? '#e2e8f0' : '#475569', fontStyle: card.issuedTo ? 'normal' : 'italic', fontSize: 13 }}>
                      {card.issuedTo || 'Unassigned'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} color="#64748b" />
                        <span style={{ fontSize: 12, color: hours > 8 ? '#f59e0b' : '#94a3b8' }}>{hours}h</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, color: over ? '#f87171' : urgent ? '#f59e0b' : '#64748b' }}>
                        {over ? `${Math.abs(days)}d late` : days === 999 ? '—' : `${days}d`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', gap: 4, fontSize: 12 }}
                          onClick={() => navigate(`/supervisor/assign/${card.id}`)}>
                          <RefreshCw size={12} /> Reassign
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => navigate(`/job-cards/view/${card.id}`)}>
                          <Eye size={12} />
                        </button>
                        {over && (
                          <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', gap: 4 }}
                            onClick={() => navigate(`/supervisor/assign/${card.id}`)}>
                            <Zap size={12} /> Escalate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 12, color: '#475569', textAlign: 'right' }}>
        Showing {jobs.length} active job{jobs.length !== 1 ? 's' : ''} · sorted by {sort}
      </div>
    </div>
  );
}
