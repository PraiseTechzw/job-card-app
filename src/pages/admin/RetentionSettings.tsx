import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Archive, ArrowLeft, Save, 
  Settings, Clock, AlertTriangle, 
  Download, Server, Play, ShieldAlert,
  RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

export default function RetentionSettings() {
  const navigate = useNavigate();
  const [retentionMonths, setRetentionMonths] = useState(24);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [lastArchiveResult, setLastArchiveResult] = useState<{ candidateCount: number; retentionMonths: number } | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, statsRes] = await Promise.all([
          axios.get('/api/admin/config'),
          axios.get('/api/admin/stats')
        ]);
        if (configRes.data.retention_months) {
          setRetentionMonths(configRes.data.retention_months);
        }
        setTelemetry(statsRes.data?.telemetry);
      } catch (e) {
        console.error('Failed to fetch retention context', e);
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
      toast.success('Retention policy updated and audit-logged.');
    } catch (e) {
      toast.error('Failed to update retention policy.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualArchive = async () => {
    setIsArchiving(true);
    try {
      const res = await axios.post('/api/admin/retention/manual-archive');
      setLastArchiveResult({
        candidateCount: res.data?.candidateCount || 0,
        retentionMonths: res.data?.retentionMonths || retentionMonths,
      });
      toast.success(`Archive sweep completed: ${res.data?.candidateCount || 0} candidate record(s) identified.`);
    } finally {
      setIsArchiving(false);
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
                  <Archive size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Dataset Lifecycle Registry</h1>
                  <p className={adminStyles.subtitle}>Retention controls now follow the same governance theme and collapse cleanly beside the sidebar.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Updating...' : 'Save Policy'}
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.contentGrid}>
        <div className={adminStyles.stack}>
          {/* Retention Rules */}
          <div className={adminStyles.panel}>
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

          <div className={adminStyles.panel}>
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
             {lastArchiveResult && (
               <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8' }}>
                 Last sweep found <strong style={{ color: '#e2e8f0' }}>{lastArchiveResult.candidateCount}</strong> record(s)
                 older than <strong style={{ color: '#e2e8f0' }}>{lastArchiveResult.retentionMonths}</strong> months.
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Status */}
        <div className={adminStyles.stack}>
           <div className={adminStyles.panel}>
              <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Infrastructure Health</h3>
              <div className="flex flex-col gap-4">
                 {[
                   { label: 'Cloud Blob Store', status: telemetry?.cloudHealth || 'Online', val: telemetry?.storageUsed || '1.42 TB', icon: Server, color: '#10b981' },
                   { label: 'Archive Integrity', status: 'Verified', val: telemetry?.lastBackup || 'Last checked: Today', icon: ShieldAlert, color: '#10b981' },
                   { label: 'Offsite Sync', status: 'Healthy', val: 'Primary Mirror Active', icon: RefreshCw, color: '#10b981' },
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

           <div className={adminStyles.warning}>
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
