import { Request, Response, NextFunction } from 'express';

export interface SessionData {
  userId?: number;
  username?: string;
  displayName?: string;
}

declare module 'http' {
  interface IncomingMessage {
    session: SessionData | null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
