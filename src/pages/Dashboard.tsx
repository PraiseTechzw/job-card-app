import React from 'react';
import { Navigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, AlertCircle, CheckCircle2, 
  Settings, Users, Activity
} from 'lucide-react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import styles from './Dashboard.module.css';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';

const Dashboard: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();

  // Artisan users are redirected to the dedicated Artisan Module
  if (user?.role === 'Artisan') {
    return <Navigate to="/artisan/dashboard" replace />;
  }

  // Supervisor / EngSupervisor → dedicated Control Centre
  if (user?.role === 'Supervisor' || user?.role === 'EngSupervisor') {
    return <Navigate to="/supervisor/dashboard" replace />;
  }

  const stats = [
    { 
      label: 'Open Job Cards', 
      value: jobCards.filter(c => c.status !== 'Closed').length, 
      change: '+12%', 
      icon: Clock, 
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)' 
    },
    { 
      label: 'Critical Faults', 
      value: jobCards.filter(c => c.priority === 'Critical').length, 
      change: '-5%', 
      icon: AlertCircle, 
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.1)' 
    },
    { 
      label: 'Completed Today', 
      value: jobCards.filter(c => c.status === 'Closed' || c.status === 'Awaiting_SignOff').length, 
      change: '+8%', 
      icon: CheckCircle2, 
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)' 
    },
    { 
      label: 'Asset Uptime', 
      value: '94.2%', 
      change: '+2.1%', 
      icon: Activity, 
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.1)' 
    },
  ];

  const chartData = [
    { name: 'Mon', completion: 4, faults: 6 },
    { name: 'Tue', completion: 7, faults: 4 },
    { name: 'Wed', completion: 5, faults: 8 },
    { name: 'Thu', completion: 12, faults: 3 },
    { name: 'Fri', completion: 9, faults: 5 },
    { name: 'Sat', completion: 3, faults: 2 },
    { name: 'Sun', completion: 2, faults: 1 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Plant Overview</h1>
          <p className={styles.subtitle}>Welcome back! Here's what's happening today.</p>
        </div>
        <div className={styles.headerActions}>
           <button className="btn btn-primary">
             <TrendingUp size={18} />
             Live Analytics
           </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>{stat.label}</p>
              <h3 className={styles.statValue}>{stat.value}</h3>
              <span className={styles.statChange} style={{ color: stat.change.startsWith('+') ? '#10b981' : '#f43f5e' }}>
                {stat.change} <span className="text-slate-500 font-normal ml-1">vs last week</span>
              </span>
            </div>
            <div className={styles.statIconWrapper} style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.mainChart}>
          <div className={styles.chartHeader}>
            <h3 className={styles.cardTitle}>Activity Trends</h3>
            <div className={styles.legend}>
               <span className={styles.legendItem}><i style={{ background: '#6366f1'}} /> Completed</span>
               <span className={styles.legendItem}><i style={{ background: '#f43f5e'}} /> Faults</span>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCompletion)" 
                />
                <Bar dataKey="faults" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sidePanel}>
           <h3 className={styles.cardTitle}>Top Performers</h3>
           <div className={styles.artisanList}>
              {[
                { name: 'Peter Moyo', jobs: 14, efficiency: 98 },
                { name: 'Sarah Choto', jobs: 12, efficiency: 95 },
                { name: 'James Sibanda', jobs: 11, efficiency: 92 },
              ].map((a, i) => (
                <div key={i} className={styles.artisanItem}>
                   <div className={styles.artisanAvatar}>{a.name.charAt(0)}</div>
                   <div className={styles.artisanInfo}>
                      <span className={styles.artisanName}>{a.name}</span>
                      <span className={styles.artisanJobs}>{a.jobs} tasks finished</span>
                   </div>
                   <div className={styles.artisanMetric}>
                      <span className={styles.metricVal}>{a.efficiency}%</span>
                      <div className={styles.metricBar}><i style={{ width: `${a.efficiency}%` }} /></div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className={styles.quickLinks}>
              <h3 className={styles.cardTitle} style={{ marginTop: '1.5rem'}}>Quick Tasks</h3>
              <div className={styles.linksGrid}>
                 <button className={styles.quickBtn}><Settings size={18} /> Asset Config</button>
                 <button className={styles.quickBtn}><Users size={18} /> Manage Team</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
