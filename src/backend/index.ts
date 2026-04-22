import express from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import path from 'path';
import { getDb } from './db/connection.js';
import { initializeSchema } from './db/schema.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import incidentRouter from './routes/incidents.js';
import timelineRouter from './routes/timeline.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'incident-assistant-dev-key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/incidents', requireAuth, incidentRouter);
app.use('/api/incidents', requireAuth, timelineRouter);
app.use('/api/users', requireAuth, authRouter);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(process.cwd(), 'dist', 'frontend');
  app.use(express.static(frontendPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  const db = await getDb();
  initializeSchema(db);
  console.log('Database initialized.');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
