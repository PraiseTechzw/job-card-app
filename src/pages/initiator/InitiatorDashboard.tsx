import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Search, FileText, Clock, CheckCircle2,
  AlertTriangle, RotateCcw, Eye, Edit2, ChevronRight,
  Send, FilePlus
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';

type FilterKey = 'all' | 'Draft' | 'Pending_Supervisor' | 'Approved' | 'Assigned' | 'InProgress' | 'Awaiting_SignOff' | 'Closed' | 'Rejected';

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  Draft:              { label: 'Draft',           color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: FileText },
  Pending_Supervisor: { label: 'Submitted',        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock },
  Approved:           { label: 'Approved',         color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  Registered:         { label: 'Registered',       color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: CheckCircle2 },
  Assigned:           { label: 'Assigned',          color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: Send },
  InProgress:         { label: 'In Progress',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  Awaiting_SignOff:   { label: 'Sign-Off Needed',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: RotateCcw },
  Closed:             { label: 'Completed',         color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
  Rejected:           { label: 'Rejected',          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || { label: status, color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: FileText };
  const Icon = m.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: m.bg, color: m.color,
      border: `1px solid ${m.color}33`,
      borderRadius: 9999, padding: '3px 10px',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

function PriorityDot({ p }: { p: string }) {
  const c = ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' } as any)[p] || '#64748b';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
    <span style={{ color: c, fontSize: 11, fontWeight: 700 }}>{p}</span>
  </span>;
}

export default function InitiatorDashboard() {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  // Only show this user's cards
  const mine = useMemo(() =>
    jobCards.filter(c => c.requestedBy === user?.name || user?.role === 'Admin'),
    [jobCards, user]
  );

  const drafts      = mine.filter(c => c.status === 'Draft');
  const submitted   = mine.filter(c => c.status === 'Pending_Supervisor');
  const approved    = mine.filter(c => ['Approved', 'Registered', 'Assigned'].includes(c.status));
  const inprog      = mine.filter(c => c.status === 'InProgress');
  const signoff     = mine.filter(c => c.status === 'Awaiting_SignOff');
  const completed   = mine.filter(c => c.status === 'Closed');
  const rejected    = mine.filter(c => c.status === 'Rejected');

  const displayed = useMemo(() => {
    let cards = filter === 'all' ? mine : mine.filter(c => c.status === filter);
    if (search) {
      const s = search.toLowerCase();
      cards = cards.filter(c =>
        c.ticketNumber.toLowerCase().includes(s) ||
        c.plantDescription.toLowerCase().includes(s) ||
        c.plantNumber.toLowerCase().includes(s) ||
        c.defect.toLowerCase().includes(s)
      );
    }
    return [...cards].sort((a, b) => new Date(b.dateRaised).getTime() - new Date(a.dateRaised).getTime());
  }, [mine, filter, search]);

  const kpis = [
    { label: 'Drafts',      count: drafts.length,    color: '#64748b', bg: 'rgba(100,116,139,0.1)', key: 'Draft' as FilterKey },
    { label: 'Submitted',   count: submitted.length,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  key: 'Pending_Supervisor' as FilterKey },
    { label: 'In Progress', count: inprog.length + approved.length, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', key: 'InProgress' as FilterKey },
    { label: 'Sign-Off',    count: signoff.length,   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', key: 'Awaiting_SignOff' as FilterKey },
    { label: 'Completed',   count: completed.length,  color: '#10b981', bg: 'rgba(16,185,129,0.1)', key: 'Closed' as FilterKey },
    { label: 'Rejected',    count: rejected.length,   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  key: 'Rejected' as FilterKey },
  ];

  const tabs = [
    { key: 'all' as FilterKey,              label: `All (${mine.length})` },
    { key: 'Draft' as FilterKey,            label: `Drafts (${drafts.length})` },
    { key: 'Pending_Supervisor' as FilterKey, label: `Submitted (${submitted.length})` },
    { key: 'InProgress' as FilterKey,       label: `In Progress (${inprog.length})` },
    { key: 'Awaiting_SignOff' as FilterKey, label: `Sign-Off (${signoff.length})` },
    { key: 'Closed' as FilterKey,           label: `Completed (${completed.length})` },
    { key: 'Rejected' as FilterKey,         label: `Rejected (${rejected.length})` },
  ];

  const canInitiatorEdit = (status: string) => ['Draft', 'Rejected'].includes(status);
  const getEditLabel = (status: string) => (status === 'Rejected' ? 'Edit & Resubmit' : 'Edit Draft');

  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitleRow}>
            <span className={styles.heroIcon}>
              <FilePlus size={22} />
            </span>
            <h1 className={styles.pageTitle}>My Maintenance Requests</h1>
          </div>
          <p className={styles.heroSubtitle}>Welcome back, {user?.name}. Track drafts, active work, and jobs waiting on your sign-off from one place.</p>
        </div>
        <div className={styles.heroActions}>
          <button className="btn btn-ghost" onClick={() => navigate('/initiator/history')} style={{ gap: 6, fontSize: 13 }}>
            <Clock size={14} /> My History
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/initiator/new')} style={{ gap: 6 }}>
            <PlusCircle size={16} /> New Request
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {kpis.map(k => (
          <button
            key={k.key}
            onClick={() => setFilter(filter === k.key ? 'all' : k.key)}
            className={`${styles.statCard} ${styles.statCardStack}`}
            style={{
              background: filter === k.key ? k.bg : 'rgba(15,23,42,0.5)',
              border: `1px solid ${filter === k.key ? k.color + '44' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              transform: filter === k.key ? 'translateY(-2px)' : 'none',
            }}
          >
            <span className={styles.statLabel}>{k.label}</span>
            <span className={styles.statValue} style={{ color: filter === k.key ? k.color : '#f1f5f9' }}>{k.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterRow}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text" placeholder="Search by job #, plant, keyword..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.chipRow}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`${styles.chip} ${filter === t.key ? styles.chipActive : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {rejected.length > 0 && (filter === 'all' || filter === 'Rejected') && (
        <div className={`${styles.notice} ${styles.noticeDanger}`}>
          <AlertTriangle size={18} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171' }}>{rejected.length} request{rejected.length > 1 ? 's' : ''} rejected</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Review the rejection reasons and raise a corrected request if needed.</div>
          </div>
        </div>
      )}

      {signoff.length > 0 && (filter === 'all' || filter === 'Awaiting_SignOff') && (
        <div className={`${styles.notice} ${styles.noticeInfo}`} style={{ alignItems: 'center' }}>
          <RotateCcw size={18} color="#a78bfa" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#c4b5fd' }}>{signoff.length} job{signoff.length > 1 ? 's' : ''} awaiting your sign-off</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Work is complete. Review and confirm the resolution when you are satisfied.</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', gap: 5, whiteSpace: 'nowrap' }}
            onClick={() => navigate('/sign-offs')}>
            Go to Sign-offs <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Job list */}
      {displayed.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job #</th>
                <th>Plant / Asset</th>
                <th>Issue Summary</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date Raised</th>
                <th>Due</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(card => (
                <tr key={card.id}>
                  <td>
                    <span className={styles.ticketNumber}>{card.ticketNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{card.plantDescription}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>ID: {card.plantNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {card.defect || '—'}
                    </div>
                  </td>
                  <td><PriorityDot p={card.priority} /></td>
                  <td><StatusBadge status={card.status} /></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{card.dateRaised}</td>
                  <td style={{ fontSize: 12, color: card.requiredCompletionDate && new Date(card.requiredCompletionDate) < new Date() && card.status !== 'Closed' ? '#f87171' : '#64748b' }}>
                    {card.requiredCompletionDate || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {canInitiatorEdit(card.status) && (
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12, gap: 4 }}
                          onClick={() => navigate(`/initiator/edit/${card.id}`)}>
                          <Edit2 size={12} /> {getEditLabel(card.status)}
                        </button>
                      )}
                      {card.status === 'Awaiting_SignOff' && (
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', gap: 4 }}
                          onClick={() => navigate(`/job-cards/view/${card.id}`)}>
                          <CheckCircle2 size={12} /> Sign Off
                        </button>
                      )}
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                        onClick={() => navigate(`/initiator/request/${card.id}`)}>
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <FilePlus size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">
            {mine.length === 0 ? 'No requests yet' : 'No matching requests'}
          </h3>
          <p>
            {mine.length === 0
              ? 'You have not raised any maintenance requests. Click "New Request" to get started.'
              : 'Try adjusting the search or filter.'}
          </p>
          {mine.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/initiator/new')} style={{ marginTop: 20, gap: 8 }}>
              <PlusCircle size={16} /> Create First Request
            </button>
          )}
        </div>
      )}

      <div className={styles.footerMeta}>
        <span>Showing {displayed.length} of {mine.length} request{mine.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
