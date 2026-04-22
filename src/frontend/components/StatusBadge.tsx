import type { Severity, Status } from '../lib/types';

const severityColors: Record<Severity, string> = {
  P1: 'bg-red-100 text-red-800 border-red-200',
  P2: 'bg-orange-100 text-orange-800 border-orange-200',
  P3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  P4: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusColors: Record<Status, string> = {
  Open: 'bg-slate-100 text-slate-800 border-slate-200',
  Investigating: 'bg-amber-100 text-amber-800 border-amber-200',
  Resolved: 'bg-green-100 text-green-800 border-green-200',
  Closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${severityColors[severity]}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[status]}`}>
      {status}
    </span>
  );
}
