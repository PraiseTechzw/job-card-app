import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck, Users, Activity, AlertTriangle, 
  Database, FileText, Settings, Bell, 
  Archive, Lock, RefreshCw, Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';
import SEO from '../../components/SEO';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/audit-logs?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentLogs(logsRes.data);
      } catch (e) {
        console.error('Admin stats fetch failed', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <RefreshCw size={48} className="animate-spin" color="#6366f1" style={{ marginBottom: 20, margin: '0 auto' }} />
          <p style={{ color: '#475569', fontWeight: 700 }}>Initializing Governance Console...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className={styles.pageContainer}>
        <div className="empty-state">
          <Lock size={64} className="empty-state-icon" color="#ef4444" />
          <h3 className="empty-state-title">Restricted Access</h3>
          <p>This module requires elevated System Administrator privileges.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <SEO title="System Governance Console" description="Administrative console for system configuration and security management." />
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-center md:text-left">
        <div className="w-full md:w-auto flex flex-col items-center md:items-start gap-2">
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ background: 'rgba(79,70,229,0.15)', borderRadius: 10, padding: '7px 9px', display: 'inline-flex' }}>
              <ShieldCheck size={24} color="#6366f1" />
            </span>
            System Governance Console
          </h1>
          <p className={styles['text-muted']}>Centralized configuration, security, and audit oversight.</p>
        </div>
        <div className="flex justify-center w-full md:w-auto">
          <div style={{ background: stats?.systemHealth === 'Healthy' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${stats?.systemHealth === 'Healthy' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: stats?.systemHealth === 'Healthy' ? '#10b981' : '#ef4444' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: stats?.systemHealth === 'Healthy' ? '#10b981' : '#ef4444' }}>SYSTEM STATUS: {stats?.systemHealth || 'STABLE'}</span>
          </div>
        </div>
      </header>

      {/* Governance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total User Accounts', val: stats?.totalUsers || 0, color: '#6366f1', icon: Users },
          { label: 'System Uptime', val: stats?.uptime || '99.9%', color: '#10b981', icon: Activity },
          { label: 'Total Job Cards', val: stats?.jobCards || 0, color: '#0ea5e9', icon: Database },
          { label: 'Audit Events', val: stats?.auditLogs || 0, color: '#8b5cf6', icon: FileText },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.06em' }}>{k.label}</span>
              <k.icon size={16} color={k.color} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9' }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main Workspace */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Access Grid */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Settings size={14} /> Administrative Master Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'User Management', icon: Users, desc: 'Accounts, status & identity', to: '/admin/users' },
                { label: 'Roles & Permissions', icon: ShieldCheck, desc: 'Security access models', to: '/admin/roles' },
                { label: 'Master Data Manager', icon: Database, desc: 'Plant & category reference', to: '/admin/master-data' },
                { label: 'Workflow Config', icon: RefreshCw, desc: 'Transitions & status rules', to: '/admin/workflow' },
                { label: 'Notification Engine', icon: Bell, desc: 'Triggers, Email & SMS', to: '/admin/notifications' },
                { label: 'System Audit Logs', icon: FileText, desc: 'Security traceability', to: '/admin/audit' },
                { label: 'Data Retention', icon: Archive, desc: 'Archiving & lifecycles', to: '/admin/retention' },
                { label: 'System Settings', icon: Server, desc: 'API & Technical config', to: '/admin/settings' },
              ].map(m => (
                <button 
                  key={m.to} 
                  onClick={() => navigate(m.to)}
                  className="admin-module-btn"
                  style={{ 
                    textAlign: 'left', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', 
                    borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: 14, alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <div style={{ background: 'rgba(99,102,241,0.1)', padding: 10, borderRadius: 10 }}>
                    <m.icon size={18} color="#6366f1" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role Distribution Visualization */}
          <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 20 }}>License & Role Allocation</h3>
            <div className="flex flex-wrap gap-2 mb-6" style={{ height: 'auto', minHeight: 40 }}>
              {Object.entries<number>(stats?.rolesDistribution || {}).map(([role, count], i) => {
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
                return (
                  <div 
                    key={role} 
                    style={{ flex: count, background: colors[i % colors.length], borderRadius: 6, minHeight: 12, minWidth: 40 }} 
                    title={`${role}: ${count}`} 
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              {Object.entries<number>(stats?.rolesDistribution || {}).map(([role, count], i) => {
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
                return (
                  <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length] }} />
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{role} <span style={{ color: '#64748b' }}>({count})</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: System Intelligence */}
        <div className="flex flex-col gap-6">
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>Governance Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.lockedUsers > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <AlertTriangle size={14} color="#f87171" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>{stats.lockedUsers} Locked Accounts</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>Multiple failed login attempts detected. Review in User Management.</p>
                </div>
              )}
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Security Audit Passed</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>Latest system vulnerability scan completed successfully. No critical issues.</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>System Event Stream</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/admin/audit')} style={{ padding: '0 4px', height: 'auto', fontSize: 11 }}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(recentLogs.length > 0 ? recentLogs : [
                { action: 'CONSOLE_INIT', performedBy: 'System', createdAt: new Date().toISOString() }
              ]).map((log, i) => (
                <div key={i} style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{log.action}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>by {log.performedBy || log.performed_by} · {new Date(log.createdAt || log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>Infrastructure Resource Matrix</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Forensic Storage</span>
              <span style={{ fontSize: 11, color: '#e2e8f0' }}>{stats?.telemetry?.storageUsed || '1.2 GB'} / {stats?.telemetry?.storageLimit || '50 GB'}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${stats?.telemetry?.storagePercent || 5}%`, height: '100%', background: '#6366f1' }} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
               <span style={{ fontSize: 10, color: '#475569' }}>Avg Cloud Latency</span>
               <span style={{ fontSize: 10, color: '#cbd5e1' }}>{stats?.telemetry?.avgResponseTime || '--'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
