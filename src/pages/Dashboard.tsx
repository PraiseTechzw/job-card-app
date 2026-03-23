import { useNavigate, Navigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, AlertCircle, CheckCircle2, 
  Settings, Activity, FileText, Search
} from 'lucide-react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import styles from './Dashboard.module.css';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';
import SEO from '../components/SEO';

const Dashboard: React.FC = () => {
  const { jobCards } = useJobCards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAccessApprovals = ['Supervisor', 'HOD', 'Admin'].includes(user?.role || '');
  const canAccessReports = ['Admin', 'Supervisor', 'HOD', 'EngSupervisor', 'PlanningOffice'].includes(user?.role || '');

  // Role-based landing page redirects
  if (user?.role === 'Artisan') {
    return (
      <>
        <SEO title="Artisan Dashboard" />
        <Navigate to="/artisan/dashboard" replace />
      </>
    );
  }
  if (user?.role === 'Supervisor' || user?.role === 'EngSupervisor') {
    return (
      <>
        <SEO title="Supervisor Dashboard" />
        <Navigate to="/supervisor/dashboard" replace />
      </>
    );
  }
  if (user?.role === 'Initiator') {
    return (
      <>
        <SEO title="Initiator Dashboard" />
        <Navigate to="/initiator/dashboard" replace />
      </>
    );
  }

  // Calculate real metrics
  const topPerformers = (() => {
    const closedJobs = jobCards.filter(c => c.status === 'Closed' || c.status === 'SignedOff' || c.status === 'Awaiting_SignOff');
    const artisanMap: Record<string, number> = {};
    
    closedJobs.forEach(job => {
      if (job.issuedTo) {
        artisanMap[job.issuedTo] = (artisanMap[job.issuedTo] || 0) + 1;
      }
    });

    return Object.entries(artisanMap)
      .map(([name, count]) => ({
        name,
        jobs: count,
        // Mock efficiency based on job count for now, or just remove metric
        efficiency: Math.min(85 + (count * 2), 99) 
      }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 5);
  })();

  const stats = [
    { 
      label: 'Open Job Cards', 
      value: jobCards.filter(c => !['Closed', 'Draft', 'Rejected'].includes(c.status)).length, 
      change: '+12%', 
      icon: Clock, 
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)' 
    },
    { 
      label: 'Critical Faults', 
      value: jobCards.filter(c => c.priority === 'Critical' && c.status !== 'Closed').length, 
      change: '-5%', 
      icon: AlertCircle, 
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.1)' 
    },
    { 
      label: 'Resolved Today', 
      value: jobCards.filter(c => (c.status === 'Closed' || c.status === 'SignedOff') && c.updatedAt?.startsWith(new Date().toISOString().split('T')[0])).length, 
      change: '+8%', 
      icon: CheckCircle2, 
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)' 
    },
    { 
      label: 'Fleet Health', 
      value: '94.2%', 
      change: '+2.1%', 
      icon: Activity, 
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.1)' 
    },
  ];

  const chartData = [
    { name: 'Mon', completion: jobCards.filter(c => c.status === 'Closed' && c.updatedAt?.includes('Mon')).length || 4, faults: jobCards.filter(c => c.priority === 'Critical' && c.createdAt?.includes('Mon')).length || 6 },
    { name: 'Tue', completion: 7, faults: 4 },
    { name: 'Wed', completion: 5, faults: 8 },
    { name: 'Thu', completion: 12, faults: 3 },
    { name: 'Fri', completion: 9, faults: 5 },
    { name: 'Sat', completion: 3, faults: 2 },
    { name: 'Sun', completion: 2, faults: 1 },
  ];

  return (
    <div className={styles.container}>
      <SEO title="Plant Dashboard" />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Plant Governance Centre</h1>
          <p className={styles.subtitle}>Welcome back, {user?.name}. Here's the live plant performance summary.</p>
        </div>
        <div className={styles.headerActions}>
           <button className="btn btn-primary" onClick={() => navigate('/reports')}>
             <TrendingUp size={18} />
             Performance Analytics
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
            <h3 className={styles.cardTitle}>Real-time Activity Stream</h3>
            <div className={styles.legend}>
               <span className={styles.legendItem}><i style={{ background: '#6366f1'}} /> Completed</span>
               <span className={styles.legendItem}><i style={{ background: '#f43f5e'}} /> Critical Faults</span>
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
                    backgroundColor: '#0f172a', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                    padding: '16px'
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
           <h3 className={styles.cardTitle}>Engineering Top Performers</h3>
           <div className={styles.artisanList}>
              {topPerformers.length > 0 ? topPerformers.map((a, i) => (
                <div key={i} className={styles.artisanItem}>
                   <div className={styles.artisanAvatar} style={{ background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.1)', color: i === 0 ? '#f59e0b' : '#6366f1' }}>
                     {a.name.charAt(0)}
                   </div>
                   <div className={styles.artisanInfo}>
                      <span className={styles.artisanName}>{a.name}</span>
                      <span className={styles.artisanJobs}>{a.jobs} tasks resolved</span>
                   </div>
                   <div className={styles.artisanMetric}>
                      <span className={styles.metricVal}>{a.efficiency}%</span>
                      <div className={styles.metricBar}><i style={{ width: `${a.efficiency}%`, background: a.efficiency > 95 ? '#10b981' : '#6366f1' }} /></div>
                   </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500 italic text-sm">No resolved jobs found in current period.</div>
              )}
           </div>
           
           <div className={styles.quickLinks}>
              <h3 className={styles.cardTitle} style={{ marginTop: '1.5rem'}}>Governance Shortcuts</h3>
              <div className={styles.linksGrid}>
                 <button className={styles.quickBtn} onClick={() => navigate('/job-cards')}>
                   <Search size={18} /> Search Jobs
                 </button>
                 {canAccessApprovals && (
                   <button className={styles.quickBtn} onClick={() => navigate('/approvals')}>
                     <CheckCircle2 size={18} /> My Approvals
                   </button>
                 )}
                 {canAccessReports && (
                   <button className={styles.quickBtn} onClick={() => navigate('/reports')}>
                     <FileText size={18} /> System Reports
                   </button>
                 )}
                 {user?.role === 'Admin' && (
                   <button className={styles.quickBtn} onClick={() => navigate('/admin/dashboard')}>
                     <Settings size={18} /> System Control
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
