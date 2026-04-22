import { getDb, saveDb } from '../db/connection.js';

export interface TimelineEntryRow {
  id: number;
  incident_id: number;
  actor_id: number;
  actor_name: string;
  action_type: string;
  content: string;
  created_at: string;
}

export async function addNote(incidentId: number, actorId: number, content: string): Promise<TimelineEntryRow> {
  const db = await getDb();

  // Verify incident exists
  const incidentResult = db.exec('SELECT id FROM incidents WHERE id = ?', [incidentId]);
  if (incidentResult.length === 0 || incidentResult[0].values.length === 0) {
    throw new Error('Incident not found');
  }

  db.run(
    `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
     VALUES (?, ?, 'note', ?)`,
    [incidentId, actorId, content.trim()]
  );

  // Update incident's updated_at
  db.run('UPDATE incidents SET updated_at = datetime(\'now\') WHERE id = ?', [incidentId]);

  saveDb();

  const idResult = db.exec('SELECT last_insert_rowid()');
  const entryId = idResult[0].values[0][0] as number;

  const entries = await getTimelineEntries(incidentId);
  return entries.find((e) => e.id === entryId)!;
}

export async function getTimelineEntries(incidentId: number): Promise<TimelineEntryRow[]> {
  const db = await getDb();

  const result = db.exec(
    `SELECT t.id, t.incident_id, t.actor_id, u.display_name as actor_name,
            t.action_type, t.content, t.created_at
     FROM timeline_entries t
     LEFT JOIN users u ON t.actor_id = u.id
     WHERE t.incident_id = ?
     ORDER BY t.created_at ASC, t.id ASC`,
    [incidentId]
  );

  if (result.length === 0) return [];

  return result[0].values.map((row) => ({
    id: row[0] as number,
    incident_id: row[1] as number,
    actor_id: row[2] as number,
    actor_name: row[3] as string,
    action_type: row[4] as string,
    content: row[5] as string,
    created_at: row[6] as string,
  }));
}
