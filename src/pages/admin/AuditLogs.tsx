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

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs');
      setLogs(res.data);
    } catch (e) {
      console.error('Audit log fetch failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let list = logs;
    const s = search.toLowerCase();
    
    if (search) {
      list = list.filter(l => 
        (l.performed_by?.toLowerCase().includes(s)) ||
        (l.action?.toLowerCase().includes(s)) ||
        (l.details?.toLowerCase().includes(s))
      );
    }
    if (filterAction) list = list.filter(l => l.action === filterAction);
    if (filterUser) list = list.filter(l => l.performed_by === filterUser);
    return list;
  }, [logs, search, filterAction, filterUser]);

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);
  const uniqueUsers = useMemo(() => Array.from(new Set(logs.map(l => l.performed_by))), [logs]);

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
            <button className={`btn btn-ghost ${adminStyles.compactButton}`} style={{ gap: 8, border: '1px solid rgba(148,163,184,0.14)' }}>
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
            <button className={`btn btn-ghost ${adminStyles.compactButton}`} onClick={() => { setSearch(''); setFilterAction(''); setFilterUser(''); fetchLogs(); }}>
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
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{new Date(log.created_at || log.createdAt).toLocaleDateString('en-ZW')}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{new Date(log.created_at || log.createdAt).toLocaleTimeString('en-ZW', { hour12: false })}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{log.performed_by || log.performedBy}</div>
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
                      {log.details || `Admin action performed on ${log.job_card_id || 'System level'}`}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>#{String(log.id).substr(0, 8).toUpperCase()}</div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
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
         <button className="btn btn-ghost" disabled={true} style={{ fontSize: 13 }}>Previous</button>
         <button className="btn btn-ghost" style={{ fontSize: 13, background: 'rgba(255,255,255,0.04)' }}>Next Page <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}
