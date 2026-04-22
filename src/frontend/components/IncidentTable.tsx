import { useNavigate } from 'react-router-dom';
import type { Incident } from '../lib/types';
import { SeverityBadge, StatusBadge } from './StatusBadge';

interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
}

export function IncidentTable({ incidents, loading }: IncidentTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        Loading incidents...
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No incidents found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm font-mono text-gray-600">{inc.incident_id}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{inc.title}</td>
              <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
              <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-600">{inc.owner_name || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{inc.affected_service}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{new Date(inc.updated_at + 'Z').toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
