import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Settings, ArrowLeft, ShieldCheck, Mail, 
  Database, LayoutTemplate, 
  Cloud, Save, Key, AlertTriangle, RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

export default function SystemSettings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [isLoading, setIsLoading] = useState(true);
  const [globalConfig, setGlobalConfig] = useState({
    appName: 'Digital Job Card MMS',
    timezone: '(GMT+02:00) Harare, Pretoria',
    broadcastBanner: '',
  });
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, statsRes] = await Promise.all([
          axios.get('/api/admin/config'),
          axios.get('/api/admin/stats')
        ]);
        if (configRes.data?.global) {
          setGlobalConfig((prev) => ({ ...prev, ...configRes.data.global }));
        }
        setTelemetry(statsRes.data?.telemetry);
      } catch (e) {
        console.error('Failed to fetch system context', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/config', { key: 'global', value: globalConfig });
      toast.success('Technical configuration synchronized successfully.');
    } catch (e) {
      toast.error('Failed to update system parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={40} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#475569' }}>Connecting to Core Technical Registry...</p>
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
                  <Settings size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Technical Core Governance</h1>
                  <p className={adminStyles.subtitle}>Unified settings visuals and less cramped layout behavior across the full admin stack.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Applying...' : 'Save Configuration'}
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.sidebarGrid}>
        {/* Navigation */}
        <div className={adminStyles.panel}>
          {[
            { id: 'General', icon: LayoutTemplate, label: 'General & Branding' },
            { id: 'Auth', icon: Key, label: 'Authentication & SSO' },
            { id: 'Mail', icon: Mail, label: 'Messaging Gateways' },
            { id: 'ERP', icon: Database, label: 'ERP / Asset Sync' },
            { id: 'Cloud', icon: Cloud, label: 'Storage & Backup' },
            { id: 'Security', icon: ShieldCheck, label: 'Technical Security' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-xs text-left"
              style={{
                border: 'none', background: activeTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#64748b', cursor: 'pointer'
              }}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Content */}
        <div className={adminStyles.stack}>
          {activeTab === 'General' && (
            <div className={adminStyles.panel}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24 }}>System Branding & Locale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="form-group">
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Application Display Name</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ background: 'rgba(9,11,18,0.7)' }}
                      value={globalConfig.appName}
                      onChange={(e) => setGlobalConfig((prev) => ({ ...prev, appName: e.target.value }))}
                    />
                 </div>
                 <div className="form-group">
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Global Timezone Node</label>
                    <select
                      className="form-select"
                      style={{ background: 'rgba(9,11,18,0.7)' }}
                      value={globalConfig.timezone}
                      onChange={(e) => setGlobalConfig((prev) => ({ ...prev, timezone: e.target.value }))}
                    >
                       <option>(GMT+02:00) Harare, Pretoria</option>
                       <option>(GMT+00:00) London, UTC</option>
                    </select>
                 </div>
                 <div className="form-group md:col-span-2">
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Administrative Broadcast Banner</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      style={{ background: 'rgba(9,11,18,0.7)' }}
                      placeholder="Broadcast maintenance window or notice to all users..."
                      value={globalConfig.broadcastBanner}
                      onChange={(e) => setGlobalConfig((prev) => ({ ...prev, broadcastBanner: e.target.value }))}
                    />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Auth' && (
            <div className={adminStyles.panel}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24 }}>Identity Protocols</h3>
              <div className="flex flex-col gap-4">
                 {[
                   { id: 'local', label: 'Local Encrypted Credentials', desc: 'Primary user data and hashed credentials with salt.', active: true },
                   { id: 'ad', label: 'Azure AD / Microsoft Entra', desc: 'Sync users via graph API (OIDC/SAML).', active: false },
                   { id: 'oidc', label: 'Okta Enterprise SSO', desc: 'Centralized identity management node.', active: false }
                 ].map(m => (
                   <div key={m.id} style={{ background: m.active ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.active ? '#4f46e533' : 'rgba(255,255,255,0.04)'}`, borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="flex items-center gap-4">
                         <div style={{ width: 8, height: 8, borderRadius: '4px', background: m.active ? '#10b981' : '#1e293b' }} />
                         <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: m.active ? '#818cf8' : '#e2e8f0' }}>{m.label}</div>
                            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{m.desc}</div>
                         </div>
                      </div>
                      <button className="btn btn-ghost" disabled={m.active} style={{ fontSize: 11 }}>{m.active ? 'Active' : 'Configure'}</button>
                   </div>
                 ))}
                 
                 <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginTop: 10 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Policy Overrides</h4>
                    <div className="flex flex-col gap-4">
                       <label className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Force Reset on Bulk Provisioning</span>
                          <input type="checkbox" checked={false} readOnly={true} />
                       </label>
                       <label className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Multifactor (2FA) for Supervisor+</span>
                          <input type="checkbox" checked={true} readOnly={true} />
                       </label>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'ERP' && (
            <div className={adminStyles.panel}>
               <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 24 }}>Enterprise Connector (SAP)</h3>
               <div className="flex flex-col gap-6">
                  <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 16, padding: 18, border: '1px solid rgba(239,68,68,0.15)', display: 'flex', gap: 14 }}>
                     <AlertTriangle size={18} color="#f87171" style={{ minWidth: 18 }} />
                     <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>Gateway Timeout: External Asset Registry Node at 192.168.10.4 is currently unreachable via Port 443.</div>
                  </div>
                  
                  <div className="form-group">
                     <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Gateway API Endpoint</label>
                     <div className="flex flex-col md:flex-row gap-4">
                        <input type="text" className="form-input" style={{ background: 'rgba(9,11,18,0.7)', flex: 1 }} defaultValue="https://mms-sync.africa.corp/node/v2" />
                        <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.04)', padding: '0 20px' }}>Refetch Token</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div style={{ background: 'rgba(15,23,42,0.4)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Asset Sync Stream</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Last delta: Today 06:12 AM</div>
                        <button className="btn btn-ghost w-full mt-4" style={{ fontSize: 11, height: 32 }}>Trigger Manual Delta</button>
                     </div>
                     <div style={{ background: 'rgba(15,23,42,0.4)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Material Ledger Node</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Last delta: Yesterday 11:30 PM</div>
                        <button className="btn btn-ghost w-full mt-4" style={{ fontSize: 11, height: 32 }}>Trigger Manual Delta</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className={adminStyles.panel}>
             <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>Infrastructure Telemetry</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>MAIN NODE UPTIME</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{telemetry?.databaseUptime || '100%'}</div>
                </div>
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>AVG LATENCY</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0' }}>{telemetry?.avgResponseTime || '--'}</div>
                </div>
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>BACKUP HEALTH</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{telemetry?.lastBackup ? 'SYNCED' : 'PENDING'}</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
