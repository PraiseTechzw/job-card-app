import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, ArrowLeft, Search, Filter, 
  CalendarDays, Download, Info, ShieldCheck,
  ChevronRight, RefreshCw, AlertTriangle, User
} from 'lucide-react';
import styles from '../JobCards.module.css';

export default function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await axios.get('/api/admin/audit-logs');
        setLogs(res.data);
      } catch (e) {
        // Mock data
        setLogs([
          { id: 'l1', timestamp: '2026-03-19T14:30:12Z', user: 'Admin User', role: 'Admin', action: 'ROLE_MODIFIED', module: 'Security', entity: 'Artisan Permissions', details: 'Added: Work History Access', ip: '192.168.1.42' },
          { id: 'l2', timestamp: '2026-03-19T13:20:45Z', user: 'Admin User', role: 'Admin', action: 'USER_DEACTIVATED', module: 'Users', entity: 'Robert Brown (30056)', details: 'Account status set to Inactive', ip: '192.168.1.42' },
          { id: 'l3', timestamp: '2026-03-19T11:45:00Z', user: 'System', role: 'System', action: 'NOTIFICATION_SENT', module: 'Alerts', entity: 'Overdue (JC-2026-004)', details: 'Email sent to J. Doe', ip: '::1' },
          { id: 'l4', timestamp: '2026-03-19T09:12:33Z', user: 'Admin User', role: 'Admin', action: 'MASTER_DATA_ADDED', module: 'Data', entity: 'Plant / Asset', details: 'Added: P1002 (Main Conveyor Belt)', ip: '192.168.1.42' },
          { id: 'l5', timestamp: '2026-03-18T16:40:02Z', user: 'Samuel Wilson', role: 'Supervisor', action: 'JOB_APPROVED', module: 'Workflow', entity: 'JC-2026-009', details: 'Supervisor sign-off granted', ip: '192.168.1.55' },
          { id: 'l6', timestamp: '2026-03-18T15:20:10Z', user: 'Jane Smith', role: 'Artisan', action: 'WORK_STARTED', module: 'Execution', entity: 'JC-2026-009', details: 'Artisan started execution', ip: '192.168.1.88' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let list = logs;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => 
        l.entity.toLowerCase().includes(s) || 
        l.details.toLowerCase().includes(s) ||
        l.user.toLowerCase().includes(s)
      );
    }
    if (filterAction) list = list.filter(l => l.action === filterAction);
    if (filterUser) list = list.filter(l => l.user === filterUser);
    return list;
  }, [logs, search, filterAction, filterUser]);

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);
  const uniqueUsers = useMemo(() => Array.from(new Set(logs.map(l => l.user))), [logs]);

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={24} color="#6366f1" />
              Administrative Audit Registry
            </h1>
            <p className={styles['text-muted']}>Immutable records of all security and data-sensitive operations.</p>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ gap: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
           <Download size={16} /> Export CSV
        </button>
      </header>

      {/* Persistence and Compliance Note */}
      <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 24, display: 'flex', gap: 14 }}>
         <Info size={20} color="#6366f1" />
         <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
           <strong>Compliance Rule:</strong> Audit logs are read-only and immutable. Deletion of audit records via UI is <strong>restricted</strong>. 
           We retain all system activity records for a minimum of <strong>24 months</strong> based on current system policy.
         </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: 14, padding: '14px 18px', marginBottom: 20, 
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input 
            type="text" placeholder="Search by entity, user or details…" 
            className="form-input" style={{ background: '#090b12', paddingLeft: 38, fontSize: 13 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" style={{ fontSize: 13, minWidth: 160 }} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="form-select" style={{ fontSize: 13, minWidth: 160 }} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
          <option value="">All Users</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterAction(''); setFilterUser(''); }} style={{ padding: '8px 12px' }}>
           <RefreshCw size={14} />
        </button>
      </div>

      <div className={styles.tableWrapper} style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Originator</th>
              <th>Action Type</th>
              <th>Entity Affected</th>
              <th>Detail Summary</th>
              <th style={{ textAlign: 'right' }}>Log ID</th>
            </tr>
          </thead>
          <tbody>
            {(filteredLogs.length > 0 ? filteredLogs : []).map(log => (
              <tr key={log.id}>
                <td>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleDateString('en-ZW')}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{new Date(log.timestamp).toLocaleTimeString('en-ZW', { hour12: false })}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{log.user}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{log.role} · {log.ip}</div>
                </td>
                <td>
                  <span style={{ 
                    padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.06)', color: '#818cf8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{log.entity}</div>
                  <div style={{ fontSize: 11, color: '#444c5a' }}>{log.module}</div>
                </td>
                <td>
                  <div style={{ fontSize: 12, color: '#64748b', maxWidth: 300, lineHeight: 1.5 }}>{log.details}</div>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>#{log.id.toUpperCase()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
             <FileText size={48} color="#1e293b" style={{ margin: '0 auto 16px' }} />
             <p style={{ color: '#475569' }}>No audit records found matching those filters.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
         <button className="btn btn-ghost" disabled={true} style={{ fontSize: 13 }}>Previous</button>
         <button className="btn btn-ghost" style={{ fontSize: 13, background: 'rgba(255,255,255,0.04)' }}>Next Page <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}
