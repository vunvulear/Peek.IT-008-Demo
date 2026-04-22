import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createTestApp, closeTestDb } from '../helpers/test-app.js';

let app: Express;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(() => {
  closeTestDb();
});

describe('POST /api/auth/login', () => {
  it('returns 200 and user data for valid username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      username: 'alice',
      display_name: 'Alice Johnson',
    });
  });

  it('returns 401 for unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody' })
      .expect(401);

    expect(res.body.error).toBe('User not found');
  });

  it('returns 400 for missing username', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
  });

  it('is case-insensitive for usernames', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Alice' })
      .expect(200);

    expect(res.body.username).toBe('alice');
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ username: 'alice' });
    const res = await agent.post('/api/auth/logout').expect(200);
    expect(res.body.message).toBe('Logged out');
  });
});

describe('GET /api/auth/me', () => {
  it('returns user info when authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ username: 'bob' });

    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body).toMatchObject({
      id: 2,
      username: 'bob',
      display_name: 'Bob Smith',
    });
  });

  it('returns 401 when not authenticated', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });
});

describe('Protected routes', () => {
  it('rejects unauthenticated access to /api/incidents', async () => {
    await request(app).get('/api/incidents').expect(401);
  });

  it('rejects unauthenticated access to /api/users', async () => {
    await request(app).get('/api/users').expect(401);
  });
});
