import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Package,
  Share2,
  TrendingUp,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useJobCards } from '../../context/JobCardContext';
import type { JobCard } from '../../types';
import styles from '../JobCards.module.css';
import DashboardSection from '../../components/reports/DashboardSection';
import EmptyState from '../../components/reports/EmptyState';
import FilterToolbar, { type ReportFilters } from '../../components/reports/FilterToolbar';
import MetricCard from '../../components/reports/MetricCard';
import ReportPageHeader from '../../components/reports/ReportPageHeader';
import reportStyles from './SupervisorReports.module.css';

const emptyFilters: ReportFilters = {
  dateFrom: '',
  dateTo: '',
  plant: '',
  artisan: '',
  status: '',
};

const dateOnly = (value: string | undefined) => (value ? new Date(`${value}T00:00:00`) : null);
const todayOnly = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
const normalize = (value?: string) => (value || '').trim().toLowerCase();

const calculateAvgCompletionDays = (cards: JobCard[]): string | null => {
  const completed = cards.filter((card) => card.dateFinished && card.dateRaised);
  if (!completed.length) return null;
  const avgDays = completed.reduce((sum, card) => {
    const durationMs = new Date(card.dateFinished!).getTime() - new Date(card.dateRaised).getTime();
    return sum + durationMs / 86400000;
  }, 0) / completed.length;
  return `${Math.round(avgDays * 10) / 10}d`;
};

export default function SupervisorReports() {
  const navigate = useNavigate();
  const { jobCards, isLoading, error } = useJobCards();

  const [draftFilters, setDraftFilters] = useState<ReportFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(emptyFilters);
  const [lastUpdated] = useState(() => new Date());

  const hasAppliedFilters = useMemo(
    () => Object.values(appliedFilters).some((value) => String(value).trim().length > 0),
    [appliedFilters]
  );

  const filteredCards = useMemo(() => {
    let cards = [...jobCards];
    const from = dateOnly(appliedFilters.dateFrom);
    const to = dateOnly(appliedFilters.dateTo);
    const plant = normalize(appliedFilters.plant);
    const artisan = normalize(appliedFilters.artisan);
    const status = appliedFilters.status;

    if (from) {
      cards = cards.filter((card) => {
        const raised = dateOnly(card.dateRaised);
        return Boolean(raised && raised >= from);
      });
    }
    if (to) {
      cards = cards.filter((card) => {
        const raised = dateOnly(card.dateRaised);
        return Boolean(raised && raised <= to);
      });
    }
    if (plant) {
      cards = cards.filter((card) => {
        const plantDescription = normalize(card.plantDescription);
        const plantNumber = normalize(card.plantNumber);
        return plantDescription.includes(plant) || plantNumber.includes(plant);
      });
    }
    if (artisan) {
      cards = cards.filter((card) => normalize(card.issuedTo).includes(artisan));
    }
    if (status) {
      cards = cards.filter((card) => card.status === status);
    }
    return cards;
  }, [jobCards, appliedFilters]);

  const dataState = isLoading ? 'loading' : error ? 'error' : filteredCards.length === 0 ? 'no_data' : 'ready';

  const closedCards = filteredCards.filter((card) => card.status === 'Closed' || card.status === 'SignedOff');
  const openCards = filteredCards.filter((card) => !['Closed', 'Rejected', 'SignedOff'].includes(card.status));
  const overdueCards = filteredCards.filter((card) => {
    if (!card.requiredCompletionDate) return false;
    const due = dateOnly(card.requiredCompletionDate);
    return Boolean(due && due < todayOnly() && !['Closed', 'Rejected', 'Awaiting_SignOff', 'SignedOff'].includes(card.status));
  });
  const pendingCards = filteredCards.filter((card) => card.status === 'Pending_Supervisor');
  const awaitingReviewCards = filteredCards.filter((card) => card.status === 'Awaiting_SignOff');
  const avgCompletion = calculateAvgCompletionDays(filteredCards);
  const completionRate = filteredCards.length ? `${Math.round((closedCards.length / filteredCards.length) * 100)}%` : null;

  const priorityCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<string, number>;
    filteredCards.forEach((card) => {
      if (counts[card.priority] !== undefined) counts[card.priority] += 1;
    });
    return counts;
  }, [filteredCards]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCards.forEach((card) => {
      counts[card.status] = (counts[card.status] || 0) + 1;
    });
    return counts;
  }, [filteredCards]);

  const topAssets = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCards.forEach((card) => {
      const key = (card.plantDescription || card.plantNumber || '').trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [filteredCards]);

  const artisanMetrics = useMemo(() => {
    const map: Record<string, { total: number; closed: number; overdue: number }> = {};
    filteredCards.forEach((card) => {
      const key = (card.issuedTo || '').trim();
      if (!key) return;
      if (!map[key]) map[key] = { total: 0, closed: 0, overdue: 0 };
      map[key].total += 1;
      if (card.status === 'Closed' || card.status === 'SignedOff') map[key].closed += 1;
      if (overdueCards.some((overdueCard) => overdueCard.id === card.id)) map[key].overdue += 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b.total - a.total)
      .map(([name, stats]) => ({
        name,
        ...stats,
        slaRate: stats.total ? Math.round((stats.closed / stats.total) * 100) : 0,
      }));
  }, [filteredCards, overdueCards]);

  const applyFilters = () => setAppliedFilters(draftFilters);
  const resetFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const exportAsCsv = () => {
    if (!filteredCards.length) {
      toast.error('No rows to export.');
      return;
    }
    const headers = [
      'Ticket Number',
      'Status',
      'Priority',
      'Plant Number',
      'Plant Description',
      'Issued To',
      'Date Raised',
      'Target Date',
      'Date Finished',
    ];
    const lines = filteredCards.map((card) =>
      [
        card.ticketNumber,
        card.status,
        card.priority,
        card.plantNumber,
        card.plantDescription,
        card.issuedTo || '',
        card.dateRaised,
        card.requiredCompletionDate,
        card.dateFinished || '',
      ]
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(',')
    );
    const csv = `${headers.join(',')}\n${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supervisors-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  const exportAsPdf = () => {
    window.print();
    toast.success('Print dialog opened.');
  };

  const shareReport = async () => {
    const url = window.location.href;
    const payload = {
      title: 'Supervisors Report',
      text: `Operational snapshot: ${filteredCards.length} jobs, ${closedCards.length} completed, ${overdueCards.length} overdue.`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        toast.success('Report shared.');
        return;
      } catch {
        // Fall back to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Report link copied.');
    } catch {
      toast.error('Unable to share this report.');
    }
  };

  const metricCards = [
    { label: 'Total Jobs', value: String(filteredCards.length), icon: BarChart2, helper: undefined },
    { label: 'Completed', value: String(closedCards.length), icon: CheckCircle2, helper: undefined },
    { label: 'Open / Active', value: String(openCards.length), icon: Activity, helper: undefined },
    { label: 'Overdue', value: String(overdueCards.length), icon: AlertTriangle, helper: undefined },
    { label: 'Pending Approval', value: String(pendingCards.length), icon: Clock, helper: undefined },
    { label: 'Awaiting Review', value: String(awaitingReviewCards.length), icon: Clock, helper: undefined },
    { label: 'Avg. Completion', value: avgCompletion ?? 'No data', icon: TrendingUp, helper: avgCompletion ? undefined : 'No completed jobs in selection' },
    { label: 'Completion Rate', value: completionRate ?? 'No data', icon: TrendingUp, helper: completionRate ? undefined : 'Not enough jobs to compute' },
  ] as const;

  const priorityPaletteClass: Record<string, string> = {
    Critical: reportStyles.barFillCritical,
    High: reportStyles.barFillHigh,
    Medium: reportStyles.barFillMedium,
    Low: reportStyles.barFillLow,
  };

  const topAssetMax = topAssets[0]?.[1] || 1;

  return (
    <div className={`${styles.pageContainer} ${reportStyles.page}`}>
      <ReportPageHeader
        title="Supervisors Report"
        subtitle="Operational analytics for workflow health, backlog control, and team performance."
        lastUpdatedLabel={`Last updated ${lastUpdated.toLocaleString()}`}
        actions={
          <>
            <button
              onClick={() => navigate('/supervisor/dashboard')}
              className={reportStyles.actionButton}
            >
              Back
            </button>
            <button
              onClick={exportAsCsv}
              className={reportStyles.actionButton}
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={exportAsPdf}
              className={reportStyles.actionButton}
            >
              <FileText size={14} /> Export PDF
            </button>
            <button
              onClick={shareReport}
              className={`${reportStyles.actionButton} ${reportStyles.actionPrimary}`}
            >
              <Share2 size={14} /> Share
            </button>
          </>
        }
      />

      <FilterToolbar
        value={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        isApplying={isLoading}
      />

      <section className={reportStyles.kpiGrid}>
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            state={dataState}
            helperText={
              dataState === 'error'
                ? 'Metric unavailable'
                : dataState === 'no_data'
                ? hasAppliedFilters
                  ? 'No jobs in current filters'
                  : 'No jobs available'
                : metric.helper
            }
          />
        ))}
      </section>

      {dataState === 'error' ? (
        <EmptyState
          title="Unable to load report data"
          description={error || 'An unexpected error occurred while loading analytics.'}
          compact
        />
      ) : null}

      <section className={reportStyles.groupA}>
        <DashboardSection
          title="Priority Distribution"
          description="Current job load split by urgency level."
          minHeightClassName="min-h-[220px]"
        >
          {dataState !== 'ready' ? (
            <EmptyState
              title={dataState === 'loading' ? 'Loading priority data' : 'No jobs found for the selected filters'}
              description={hasAppliedFilters ? 'Adjust filter criteria to view distribution.' : 'Create or assign jobs to populate this view.'}
              compact
            />
          ) : (
            <div className={reportStyles.bars}>
              {Object.entries(priorityCounts).map(([priority, count]) => {
                const percentage = filteredCards.length ? (count / filteredCards.length) * 100 : 0;
                return (
                  <div key={priority} className={reportStyles.barRow}>
                    <div className={reportStyles.barHead}>
                      <span className={reportStyles.barLabel}>{priority}</span>
                      <span className={reportStyles.barValue}>{count}</span>
                    </div>
                    <div className={reportStyles.barTrack}>
                      <div
                        className={`${reportStyles.barFill} ${priorityPaletteClass[priority]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Workflow Status"
          description="Volume by workflow stage for operational control."
          minHeightClassName="min-h-[220px]"
        >
          {dataState !== 'ready' ? (
            <EmptyState
              title={dataState === 'loading' ? 'Loading workflow data' : 'Select a date range or plant to view workflow trends'}
              description={hasAppliedFilters ? 'No status buckets are available for the selected criteria.' : 'Workflow counts appear once jobs are available.'}
              compact
            />
          ) : (
            <div className={reportStyles.bars}>
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const percentage = filteredCards.length ? (count / filteredCards.length) * 100 : 0;
                  return (
                    <div key={status} className={reportStyles.statusRow}>
                      <span className={reportStyles.statusLabel}>{status.replace(/_/g, ' ')}</span>
                      <div className={reportStyles.barTrack}>
                        <div className={reportStyles.barFill} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className={reportStyles.statusCount}>{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </DashboardSection>
      </section>

      <section className={reportStyles.groupBC}>
        <div>
          <DashboardSection
            title="Top Problem Assets"
            description="Assets with the highest issue frequency in this view."
            minHeightClassName="min-h-[220px]"
          >
            {dataState !== 'ready' || topAssets.length === 0 ? (
              <EmptyState
                title="No asset issues recorded in this period"
                description="Asset issue ranking will appear when records match the selected filters."
                icon={Package}
                compact
              />
            ) : (
              <div className={reportStyles.bars}>
                {topAssets.map(([asset, count]) => (
                  <div key={asset} className={reportStyles.barRow}>
                    <div className={reportStyles.barHead}>
                      <span className={reportStyles.barLabel}>{asset}</span>
                      <span className={reportStyles.barValue}>{count}</span>
                    </div>
                    <div className={reportStyles.barTrack}>
                      <div className={reportStyles.barFillHigh} style={{ width: `${(count / topAssetMax) * 100}%`, height: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div>
          <DashboardSection
            title="Artisan Efficiency Metrics"
            description="Workload, completion volume, and SLA proxy by assignee."
            minHeightClassName="min-h-[220px]"
          >
            {dataState !== 'ready' || artisanMetrics.length === 0 ? (
              <EmptyState
                title="No artisan performance records available for the current selection"
                description="Assign jobs to artisans to generate team-level performance insights."
                icon={User}
                compact
              />
            ) : (
              <div className={reportStyles.tableWrap}>
                <table className={reportStyles.table}>
                  <thead>
                    <tr className={reportStyles.tableHeadRow}>
                      <th className={reportStyles.tableHeadCell}>Artisan</th>
                      <th className={`${reportStyles.tableHeadCell} ${reportStyles.tableHeadCellRight}`}>Volume</th>
                      <th className={`${reportStyles.tableHeadCell} ${reportStyles.tableHeadCellRight}`}>Resolved</th>
                      <th className={`${reportStyles.tableHeadCell} ${reportStyles.tableHeadCellRight}`}>Overdue</th>
                      <th className={`${reportStyles.tableHeadCell} ${reportStyles.tableHeadCellRight}`}>SLA Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisanMetrics.map((entry) => (
                      <tr key={entry.name} className={reportStyles.tableRow}>
                        <td className={reportStyles.tableCell}>{entry.name}</td>
                        <td className={`${reportStyles.tableCell} ${reportStyles.tableCellRight}`}>{entry.total}</td>
                        <td className={`${reportStyles.tableCell} ${reportStyles.tableCellRight}`}>{entry.closed}</td>
                        <td className={`${reportStyles.tableCell} ${reportStyles.tableCellRight}`}>{entry.overdue}</td>
                        <td className={`${reportStyles.tableCell} ${reportStyles.tableCellRight}`}>
                          <span className={reportStyles.slaPill}>
                            {entry.slaRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardSection>
        </div>
      </section>
    </div>
  );
}
