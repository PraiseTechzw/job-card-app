import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  compact?: boolean;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-dashed border-white/10 bg-slate-950/30 text-center ${
        compact ? 'px-4 py-6' : 'px-6 py-10'
      }`}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/70 text-slate-400">
        <Icon size={18} />
      </div>
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}
