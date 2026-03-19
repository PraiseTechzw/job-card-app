import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Search, ArrowLeft, Clock, AlertTriangle,
  BarChart2, Wrench, ChevronRight
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

interface PlantStats {
  totalJobs: number;
  completedJobs: number;
  totalDowntime: number; // in hours (parsed)
  totalCost: number;
  mttr: number; // Mean Time To Repair
  mtbf: number; // Mean Time Between Failures
  lastMaintenance: string;
  mostCommonFailure: string;
}

function parseDowntime(dt?: string): number {
  if (!dt) return 0;
  const match = dt.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export default function MaintenanceHistory() {
  const { jobCards } = useJobCards();
  const navigate = useNavigate();
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique list of plants
  const plants = useMemo(() => {
    const pMap = new Map<string, { id: string, desc: string }>();
    jobCards.forEach(c => {
      if (c.plantNumber && c.plantDescription) {
        pMap.set(c.plantNumber, { id: c.plantNumber, desc: c.plantDescription });
      }
    });
    return Array.from(pMap.values()).sort((a, b) => a.desc.localeCompare(b.desc));
  }, [jobCards]);

  const filteredPlants = useMemo(() => {
    return plants.filter(p => 
      p.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plants, searchTerm]);

  const plantJobs = useMemo(() => {
    if (!selectedPlant) return [];
    return jobCards.filter(c => c.plantNumber === selectedPlant)
      .sort((a, b) => new Date(b.dateRaised).getTime() - new Date(a.dateRaised).getTime());
  }, [jobCards, selectedPlant]);

  const stats = useMemo((): PlantStats | null => {
    if (!selectedPlant || plantJobs.length === 0) return null;

    const completed = plantJobs.filter(j => j.status === 'Closed');
    const totalDowntime = plantJobs.reduce((acc, j) => acc + parseDowntime(j.machineDowntime), 0);
    const totalCost = plantJobs.reduce((acc, j) => {
      const partsCost = (j.sparesWithdrawn || []).reduce((s, p) => s + (parseFloat(p.cost) || 0), 0);
      return acc + partsCost;
    }, 0);

    // MTTR: Total downtime of completed jobs / number of completed jobs
    const mttr = completed.length > 0 ? totalDowntime / completed.length : 0;

    // MTBF: Time between first and last job / number of jobs
    let mtbf = 0;
    if (plantJobs.length > 1) {
      const first = new Date(plantJobs[plantJobs.length - 1].dateRaised).getTime();
      const last = new Date(plantJobs[0].dateRaised).getTime();
      const days = (last - first) / (1000 * 60 * 60 * 24);
      mtbf = days / (plantJobs.length - 1);
    }

    // Most common failure category (extracted from planner metadata if available)
    const failures: Record<string, number> = {};
    plantJobs.forEach(j => {
      const catMatch = (j.maintenanceSchedule || '').match(/Failure Category: ([^|]+)/);
      const cat = catMatch ? catMatch[1].trim() : 'Unclassified';
      failures[cat] = (failures[cat] || 0) + 1;
    });
    const mostCommonFailure = Object.entries(failures).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalJobs: plantJobs.length,
      completedJobs: completed.length,
      totalDowntime,
      totalCost,
      mttr,
      mtbf,
      lastMaintenance: plantJobs[0].dateRaised,
      mostCommonFailure
    };
  }, [plantJobs, selectedPlant]);

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Activity size={22} color="#6366f1" />
            </span>
            Equipment Maintenance History
          </h1>
          <p className={styles['text-muted']}>Asset-level lifecycle tracking and performance analytics.</p>
        </div>
        {!selectedPlant && (
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search equipment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ paddingLeft: 34 }}
            />
          </div>
        )}
        {selectedPlant && (
          <button className="btn btn-ghost" onClick={() => setSelectedPlant(null)} style={{ gap: 6 }}>
            <ArrowLeft size={14} /> Back to Equipment List
          </button>
        )}
      </header>

      {!selectedPlant ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredPlants.map(p => {
             const count = jobCards.filter(c => c.plantNumber === p.id).length;
             return (
               <div 
                 key={p.id} 
                 onClick={() => setSelectedPlant(p.id)}
                 style={{ 
                   background: 'rgba(15,23,42,0.6)', 
                   border: '1px solid rgba(255,255,255,0.06)', 
                   borderRadius: 16, 
                   padding: 20, 
                   cursor: 'pointer',
                   transition: 'transform 0.2s, background 0.2s'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-2px)';
                   e.currentTarget.style.background = 'rgba(15,23,42,0.8)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.background = 'rgba(15,23,42,0.6)';
                 }}
               >
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                   <div>
                     <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{p.desc}</div>
                     <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{p.id}</div>
                   </div>
                   <div style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                     {count} Jobs
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Last Seen</div>
                     <div style={{ fontSize: 12, color: '#94a3b8' }}>{jobCards.filter(c => c.plantNumber === p.id).sort((a,b) => new Date(b.dateRaised).getTime() - new Date(a.dateRaised).getTime())[0]?.dateRaised || 'N/A'}</div>
                   </div>
                   <ChevronRight size={16} color="#334155" style={{ alignSelf: 'center' }} />
                 </div>
               </div>
             );
          })}
          {filteredPlants.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Search size={40} className="empty-state-icon" />
              <h3>No equipment found</h3>
              <p>Try adjusting your search term.</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Plant Stats Panel */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'MTTR', value: `${stats.mttr.toFixed(1)} hrs`, icon: Clock, color: '#6366f1', sub: 'Mean Time To Repair' },
                { label: 'MTBF', value: `${stats.mtbf.toFixed(1)} days`, icon: Activity, color: '#10b981', sub: 'Mean Time Between Failure' },
                { label: 'Total Downtime', value: `${stats.totalDowntime} hrs`, icon: AlertTriangle, color: '#f59e0b', sub: 'Cumulative machine stop' },
                { label: 'Total Spares Cost', value: `$${stats.totalCost.toLocaleString()}`, icon: BarChart2, color: '#34d399', sub: 'Excluding labor' },
                { label: 'Top Failure', value: stats.mostCommonFailure, icon: Wrench, color: '#a78bfa', sub: 'Primary failure mode' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>{s.label}</span>
                    <s.icon size={13} color={s.color} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline View */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Maintenance Timeline</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{plantJobs.length} Events Logged</span>
              </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: 30 }}>
              <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)' }} />
              
              {plantJobs.map((job) => (
                <div key={job.id} style={{ position: 'relative', marginBottom: 24 }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: -21, 
                    top: 2, 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    background: job.status === 'Closed' ? '#10b981' : '#6366f1',
                    border: '2px solid rgba(15,23,42,1)',
                    zIndex: 2
                  }} />
                  
                  <div 
                    onClick={() => navigate(`/planner/job/${job.id}`)}
                    style={{ 
                      background: 'rgba(9,11,18,0.4)', 
                      border: '1px solid rgba(255,255,255,0.04)', 
                      borderRadius: 12, 
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(9,11,18,0.6)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(9,11,18,0.4)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{job.ticketNumber} · {job.defect}</div>
                      <span style={{ fontSize: 11, color: '#475569' }}>{job.dateRaised}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Artisan</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{job.issuedTo || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Downtime</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{job.machineDowntime || '0 hrs'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>Outcome</div>
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: job.status === 'Closed' ? '#10b981' : '#f59e0b',
                          textTransform: 'uppercase'
                        }}>{job.status.replace(/_/g, ' ')}</div>
                      </div>
                    </div>

                    {job.workDoneDetails && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                        {job.workDoneDetails.substring(0, 150)}{job.workDoneDetails.length > 150 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
