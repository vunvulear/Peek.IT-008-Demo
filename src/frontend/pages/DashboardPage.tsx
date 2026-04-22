import { useState, useEffect, useCallback } from 'react';
import type { Incident, Status, Severity } from '../lib/types';
import { getIncidents } from '../lib/api';
import { IncidentTable } from '../components/IncidentTable';
import { IncidentForm } from '../components/IncidentForm';

const ALL_STATUSES: Status[] = ['Open', 'Investigating', 'Resolved', 'Closed'];
const ALL_SEVERITIES: Severity[] = ['P1', 'P2', 'P3', 'P4'];

export function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getIncidents({
        status: statusFilter.length > 0 ? statusFilter : undefined,
        severity: severityFilter.length > 0 ? severityFilter : undefined,
        sort: 'updated_at',
      });
      setIncidents(result.incidents);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  function toggleFilter(current: string[], value: string): string[] {
    return current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Incidents</h2>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + New Incident
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report New Incident</h3>
          <IncidentForm
            onCreated={() => {
              setShowCreateForm(false);
              fetchIncidents();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-start">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Status</span>
          <div className="flex gap-1">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(toggleFilter(statusFilter, s))}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  statusFilter.includes(s)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Severity</span>
          <div className="flex gap-1">
            {ALL_SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(toggleFilter(severityFilter, s))}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  severityFilter.includes(s)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {(statusFilter.length > 0 || severityFilter.length > 0) && (
          <button
            onClick={() => { setStatusFilter([]); setSeverityFilter([]); }}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-5"
          >
            Clear filters
          </button>
        )}
      </div>

      <IncidentTable incidents={incidents} loading={loading} />
    </div>
  );
}
