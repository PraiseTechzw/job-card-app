import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  minHeightClassName?: string;
}

export default function DashboardSection({
  title,
  description,
  children,
  rightSlot,
  minHeightClassName = 'min-h-[240px]',
}: DashboardSectionProps) {
  return (
    <section className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">{title}</h3>
          {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
        </div>
        {rightSlot}
      </div>
      <div className={minHeightClassName}>{children}</div>
    </section>
  );
}
