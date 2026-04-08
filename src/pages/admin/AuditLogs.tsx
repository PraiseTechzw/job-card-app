import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, ArrowLeft, Search, 
  Download, Info, ShieldCheck,
  ChevronRight, RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs', {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
          action: filterAction || undefined,
          user: filterUser || undefined,
        },
      });
      setLogs(res.data?.items || []);
      setPagination(res.data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (e) {
      console.error('Audit log fetch failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, filterAction, filterUser]);

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))).filter(Boolean), [logs]);
  const uniqueUsers = useMemo(() => Array.from(new Set(logs.map(l => l.performedBy))).filter(Boolean), [logs]);

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/admin/audit-logs/export', {
        params: {
          search: search || undefined,
          action: filterAction || undefined,
          user: filterUser || undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'audit-logs.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Audit export failed', error);
    }
  };

  return (
    <div className={`${styles.pageContainer} ${adminStyles.page}`}>
      <div className={adminStyles.hero}>
        <header className={adminStyles.header}>
          <div className={adminStyles.headerMain}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
            <div className={adminStyles.headerText}>
              <p className={adminStyles.eyebrow}>System Governance</p>
              <div className={adminStyles.titleRow}>
                <span className={adminStyles.titleIcon}>
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Administrative Audit Registry</h1>
                  <p className={adminStyles.subtitle}>Immutable records of security, configuration, and sensitive data operations.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className={`btn btn-ghost ${adminStyles.compactButton}`} style={{ gap: 8, border: '1px solid rgba(148,163,184,0.14)' }} onClick={handleExport}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.note}>
         <Info size={20} color="#6366f1" style={{ minWidth: 20 }} />
         <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
           <strong>Compliance Rule:</strong> Audit logs are read-only and immutable. Deletion of audit records via UI is <strong>restricted</strong>. 
           We retain all system activity records for a minimum of <strong>24 months</strong> based on forensic system policy.
         </div>
      </div>

      <div className={adminStyles.panel}>
        <div className={adminStyles.toolbar}>
          <div className="search-container flex-1">
          <Search size={14} className="search-icon" />
          <input 
            type="text" placeholder="Search by entity, user or details…" 
            className="form-input outline-none shadow-inner pl-12 pr-4"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          </div>
          <div className={adminStyles.toolbarGroup}>
            <select className="form-select" style={{ fontSize: 13, minWidth: 160 }} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="form-select" style={{ fontSize: 13, minWidth: 160 }} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              <option value="">All Users</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button className={`btn btn-ghost ${adminStyles.compactButton}`} onClick={() => { setSearch(''); setFilterAction(''); setFilterUser(''); setPage(1); }}>
               <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${adminStyles.panel} ${adminStyles.tableShell}`}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <RefreshCw size={32} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#475569', fontSize: 13 }}>Synchronizing Forensic Stream...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Originator</th>
                <th>Action Type</th>
                <th>Detail Summary</th>
                <th style={{ textAlign: 'right' }}>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{new Date(log.createdAt).toLocaleDateString('en-ZW')}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{new Date(log.createdAt).toLocaleTimeString('en-ZW', { hour12: false })}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{log.performedBy}</div>
                    <div style={{ fontSize: 11, color: '#444c5a' }}>System Node: Internal</div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.05)', 
                      border: '1px solid rgba(99,102,241,0.1)', color: '#818cf8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, color: '#64748b', maxWidth: 400, lineHeight: 1.5 }}>
                      {log.details || `Admin action performed on ${log.jobCardId || 'System level'}`}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>#{String(log.id).substr(0, 8).toUpperCase()}</div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                    <FileText size={48} color="#1e293b" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#475569' }}>No audit records match the current governance filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className={adminStyles.toolbarGroup} style={{ justifyContent: 'flex-end' }}>
         <button className="btn btn-ghost" disabled={page <= 1} style={{ fontSize: 13 }} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Previous</button>
         <span style={{ fontSize: 12, color: '#64748b' }}>Page {pagination.page} of {pagination.totalPages}</span>
         <button className="btn btn-ghost" disabled={page >= pagination.totalPages} style={{ fontSize: 13, background: 'rgba(255,255,255,0.04)' }} onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}>Next Page <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}
