import { Database } from 'sql.js';

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK(length(title) <= 200),
  description TEXT CHECK(length(description) <= 10000),
  severity TEXT NOT NULL CHECK(severity IN ('P1','P2','P3','P4')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open','Investigating','Resolved','Closed')),
  owner_id INTEGER REFERENCES users(id),
  affected_service TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timeline_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL REFERENCES incidents(id),
  actor_id INTEGER NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL CHECK(action_type IN ('created','status_change','severity_change','assignment','note')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function initializeSchema(db: Database): void {
  db.run(CREATE_TABLES_SQL);
}
