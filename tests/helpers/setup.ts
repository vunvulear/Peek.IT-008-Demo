import initSqlJs from 'sql.js';
import { initializeSchema } from '../../src/backend/db/schema.js';

/**
 * Creates a fresh in-memory SQLite database for testing.
 * Seeds 3 test users: alice (1), bob (2), carol (3).
 */
export async function createTestDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  initializeSchema(db);

  db.run("INSERT INTO users (username, display_name) VALUES ('alice', 'Alice Johnson')");
  db.run("INSERT INTO users (username, display_name) VALUES ('bob', 'Bob Smith')");
  db.run("INSERT INTO users (username, display_name) VALUES ('carol', 'Carol Williams')");

  return db;
}
