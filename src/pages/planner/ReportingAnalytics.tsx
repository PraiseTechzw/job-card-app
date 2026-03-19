import { useState, useMemo } from 'react';
import {
  TrendingUp, Download, 
  BarChart2, Activity, Clock,
  PieChart, DollarSign, AlertTriangle
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

type ReportType = 'status' | 'plant' | 'artisan' | 'cost' | 'downtime' | 'failure';

export default function ReportingAnalytics() {
  const { jobCards } = useJobCards();
  const [reportType, setReportType] = useState<ReportType>('status');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterPlant, setFilterPlant] = useState('');

  const plants = useMemo(() => 
    [...new Set(jobCards.map(c => c.plantDescription).filter(Boolean))].sort(), 
    [jobCards]
  );

  const filtered = useMemo(() => {
    let cards = jobCards.filter(c => c.status !== 'Draft');
    if (dateFrom) cards = cards.filter(c => c.dateRaised >= dateFrom);
    if (dateTo) cards = cards.filter(c => c.dateRaised <= dateTo);
    if (filterPlant) cards = cards.filter(c => c.plantDescription === filterPlant);
    return cards;
  }, [jobCards, dateFrom, dateTo, filterPlant]);

  // Generators for different types of reports
  const data = useMemo(() => {
    const res: Record<string, number> = {};
    const total = filtered.length;

    if (reportType === 'status') {
      filtered.forEach(c => { res[c.status] = (res[c.status] || 0) + 1; });
    } else if (reportType === 'plant') {
      filtered.forEach(c => { 
        const p = c.plantDescription || 'Unknown';
        res[p] = (res[p] || 0) + 1; 
      });
    } else if (reportType === 'artisan') {
      filtered.forEach(c => { 
        const a = c.issuedTo || 'Unassigned';
        res[a] = (res[a] || 0) + 1; 
      });
    } else if (reportType === 'cost') {
      filtered.forEach(c => {
        const cost = (c.sparesWithdrawn || []).reduce((s, p) => s + (parseFloat(p.cost) || 0), 0);
        const p = c.plantDescription || 'Other';
        res[p] = (res[p] || 0) + cost;
      });
    } else if (reportType === 'downtime') {
      filtered.forEach(c => {
        const dtStr = c.machineDowntime || '0';
        const dt = parseInt(dtStr.match(/(\d+)/)?.[1] || '0');
        const p = c.plantDescription || 'Other';
        res[p] = (res[p] || 0) + dt;
      });
    } else if (reportType === 'failure') {
      filtered.forEach(c => {
        const catMatch = (c.maintenanceSchedule || '').match(/Failure Category: ([^|]+)/);
        const cat = catMatch ? catMatch[1].trim() : 'Unclassified';
        res[cat] = (res[cat] || 0) + 1;
      });
    }

    return Object.entries(res).sort((a,b) => b[1] - a[1]);
  }, [filtered, reportType]);

  const maxVal = Math.max(...data.map(d => d[1]), 1);

  const exportReport = () => {
    const csv = [
      ['Metric', 'Value'],
      ...data.map(d => [d[0], d[1]])
    ].map(m => m.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <TrendingUp size={22} color="#6366f1" />
            </span>
            Reporting & Analytics
          </h1>
          <p className={styles['text-muted']}>Analyze maintenance performance, costs, and equipment reliability.</p>
        </div>
        <button className="btn btn-primary" onClick={exportReport} style={{ gap: 6 }}>
          <Download size={14} /> Export Report
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Selection & Filters Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, letterSpacing: '0.05em' }}>Report Type</h3>
            {[
              { id: 'status', label: 'By Completion Status', icon: PieChart },
              { id: 'plant', label: 'By Equipment Class', icon: Activity },
              { id: 'artisan', label: 'By Artisan Output', icon: Clock },
              { id: 'failure', label: 'By Failure Mode', icon: AlertTriangle },
              { id: 'cost', label: 'Material Cost Analysis', icon: DollarSign },
              { id: 'downtime', label: 'Machine Downtime', icon: Activity },
            ].map(r => (
              <button 
                key={r.id}
                onClick={() => setReportType(r.id as ReportType)}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '10px 12px', 
                  borderRadius: 10, 
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  background: reportType === r.id ? '#4f46e5' : 'transparent',
                  color: reportType === r.id ? '#fff' : '#64748b',
                  border: `1px solid ${reportType === r.id ? '#4f46e5' : 'transparent'}`,
                  cursor: 'pointer'
                }}
              >
                <r.icon size={14} /> {r.label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: 16, letterSpacing: '0.05em' }}>Filters</h3>
            
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Date Range</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input" style={{ fontSize: 12 }} />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input" style={{ fontSize: 12 }} />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Equipment</label>
              <select className="form-select" value={filterPlant} onChange={e => setFilterPlant(e.target.value)} style={{ fontSize: 12 }}>
                <option value="">All Equipment</option>
                {plants.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Data Visualization Area */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
              {(() => {
                if (reportType === 'status') return 'Status Distribution';
                if (reportType === 'plant') return 'Asset Activity Density';
                if (reportType === 'artisan') return 'Workflow Distribution by Artisan';
                if (reportType === 'failure') return 'Root Cause Frequency Analysis';
                if (reportType === 'cost') return 'Material Cost Breakdown';
                if (reportType === 'downtime') return 'Downtime Impact Analysis';
              })()}
            </h2>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Sample: <strong>{filtered.length}</strong> records match
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.length === 0 ? (
              <div className="empty-state">
                <BarChart2 size={48} className="empty-state-icon" />
                <h3>No data available</h3>
                <p>Try adjusting your filters.</p>
              </div>
            ) : (
              data.map(([label, val], idx) => {
                const percentage = Math.round((val / maxVal) * 100);
                return (
                  <div key={label} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{label.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: reportType === 'cost' ? '#34d399' : '#818cf8' }}>
                        {reportType === 'cost' ? `$${val.toLocaleString()}` : 
                         reportType === 'downtime' ? `${val} hrs` : val}
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          background: `linear-gradient(90deg, ${reportType === 'cost' ? '#34d399, #10b981' : '#4f46e5, #818cf8'})`,
                          borderRadius: 10,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Total Sample Size</div>
               <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{filtered.length}</div>
             </div>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Completion Rate</div>
               <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
                 {Math.round((filtered.filter(c => c.status === 'Closed').length / filtered.length) * 100 || 0)}%
               </div>
             </div>
             <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Avg Downtime</div>
               <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>
                 {Math.round(filtered.reduce((s,c) => s + parseInt(c.machineDowntime || '0'), 0) / filtered.length || 0)} hrs
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
