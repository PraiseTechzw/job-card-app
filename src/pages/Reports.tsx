import React from 'react';
import { useJobCards } from '../context/JobCardContext';
import styles from './Reports.module.css';
import { BarChart3, PieChart, Activity, HardHat } from 'lucide-react';

const Reports: React.FC = () => {
  const { jobCards, allocationSheets } = useJobCards();

  // 1. Status Distribution
  const statusCounts = jobCards.reduce((acc: any, card) => {
    acc[card.status] = (acc[card.status] || 0) + 1;
    return acc;
  }, {});

  const statuses = [
    { key: 'Draft', label: 'Drafts', color: 'bg-info' },
    { key: 'Pending_Supervisor', label: 'Pending Appr', color: 'bg-warning' },
    { key: 'Approved', label: 'Authorized', color: 'bg-primary' },
    { key: 'InProgress', label: 'In Execution', color: 'bg-purple' },
    { key: 'Awaiting_SignOff', label: 'Done (Await Sign-off)', color: 'bg-success' },
    { key: 'SignedOff', label: 'Signed Off', color: 'bg-primary' },
    { key: 'Closed', label: 'Archived', color: 'bg-info' }
  ];

  // 2. Priority Distribution
  const priorityCounts = jobCards.reduce((acc: any, card) => {
    acc[card.priority] = (acc[card.priority] || 0) + 1;
    return acc;
  }, {});

  const priorities = [
    { key: 'Critical', label: 'Critical', color: 'bg-danger' },
    { key: 'High', label: 'High', color: 'bg-warning' },
    { key: 'Medium', label: 'Normal', color: 'bg-primary' },
    { key: 'Low', label: 'Low', color: 'bg-success' }
  ];

  // 3. Plant Utilization (Top 5 assets)
  const plantCounts = jobCards.reduce((acc: any, card) => {
    if (card.plantNumber) {
      acc[card.plantNumber] = (acc[card.plantNumber] || 0) + 1;
    }
    return acc;
  }, {});

  const topPlants = Object.entries(plantCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  const totalCards = jobCards.length || 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Analytics & Reports</h1>
        <p className={styles.subtitle}>Maintenance Performance Overview</p>
      </div>

      <div className={styles.reportGrid}>
        {/* Status Report */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>
            <Activity size={20} className="text-blue-500" /> 
            Job Card Workflow Status
          </h2>
          <div className={styles.chartContainer}>
            {statuses.map(status => {
              const count = statusCounts[status.key] || 0;
              const percent = (count / totalCards) * 100;
              return (
                <div key={status.key} className={styles.barWrapper}>
                  <div className={styles.barLabel}>
                    <span>{status.label}</span>
                    <span>{count} ({Math.round(percent)}%)</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={`${styles.barFill} ${styles[status.color]}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Report */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>
            <PieChart size={20} className="text-amber-500" />
            Priority Breakdown
          </h2>
          <div className={styles.chartContainer}>
            {priorities.map(prio => {
              const count = priorityCounts[prio.key] || 0;
              const percent = (count / totalCards) * 100;
              return (
                <div key={prio.key} className={styles.barWrapper}>
                  <div className={styles.barLabel}>
                    <span>{prio.label}</span>
                    <span>{count}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={`${styles.barFill} ${styles[prio.color]}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Performance */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>
            <BarChart3 size={20} className="text-emerald-500" />
            Top Impacted Assets
          </h2>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Plant ID</th>
                <th>JC Count</th>
              </tr>
            </thead>
            <tbody>
              {topPlants.length > 0 ? topPlants.map(([id, count]: any) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{count}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} style={{textAlign: 'center', opacity: 0.5}}>No asset data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Artisan Load */}
        <div className={`glass-panel ${styles.card}`}>
          <h2 className={styles.cardTitle}>
            <HardHat size={20} className="text-purple-500" />
            Active Artisan Load
          </h2>
          <div className={styles.statsList}>
            {(() => {
              const allRows = allocationSheets.flatMap(s => s.rows);
              return (
                <>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Total Allocations</span>
                    <span className={styles.statValue}>{allRows.length}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Unique Artisans</span>
                    <span className={styles.statValue}>
                      {new Set(allRows.map(a => a.artisanName)).size}
                    </span>
                  </div>
                </>
              );
            })()}
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Efficiency Rating</span>
              <span className={styles.statValue}>84%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
