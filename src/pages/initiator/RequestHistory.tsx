import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Eye,
  Filter, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';

type DateFilter = 'all' | 'week' | 'month' | 'year';
type StatusFilter = 'all' | 'open' | 'closed' | 'rejected';

function statusLabel(s: string) {
  const m: Record<string, string> = {
    Draft: 'Draft', Pending_Supervisor: 'Submitted', Approved: 'Approved',
    Registered: 'Registered', Assigned: 'Assigned', InProgress: 'In Progress',
    Awaiting_SignOff: 'Sign-Off Needed', Closed: 'Completed', Rejected: 'Rejected',
  };
  return m[s] || s.replace(/_/g, ' ');
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    Draft: '#64748b', Pending_Supervisor: '#f59e0b', Approved: '#10b981',
    Registered: '#0ea5e9', Assigned: '#6366f1', InProgress: '#f59e0b',
    Awaiting_SignOff: '#a78bfa', Closed: '#10b981', Rejected: '#ef4444',
  };
  return m[s] || '#64748b';
}

function outcomeTag(card: JobCard) {
  if (card.status === 'Closed') return { label: 'Completed', color: '#10b981' };
  if (card.status === 'Rejected') return { label: 'Rejected', color: '#ef4444' };
  if (['Assigned', 'InProgress', 'Awaiting_SignOff', 'Approved', 'Registered'].includes(card.status))
    return { label: 'Active', color: '#6366f1' };
  if (card.status === 'Pending_Supervisor') return { label: 'Pending', color: '#f59e0b' };
  return { label: 'Draft', color: '#64748b' };
}

function isWithin(dateStr: string, range: DateFilter) {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (range === 'week') {
    const w = new Date(now); w.setDate(w.getDate() - 7);
    return d >= w;
  }
  if (range === 'month') {
    const m = new Date(now); m.setMonth(m.getMonth() - 1);
    return d >= m;
  }
  if (range === 'year') {
    const y = new Date(now); y.setFullYear(y.getFullYear() - 1);
    return d >= y;
  }
  return true;
}

function isStatusGroup(card: JobCard, group: StatusFilter) {
  if (group === 'all') return true;
  if (group === 'open') return !['Closed', 'Rejected'].includes(card.status);
  if (group === 'closed') return card.status === 'Closed';
  if (group === 'rejected') return card.status === 'Rejected';
  return true;
}

export default function RequestHistory() {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const mine = useMemo(() =>
    jobCards.filter(c => c.requestedBy === user?.name || user?.role === 'Admin'),
    [jobCards, user]
  );

  const filtered = useMemo(() => {
    let cards = mine.filter(c =>
      isWithin(c.dateRaised, dateFilter) && isStatusGroup(c, statusFilter)
    );
    if (search) {
      const s = search.toLowerCase();
      cards = cards.filter(c =>
        c.ticketNumber.toLowerCase().includes(s) ||
        c.plantDescription.toLowerCase().includes(s) ||
        c.defect.toLowerCase().includes(s)
      );
    }
    return [...cards].sort((a, b) => {
      const diff = new Date(b.dateRaised).getTime() - new Date(a.dateRaised).getTime();
      return sortDir === 'desc' ? diff : -diff;
    });
  }, [mine, dateFilter, statusFilter, search, sortDir]);

  // Stats
  const total    = mine.length;
  const closed   = mine.filter(c => c.status === 'Closed').length;
  const rejected = mine.filter(c => c.status === 'Rejected').length;
  const open     = mine.filter(c => !['Closed', 'Rejected'].includes(c.status)).length;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroIcon}>
              <Clock size={22} />
            </span>
            <h1 className={styles.pageTitle}>My Request History</h1>
          </div>
          <p className={styles.heroSubtitle}>Browse the full history of every maintenance request you have raised, with cleaner filters and improved mobile wrapping.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/initiator/dashboard')} style={{ gap: 6, fontSize: 13 }}>
          ← Dashboard
        </button>
      </header>

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Raised',    count: total,    color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Open / Active',   count: open,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Completed',       count: closed,   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Rejected',        count: rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <span className={styles.statLabel} style={{ marginBottom: 0 }}>{s.label}</span>
            <span className={styles.statValue} style={{ color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterRow}>
          <Filter size={14} color="#64748b" />

          <div className={styles.chipRow}>
            {([
              ['all', 'All Time'], ['week', 'Last 7 Days'], ['month', 'Last Month'], ['year', 'Last Year']
            ] as [DateFilter, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setDateFilter(v)} className={`${styles.chip} ${dateFilter === v ? styles.chipActive : ''}`}>{l}</button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          <div className={styles.chipRow}>
            {([
              ['all', 'All'], ['open', 'Open'], ['closed', 'Completed'], ['rejected', 'Rejected']
            ] as [StatusFilter, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setStatusFilter(v)} className={`${styles.chip} ${statusFilter === v ? styles.chipActive : ''}`}>{l}</button>
            ))}
          </div>

          <div className={styles.searchWrap} style={{ marginLeft: 'auto' }}>
            <input type="text" placeholder="Search..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">No requests match your filters</h3>
          <p>Try adjusting the date range or status filter.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table} style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: 130 }}>Job Card #</th>
                  <th>Plant</th>
                  <th>Issue Summary</th>
                  <th style={{ width: 80 }}>Priority</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 110, cursor: 'pointer' }} onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Date Raised {sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </span>
                  </th>
                  <th style={{ width: 100 }}>Completed</th>
                  <th style={{ width: 90 }}>Outcome</th>
                  <th style={{ width: 70, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(card => {
                  const outcome = outcomeTag(card);
                  return (
                    <tr key={card.id}>
                      <td>
                        <span className={styles.ticketNumber}>{card.ticketNumber}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{card.plantDescription}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{card.plantNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                          {card.defect || '—'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' } as any)[card.priority] }}>{card.priority}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                          color: statusColor(card.status), background: `${statusColor(card.status)}15`,
                          border: `1px solid ${statusColor(card.status)}30`,
                          borderRadius: 9999, padding: '3px 8px', whiteSpace: 'nowrap'
                        }}>
                          {statusLabel(card.status)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{card.dateRaised}</td>
                      <td style={{ fontSize: 12, color: card.dateFinished ? '#64748b' : '#3f4f6a' }}>
                        {card.dateFinished || '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: outcome.color }}>{outcome.label}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                          onClick={() => navigate(`/initiator/request/${card.id}`)}>
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#475569', textAlign: 'right' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} shown
          </div>
        </>
      )}
    </div>
  );
}
