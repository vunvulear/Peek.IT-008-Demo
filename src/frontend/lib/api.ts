import type {
  User,
  Incident,
  TimelineEntry,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  AddTimelineNoteRequest,
} from './types.js';

const BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiResponseError(res.status, body.error || 'Request failed', body.details);
  }

  return res.json();
}

export class ApiResponseError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

// Auth
export const login = (username: string) =>
  request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username }) });

export const logout = () =>
  request<{ message: string }>('/auth/logout', { method: 'POST' });

export const getMe = () =>
  request<User>('/auth/me');

// Users
export const getUsers = () =>
  request<User[]>('/users/users');

// Incidents
export const getIncidents = (params?: {
  status?: string[];
  severity?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) params.status.forEach((s) => searchParams.append('status', s));
  if (params?.severity) params.severity.forEach((s) => searchParams.append('severity', s));
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const qs = searchParams.toString();
  return request<{ incidents: Incident[]; total: number }>(`/incidents${qs ? `?${qs}` : ''}`);
};

export const getIncident = (id: number) =>
  request<Incident>(`/incidents/${id}`);

export const createIncident = (data: CreateIncidentRequest) =>
  request<Incident>('/incidents', { method: 'POST', body: JSON.stringify(data) });

export const updateIncident = (id: number, data: UpdateIncidentRequest) =>
  request<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Timeline
export const getTimeline = (incidentId: number) =>
  request<TimelineEntry[]>(`/incidents/${incidentId}/timeline`);

export const addTimelineNote = (incidentId: number, data: AddTimelineNoteRequest) =>
  request<TimelineEntry>(`/incidents/${incidentId}/timeline`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
