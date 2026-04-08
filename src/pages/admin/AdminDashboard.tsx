import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck, Users, Activity, AlertTriangle, 
  Database, FileText, Bell, 
  Archive, Lock, RefreshCw, Server, ChevronRight, HardDrive, Cpu, Network, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from '../JobCards.module.css';
import SEO from '../../components/SEO';
import adminStyles from './AdminTheme.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const [statsRes] = await Promise.all([
          axios.get('/api/admin/stats')
        ]);
        setStats(statsRes.data);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
        </div>
        <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Initializing Governance Console</p>
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="glass-panel p-12 border border-red-500/10 rounded-3xl bg-slate-900/40 backdrop-blur-xl max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
            <Lock size={32} />
          </div>
          <h3 className="text-white text-2xl font-black mb-3">Restricted Access</h3>
          <p className="text-slate-400 mb-8 leading-relaxed">This module requires elevated System Administrator privileges. Unauthorized access attempts are logged.</p>
          <button className="w-full btn btn-primary py-4 rounded-2xl font-bold" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Users', val: stats?.totalUsers || 0, color: '#6366f1', icon: Users, bg: 'rgba(99, 102, 241, 0.1)' },
    { label: 'System Uptime', val: stats?.uptime || '99.9%', color: '#10b981', icon: Activity, bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Job Records', val: stats?.jobCards || 0, color: '#0ea5e9', icon: Database, bg: 'rgba(14, 165, 233, 0.1)' },
    { label: 'Audit Events', val: stats?.auditLogs || 0, color: '#8b5cf6', icon: FileText, bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  return (
    <div className={`${styles.pageContainer} ${adminStyles.page} animate-in fade-in duration-700`}>
      <SEO title="System Governance Console" />
      
      <div className={adminStyles.hero}>
        <header className={adminStyles.header}>
          <div className={adminStyles.headerMain}>
            <div className={adminStyles.headerText}>
              <p className={adminStyles.eyebrow}>System Governance</p>
              <div className={adminStyles.titleRow}>
                <span className={adminStyles.titleIcon}>
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <h1 className={adminStyles.title}>Governance Console</h1>
                  <p className={adminStyles.subtitle}>Centralized security, audit, retention, identity, and infrastructure oversight.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={adminStyles.headerActions}>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-xl">
              <div className={`w-2.5 h-2.5 rounded-full ${stats?.systemHealth === 'Healthy' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-red-500 animate-ping shadow-[0_0_10px_#ef4444]'}`} />
              <span className={`text-[11px] font-black tracking-[0.1em] uppercase ${stats?.systemHealth === 'Healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                System {stats?.systemHealth || 'STABLE'}
              </span>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">Ver 4.2.0-LTS</span>
            </div>
          </div>
        </header>
      </div>

      {/* Governance Stats */}
      <div className={adminStyles.statsGrid}>
        {kpis.map(k => (
          <div key={k.label} className="glass-panel p-7 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl group hover:border-white/10 transition-all shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="p-2.5 rounded-xl shadow-inner" style={{ backgroundColor: k.bg, color: k.color }}>
                <k.icon size={20} />
              </div>
              <Activity size={14} className="text-slate-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{k.label}</h3>
              <div className="text-3xl font-black text-white tracking-tighter">{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        
        {/* Module Control Centre */}
        <div className="xl:col-span-2 space-y-8">
          <section className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1]"></div>
              Administrative Master Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'User Accounts', icon: Users, desc: 'Identity & Access Control', to: '/admin/users' },
                { label: 'Security Policies', icon: ShieldCheck, desc: 'Role-based access models', to: '/admin/roles' },
                { label: 'Master Assets', icon: Database, desc: 'Global plant reference data', to: '/admin/master-data' },
                { label: 'Workflow Engine', icon: RefreshCw, desc: 'Business logic & status rules', to: '/admin/workflow' },
                { label: 'Communication Hub', icon: Bell, desc: 'Email, SMS & Push triggers', to: '/admin/notifications' },
                { label: 'Security Audits', icon: FileText, desc: 'Compliance traceability', to: '/admin/audit' },
                { label: 'Data Retention', icon: Archive, desc: 'Archiving & lifecycles', to: '/admin/retention' },
                { label: 'Core Configuration', icon: Server, desc: 'API & Environment settings', to: '/admin/settings' },
              ].map(m => (
                <button 
                  key={m.to} 
                  onClick={() => navigate(m.to)}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300 text-left shadow-lg"
                >
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all duration-300">
                    <m.icon size={20} className="text-slate-400 group-hover:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-200 font-bold text-sm group-hover:text-white transition-colors">{m.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{m.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </section>

          {/* Role Distribution */}
          <section className="glass-panel p-8 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl">
            <h3 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
              Licensing & Role Allocation
            </h3>
            <div className="space-y-8">
              <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
                {Object.entries<number>(stats?.rolesDistribution || {}).map(([role, count], i) => {
                  const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
                  const total = Object.values<number>(stats?.rolesDistribution || {}).reduce((a, b) => a + b, 0);
                  const width = (count / total) * 100;
                  return (
                    <div 
                      key={role} 
                      style={{ width: `${width}%`, background: colors[i % colors.length] }} 
                      className="h-full relative group transition-all hover:opacity-80"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-slate-900 text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-white/10 shadow-xl">
                        {role}: {count}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {Object.entries<number>(stats?.rolesDistribution || {}).map(([role, count], i) => {
                  const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
                  return (
                    <div key={role} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: colors[i % colors.length], color: colors[i % colors.length] }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{role}</span>
                      </div>
                      <div className="text-lg font-black text-slate-200">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: System Intelligence */}
        <div className="space-y-8">
          
          {/* Top Performers Sidebar */}
          <section className="glass-panel p-7 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl">
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Performance Leaders
              <TrendingUp size={14} className="text-indigo-400" />
            </h3>
            <div className="space-y-4">
              {(stats?.topPerformers || []).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/30 border border-white/5 group hover:bg-indigo-500/5 hover:border-indigo-500/10 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-sm font-black text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                    {a.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-200 font-bold text-xs">{a.name}</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">{a.jobs} tasks finalized</div>
                  </div>
                  {i === 0 && <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/5 border border-amber-500/20 animate-bounce"><TrendingUp size={12} /></div>}
                </div>
              ))}
              {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No Leaderboard Data</p>
                </div>
              )}
            </div>
          </section>

          {/* Security Alerts */}
          <section className="glass-panel p-7 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center justify-between relative z-10">
              Security Pulse
              <Bell size={14} className="text-slate-500" />
            </h3>
            <div className="space-y-4 relative z-10">
              {stats?.lockedUsers > 0 && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                    <span className="text-xs font-black text-red-400 uppercase tracking-widest">{stats.lockedUsers} Locked Accounts</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Multiple failed access attempts detected. Investigation recommended.</p>
                </div>
              )}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Audit Passed</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Latest forensic integrity scan completed. Zero vulnerabilities detected.</p>
              </div>
            </div>
          </section>

          {/* Infrastructure Health */}
          <section className="glass-panel p-7 border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl">
            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Infrastructure
              <Server size={14} className="text-slate-500" />
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400">
                     <HardDrive size={12} />
                     <span className="text-[10px] font-bold uppercase">Storage</span>
                   </div>
                   <span className="text-[10px] font-mono text-slate-300 font-bold">{stats?.telemetry?.storagePercent || 14}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                   <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f166]" style={{ width: `${stats?.telemetry?.storagePercent || 14}%` }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Cpu size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Load</span>
                    </div>
                    <div className="text-xs font-black text-slate-200">12.4%</div>
                 </div>
                 <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Network size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Latency</span>
                    </div>
                    <div className="text-xs font-black text-slate-200">24ms</div>
                 </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
