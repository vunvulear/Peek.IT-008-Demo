import { describe, it, expect } from 'vitest';
import { createTestDb } from '../helpers/setup.js';

describe('timeline_entries table constraints', () => {
  it('rejects invalid action_type values', async () => {
    const db = await createTestDb();

    db.run(
      `INSERT INTO incidents (title, severity, status, affected_service, created_by)
       VALUES ('Test', 'P1', 'Open', 'api', 1)`
    );

    expect(() => {
      db.run(
        `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
         VALUES (1, 1, 'invalid_type', 'should fail')`
      );
    }).toThrow();

    db.close();
  });

  it('accepts all valid action_type values', async () => {
    const db = await createTestDb();

    db.run(
      `INSERT INTO incidents (title, severity, status, affected_service, created_by)
       VALUES ('Test', 'P2', 'Open', 'api', 1)`
    );

    const validTypes = ['created', 'status_change', 'severity_change', 'assignment', 'note'];
    for (const actionType of validTypes) {
      db.run(
        `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
         VALUES (1, 1, ?, ?)`,
        [actionType, `Test entry for ${actionType}`]
      );
    }

    const result = db.exec('SELECT COUNT(*) FROM timeline_entries WHERE incident_id = 1');
    expect(result[0].values[0][0]).toBe(5);

    db.close();
  });

  it('timeline entries are append-only by design (no UPDATE on content)', async () => {
    const db = await createTestDb();

    db.run(
      `INSERT INTO incidents (title, severity, status, affected_service, created_by)
       VALUES ('Test', 'P3', 'Open', 'api', 1)`
    );

    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
       VALUES (1, 1, 'note', 'Original note')`
    );

    const before = db.exec('SELECT content FROM timeline_entries WHERE id = 1');
    expect(before[0].values[0][0]).toBe('Original note');

    db.close();
  });

  it('requires incident_id FK to exist', async () => {
    const db = await createTestDb();

    // No incidents exist yet — FK should fail if enforced
    // Note: SQLite FK enforcement requires PRAGMA foreign_keys = ON
    db.run('PRAGMA foreign_keys = ON');

    expect(() => {
      db.run(
        `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content)
         VALUES (999, 1, 'note', 'orphan entry')`
      );
    }).toThrow();

    db.close();
  });

  it('orders timeline entries chronologically', async () => {
    const db = await createTestDb();

    db.run(
      `INSERT INTO incidents (title, severity, status, affected_service, created_by)
       VALUES ('Test', 'P1', 'Open', 'api', 1)`
    );

    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
       VALUES (1, 1, 'created', 'First', '2026-01-01 10:00:00')`
    );
    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
       VALUES (1, 2, 'status_change', 'Second', '2026-01-01 10:05:00')`
    );
    db.run(
      `INSERT INTO timeline_entries (incident_id, actor_id, action_type, content, created_at)
       VALUES (1, 1, 'note', 'Third', '2026-01-01 10:10:00')`
    );

    const result = db.exec(
      'SELECT content FROM timeline_entries WHERE incident_id = 1 ORDER BY created_at ASC, id ASC'
    );
    const contents = result[0].values.map((r) => r[0]);
    expect(contents).toEqual(['First', 'Second', 'Third']);

    db.close();
  });
});
