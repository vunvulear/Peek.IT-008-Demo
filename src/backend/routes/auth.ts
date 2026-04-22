import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection.js';

const router = Router();

// POST /api/auth/login — authenticate with username
router.post('/login', async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const db = await getDb();
  const result = db.exec('SELECT id, username, display_name FROM users WHERE username = ?', [username.trim().toLowerCase()]);

  if (result.length === 0 || result[0].values.length === 0) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const row = result[0].values[0];
  req.session!.userId = row[0] as number;
  req.session!.username = row[1] as string;
  req.session!.displayName = row[2] as string;

  res.json({
    id: row[0],
    username: row[1],
    display_name: row[2],
  });
});

// POST /api/auth/logout — end session
router.post('/logout', (req: Request, res: Response) => {
  req.session = null as unknown as Request['session'];
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me — get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.session?.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  res.json({
    id: req.session.userId,
    username: req.session.username,
    display_name: req.session.displayName,
  });
});

// GET /api/users — list all users (for owner dropdown)
router.get('/users', async (_req: Request, res: Response) => {
  const db = await getDb();
  const result = db.exec('SELECT id, username, display_name FROM users ORDER BY display_name');

  if (result.length === 0) {
    res.json([]);
    return;
  }

  const users = result[0].values.map((row) => ({
    id: row[0],
    username: row[1],
    display_name: row[2],
  }));

  res.json(users);
});

export default router;
