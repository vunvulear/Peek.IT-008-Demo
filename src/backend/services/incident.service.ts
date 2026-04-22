import { getDb, saveDb } from '../db/connection.js';

export interface IncidentRow {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  owner_id: number | null;
  owner_name: string | null;
  affected_service: string;
  created_by: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export function formatIncidentId(id: number): string {
  return `INC-${String(id).padStart(3, '0')}`;
}

export interface CreateIncidentInput {
  title: string;
  description?: string;
  severity: string;
  affected_service: string;
  created_by: number;
}

export interface UpdateIncidentInput {
  status?: string;
  severity?: string;
  owner_id?: number;
}

const VALID_SEVERITIES = ['P1', 'P2', 'P3', 'P4'];
const VALID_STATUSES = ['Open', 'Investigating', 'Resolved', 'Closed'];

export function validateCreateInput(input: CreateIncidentInput): string[] {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (input.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  if (input.description && input.description.length > 10000) {
    errors.push('Description must be 10,000 characters or less');
  }

  if (!input.severity || !VALID_SEVERITIES.includes(input.severity)) {
    errors.push('Severity must be one of: P1, P2, P3, P4');
  }

  if (!input.affected_service || input.affected_service.trim().length === 0) {
    errors.push('Affected service is required');
  } else if (input.affected_service.length > 200) {
    errors.push('Affected service must be 200 characters or less');
  }

  return errors;
}

export function validateUpdateInput(input: UpdateIncidentInput): string[] {
  const errors: string[] = [];

  if (input.status !== undefined && !VALID_STATUSES.includes(input.status)) {
    errors.push('Status must be one of: Open, Investigating, Resolved, Closed');
  }

  if (input.severity !== undefined && !VALID_SEVERITIES.includes(input.severity)) {
    errors.push('Severity must be one of: P1, P2, P3, P4');
  }

  return errors;
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentRow> {
  const db = await getDb();

  db.run(
    `INSERT INTO incidents (title, description, severity, status, affected_service, created_by)
     VALUES (?, ?, ?, 'Open', ?, ?)`,
    [input.title.trim(), input.description?.trim() || null, input.severity, input.affected_service.trim(), input.created_by]
  );

  const idResult = db.exec('SELECT last_insert_rowid()');
  const incidentId = idResult[0].values[0][0] as number;

  // Auto-create "created" timeline entry
  db.run(
    `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
     VALUES (?, ?, 'created', ?)`,
    [incidentId, input.created_by, `Incident created with severity ${input.severity}`]
  );

  saveDb();

  return getIncidentById(incidentId) as Promise<IncidentRow>;
}

export async function getIncidentById(id: number): Promise<IncidentRow | null> {
  const db = await getDb();

  const result = db.exec(
    `SELECT i.id, i.title, i.description, i.severity, i.status, i.owner_id,
            o.display_name as owner_name, i.affected_service, i.created_by,
            c.display_name as creator_name, i.created_at, i.updated_at
     FROM incidents i
     LEFT JOIN users o ON i.owner_id = o.id
     LEFT JOIN users c ON i.created_by = c.id
     WHERE i.id = ?`,
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) return null;

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    title: row[1] as string,
    description: row[2] as string | null,
    severity: row[3] as string,
    status: row[4] as string,
    owner_id: row[5] as number | null,
    owner_name: row[6] as string | null,
    affected_service: row[7] as string,
    created_by: row[8] as number,
    creator_name: row[9] as string,
    created_at: row[10] as string,
    updated_at: row[11] as string,
  };
}

export async function updateIncident(
  id: number,
  input: UpdateIncidentInput,
  actorId: number
): Promise<IncidentRow | null> {
  const db = await getDb();

  const existing = await getIncidentById(id);
  if (!existing) return null;

  // Validate owner exists if provided
  if (input.owner_id !== undefined) {
    const userResult = db.exec('SELECT id FROM users WHERE id = ?', [input.owner_id]);
    if (userResult.length === 0 || userResult[0].values.length === 0) {
      throw new Error('Owner not found');
    }
  }

  // P1 → Investigating requires an owner
  if (
    input.status === 'Investigating' &&
    existing.severity === 'P1' &&
    existing.owner_id === null &&
    input.owner_id === undefined
  ) {
    throw new Error('P1 incidents require an assigned owner before moving to Investigating');
  }

  // Track changes for timeline
  const changes: { type: string; content: string }[] = [];

  if (input.status !== undefined && input.status !== existing.status) {
    db.run('UPDATE incidents SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', [input.status, id]);
    changes.push({
      type: 'status_change',
      content: `Status changed from ${existing.status} to ${input.status}`,
    });
  }

  if (input.severity !== undefined && input.severity !== existing.severity) {
    db.run('UPDATE incidents SET severity = ?, updated_at = datetime(\'now\') WHERE id = ?', [input.severity, id]);
    changes.push({
      type: 'severity_change',
      content: `Severity changed from ${existing.severity} to ${input.severity}`,
    });
  }

  if (input.owner_id !== undefined && input.owner_id !== existing.owner_id) {
    db.run('UPDATE incidents SET owner_id = ?, updated_at = datetime(\'now\') WHERE id = ?', [input.owner_id, id]);
    const ownerResult = db.exec('SELECT display_name FROM users WHERE id = ?', [input.owner_id]);
    const ownerName = ownerResult[0]?.values[0]?.[0] as string || 'Unknown';
    changes.push({
      type: 'assignment',
      content: `Assigned to ${ownerName}`,
    });
  }

  // Create timeline entries for each change
  for (const change of changes) {
    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
       VALUES (?, ?, ?, ?)`,
      [id, actorId, change.type, change.content]
    );
  }

  if (changes.length > 0) {
    saveDb();
  }

  return getIncidentById(id);
}

export interface ListIncidentsOptions {
  status?: string[];
  severity?: string[];
  sort?: string;
  limit?: number;
  offset?: number;
}

export async function listIncidents(options: ListIncidentsOptions = {}): Promise<{
  incidents: (IncidentRow & { incident_id: string })[];
  total: number;
}> {
  const db = await getDb();

  let where = 'WHERE 1=1';
  const params: (string | number)[] = [];

  if (options.status && options.status.length > 0) {
    const placeholders = options.status.map(() => '?').join(',');
    where += ` AND i.status IN (${placeholders})`;
    params.push(...options.status);
  }

  if (options.severity && options.severity.length > 0) {
    const placeholders = options.severity.map(() => '?').join(',');
    where += ` AND i.severity IN (${placeholders})`;
    params.push(...options.severity);
  }

  const timeSort = options.sort === 'created_at' ? 'i.created_at DESC' : 'i.updated_at DESC';
  const orderBy = `CASE WHEN i.severity = 'P1' THEN 0 ELSE 1 END, ${timeSort}`;
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  // Get total count
  const countResult = db.exec(
    `SELECT COUNT(*) FROM incidents i ${where}`,
    params
  );
  const total = (countResult[0]?.values[0]?.[0] as number) || 0;

  // Get paginated results
  const result = db.exec(
    `SELECT i.id, i.title, i.description, i.severity, i.status, i.owner_id,
            o.display_name as owner_name, i.affected_service, i.created_by,
            c.display_name as creator_name, i.created_at, i.updated_at
     FROM incidents i
     LEFT JOIN users o ON i.owner_id = o.id
     LEFT JOIN users c ON i.created_by = c.id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  if (result.length === 0) {
    return { incidents: [], total };
  }

  const incidents = result[0].values.map((row) => ({
    id: row[0] as number,
    incident_id: formatIncidentId(row[0] as number),
    title: row[1] as string,
    description: row[2] as string | null,
    severity: row[3] as string,
    status: row[4] as string,
    owner_id: row[5] as number | null,
    owner_name: row[6] as string | null,
    affected_service: row[7] as string,
    created_by: row[8] as number,
    creator_name: row[9] as string,
    created_at: row[10] as string,
    updated_at: row[11] as string,
  }));

  return { incidents, total };
}
