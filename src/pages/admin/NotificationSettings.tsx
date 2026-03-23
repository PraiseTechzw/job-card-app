import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Bell, ArrowLeft, Mail, 
  Smartphone, Save, AlertTriangle, 
  Clock, History, RefreshCw
} from 'lucide-react';
import styles from '../JobCards.module.css';

const ALERT_CATEGORIES = [
  'Job Submission', 'Approval Pending', 'Job Assignment', 
  'Job Completed', 'Work Overdue', 'Rejection / Return', 'Closure'
];

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Job Submission');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, statsRes] = await Promise.all([
          axios.get('/api/admin/config'),
          axios.get('/api/admin/stats')
        ]);
        if (configRes.data.notifications) {
          setSettings(configRes.data.notifications);
        } else {
          setSettings({
            'Job Submission': { email: true, inApp: true, sms: false, recipients: ['Supervisor', 'Admin'] },
            'Approval Pending': { email: true, inApp: true, sms: true, recipients: ['Supervisor', 'HOD'] }
          });
        }
        setTelemetry(statsRes.data?.telemetry);
      } catch (e) {
        console.error('Failed to fetch notification context', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleToggle = (cat: string, channel: string) => {
    const updated = {
      ...settings,
      [cat]: { ...settings[cat], [channel]: !settings[cat]?.[channel] }
    };
    setSettings(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/config', { key: 'notifications', value: settings });
      toast.success('Notification routing updated successfully.');
    } catch (e) {
      toast.error('Failed to synchronize notification engine.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={40} className="animate-spin" color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#475569' }}>Synchronizing Alert Engine...</p>
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
              <Bell size={24} color="#6366f1" />
              Alert & Notification Engine
            </h1>
            <p className={styles['text-muted']}>Control automated communication triggers and distribution clusters.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Deploying...' : 'Save Configuration'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          {/* Main Matrix */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '24px 0' }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20, padding: '0 24px' }}>Event Triggers & Routing</h3>
            
            <div className="overflow-x-auto">
              <table className={styles.table} style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ background: 'transparent' }}>
                    <th style={{ paddingLeft: 24 }}>System Event</th>
                    <th style={{ textAlign: 'center' }}>Email</th>
                    <th style={{ textAlign: 'center' }}>In-App</th>
                    <th style={{ textAlign: 'center' }}>SMS</th>
                    <th style={{ textAlign: 'center' }}>Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {ALERT_CATEGORIES.map(category => (
                    <tr key={category} className={activeCategory === category ? 'active-row' : ''} style={{ background: activeCategory === category ? 'rgba(99,102,241,0.05)' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveCategory(category)}>
                      <td style={{ padding: '16px 24px', fontWeight: 700, fontSize: 13, color: activeCategory === category ? '#f1f5f9' : '#e2e8f0' }}>{category}</td>
                      <td style={{ textAlign: 'center' }}>
                         <input type="checkbox" checked={!!settings[category]?.email} onChange={() => handleToggle(category, 'email')} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         <input type="checkbox" checked={!!settings[category]?.inApp} onChange={() => handleToggle(category, 'inApp')} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         <input type="checkbox" checked={!!settings[category]?.sms} onChange={() => handleToggle(category, 'sms')} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{settings[category]?.recipients?.join(', ') || 'Global'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ background: 'rgba(9,11,18,0.7)', padding: 20, borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                   <Clock size={16} color="#6366f1" />
                   <span style={{ fontSize: 13, fontWeight: 700 }}>Resilience Parameters</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>SLA Retry Ceiling</span>
                      <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>5 Attempts</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Retry Backoff Interval</span>
                      <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>15 Minutes</span>
                   </div>
                </div>
             </div>
             <div style={{ background: 'rgba(9,11,18,0.7)', padding: 20, borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                   <History size={16} color="#6366f1" />
                   <span style={{ fontSize: 13, fontWeight: 700 }}>Executive Digests</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <label className="flex items-center justify-between" style={{ cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>HOD Daily Operations Summary</span>
                      <input type="checkbox" checked={true} readOnly={true} />
                   </label>
                   <div className="flex justify-between items-center">
                      <span style={{ fontSize: 12, color: '#64748b' }}>Scheduled Broadcast</span>
                      <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>08:00 CAT</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Channel Health and Status */}
        <div className="flex flex-col gap-6">
           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Provisioning Status</h3>
              <div className="flex flex-col gap-4">
                 {[
                   { label: 'SMTP Connector', status: telemetry?.channelHealth?.email || 'Online', icon: Mail, color: '#10b981' },
                   { label: 'SMS Gateway (Twilio)', status: telemetry?.channelHealth?.sms || 'Online', icon: Smartphone, color: '#10b981' },
                   { label: 'Push Hub', status: telemetry?.channelHealth?.push || 'Online', icon: Bell, color: '#10b981' },
                 ].map(ch => (
                   <div key={ch.label} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                      <div className="p-2 rounded-lg bg-white/5"><ch.icon size={15} color="#64748b" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{ch.label}</div>
                        <div style={{ fontSize: 10, color: ch.color, fontWeight: 700, textTransform: 'uppercase' }}>{ch.status}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
              <AlertTriangle size={20} color="#f87171" style={{ minWidth: 20 }} />
              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                 <strong>Forensic Limit:</strong> SMS traffic for non-critical assets is capped at 100/day per plant to prevent system flooding. Critical plant alerts remain unlimited.
              </div>
           </div>

           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Mtd Alert Volume</span>
                <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700 }}>1,248</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Delivery Success Rate</span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>99.2%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
