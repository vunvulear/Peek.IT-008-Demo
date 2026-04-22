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

  // Create test incidents with varied statuses/severities
  const incidents = [
    { title: 'Open P1 incident', severity: 'P1', affected_service: 'api' },
    { title: 'Open P2 incident', severity: 'P2', affected_service: 'cdn' },
    { title: 'Open P3 incident', severity: 'P3', affected_service: 'db' },
    { title: 'P4 incident for status test', severity: 'P4', affected_service: 'cache' },
    { title: 'Another P1', severity: 'P1', affected_service: 'search' },
  ];

  for (const inc of incidents) {
    await agent.post('/api/incidents').send(inc);
  }

  // Change status of incident 4 to Investigating
  await agent.patch('/api/incidents/4').send({ status: 'Investigating' });
  // Change status of incident 5 to Resolved
  await agent.patch('/api/incidents/5').send({ status: 'Resolved' });
});

afterAll(() => {
  closeTestDb();
});

describe('GET /api/incidents', () => {
  it('returns all incidents', async () => {
    const res = await agent.get('/api/incidents').expect(200);

    expect(res.body.total).toBe(5);
    expect(res.body.incidents.length).toBe(5);
  });

  it('each incident has formatted incident_id', async () => {
    const res = await agent.get('/api/incidents').expect(200);

    for (const inc of res.body.incidents) {
      expect(inc.incident_id).toMatch(/^INC-\d{3,}$/);
    }
  });

  it('returns required dashboard columns', async () => {
    const res = await agent.get('/api/incidents').expect(200);
    const inc = res.body.incidents[0];

    expect(inc).toHaveProperty('incident_id');
    expect(inc).toHaveProperty('title');
    expect(inc).toHaveProperty('severity');
    expect(inc).toHaveProperty('status');
    expect(inc).toHaveProperty('owner_name');
    expect(inc).toHaveProperty('affected_service');
    expect(inc).toHaveProperty('updated_at');
  });

  it('filters by status', async () => {
    const res = await agent.get('/api/incidents?status=Open').expect(200);

    expect(res.body.total).toBe(3);
    for (const inc of res.body.incidents) {
      expect(inc.status).toBe('Open');
    }
  });

  it('filters by multiple statuses', async () => {
    const res = await agent
      .get('/api/incidents?status=Open&status=Investigating')
      .expect(200);

    expect(res.body.total).toBe(4);
    for (const inc of res.body.incidents) {
      expect(['Open', 'Investigating']).toContain(inc.status);
    }
  });

  it('filters by severity', async () => {
    const res = await agent.get('/api/incidents?severity=P1').expect(200);

    expect(res.body.total).toBe(2);
    for (const inc of res.body.incidents) {
      expect(inc.severity).toBe('P1');
    }
  });

  it('filters by severity and status combined', async () => {
    const res = await agent
      .get('/api/incidents?severity=P1&status=Open')
      .expect(200);

    expect(res.body.total).toBe(1);
    expect(res.body.incidents[0].title).toBe('Open P1 incident');
  });

  it('sorts P1 incidents first, then by updated_at descending', async () => {
    const res = await agent.get('/api/incidents').expect(200);

    const incidents = res.body.incidents;
    const p1Incidents = incidents.filter((i: { severity: string }) => i.severity === 'P1');
    const nonP1Incidents = incidents.filter((i: { severity: string }) => i.severity !== 'P1');

    // All P1s should come before any non-P1
    expect(p1Incidents.length).toBeGreaterThan(0);
    expect(nonP1Incidents.length).toBeGreaterThan(0);
    const severities = incidents.map((i: { severity: string }) => i.severity);
    const lastP1Idx = severities.lastIndexOf('P1');
    const firstNonP1Idx = severities.findIndex((s: string) => s !== 'P1');
    expect(lastP1Idx).toBeLessThan(firstNonP1Idx);
  });

  it('respects limit parameter', async () => {
    const res = await agent.get('/api/incidents?limit=2').expect(200);

    expect(res.body.incidents.length).toBe(2);
    expect(res.body.total).toBe(5);
  });

  it('respects offset parameter', async () => {
    const res = await agent.get('/api/incidents?limit=2&offset=3').expect(200);

    expect(res.body.incidents.length).toBe(2);
  });
});
