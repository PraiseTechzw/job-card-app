import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Retention policy updated and audit-logged.');
    }, 1200);
  };

  const handleManualArchive = () => {
    if (confirm('Initiate manual archive sweep? This will move records older than the current threshold to cold storage. Process is backgrounded but cannot be reversed.')) {
      setIsArchiving(true);
      setTimeout(() => {
        setIsArchiving(false);
        alert('Archive process completed. 156 records moved to cold storage.');
      }, 3000);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Archive size={24} color="#6366f1" />
              Data Retention and Archiving
            </h1>
            <p className={styles['text-muted']}>Manage the operational life cycle and cold storage of historical data.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Updating...' : 'Save Policy'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Retention Rules */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
             <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Settings size={14} /> Lifecycle Policies
             </h3>
             <div className="form-group">
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Operational Retention Period (Months)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
                   <input 
                     type="range" min={6} max={120} step={6} 
                     value={retentionMonths} onChange={e => setRetentionMonths(Number(e.target.value))}
                     style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.2)', height: 6, borderRadius: 3 }}
                   />
                   <span style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', minWidth: 100 }}>{retentionMonths} mths</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>Records older than {retentionMonths} months will be moved from the primary database to Cold Storage automatically. This includes Job Cards, audit logs, and material attachments.</p>
             </div>

             <div className="form-group" style={{ marginTop: 30 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'flex', gap: 8, alignItems: 'center' }}>
                   <Clock size={13} /> Auto-Archive Schedule
                </label>
                <div style={{ background: 'rgba(9,11,18,0.7)', borderRadius: 12, padding: 16, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>End-of-Month Sweep</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Scheduled for: 1st of every month at 02:00 AM</div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>ENABLED</span>
                      <input type="checkbox" checked={true} readOnly={true} />
                   </div>
                </div>
             </div>
          </div>

          {/* Manual Tools */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
             <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>Governance Utilities</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button 
                  className="btn btn-ghost" 
                  disabled={isArchiving}
                  onClick={handleManualArchive}
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', padding: '16px', height: 'auto', flexDirection: 'column', gap: 10 }}
                >
                   <Play size={18} color="#818cf8" />
                   <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{isArchiving ? 'Archiving...' : 'Run Manual Archive'}</div>
                   <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>Immediate sweep of old data.</div>
                </button>
                <button 
                  className="btn btn-ghost"
                  style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '16px', height: 'auto', flexDirection: 'column', gap: 10 }}
                >
                   <Download size={18} color="#34d399" />
                   <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Export Archive Index</div>
                   <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>Download CSV of cold records.</div>
                </button>
             </div>
          </div>
        </div>

        {/* Status and Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Cold Storage Health</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 {[
                   { label: 'Cloud Blob Store', status: 'Online', val: '1.42 TB used', icon: Server, color: '#10b981' },
                   { label: 'Archive Integrity', status: 'Verified', val: 'Last checked: Today 04:00 AM', icon: ShieldAlert, color: '#10b981' },
                   { label: 'Offsite Backup', status: 'Syncing', val: '88% Complete', icon: RefreshCw, color: '#f59e0b' },
                 ].map(st => (
                   <div key={st.label} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 8 }}><st.icon size={15} color="#64748b" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{st.label}</div>
                        <div style={{ fontSize: 11, color: st.color, fontWeight: 700 }}>{st.status}</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{st.val}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
             <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Storage Summary</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Active DB Entries</span>
                <span style={{ fontSize: 11, color: '#e2e8f0' }}>4,250</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Archived Records</span>
                <span style={{ fontSize: 11, color: '#e2e8f0' }}>148,208</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Average Archive Age</span>
                <span style={{ fontSize: 11, color: '#e2e8f0' }}>4.2 Years</span>
             </div>
           </div>

           <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 18, display: 'flex', gap: 12 }}>
              <AlertTriangle size={20} color="#f87171" />
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                 <strong>Policy Guard:</strong> Data restores from cold storage require a documented "Governance Justification" and are audit-logged for security oversight. Restore speed: Approx 4-12hrs based on volume.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
