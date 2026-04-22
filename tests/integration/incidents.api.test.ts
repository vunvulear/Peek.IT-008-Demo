import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createTestApp, closeTestDb } from '../helpers/test-app.js';

let app: Express;
let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  app = await createTestApp();
  agent = request.agent(app);
  await agent.post('/api/auth/login').send({ username: 'alice' });
});

afterAll(() => {
  closeTestDb();
});

describe('POST /api/incidents', () => {
  it('creates an incident with valid data', async () => {
    const res = await agent
      .post('/api/incidents')
      .send({
        title: 'Database connection pool exhausted',
        description: 'Production DB at max connections',
        severity: 'P1',
        affected_service: 'api-gateway',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      id: 1,
      incident_id: 'INC-001',
      title: 'Database connection pool exhausted',
      severity: 'P1',
      status: 'Open',
      affected_service: 'api-gateway',
      creator_name: 'Alice Johnson',
    });
    expect(res.body.created_at).toBeDefined();
    expect(res.body.updated_at).toBeDefined();
  });

  it('rejects missing title', async () => {
    const res = await agent
      .post('/api/incidents')
      .send({ severity: 'P2', affected_service: 'api' })
      .expect(400);

    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toContain('Title is required');
  });

  it('rejects invalid severity', async () => {
    const res = await agent
      .post('/api/incidents')
      .send({ title: 'Test', severity: 'P9', affected_service: 'api' })
      .expect(400);

    expect(res.body.details).toContain('Severity must be one of: P1, P2, P3, P4');
  });

  it('rejects missing affected_service', async () => {
    const res = await agent
      .post('/api/incidents')
      .send({ title: 'Test', severity: 'P2' })
      .expect(400);

    expect(res.body.details).toContain('Affected service is required');
  });

  it('rejects title over 200 characters', async () => {
    const res = await agent
      .post('/api/incidents')
      .send({ title: 'x'.repeat(201), severity: 'P3', affected_service: 'api' })
      .expect(400);

    expect(res.body.details).toContain('Title must be 200 characters or less');
  });
});

describe('GET /api/incidents/:id', () => {
  it('returns incident detail with formatted ID', async () => {
    const res = await agent.get('/api/incidents/1').expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      incident_id: 'INC-001',
      title: 'Database connection pool exhausted',
    });
  });

  it('returns 404 for non-existent incident', async () => {
    await agent.get('/api/incidents/999').expect(404);
  });

  it('returns 400 for non-numeric ID', async () => {
    await agent.get('/api/incidents/abc').expect(400);
  });
});
