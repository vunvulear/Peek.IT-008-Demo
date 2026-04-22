import type { TimelineEntry, ActionType } from '../lib/types';

const ACTION_ICONS: Record<ActionType, string> = {
  created: '🟢',
  status_change: '🔄',
  assignment: '👤',
  note: '📝',
};

const ACTION_LABELS: Record<ActionType, string> = {
  created: 'Created',
  status_change: 'Status Change',
  assignment: 'Assignment',
  note: 'Note',
};

interface IncidentTimelineProps {
  entries: TimelineEntry[];
  loading: boolean;
}

export function IncidentTimeline({ entries, loading }: IncidentTimelineProps) {
  if (loading) {
    return <div className="text-sm text-gray-400 py-4">Loading timeline...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-sm text-gray-400 py-4">No timeline entries yet.</div>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3 items-start">
          <span className="text-lg mt-0.5" title={ACTION_LABELS[entry.action_type]}>
            {ACTION_ICONS[entry.action_type] || '•'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{entry.actor_name}</span>
              <span className="text-xs text-gray-400 uppercase">{ACTION_LABELS[entry.action_type]}</span>
              <span className="text-xs text-gray-400">
                {new Date(entry.created_at + 'Z').toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{entry.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
