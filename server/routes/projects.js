import { Router } from 'express';
import { Project } from '../models/Project.js';
import { isDatabaseReady } from '../db.js';

const router = Router();

/** Turn a thrown error into a clean JSON response instead of an HTML stack. */
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

/** Fail fast with a useful message when Mongo is not connected. */
router.use((req, res, next) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({
      error: 'Database unavailable',
      hint: 'Check MONGODB_URI in server/.env and your Atlas IP access list.',
    });
  }
  return next();
});

/** Accept either `id` or `_id` from the client. */
function normaliseBody(body = {}) {
  const { id, _id, createdAt, updatedAt, ...rest } = body;
  return { _id: id || _id, ...rest };
}

/* GET /api/projects — newest first */
router.get(
  '/',
  wrap(async (req, res) => {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  })
);

/**
 * Public view counter, mounted separately in index.js so it sits OUTSIDE the
 * write guard. Anyone browsing may bump a view count — that is the whole point
 * of a view count — but they still cannot change anything else.
 */
export const incrementView = wrap(async (req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ error: 'Database unavailable' });

  const updated = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json({ id: updated.id, views: updated.views });
});

/* GET /api/projects/:id */
router.get(
  '/:id',
  wrap(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  })
);

/* POST /api/projects */
router.post(
  '/',
  wrap(async (req, res) => {
    const data = normaliseBody(req.body);
    if (!data.title?.trim()) {
      return res.status(400).json({ error: 'A title is required' });
    }
    if (!data._id) data._id = `prj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const created = await Project.create(data);
    res.status(201).json(created);
  })
);

/* PATCH /api/projects/:id — partial update */
router.patch(
  '/:id',
  wrap(async (req, res) => {
    const { _id, ...patch } = normaliseBody(req.body);
    const updated = await Project.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  })
);

/* DELETE /api/projects/:id */
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.json({ id: req.params.id, deleted: true });
  })
);

/* PUT /api/projects — replace the whole collection (JSON import / reset) */
router.put(
  '/',
  wrap(async (req, res) => {
    const incoming = Array.isArray(req.body) ? req.body : req.body?.projects;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'Expected an array of projects' });
    }

    await Project.deleteMany({});
    if (incoming.length === 0) return res.json([]);

    const created = await Project.insertMany(incoming.map(normaliseBody), { ordered: false });
    res.json(created);
  })
);

export default router;
