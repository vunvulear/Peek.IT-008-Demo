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

  // Create a test incident
  await agent.post('/api/incidents').send({
    title: 'Timeline test incident',
    severity: 'P2',
    affected_service: 'test-service',
  });
});

afterAll(() => {
  closeTestDb();
});

describe('GET /api/incidents/:id/timeline', () => {
  it('returns the auto-created "created" entry', async () => {
    const res = await agent.get('/api/incidents/1/timeline').expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toMatchObject({
      action_type: 'created',
      actor_name: 'Alice Johnson',
    });
    expect(res.body[0].content).toContain('severity P2');
  });
});

describe('POST /api/incidents/:id/timeline', () => {
  it('adds a note to the timeline', async () => {
    const res = await agent
      .post('/api/incidents/1/timeline')
      .send({ content: 'Investigating connection pool settings' })
      .expect(201);

    expect(res.body).toMatchObject({
      action_type: 'note',
      content: 'Investigating connection pool settings',
      actor_name: 'Alice Johnson',
    });
  });

  it('rejects empty content', async () => {
    await agent
      .post('/api/incidents/1/timeline')
      .send({ content: '' })
      .expect(400);
  });

  it('rejects missing content', async () => {
    await agent
      .post('/api/incidents/1/timeline')
      .send({})
      .expect(400);
  });

  it('returns 404 for non-existent incident', async () => {
    await agent
      .post('/api/incidents/999/timeline')
      .send({ content: 'orphan note' })
      .expect(404);
  });
});

describe('PATCH /api/incidents/:id creates timeline entries', () => {
  it('logs status change in timeline', async () => {
    await agent
      .patch('/api/incidents/1')
      .send({ status: 'Investigating' })
      .expect(200);

    const res = await agent.get('/api/incidents/1/timeline').expect(200);
    const statusEntries = res.body.filter((e: { action_type: string }) => e.action_type === 'status_change');
    expect(statusEntries.length).toBeGreaterThanOrEqual(1);
    expect(statusEntries.at(-1).content).toContain('Open');
    expect(statusEntries.at(-1).content).toContain('Investigating');
  });

  it('logs severity change in timeline', async () => {
    await agent
      .patch('/api/incidents/1')
      .send({ severity: 'P1' })
      .expect(200);

    const res = await agent.get('/api/incidents/1/timeline').expect(200);
    const sevEntries = res.body.filter((e: { action_type: string }) => e.action_type === 'severity_change');
    expect(sevEntries.length).toBeGreaterThanOrEqual(1);
    expect(sevEntries.at(-1).content).toContain('P2');
    expect(sevEntries.at(-1).content).toContain('P1');
  });

  it('logs assignment in timeline', async () => {
    await agent
      .patch('/api/incidents/1')
      .send({ owner_id: 2 })
      .expect(200);

    const res = await agent.get('/api/incidents/1/timeline').expect(200);
    const assignEntries = res.body.filter((e: { action_type: string }) => e.action_type === 'assignment');
    expect(assignEntries.length).toBeGreaterThanOrEqual(1);
    expect(assignEntries.at(-1).content).toContain('Bob Smith');
  });

  it('rejects assignment to non-existent user', async () => {
    const res = await agent
      .patch('/api/incidents/1')
      .send({ owner_id: 999 })
      .expect(400);

    expect(res.body.error).toBe('Owner not found');
  });
});
