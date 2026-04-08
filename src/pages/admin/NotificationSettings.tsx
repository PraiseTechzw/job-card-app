import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Bell,
  ArrowLeft,
  Mail,
  Smartphone,
  Save,
  AlertTriangle,
  Clock,
  History,
  RefreshCw,
} from 'lucide-react';
import styles from '../JobCards.module.css';
import adminStyles from './AdminTheme.module.css';

const ALERT_CATEGORIES = [
  'Job Submission',
  'Approval Pending',
  'Job Assignment',
  'Job Completed',
  'Work Overdue',
  'Rejection / Return',
  'Closure',
];

const defaultSettings = Object.fromEntries(
  ALERT_CATEGORIES.map((category) => [
    category,
    { email: true, inApp: true, sms: false, recipients: [] as string[] },
  ])
);

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Job Submission');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [notificationVolumeMonth, setNotificationVolumeMonth] = useState(0);
  const [messagingSettings, setMessagingSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [configRes, statsRes] = await Promise.all([
          axios.get('/api/admin/config'),
          axios.get('/api/admin/stats'),
        ]);
        setSettings(configRes.data?.notifications || defaultSettings);
        setTelemetry(statsRes.data?.telemetry || null);
        setNotificationVolumeMonth(statsRes.data?.notificationVolumeMonth || 0);
        setMessagingSettings(statsRes.data?.runtimeConfig?.systemSettings?.messaging || null);
      } catch (error) {
        console.error('Failed to fetch notification context', error);
        toast.error('Failed to load notification settings.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleToggle = (category: string, channel: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...(prev?.[category] || {}),
        [channel]: !prev?.[category]?.[channel],
      },
    }));
  };

  const handleRecipientsChange = (value: string) => {
    const recipients = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setSettings((prev: any) => ({
      ...prev,
      [activeCategory]: {
        ...(prev?.[activeCategory] || {}),
        recipients,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('/api/admin/config', { key: 'notifications', value: settings });
      toast.success('Notification routing updated successfully.');
    } catch (error) {
      console.error('Failed to save notification config', error);
      toast.error('Failed to synchronize notification engine.');
    } finally {
      setIsSaving(false);
    }
  };

  const deliverySuccessRate = useMemo(() => {
    const channels = Object.values(telemetry?.notificationByChannel || {}) as Array<any>;
    const total = channels.reduce((sum, channel) => sum + Number(channel?.total || 0), 0);
    const successful = channels.reduce((sum, channel) => sum + Number(channel?.successful || 0), 0);
    if (total === 0) return '0%';
    return `${((successful / total) * 100).toFixed(1)}%`;
  }, [telemetry]);

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
                  <Bell size={20} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Alert & Notification Engine</h1>
                  <p className={adminStyles.subtitle}>Event routing now uses the saved matrix, and the delivery status cards reflect live dispatch telemetry.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={adminStyles.headerActions}>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              <Save size={16} style={{ marginRight: 6 }} /> {isSaving ? 'Deploying...' : 'Save Configuration'}
            </button>
          </div>
        </header>
      </div>

      <div className={adminStyles.contentGrid}>
        <div className={adminStyles.stack}>
          <div className={adminStyles.panel} style={{ padding: '24px 0' }}>
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
                  {ALERT_CATEGORIES.map((category) => (
                    <tr
                      key={category}
                      className={activeCategory === category ? 'active-row' : ''}
                      style={{ background: activeCategory === category ? 'rgba(99,102,241,0.05)' : 'transparent', cursor: 'pointer' }}
                      onClick={() => setActiveCategory(category)}
                    >
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
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {settings[category]?.recipients?.join(', ') || 'Global / Role Defaults'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={adminStyles.twoCol}>
            <div style={{ background: 'rgba(9,11,18,0.7)', padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <Clock size={16} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Selected Event</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>Active Rule</div>
                  <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 700 }}>{activeCategory}</div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Recipients</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={(settings[activeCategory]?.recipients || []).join(', ')}
                    onChange={(e) => handleRecipientsChange(e.target.value)}
                    placeholder="Supervisor, HOD, Requested By"
                  />
                  <p style={{ fontSize: 10, color: '#64748b', marginTop: 8 }}>Comma-separated role labels or recipient placeholders used by the runtime notification engine.</p>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(9,11,18,0.7)', padding: 20, borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <History size={16} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Delivery Runtime</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Retry Attempts</span>
                  <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>{messagingSettings?.retryAttempts ?? '--'} Attempts</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Retry Backoff Interval</span>
                  <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700 }}>{messagingSettings?.retryBackoffMinutes ?? '--'} Minutes</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Daily Digest Time</span>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>{messagingSettings?.dailyDigestTime || '--:--'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={adminStyles.stack}>
          <div className={adminStyles.panel}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Provisioning Status</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'SMTP Connector', status: telemetry?.channelHealth?.email || 'Unknown', icon: Mail, color: telemetry?.channelHealth?.email === 'Disabled' ? '#f87171' : '#10b981' },
                { label: 'SMS Gateway', status: telemetry?.channelHealth?.sms || 'Unknown', icon: Smartphone, color: telemetry?.channelHealth?.sms === 'Disabled' ? '#f87171' : '#10b981' },
                { label: 'Push Hub', status: telemetry?.channelHealth?.push || 'Unknown', icon: Bell, color: telemetry?.channelHealth?.push === 'Disabled' ? '#f87171' : '#10b981' },
              ].map((channel) => (
                <div key={channel.label} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                  <div className="p-2 rounded-lg bg-white/5"><channel.icon size={15} color="#64748b" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{channel.label}</div>
                    <div style={{ fontSize: 10, color: channel.color, fontWeight: 700, textTransform: 'uppercase' }}>{channel.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={adminStyles.warning}>
            <AlertTriangle size={20} color="#f87171" style={{ minWidth: 20 }} />
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              <strong>Forensic Limit:</strong> SMS traffic for non-critical assets is capped using the saved runtime security settings, while critical plant workflows can still use email and in-app fallback channels.
            </div>
          </div>

          <div className={adminStyles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Mtd Alert Volume</span>
              <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700 }}>{notificationVolumeMonth}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Delivery Success Rate</span>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>{deliverySuccessRate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Queued Email This Month</span>
              <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700 }}>{telemetry?.notificationByChannel?.email?.monthCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
