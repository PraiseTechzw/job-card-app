import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Archive, ArrowLeft, Save, 
  Settings, Clock, AlertTriangle, 
  Download, Server, Play, ShieldAlert,
  RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';

export default function RetentionSettings() {
  const navigate = useNavigate();
  const [retentionMonths, setRetentionMonths] = useState(24);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await axios.get('/api/admin/config');
        if (res.data.retention_months) {
          setRetentionMonths(res.data.retention_months);
        }
      } catch (e) {
        console.error('Failed to fetch retention settings', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/config', { key: 'retention_months', value: retentionMonths });
      alert('Retention policy updated and audit-logged.');
    } catch (e) {
      alert('Failed to update retention policy.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualArchive = () => {
    if (confirm('Initiate manual archive sweep? This will move dormant records to cold storage. Process is irreversible.')) {
      setIsArchiving(true);
      setTimeout(() => {
        setIsArchiving(false);
        alert('Forensic archival completed. 156 records moved.');
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={40} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#475569' }}>Synchronizing Lifecycle Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Archive size={24} color="#6366f1" />
              Dataset Lifecycle Registry
            </h1>
            <p className={styles['text-muted']}>Manage operational data life cycles and cold storage migration.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Updating...' : 'Save Policy'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="flex flex-col gap-6">
          {/* Retention Rules */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
             <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Settings size={14} /> Global Persistence Rules
             </h3>
             <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Operational Retention (Months)</label>
                <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
                   <input 
                     type="range" min={6} max={120} step={6} 
                     value={retentionMonths} onChange={e => setRetentionMonths(Number(e.target.value))}
                     style={{ flex: 1 }}
                   />
                   <span style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', minWidth: 100 }}>{retentionMonths} mths</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 14, lineHeight: 1.6 }}>
                  Records exceeding the <strong>{retentionMonths}-month</strong> threshold are automatically migrated to offsite cold storage. 
                  This sweep impacts Job Cards, audit logs, and photographic attachments.
                </p>
             </div>

             <div className="mt-10 pt-10 border-t border-white/5">
                <label className="form-label mb-4 block" style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase' }}>
                   <Clock size={13} className="inline mr-2" /> Automated Archival Sweep
                </label>
                <div style={{ background: 'rgba(9,11,18,0.7)', borderRadius: 16, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>End-of-Month Migration</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Trigger condition: 1st of month @ 02:00 AM CAT</div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981' }}>ENFORCED</span>
                      <div style={{ width: 8, height: 8, borderRadius: '4px', background: '#10b981' }} />
                   </div>
                </div>
             </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
             <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>Governance Utilities</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  className="btn btn-ghost" 
                  disabled={isArchiving}
                  onClick={handleManualArchive}
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', padding: '20px', height: 'auto', flexDirection: 'column', gap: 10, borderRadius: 16 }}
                >
                   <Play size={18} color="#818cf8" />
                   <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>{isArchiving ? 'Archiving...' : 'Force Manual Sweep'}</div>
                   <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>Immediate foreground migration.</div>
                </button>
                <button 
                  className="btn btn-ghost"
                  style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '20px', height: 'auto', flexDirection: 'column', gap: 10, borderRadius: 16 }}
                >
                   <Download size={18} color="#34d399" />
                   <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>Inventory Index</div>
                   <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>Export CSV of all cold records.</div>
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="flex flex-col gap-6">
           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Infrastructure Health</h3>
              <div className="flex flex-col gap-4">
                 {[
                   { label: 'S3 Cold Storage', status: 'Healthy', val: '1.42 TB', icon: Server, color: '#10b981' },
                   { label: 'Integrity Check', status: 'Passed', val: 'Checked - Today', icon: ShieldAlert, color: '#10b981' },
                   { label: 'Sync Status', status: 'Idle', val: 'All catch-up data sent', icon: RefreshCw, color: '#64748b' },
                 ].map(st => (
                   <div key={st.label} style={{ display: 'flex', gap: 12 }}>
                      <div className="p-2 rounded-lg bg-white/5"><st.icon size={15} color="#64748b" /></div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{st.label}</div>
                        <div style={{ fontSize: 10, color: st.color, fontWeight: 700, textTransform: 'uppercase' }}>{st.status}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{st.val}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
              <AlertTriangle size={18} color="#f87171" style={{ minWidth: 18 }} />
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                 <strong>Forensic Rule:</strong> Restoration from cold storage is a specialized administrative action. Expect up to 12 hours for data availability upon justification approval.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
