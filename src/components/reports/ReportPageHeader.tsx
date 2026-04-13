import type { ReactNode } from 'react';

interface ReportPageHeaderProps {
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  actions?: ReactNode;
}

export default function ReportPageHeader({
  title,
  subtitle,
  lastUpdatedLabel,
  actions,
}: ReportPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-7 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
        <p className="max-w-2xl text-sm text-slate-400">{subtitle}</p>
        <p className="text-xs text-slate-500">{lastUpdatedLabel}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
