import { useState, useMemo } from 'react';
import {
  Archive, Search, Database, 
  Download, ShieldAlert, ArrowRight
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

export default function ArchiveManagement() {
  const { jobCards } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'archived'>('current');

  // Archive policy simulation: anything older than 24 months
  const ARCHIVE_MONTHS = 24;
  const policyDate = new Date();
  policyDate.setMonth(policyDate.getMonth() - ARCHIVE_MONTHS);

  const candidates = useMemo(() => {
    return jobCards.filter(c => 
      c.status === 'Closed' && 
      new Date(c.dateRaised) < policyDate
    ).sort((a, b) => new Date(a.dateRaised).getTime() - new Date(b.dateRaised).getTime());
  }, [jobCards, policyDate]);

  // Mocking archived data (locally)
  const archivedRecords = useMemo(() => {
    // In a real system, this would come from a separate /archive endpoint
    return jobCards.filter(c => c.status === 'Closed' && new Date(c.dateRaised).getFullYear() < 2024);
  }, [jobCards]);

  const filteredCurrent = candidates.filter(c => 
    c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plantDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArchived = archivedRecords.filter(c => 
    c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plantDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 10, padding: '6px 8px', display: 'inline-flex' }}>
              <Archive size={22} color="#6366f1" />
            </span>
            Archive Management
          </h1>
          <p className={styles['text-muted']}>Manage long-term storage and historical compliance records.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ gap: 6, fontSize: 13 }}><Download size={14} /> Export All Historical Data</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Tabs & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { id: 'current', label: 'Candidates for Archival', count: candidates.length },
                { id: 'archived', label: 'Archived Cold Storage', count: archivedRecords.length }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id as 'current' | 'archived')}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 10, 
                    fontSize: 13, 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    background: activeTab === t.id ? '#4f46e5' : 'rgba(255,255,255,0.03)',
                    color: activeTab === t.id ? '#fff' : '#64748b',
                    border: `1px solid ${activeTab === t.id ? '#4f46e5' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {t.label} <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 4 }}>{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input" 
                style={{ paddingLeft: 30, fontSize: 12, height: 36 }}
              />
            </div>
          </div>

          {/* Records Table Area */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, minHeight: 400 }}>
             {activeTab === 'current' ? (
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: '#94a3b8' }}>
                    <ShieldAlert size={16} color="#f59e0b" />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>The following records are older than {ARCHIVE_MONTHS} months and are ready to be moved to cold storage.</span>
                  </div>

                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Job Card #</th>
                          <th>Plant</th>
                          <th>Completed Date</th>
                          <th>Artisan</th>
                          <th>Department</th>
                          <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCurrent.map(c => (
                          <tr key={c.id}>
                            <td><span className={styles.ticketNumber}>{c.ticketNumber}</span></td>
                            <td><div style={{ fontSize: 12, color: '#e2e8f0' }}>{c.plantDescription}</div></td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>{c.dateFinished}</td>
                            <td style={{ fontSize: 12, color: '#94a3b8' }}>{c.issuedTo}</td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>Maintenance</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 5 }}>
                                <Archive size={12} color="#f59e0b" /> Move to Archive
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredCurrent.length > 0 && (
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                      <button className="btn btn-primary" style={{ gap: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                         Move {filteredCurrent.length} Items to Archive Cold Storage <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
               </div>
             ) : (
               <div>
                 <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Archive ID</th>
                          <th>Job Card #</th>
                          <th>Plant</th>
                          <th>Closed Date</th>
                          <th>Archived Date</th>
                          <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredArchived.map(c => (
                          <tr key={c.id}>
                            <td style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>ARC-{c.id.slice(0, 8).toUpperCase()}</td>
                            <td><span className={styles.ticketNumber}>{c.ticketNumber}</span></td>
                            <td><div style={{ fontSize: 12, color: '#94a3b8' }}>{c.plantDescription}</div></td>
                            <td style={{ fontSize: 11, color: '#64748b' }}>{c.dateFinished}</td>
                            <td style={{ fontSize: 11, color: '#10b981' }}>2025-01-10</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                                <Database size={12} /> Retrieve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* Global Archive Stats Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Database size={16} color="#6366f1" />
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Storage Statistics</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Record Density</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{jobCards.length} <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Items</span></div>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                     <span style={{ fontSize: 11, color: '#94a3b8' }}>Active (Read/Write)</span>
                     <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{jobCards.length - archivedRecords.length}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                     <span style={{ fontSize: 11, color: '#94a3b8' }}>Cold (Archived)</span>
                     <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{archivedRecords.length}</span>
                   </div>
                   <div style={{ height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', display: 'flex' }}>
                     <div style={{ width: '70%', background: '#4f46e5', height: '100%' }} />
                     <div style={{ width: '30%', background: '#10b981', height: '100%' }} />
                   </div>
                </div>
              </div>
           </div>

           <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <ShieldAlert size={16} color="#475569" />
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Policy Info</h3>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                 Records older than 24 months are automatically flagged for archival. Archived records are Immutable and stored for 7 years for compliance.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
