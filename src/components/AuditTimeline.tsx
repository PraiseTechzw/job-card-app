import React from 'react';
import { History, User as UserIcon, Calendar, Info } from 'lucide-react';

interface AuditLog {
  id: string;
  jobCardId: string;
  action: string;
  performedBy: string;
  details: string | object;
  createdAt: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
}

const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-white/5">
        <History size={48} className="mb-4 opacity-20" />
        <p className="italic">No history records found for this Job Card.</p>
      </div>
    );
  }

  const parseDetails = (details: any) => {
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return parsed;
      } catch (e) {
        return details;
      }
    }
    return details;
  };

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-blue-500 before:via-blue-500/50 before:to-transparent">
      {logs.map((log) => {
        const details = parseDetails(log.details);
        const isStatusChange = log.action === 'Status Update';

        return (
          <div key={log.id} className="relative group animate-fade-in">
            {/* Timeline Dot */}
            <div className={`absolute -left-8 mt-1.5 w-6 h-6 rounded-full border-4 border-slate-900 z-10 transition-transform group-hover:scale-125 ${isStatusChange ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-600'}`}>
              {isStatusChange ? <Info size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> : null}
            </div>

            <div className="glass-panel p-5 border-white/5 hover:border-blue-500/30 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isStatusChange ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {log.action}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <UserIcon size={14} className="text-slate-500" />
                    {log.performedBy}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={14} />
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>

              {typeof details === 'object' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400">{details.fromStatus}</span>
                    <span className="text-slate-600">→</span>
                    <span className="px-2 py-0.5 rounded bg-blue-900/30 text-xs text-blue-300 font-bold border border-blue-500/20">{details.toStatus}</span>
                  </div>
                  {details.changedFields && (
                    <div className="text-xs text-slate-500 mt-2">
                      <span className="font-bold">Modified:</span> {details.changedFields.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-300 italic">
                  "{typeof details === 'string' ? details : JSON.stringify(details)}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditTimeline;
