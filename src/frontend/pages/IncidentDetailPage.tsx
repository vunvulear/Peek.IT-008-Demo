import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Incident, TimelineEntry, User, Status, Severity } from '../lib/types';
import { getIncident, getTimeline, getUsers, updateIncident, addTimelineNote, ApiResponseError } from '../lib/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import { DetailSkeleton } from '../components/Skeleton';
import { IncidentTimeline } from '../components/IncidentTimeline';

const STATUSES: Status[] = ['Open', 'Investigating', 'Resolved', 'Closed'];
const SEVERITIES: Severity[] = ['P1', 'P2', 'P3', 'P4'];

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incidentId = parseInt(id || '');

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingIncident, setLoadingIncident] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchIncident = useCallback(async () => {
    if (isNaN(incidentId)) return;
    setLoadingIncident(true);
    try {
      const data = await getIncident(incidentId);
      setIncident(data);
    } catch { /* handled by null check */ }
    finally { setLoadingIncident(false); }
  }, [incidentId]);

  const fetchTimeline = useCallback(async () => {
    if (isNaN(incidentId)) return;
    setLoadingTimeline(true);
    try {
      const data = await getTimeline(incidentId);
      setTimeline(data);
    } catch { /* handled by empty array */ }
    finally { setLoadingTimeline(false); }
  }, [incidentId]);

  useEffect(() => {
    fetchIncident();
    fetchTimeline();
    getUsers().then(setAllUsers).catch(() => {});
  }, [fetchIncident, fetchTimeline]);

  async function handleStatusChange(newStatus: Status) {
    if (!incident) return;
    setUpdateError('');
    try {
      const updated = await updateIncident(incidentId, { status: newStatus });
      setIncident(updated);
      fetchTimeline();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleSeverityChange(newSeverity: Severity) {
    if (!incident) return;
    setUpdateError('');
    try {
      const updated = await updateIncident(incidentId, { severity: newSeverity });
      setIncident(updated);
      fetchTimeline();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleOwnerChange(newOwnerId: number) {
    if (!incident) return;
    setUpdateError('');
    try {
      const updated = await updateIncident(incidentId, { owner_id: newOwnerId });
      setIncident(updated);
      fetchTimeline();
    } catch (err) {
      if (err instanceof ApiResponseError) setUpdateError(err.message);
      else setUpdateError('Assignment failed');
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      await addTimelineNote(incidentId, { content: noteContent.trim() });
      setNoteContent('');
      fetchTimeline();
    } catch { /* silent */ }
    finally { setSubmittingNote(false); }
  }

  if (loadingIncident) {
    return <DetailSkeleton />;
  }

  if (!incident) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 mb-4">Incident not found</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-500">{incident.incident_id}</span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{incident.title}</h2>
        </div>
      </div>

      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{updateError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incident Details + Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Details</h3>

            {incident.description && (
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{incident.description}</p>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500">Affected Service</label>
              <p className="text-sm text-gray-800 mt-0.5">{incident.affected_service}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500">Created By</label>
              <p className="text-sm text-gray-800 mt-0.5">{incident.creator_name}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500">Created At</label>
              <p className="text-sm text-gray-800 mt-0.5">
                {new Date(incident.created_at + 'Z').toLocaleString('en-US', { timeZone: 'UTC' })} UTC
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</h3>

            <div>
              <label htmlFor="detail-status" className="text-xs text-gray-500 block mb-1">Status</label>
              <select
                id="detail-status"
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="detail-severity" className="text-xs text-gray-500 block mb-1">Severity</label>
              <select
                id="detail-severity"
                value={incident.severity}
                onChange={(e) => handleSeverityChange(e.target.value as Severity)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="detail-owner" className="text-xs text-gray-500 block mb-1">Owner</label>
              <select
                id="detail-owner"
                value={incident.owner_id || ''}
                onChange={(e) => handleOwnerChange(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.display_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Timeline</h3>
            <IncidentTimeline entries={timeline} loading={loadingTimeline} />
          </div>

          {/* Add Note Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Add Note</h3>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a resolution note or update..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submittingNote || !noteContent.trim()}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
