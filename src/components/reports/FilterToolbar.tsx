import type { JobCardStatus } from '../../types';

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  plant: string;
  artisan: string;
  status: '' | JobCardStatus;
}

interface FilterToolbarProps {
  value: ReportFilters;
  onChange: (next: ReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
  isApplying?: boolean;
}

const statusOptions: JobCardStatus[] = [
  'Draft',
  'Pending_Supervisor',
  'Pending_HOD',
  'Approved',
  'Registered',
  'Assigned',
  'InProgress',
  'Awaiting_SignOff',
  'SignedOff',
  'Closed',
  'Rejected',
];

export default function FilterToolbar({
  value,
  onChange,
  onApply,
  onReset,
  isApplying = false,
}: FilterToolbarProps) {
  const setField = <K extends keyof ReportFilters>(field: K, fieldValue: ReportFilters[K]) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <section className="mb-6 rounded-2xl border border-white/8 bg-slate-900/50 p-4 md:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
        <label className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Date From</span>
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => setField('dateFrom', e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/40"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Date To</span>
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => setField('dateTo', e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/40"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Plant / Asset</span>
          <input
            type="text"
            value={value.plant}
            onChange={(e) => setField('plant', e.target.value)}
            placeholder="Plant number or name"
            className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400/40"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Artisan</span>
          <input
            type="text"
            value={value.artisan}
            onChange={(e) => setField('artisan', e.target.value)}
            placeholder="Assignee name"
            className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400/40"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Job Status</span>
          <select
            value={value.status}
            onChange={(e) => setField('status', e.target.value as ReportFilters['status'])}
            className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-blue-400/40"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            onClick={onApply}
            disabled={isApplying}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            Apply
          </button>
          <button
            onClick={onReset}
            disabled={isApplying}
            className="h-10 rounded-lg border border-white/15 bg-slate-800 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
