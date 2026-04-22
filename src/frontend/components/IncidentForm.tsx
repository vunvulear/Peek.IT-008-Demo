import { useState } from 'react';
import type { Severity, CreateIncidentRequest } from '../lib/types';
import { createIncident, ApiResponseError } from '../lib/api';

interface IncidentFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'P1', label: 'P1 — Critical' },
  { value: 'P2', label: 'P2 — High' },
  { value: 'P3', label: 'P3 — Medium' },
  { value: 'P4', label: 'P4 — Low' },
];

export function IncidentForm({ onCreated, onCancel }: IncidentFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('P3');
  const [affectedService, setAffectedService] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationErrors([]);
    setIsSubmitting(true);

    const payload: CreateIncidentRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      severity,
      affected_service: affectedService.trim(),
    };

    try {
      await createIncident(payload);
      onCreated();
    } catch (err) {
      if (err instanceof ApiResponseError && err.details) {
        setValidationErrors(err.details);
      } else if (err instanceof Error) {
        setValidationErrors([err.message]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          {validationErrors.map((msg, idx) => (
            <p key={idx} className="text-sm text-red-700">{msg}</p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor="incident-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="incident-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Brief incident summary"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">{title.length}/200</span>
      </div>

      <div>
        <label htmlFor="incident-desc" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="incident-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={10000}
          rows={4}
          placeholder="Detailed description of what is happening..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="incident-severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity <span className="text-red-500">*</span>
          </label>
          <select
            id="incident-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="incident-service" className="block text-sm font-medium text-gray-700 mb-1">
            Affected Service <span className="text-red-500">*</span>
          </label>
          <input
            id="incident-service"
            type="text"
            value={affectedService}
            onChange={(e) => setAffectedService(e.target.value)}
            placeholder="e.g., api-gateway"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Report Incident'}
        </button>
      </div>
    </form>
  );
}
