import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Download, Eye, Tag,
  ChevronDown, ChevronUp, X, AlertTriangle, Database
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard, Priority, JobCardStatus } from '../../types';
import styles from '../JobCards.module.css';

type SortKey = 'dateRaised' | 'requiredCompletionDate' | 'priority' | 'status' | 'plantDescription';
type SortDir = 'asc' | 'desc';

const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: JobCardStatus[] = ['Pending_Supervisor', 'Approved', 'Registered', 'Assigned', 'InProgress', 'Awaiting_SignOff', 'Closed', 'Rejected'];

const PRIORITY_ORDER: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function priorityColor(p: string) {
  return ({ Critical: '#ef4444', High: '#f59e0b', Medium: '#0ea5e9', Low: '#64748b' } as any)[p] || '#64748b';
}
function statusColor(s: string) {
  return ({ Draft: '#64748b', Pending_Supervisor: '#f59e0b', Approved: '#10b981', Registered: '#0ea5e9', Assigned: '#6366f1', InProgress: '#f59e0b', Awaiting_SignOff: '#a78bfa', Closed: '#10b981', Rejected: '#ef4444' } as any)[s] || '#64748b';
}
function statusLabel(s: string) {
  return ({ Pending_Supervisor: 'Submitted', Awaiting_SignOff: 'Awaiting Review' } as any)[s] || s.replace(/_/g, ' ');
}
function isOverdue(c: JobCard) {
  return !!c.requiredCompletionDate && new Date(c.requiredCompletionDate) < new Date() && !['Closed', 'Rejected'].includes(c.status);
}

export default function JobRecordsManagement() {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterArtisan, setFilterArtisan] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('dateRaised');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (!statusParam) return;
    if (statusParam === 'overdue') {
      setShowOverdueOnly(true);
      setFilterStatus('');
      setPage(1);
      return;
    }
    if (STATUSES.includes(statusParam as JobCardStatus)) {
      setFilterStatus(statusParam);
      setShowOverdueOnly(false);
      setPage(1);
    }
  }, [searchParams]);

  // Unique plant list for filter dropdown
  const plants = useMemo(() =>
    [...new Set(jobCards.map(c => c.plantDescription).filter(Boolean))].sort(),
    [jobCards]
  );
  const artisans = useMemo(() =>
    [...new Set(jobCards.map(c => c.issuedTo).filter(Boolean))].sort() as string[],
    [jobCards]
  );

  const filtered = useMemo(() => {
    let cards = jobCards.filter(c => c.status !== 'Draft'); // planners see submitted+ records

    if (search) {
      const s = search.toLowerCase();
      cards = cards.filter(c =>
        c.ticketNumber.toLowerCase().includes(s) ||
        c.plantDescription.toLowerCase().includes(s) ||
        c.plantNumber.toLowerCase().includes(s) ||
        c.defect.toLowerCase().includes(s) ||
        (c.requestedBy || '').toLowerCase().includes(s) ||
        (c.issuedTo || '').toLowerCase().includes(s)
      );
    }
    if (filterStatus) cards = cards.filter(c => c.status === filterStatus);
    if (filterPriority) cards = cards.filter(c => c.priority === filterPriority);
    if (filterPlant) cards = cards.filter(c => c.plantDescription === filterPlant);
    if (filterArtisan) cards = cards.filter(c => c.issuedTo === filterArtisan);
    if (filterDateFrom) cards = cards.filter(c => c.dateRaised >= filterDateFrom);
    if (filterDateTo)   cards = cards.filter(c => c.dateRaised <= filterDateTo);
    if (showOverdueOnly) cards = cards.filter(isOverdue);

    cards.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortKey === 'plantDescription') cmp = (a.plantDescription || '').localeCompare(b.plantDescription || '');
      else cmp = (a[sortKey] || '').localeCompare(b[sortKey] || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return cards;
  }, [jobCards, search, filterStatus, filterPriority, filterPlant, filterArtisan, filterDateFrom, filterDateTo, showOverdueOnly, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const clearFilters = useCallback(() => {
    setFilterStatus(''); setFilterPriority(''); setFilterPlant('');
    setFilterArtisan(''); setFilterDateFrom(''); setFilterDateTo('');
    setShowOverdueOnly(false); setSearch('');
    setPage(1);
  }, []);

  const activeFilterCount = [filterStatus, filterPriority, filterPlant, filterArtisan, filterDateFrom, filterDateTo, showOverdueOnly && 'ov'].filter(Boolean).length;

  // CSV export
  const exportCSV = () => {
    const cols = ['Ticket #', 'Plant #', 'Plant Desc', 'Category', 'Priority', 'Status', 'Date Raised', 'Due Date', 'Requested By', 'Artisan', 'Date Finished'];
    const rows = filtered.map(c => [
      c.ticketNumber, c.plantNumber, c.plantDescription, '', c.priority, c.status,
      c.dateRaised, c.requiredCompletionDate, c.requestedBy, c.issuedTo || '', c.dateFinished || ''
    ]);
    const csv = [cols, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `job-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null;

  const thStyle = (k: SortKey): React.CSSProperties => ({
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    color: sortKey === k ? '#818cf8' : undefined,
  });

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Database size={22} color="#6366f1" />
            </span>
            Job Records Management
          </h1>
          <p className={styles['text-muted']}>{filtered.length} records matching current filters</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={exportCSV} style={{ gap: 5, fontSize: 12 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {/* Search + filter bar */}
      <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search job #, plant, artisan, description…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ background: 'rgba(9,11,18,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px 8px 34px', color: '#f1f5f9', fontSize: 13, width: '100%', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button className="btn btn-ghost" onClick={() => setShowFilters(p => !p)} style={{ gap: 5, fontSize: 12, position: 'relative' }}>
            <Filter size={13} /> Filters
            {activeFilterCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -5, right: -5 }}>{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn btn-ghost" onClick={clearFilters} style={{ gap: 5, fontSize: 12, color: '#f87171' }}>
              <X size={12} /> Clear
            </button>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: showOverdueOnly ? '#f87171' : '#64748b', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={showOverdueOnly} onChange={e => { setShowOverdueOnly(e.target.checked); setPage(1); }} />
            Overdue only
          </label>
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Status</label>
              <select className="form-select" style={{ fontSize: 12 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Priority</label>
              <select className="form-select" style={{ fontSize: 12 }} value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Plant</label>
              <select className="form-select" style={{ fontSize: 12 }} value={filterPlant} onChange={e => { setFilterPlant(e.target.value); setPage(1); }}>
                <option value="">All Plants</option>
                {plants.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Artisan</label>
              <select className="form-select" style={{ fontSize: 12 }} value={filterArtisan} onChange={e => { setFilterArtisan(e.target.value); setPage(1); }}>
                <option value="">All Artisans</option>
                {artisans.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Date From</label>
              <input type="date" className="form-input" style={{ fontSize: 12 }} value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Date To</label>
              <input type="date" className="form-input" style={{ fontSize: 12 }} value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {paged.length === 0 ? (
        <div className="empty-state">
          <Database size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">No records match</h3>
          <button className="btn btn-ghost" onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table} style={{ tableLayout: 'fixed', minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={{ width: 120, ...thStyle('dateRaised') }} onClick={() => handleSort('dateRaised')}>
                    Date Raised <SortIcon k="dateRaised" />
                  </th>
                  <th style={{ width: 130 }}>Job #</th>
                  <th style={{ ...thStyle('plantDescription') }} onClick={() => handleSort('plantDescription')}>
                    Plant / Asset <SortIcon k="plantDescription" />
                  </th>
                  <th>Defect Summary</th>
                  <th style={{ width: 80, ...thStyle('priority') }} onClick={() => handleSort('priority')}>
                    Priority <SortIcon k="priority" />
                  </th>
                  <th style={{ width: 140, ...thStyle('status') }} onClick={() => handleSort('status')}>
                    Status <SortIcon k="status" />
                  </th>
                  <th style={{ width: 110 }}>Artisan</th>
                  <th style={{ width: 110, ...thStyle('requiredCompletionDate') }} onClick={() => handleSort('requiredCompletionDate')}>
                    Due <SortIcon k="requiredCompletionDate" />
                  </th>
                  <th style={{ width: 100 }}>Closed</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(card => {
                  const overdue = isOverdue(card);
                  return (
                    <tr key={card.id} style={overdue ? { borderLeft: '3px solid #ef4444' } : undefined}>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{card.dateRaised}</td>
                      <td>
                        <span className={styles.ticketNumber} style={{ fontSize: 12 }}>{card.ticketNumber}</span>
                        {overdue && <span style={{ marginLeft: 6 }}><AlertTriangle size={11} color="#ef4444" /></span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.plantDescription}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{card.plantNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                          {card.defect || '—'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 800, color: priorityColor(card.priority) }}>{card.priority}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          color: statusColor(card.status), background: `${statusColor(card.status)}15`,
                          border: `1px solid ${statusColor(card.status)}30`,
                          borderRadius: 9999, padding: '2px 8px', whiteSpace: 'nowrap'
                        }}>{statusLabel(card.status)}</span>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.issuedTo || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: overdue ? '#f87171' : '#64748b' }}>
                        {card.requiredCompletionDate || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{card.dateFinished || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11, gap: 3 }}
                            onClick={() => navigate(`/planner/job/${card.id}`)}>
                            <Eye size={11} /> View
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11, gap: 3 }}
                            onClick={() => navigate(`/planner/job/${card.id}?classify=1`)}>
                            <Tag size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: '#475569' }}>
              Page {page} of {totalPages} · {filtered.length} records
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '5px 12px', fontSize: 12 }}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={n} onClick={() => setPage(n)} style={{
                    padding: '5px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    background: n === page ? '#4f46e5' : 'rgba(255,255,255,0.04)',
                    color: n === page ? '#fff' : '#64748b', border: `1px solid ${n === page ? '#4f46e5' : 'rgba(255,255,255,0.07)'}`,
                  }}>{n}</button>
                );
              })}
              <button className="btn btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '5px 12px', fontSize: 12 }}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
