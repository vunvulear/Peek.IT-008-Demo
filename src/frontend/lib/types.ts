export type Severity = 'P1' | 'P2' | 'P3' | 'P4';
export type Status = 'Open' | 'Investigating' | 'Resolved' | 'Closed';
export type ActionType = 'created' | 'status_change' | 'severity_change' | 'assignment' | 'note';

export interface User {
  id: number;
  username: string;
  display_name: string;
}

export interface Incident {
  id: number;
  incident_id: string; // INC-001 formatted
  title: string;
  description: string | null;
  severity: Severity;
  status: Status;
  owner_id: number | null;
  owner_name: string | null;
  affected_service: string;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  id: number;
  incident_id: number;
  actor_id: number;
  actor_name: string;
  action_type: ActionType;
  content: string;
  created_at: string;
}

export interface CreateIncidentRequest {
  title: string;
  description?: string;
  severity: Severity;
  affected_service: string;
}

export interface UpdateIncidentRequest {
  status?: Status;
  severity?: Severity;
  owner_id?: number;
}

export interface AddTimelineNoteRequest {
  content: string;
}

export interface LoginRequest {
  username: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}
