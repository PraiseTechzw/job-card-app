import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

type MetricState = 'loading' | 'no_data' | 'error' | 'ready';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  state: MetricState;
  helperText?: string;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  state,
  helperText,
}: MetricCardProps) {
  const isMuted = state === 'no_data' || state === 'loading';
  return (
    <article className="min-h-[126px] rounded-2xl border border-white/8 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className="rounded-lg border border-white/10 bg-slate-800/70 p-2 text-slate-300">
          {state === 'error' ? <AlertCircle size={16} /> : <Icon size={16} />}
        </span>
      </div>

      {state === 'loading' ? (
        <div className="space-y-2">
          <div className="h-8 w-20 animate-pulse rounded bg-slate-700/40" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-700/30" />
        </div>
      ) : (
        <div>
          <p className={`text-3xl font-semibold tracking-tight ${isMuted ? 'text-slate-500' : 'text-white'}`}>{value}</p>
          {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
        </div>
      )}
    </article>
  );
}
