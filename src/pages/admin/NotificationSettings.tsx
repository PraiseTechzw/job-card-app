import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ArrowLeft, Mail, MessageSquare, 
  Smartphone, Save, AlertTriangle, CheckCircle2,
  Clock, History, Settings, User
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

  // Example settings for each category
  const [settings, setSettings] = useState<any>({
    'Job Submission': { email: true, inApp: true, sms: false, recipients: ['Supervisor', 'Admin'] },
    'Approval Pending': { email: true, inApp: true, sms: true, recipients: ['Supervisor', 'HOD'] },
    'Work Overdue': { email: true, inApp: true, sms: true, recipients: ['Supervisor', 'Artisan', 'Admin'] },
  });

  const handleToggle = (cat: string, channel: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [cat]: { ...prev[cat], [channel]: !prev[cat][channel] }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Notification settings updated successfully.');
    }, 1000);
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
              <Bell size={24} color="#6366f1" />
              Notifications and Alerts Engine
            </h1>
            <p className={styles['text-muted']}>Configure communication channels and broadcast triggers.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Saving...' : 'Apply Configurations'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Matrix */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '24px 0' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20, padding: '0 24px' }}>Event Triggers and Channels</h3>
            
            <table className={styles.table} style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ paddingLeft: 24 }}>Event Trigger</th>
                  <th style={{ textAlign: 'center' }}>Email</th>
                  <th style={{ textAlign: 'center' }}>In-App</th>
                  <th style={{ textAlign: 'center' }}>SMS</th>
                  <th style={{ textAlign: 'center' }}>Group / Role</th>
                </tr>
              </thead>
              <tbody>
                {ALERT_CATEGORIES.map(category => (
                  <tr key={category} style={{ background: activeCategory === category ? 'rgba(99,102,241,0.05)' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveCategory(category)}>
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
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{settings[category]?.recipients?.join(', ') || '—'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
             <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>Escalation & Schedule</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: 'rgba(9,11,18,0.7)', padding: 16, borderRadius: 12 }}>
                   <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                      <Clock size={16} color="#6366f1" />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Retry Behavior</span>
                   </div>
                   <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Max Retries (Failed Notifications)</span>
                         <span style={{ color: '#e2e8f0' }}>5 Attempts</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Retry Interval</span>
                         <span style={{ color: '#e2e8f0' }}>15 Minutes</span>
                      </div>
                   </div>
                </div>
                <div style={{ background: 'rgba(9,11,18,0.7)', padding: 16, borderRadius: 12 }}>
                   <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                      <History size={16} color="#6366f1" />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Daily Summaries</span>
                   </div>
                   <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span>Send Digest to HOD/Admin</span>
                         <input type="checkbox" checked={true} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span>Broadcast Time</span>
                         <span style={{ color: '#e2e8f0' }}>08:00 AM CAT</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Channel Health and Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Channel Health Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                 {[
                   { label: 'SMTP (Email Server)', status: 'Online', icon: Mail, color: '#10b981' },
                   { label: 'SMS Gateway', status: 'Degraded', icon: Smartphone, color: '#f59e0b', sub: 'Slow delivery observed' },
                   { label: 'In-App Broadcast', status: 'Online', icon: Bell, color: '#10b981' },
                 ].map(ch => (
                   <div key={ch.label} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 8 }}><ch.icon size={15} color="#64748b" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{ch.label}</div>
                        <div style={{ fontSize: 11, color: ch.color, fontWeight: 700 }}>{ch.status}</div>
                        {ch.sub && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{ch.sub}</div>}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 16, padding: 20, display: 'flex', gap: 14 }}>
              <AlertTriangle size={20} color="#f87171" />
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                 <strong>Security Guard:</strong> SMS notifications for critical failures are rate-limited to avoid system floods. Only 200 SMS broadcasts permitted per 24hrs for non-critical events.
              </div>
           </div>

           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>System Usage Info</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>30-Day Email Volume</span>
                <span style={{ fontSize: 11, color: '#e2e8f0' }}>1,248</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Successful Delivery Rate</span>
                <span style={{ fontSize: 11, color: '#10b981' }}>99.2%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
