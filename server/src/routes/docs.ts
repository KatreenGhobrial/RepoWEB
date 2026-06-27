import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import TechDoc from '../models/TechDoc';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// GET /api/docs/project/:projectId — Get all docs for a project
// ───────────────────────────────────────────────────────────────────────────
router.get('/project/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;

    const filter: any = { projectId };
    if (type) filter.type = type;

    const docs = await TechDoc.find(filter).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (error) {
    console.error('Get docs error:', error);
    res.status(500).json({ message: 'Server error fetching documents' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/docs/:id — Get a single document by ID
// ───────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await TechDoc.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.json(doc);
  } catch (error) {
    console.error('Get doc error:', error);
    res.status(500).json({ message: 'Server error fetching document' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/docs/ — Create a new document
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, title, type, content, tags } = req.body;

    if (!projectId || !title) {
      res.status(400).json({ message: 'projectId and title are required' });
      return;
    }

    // Get author from header or use a placeholder ObjectId
    const userId = req.headers['x-user-id'] as string;
    const author = userId && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : new mongoose.Types.ObjectId('000000000000000000000000');

    const doc = await TechDoc.create({
      projectId,
      title,
      type,
      content,
      tags,
      author,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Create doc error:', error);
    res.status(500).json({ message: 'Server error creating document' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/docs/:id — Update a document
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, type, tags } = req.body;

    const existing = await TechDoc.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    // Build update object
    const update: any = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (type !== undefined) update.type = type;
    if (tags !== undefined) update.tags = tags;

    // Set lastEditedBy from header
    const userId = req.headers['x-user-id'] as string;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      update.lastEditedBy = new mongoose.Types.ObjectId(userId);
    }

    // Increment version
    update.version = existing.version + 1;

    const doc = await TechDoc.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(doc);
  } catch (error) {
    console.error('Update doc error:', error);
    res.status(500).json({ message: 'Server error updating document' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// DELETE /api/docs/:id — Delete a document
// ───────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await TechDoc.findByIdAndDelete(req.params.id);

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete doc error:', error);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

export default router;
