import express from 'express';
import cookieSession from 'cookie-session';
import initSqlJs, { Database } from 'sql.js';
import { initializeSchema } from '../../src/backend/db/schema.js';
import { setDb } from '../../src/backend/db/connection.js';
import { requireAuth } from '../../src/backend/middleware/auth.js';
import authRouter from '../../src/backend/routes/auth.js';
import incidentRouter from '../../src/backend/routes/incidents.js';
import timelineRouter from '../../src/backend/routes/timeline.js';

process.env.NODE_ENV = 'test';

let testDb: Database | null = null;

export async function createTestApp() {
  const SQL = await initSqlJs();
  testDb = new SQL.Database();
  initializeSchema(testDb);

  // Seed test users
  testDb.run("INSERT INTO users (username, display_name) VALUES ('alice', 'Alice Johnson')");
  testDb.run("INSERT INTO users (username, display_name) VALUES ('bob', 'Bob Smith')");
  testDb.run("INSERT INTO users (username, display_name) VALUES ('carol', 'Carol Williams')");

  // Inject test DB into the connection module
  setDb(testDb);

  const app = express();
  app.use(express.json());
  app.use(
    cookieSession({
      name: 'session',
      keys: ['test-secret'],
      maxAge: 24 * 60 * 60 * 1000,
    })
  );

  app.use('/api/auth', authRouter);
  app.use('/api/incidents', requireAuth, incidentRouter);
  app.use('/api/incidents', requireAuth, timelineRouter);
  app.use('/api/users', requireAuth, authRouter);

  return app;
}

export function getTestDb(): Database {
  return testDb!;
}

export function closeTestDb(): void {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
}
