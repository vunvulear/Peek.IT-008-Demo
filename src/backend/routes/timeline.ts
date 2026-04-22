import { Router, Request, Response } from 'express';
import { addNote, getTimelineEntries } from '../services/timeline.service.js';

const router = Router();

// GET /api/incidents/:id/timeline — get timeline entries for an incident
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid incident ID' });
      return;
    }

    const entries = await getTimelineEntries(id);
    res.json(entries);
  } catch (err) {
    console.error('Error getting timeline:', err);
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

// POST /api/incidents/:id/timeline — add a note to an incident
router.post('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid incident ID' });
      return;
    }

    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const entry = await addNote(id, req.session!.userId!, content);
    res.status(201).json(entry);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Incident not found') {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }
    console.error('Error adding timeline note:', err);
    res.status(500).json({ error: 'Failed to add timeline note' });
  }
});

export default router;
