import { Router, Request, Response } from 'express';
import {
  createIncident,
  getIncidentById,
  updateIncident,
  listIncidents,
  validateCreateInput,
  validateUpdateInput,
  formatIncidentId,
} from '../services/incident.service.js';

const router = Router();

// GET /api/incidents — list incidents with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status
      ? (Array.isArray(req.query.status) ? req.query.status as string[] : [req.query.status as string])
      : undefined;

    const severity = req.query.severity
      ? (Array.isArray(req.query.severity) ? req.query.severity as string[] : [req.query.severity as string])
      : undefined;

    const sort = (req.query.sort as string) || 'updated_at';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await listIncidents({ status, severity, sort, limit, offset });
    res.json(result);
  } catch (err) {
    console.error('Error listing incidents:', err);
    res.status(500).json({ error: 'Failed to list incidents' });
  }
});

// POST /api/incidents — create a new incident
router.post('/', async (req: Request, res: Response) => {
  try {
    const input = {
      title: req.body.title,
      description: req.body.description,
      severity: req.body.severity,
      affected_service: req.body.affected_service,
      created_by: req.session!.userId!,
    };

    const errors = validateCreateInput(input);
    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const incident = await createIncident(input);
    res.status(201).json({
      ...incident,
      incident_id: formatIncidentId(incident.id),
    });
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// GET /api/incidents/:id — get incident detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid incident ID' });
      return;
    }

    const incident = await getIncidentById(id);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    res.json({
      ...incident,
      incident_id: formatIncidentId(incident.id),
    });
  } catch (err) {
    console.error('Error getting incident:', err);
    res.status(500).json({ error: 'Failed to get incident' });
  }
});

// PATCH /api/incidents/:id — update incident (status, severity, owner)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid incident ID' });
      return;
    }

    const input = {
      status: req.body.status,
      severity: req.body.severity,
      owner_id: req.body.owner_id,
    };

    const errors = validateUpdateInput(input);
    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const incident = await updateIncident(id, input, req.session!.userId!);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    res.json({
      ...incident,
      incident_id: formatIncidentId(incident.id),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Owner not found') {
      res.status(400).json({ error: 'Owner not found' });
      return;
    }
    console.error('Error updating incident:', err);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

export default router;
