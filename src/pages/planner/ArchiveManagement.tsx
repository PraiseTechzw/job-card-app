import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Archive,
  Search,
  Database,
  Download,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

interface ArchiveRecord {
  id: string;
  ticketNumber: string;
  plantDescription: string;
  status: string;
  issuedTo?: string;
  dateRaised?: string;
  dateFinished?: string;
  closedByDate?: string;
  archivedAt?: string | null;
  archivedBy?: string | null;
  archiveReason?: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-ZW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ArchiveManagement() {
  const { jobCards } = useJobCards();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'archived'>('current');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [retentionMonths, setRetentionMonths] = useState(24);
  const [candidateRecords, setCandidateRecords] = useState<ArchiveRecord[]>([]);
  const [archivedRecords, setArchivedRecords] = useState<ArchiveRecord[]>([]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const [candidateRes, archivedRes] = await Promise.all([
        axios.get('/api/archive/records', { params: { status: 'candidates' } }),
        axios.get('/api/archive/records', { params: { status: 'archived' } }),
      ]);
      setCandidateRecords(candidateRes.data?.items || []);
      setArchivedRecords(archivedRes.data?.items || []);
      setRetentionMonths(candidateRes.data?.retentionMonths || archivedRes.data?.retentionMonths || 24);
    } catch (error) {
      console.error('Failed to fetch archive records', error);
      toast.error('Failed to load archive records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCurrent = useMemo(() => {
    return candidateRecords.filter((record) => {
      if (!normalizedSearch) return true;
      return (
        record.ticketNumber?.toLowerCase().includes(normalizedSearch) ||
        record.plantDescription?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [candidateRecords, normalizedSearch]);

  const filteredArchived = useMemo(() => {
    return archivedRecords.filter((record) => {
      if (!normalizedSearch) return true;
      return (
        record.ticketNumber?.toLowerCase().includes(normalizedSearch) ||
        record.plantDescription?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [archivedRecords, normalizedSearch]);

  const handleArchive = async (id: string) => {
    const reason = window.prompt('Archive reason', 'Manual archive');
    if (reason === null) return;

    try {
      await axios.post(`/api/archive/jobs/${id}`, { reason: reason.trim() || 'Manual archive' });
      toast.success('Job card archived.');
      await loadRecords();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to archive record.');
    }
  };

  const handleArchiveAll = async () => {
    if (!filteredCurrent.length) return;
    const confirmed = window.confirm(`Archive ${filteredCurrent.length} eligible records now?`);
    if (!confirmed) return;

    try {
      await Promise.all(
        filteredCurrent.map((record) =>
          axios.post(`/api/archive/jobs/${record.id}`, { reason: 'Bulk archive from planner archive management' })
        )
      );
      toast.success(`${filteredCurrent.length} records archived.`);
      await loadRecords();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Bulk archive failed.');
    }
  };

  const handleRetrieve = async (id: string) => {
    try {
      await axios.post(`/api/archive/jobs/${id}/retrieve`);
      toast.success('Archived job restored.');
      await loadRecords();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to retrieve archive record.');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get('/api/archive/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'archived-job-cards.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archive export downloaded.');
    } catch (error) {
      console.error('Failed to export archive records', error);
      toast.error('Failed to export archive records.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeCount = jobCards.filter((card: any) => !card.archivedAt).length;
  const coldCount = archivedRecords.length;
  const totalCount = activeCount + coldCount;
  const coldWidth = totalCount > 0 ? `${Math.round((coldCount / totalCount) * 100)}%` : '0%';
  const activeWidth = totalCount > 0 ? `${Math.max(0, 100 - Math.round((coldCount / totalCount) * 100))}%` : '100%';

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
          <p className={styles['text-muted']}>Manage live archive candidates, cold storage retrieval, and retention exports.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ gap: 6, fontSize: 13 }} onClick={loadRecords} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-ghost" style={{ gap: 6, fontSize: 13 }} onClick={handleExport} disabled={isExporting}>
            <Download size={14} /> {isExporting ? 'Exporting...' : 'Export Archived Data'}
          </button>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'current', label: 'Candidates for Archival', count: candidateRecords.length },
                { id: 'archived', label: 'Archived Cold Storage', count: archivedRecords.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'current' | 'archived')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeTab === tab.id ? '#4f46e5' : 'rgba(255,255,255,0.03)',
                    color: activeTab === tab.id ? '#fff' : '#64748b',
                    border: `1px solid ${activeTab === tab.id ? '#4f46e5' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {tab.label}
                  <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.2)', padding: '1px 6px', borderRadius: 4 }}>{tab.count}</span>
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
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

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, minHeight: 400 }}>
            {isLoading ? (
              <div className="empty-state">
                <RefreshCw size={42} className="animate-spin" />
                <p>Loading archive records...</p>
              </div>
            ) : activeTab === 'current' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 20, color: '#94a3b8', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldAlert size={16} color="#f59e0b" />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      The following closed records are older than {retentionMonths} months and are ready for cold storage.
                    </span>
                  </div>
                  {filteredCurrent.length > 0 && (
                    <button className="btn btn-primary" style={{ gap: 8 }} onClick={handleArchiveAll}>
                      Move {filteredCurrent.length} Items to Archive <ArrowRight size={16} />
                    </button>
                  )}
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Job Card #</th>
                        <th>Plant</th>
                        <th>Closed Date</th>
                        <th>Artisan</th>
                        <th>Status</th>
                        <th style={{ width: 160, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCurrent.map((record) => (
                        <tr key={record.id}>
                          <td><span className={styles.ticketNumber}>{record.ticketNumber}</span></td>
                          <td><div style={{ fontSize: 12, color: '#e2e8f0' }}>{record.plantDescription || 'N/A'}</div></td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>{formatDate(record.closedByDate || record.dateFinished || record.dateRaised)}</td>
                          <td style={{ fontSize: 12, color: '#94a3b8' }}>{record.issuedTo || 'Unassigned'}</td>
                          <td style={{ fontSize: 12, color: '#cbd5e1' }}>{record.status}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 5 }} onClick={() => handleArchive(record.id)}>
                              <Archive size={12} color="#f59e0b" /> Move to Archive
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCurrent.length === 0 && (
                  <div className="empty-state">
                    <Archive size={42} className="empty-state-icon" />
                    <p>No archive candidates match the current filter.</p>
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
                        <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchived.map((record) => (
                        <tr key={record.id}>
                          <td style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>ARC-{record.id.slice(0, 8).toUpperCase()}</td>
                          <td><span className={styles.ticketNumber}>{record.ticketNumber}</span></td>
                          <td><div style={{ fontSize: 12, color: '#94a3b8' }}>{record.plantDescription || 'N/A'}</div></td>
                          <td style={{ fontSize: 11, color: '#64748b' }}>{formatDate(record.closedByDate || record.dateFinished || record.dateRaised)}</td>
                          <td style={{ fontSize: 11, color: '#10b981' }}>{formatDate(record.archivedAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 6 }} onClick={() => handleRetrieve(record.id)}>
                              <RotateCcw size={12} /> Retrieve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredArchived.length === 0 && (
                  <div className="empty-state">
                    <Database size={42} className="empty-state-icon" />
                    <p>No archived records match the current filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.asideColumn}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Database size={16} color="#6366f1" />
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Storage Statistics</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Record Density</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>
                  {totalCount} <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Items</span>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Active (Read/Write)</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{activeCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Cold (Archived)</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{coldCount}</span>
                </div>
                <div style={{ height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: activeWidth, background: '#4f46e5', height: '100%' }} />
                  <div style={{ width: coldWidth, background: '#10b981', height: '100%' }} />
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
              Closed records older than {retentionMonths} months are eligible for archival. Archived records stay queryable, exportable, and retrievable for compliance review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
