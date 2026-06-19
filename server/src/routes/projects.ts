import { Router, Response, Request } from 'express';
import Project from '../models/Project';
const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/projects — Create a new IoT project
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, device, protocol, database,
      powerSource, cloudPlatform, sensors, components, flow,
    } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: null,
      members: [],
      device, protocol, database, powerSource,
      cloudPlatform, sensors, components, flow,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/projects — List projects the user owns or is a member of
// ───────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate('owner', 'username email')
      .populate('members', 'username email role expertise')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ message: 'Server error listing projects' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/projects/:id — Get single project by ID
// ───────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email role expertise');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/projects/:id — Update project
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// DELETE /api/projects/:id
// ───────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or not authorized' });
      return;
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/projects/:id/members — Add a member to the project
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/members', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'username email role expertise');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
});

export default router;
