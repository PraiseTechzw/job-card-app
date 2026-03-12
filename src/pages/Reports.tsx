import React from 'react';
import { useJobCards } from '../context/JobCardContext';
import styles from './Reports.module.css';
import { BarChart3, PieChart, Activity, HardHat } from 'lucide-react';

import { BarChart3, PieChart, Activity, HardHat, FileText, Download, Printer, ChevronRight, Search } from 'lucide-react';

const Reports: React.FC = () => {
  const { jobCards, allocationSheets } = useJobCards();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'completed' | 'outstanding' | 'machine' | 'artisan' | 'downtime'>('overview');
  const [reportSearch, setReportSearch] = React.useState('');

  const totalCards = jobCards.length || 1;

  // Data helpers
  const getStatusCounts = () => jobCards.reduce((acc: any, card) => {
    acc[card.status] = (acc[card.status] || 0) + 1;
    return acc;
  }, {});

  const getPriorityCounts = () => jobCards.reduce((acc: any, card) => {
    acc[card.priority] = (acc[card.priority] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  const handlePrint = () => {
    window.print();
  };

  // Report filtered data
  const completedJobs = jobCards.filter(c => ['Closed', 'SignedOff'].includes(c.status));
  const outstandingJobs = jobCards.filter(c => !['Closed', 'Rejected', 'Draft'].includes(c.status));
  
  const historyData = jobCards.filter(c => 
    !reportSearch || 
    c.plantNumber?.toLowerCase().includes(reportSearch.toLowerCase()) || 
    c.plantDescription?.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const artisanWorkload = jobCards.reduce((acc: any, card) => {
    if (card.issuedTo) {
      if (!acc[card.issuedTo]) acc[card.issuedTo] = { total: 0, open: 0, done: 0 };
      acc[card.issuedTo].total++;
      if (['InProgress', 'Assigned'].includes(card.status)) acc[card.issuedTo].open++;
      if (['Closed', 'SignedOff', 'Awaiting_SignOff'].includes(card.status)) acc[card.issuedTo].done++;
    }
    return acc;
  }, {});

  const downtimeSummary = jobCards.reduce((acc: any, card) => {
    if (card.plantNumber && card.machineDowntime) {
      const hours = parseFloat(card.machineDowntime) || 0;
      if (!acc[card.plantNumber]) acc[card.plantNumber] = { description: card.plantDescription, totalHours: 0, count: 0 };
      acc[card.plantNumber].totalHours += hours;
      acc[card.plantNumber].count++;
    }
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={`${styles.header} no-print`}>
        <div>
          <h1 className={styles.title}>System Analytics & Reports</h1>
          <p className={styles.subtitle}>Maintenance Performance Overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      <div className={`${styles.tabs} no-print`}>
        <button className={activeTab === 'overview' ? styles.activeTab : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'completed' ? styles.activeTab : ''} onClick={() => setActiveTab('completed')}>Completed</button>
        <button className={activeTab === 'outstanding' ? styles.activeTab : ''} onClick={() => setActiveTab('outstanding')}>Outstanding</button>
        <button className={activeTab === 'machine' ? styles.activeTab : ''} onClick={() => setActiveTab('machine')}>Machine History</button>
        <button className={activeTab === 'artisan' ? styles.activeTab : ''} onClick={() => setActiveTab('artisan')}>Artisan Workload</button>
        <button className={activeTab === 'downtime' ? styles.activeTab : ''} onClick={() => setActiveTab('downtime')}>Downtime</button>
      </div>

      {activeTab === 'overview' && (
        <div className={styles.reportGrid}>
          {/* Workflow Status */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}><Activity size={20} className="text-blue-500" /> Workflow Status</h2>
            <div className={styles.chartContainer}>
              {[
                { k: 'Pending_Supervisor', l: 'In Approval', c: 'bg-warning' },
                { k: 'Registered', l: 'Registered', c: 'bg-cyan' },
                { k: 'InProgress', l: 'In Execution', c: 'bg-purple' },
                { k: 'Awaiting_SignOff', l: 'Done (Await)', c: 'bg-emerald' },
                { k: 'Closed', l: 'Closed/Archived', c: 'bg-slate' }
              ].map(st => {
                const count = statusCounts[st.k] || 0;
                const percent = (count / totalCards) * 100;
                return (
                  <div key={st.k} className={styles.barWrapper}>
                    <div className={styles.barLabel}><span>{st.l}</span><span>{count}</span></div>
                    <div className={styles.barTrack}><div className={`${styles.barFill} ${styles[st.c]}`} style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}><PieChart size={20} className="text-amber-500" /> Priority Breakdown</h2>
            <div className={styles.chartContainer}>
              {['Critical', 'High', 'Medium', 'Low'].map(prio => {
                const count = priorityCounts[prio] || 0;
                const percent = (count / totalCards) * 100;
                const color = prio === 'Critical' ? 'bg-danger' : prio === 'High' ? 'bg-warning' : prio === 'Medium' ? 'bg-primary' : 'bg-success';
                return (
                  <div key={prio} className={styles.barWrapper}>
                    <div className={styles.barLabel}><span>{prio}</span><span>{count}</span></div>
                    <div className={styles.barTrack}><div className={`${styles.barFill} ${styles[color]}`} style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Summary */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}><BarChart3 size={20} className="text-emerald-500" /> Top Assets (by JC Count)</h2>
            <table className={styles.summaryTable}>
              <thead><tr><th>Plant ID</th><th>JC Count</th></tr></thead>
              <tbody>
                {Object.entries(jobCards.reduce((a: any, c) => { if(c.plantNumber) a[c.plantNumber] = (a[c.plantNumber] || 0) + 1; return a; }, {}))
                  .sort(([, a]: any, [, b]: any) => b - a).slice(0, 5).map(([id, count]) => (
                    <tr key={id as string}><td>{id as string}</td><td>{count as number}</td></tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Artisan Summary */}
          <div className={`glass-panel ${styles.card}`}>
            <h2 className={styles.cardTitle}><HardHat size={20} className="text-purple-500" /> Artisan Activity</h2>
            <div className={styles.statsList}>
              <div className={styles.statRow}><span className={styles.statLabel}>Active Artisans</span><span className={styles.statValue}>{Object.keys(artisanWorkload).length}</span></div>
              <div className={styles.statRow}><span className={styles.statLabel}>In-Progress Jobs</span><span className={styles.statValue}>{statusCounts['InProgress'] || 0}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED JOBS REPORT */}
      {activeTab === 'completed' && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Completed Job Cards Report</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Plant Description</th>
                  <th>Requested By</th>
                  <th>Issued To</th>
                  <th>Finish Date</th>
                  <th>Downtime</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.map(card => (
                  <tr key={card.id}>
                    <td>{card.ticketNumber}</td>
                    <td>{card.plantDescription}</td>
                    <td>{card.requestedBy}</td>
                    <td>{card.issuedTo}</td>
                    <td>{card.dateFinished || '--'}</td>
                    <td>{card.machineDowntime || '0'} hrs</td>
                    <td><span className={`badge ${card.status === 'Closed' ? 'badge-ghost' : 'badge-success'}`}>{card.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OUTSTANDING JOBS REPORT */}
      {activeTab === 'outstanding' && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Outstanding (In-Progress/Unresolved) Report</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Target Date</th>
                </tr>
              </thead>
              <tbody>
                {outstandingJobs.map(card => (
                  <tr key={card.id}>
                    <td>{card.ticketNumber}</td>
                    <td>{card.plantDescription}</td>
                    <td><span className={`badge ${card.priority === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>{card.priority}</span></td>
                    <td><span className="badge badge-info">{card.status.replace('_', ' ')}</span></td>
                    <td>{card.issuedTo || 'Unassigned'}</td>
                    <td>{card.requiredCompletionDate || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MACHINE HISTORY REPORT */}
      {activeTab === 'machine' && (
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Machine Maintenance History</h2>
            <div className="relative no-print">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Plant # or Name..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm outline-none"
              />
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plant #</th>
                  <th>Description</th>
                  <th>Fault / Work Done</th>
                  <th>Issued To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map(card => (
                  <tr key={card.id}>
                    <td>{card.dateRaised}</td>
                    <td>{card.plantNumber}</td>
                    <td>{card.plantDescription}</td>
                    <td>{card.defect || card.workRequest}</td>
                    <td>{card.issuedTo}</td>
                    <td>{card.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ARTISAN WORKLOAD REPORT */}
      {activeTab === 'artisan' && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Technician / Artisan Workload Report</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Artisan Name</th>
                  <th>Total Jobs</th>
                  <th>Open / Active</th>
                  <th>Completed</th>
                  <th>Load Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(artisanWorkload).map(([name, stats]: any) => (
                  <tr key={name}>
                    <td className="font-bold text-blue-400">{name}</td>
                    <td>{stats.total}</td>
                    <td>{stats.open}</td>
                    <td>{stats.done}</td>
                    <td>
                      <div className="flex items-center gap-2">
                         <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${(stats.open / (stats.total || 1)) * 100}%` }} />
                         </div>
                         <span className="text-[10px] uppercase font-bold text-slate-500">{stats.open > 3 ? 'Heavy' : 'Normal'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOWNTIME SUMMARY REPORT */}
      {activeTab === 'downtime' && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Machine Downtime Summary</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Plant #</th>
                  <th>Description</th>
                  <th>Total Downtime</th>
                  <th>Breakdown Events</th>
                  <th>Avg. Time / Event</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(downtimeSummary).map(([plantNum, data]: any) => (
                  <tr key={plantNum}>
                    <td>{plantNum}</td>
                    <td>{data.description}</td>
                    <td className="text-red-400 font-bold">{data.totalHours.toFixed(1)} hrs</td>
                    <td>{data.count}</td>
                    <td>{(data.totalHours / data.count).toFixed(1)} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
  );
};

export default Reports;
