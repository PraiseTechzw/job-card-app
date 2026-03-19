import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, ArrowLeft, ShieldCheck, Mail, 
  Database, LayoutTemplate, 
  Cloud, Save, Key, AlertTriangle
} from 'lucide-react';
import styles from '../JobCards.module.css';

export default function SystemSettings() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('System settings updated and services re-initialized.');
    }, 1500);
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
              <Settings size={24} color="#6366f1" />
              Technical System Configuration
            </h1>
            <p className={styles['text-muted']}>Manage backend parameters, service integrations, and technical security.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Applying...' : 'Save All Settings'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Navigation */}
        <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 12 }}>
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
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', borderRadius: 10,
                border: 'none', background: activeTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#64748b', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500
              }}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeTab === 'General' && (
            <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#444c5a', marginBottom: 24 }}>System Branding & Locale</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                 <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Application Name</label>
                    <input type="text" className="form-input" style={{ background: 'rgba(9,11,18,0.7)', padding: 12 }} defaultValue="Digital Job Card MMS" />
                 </div>
                 <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>System Timezone</label>
                    <select className="form-select" style={{ background: 'rgba(9,11,18,0.7)', padding: 11 }}>
                       <option>(GMT+02:00) Harare, Pretoria</option>
                       <option>(GMT+00:00) London, UTC</option>
                    </select>
                 </div>
                 <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Maintenance Banner Text</label>
                    <textarea rows={2} className="form-textarea" style={{ background: 'rgba(9,11,18,0.7)', padding: 12 }} placeholder="Display banner to all users..." />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Auth' && (
            <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#444c5a', marginBottom: 24 }}>Authentication Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {[
                   { id: 'local', label: 'Local Credentials', desc: 'Manage user and hashed passwords in primary database.', active: true },
                   { id: 'ad', label: 'Active Directory / LDAP', desc: 'Sync users with enterprise Microsoft AD system.', active: false },
                   { id: 'oidc', label: 'Single Sign-On (Saml/OIDC)', desc: 'Authenticate via Azure AD, Okta or Google Workspace.', active: false }
                 ].map(m => (
                   <div key={m.id} style={{ background: m.active ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${m.active ? '#4f46e544' : 'rgba(255,255,255,0.04)'}`, borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                         <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.active ? '#10b981' : '#1e293b' }} />
                         <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: m.active ? '#818cf8' : '#475569' }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: '#475569' }}>{m.desc}</div>
                         </div>
                      </div>
                      <button className="btn btn-ghost" disabled={m.active} style={{ fontSize: 12 }}>{m.active ? 'Active' : 'Configure'}</button>
                   </div>
                 ))}
                 
                 <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginTop: 10 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Security Overrides</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Force Password Reset on Login</span>
                          <input type="checkbox" checked={false} />
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>Require 2FA for Admin Role</span>
                          <input type="checkbox" checked={true} />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'ERP' && (
            <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
               <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#444c5a', marginBottom: 24 }}>External ERP Integration</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 12, padding: 14, border: '1px solid rgba(239,68,68,0.15)', display: 'flex', gap: 12 }}>
                     <AlertTriangle size={18} color="#f87171" />
                     <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Connection Error: SAP Hana Connector Unreachable</div>
                  </div>
                  
                  <div className="form-group">
                     <label className="form-label" style={{ fontSize: 11, fontWeight: 800, color: '#475569' }}>ERP CONNECTOR URL</label>
                     <div style={{ display: 'flex', gap: 10 }}>
                        <input type="text" className="form-input" style={{ background: 'rgba(9,11,18,0.7)', padding: 12, flex: 1 }} defaultValue="https://erp-gateway.corp.local/api/v1" />
                        <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.04)', padding: '0 16px' }}>Test Connection</button>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                     <div style={{ background: 'rgba(15,23,42,0.4)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>Asset Register Sync</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>Last sync: Today 06:12 AM</div>
                        <button className="btn btn-ghost" style={{ fontSize: 10, padding: 4, height: 'auto', marginTop: 10 }}>Sync Now</button>
                     </div>
                     <div style={{ background: 'rgba(15,23,42,0.4)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>Spare Parts Ledger</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>Last sync: Yesterday 11:30 PM</div>
                        <button className="btn btn-ghost" style={{ fontSize: 10, padding: 4, height: 'auto', marginTop: 10 }}>Sync Now</button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
             <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#444c5a', marginBottom: 16 }}>System Performance Info</h3>
             <div style={{ display: 'flex', gap: 40 }}>
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Main Database Uptime</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>100%</div>
                </div>
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Avg. Response Time</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0' }}>42ms</div>
                </div>
                <div>
                   <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Last Backup Success</div>
                   <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>Success</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
