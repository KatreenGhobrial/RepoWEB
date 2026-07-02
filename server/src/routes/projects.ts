import { Router, Response, Request } from 'express';
import Project from '../models/Project';
import User from '../models/User';
const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/projects — Create a new IoT project
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, device, protocol, database,
      powerSource, cloudPlatform, sensors, components, flow,
      ownerEmail, memberEmails
    } = req.body;

    let ownerId = null;
    if (ownerEmail) {
      const ownerUser = await User.findOne({ email: ownerEmail });
      if (!ownerUser) {
        res.status(404).json({ message: `Owner user not found: ${ownerEmail}` });
        return;
      }
      ownerId = ownerUser._id;
    }

    let memberIds: any[] = [];
    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      const users = await User.find({
        $or: [
          { email: { $in: memberEmails } },
          { username: { $in: memberEmails } }
        ]
      });
      
      if (users.length !== memberEmails.length) {
        const foundIdentifiers = users.flatMap(u => [u.email, u.username]);
        const missing = memberEmails.filter(email => !foundIdentifiers.includes(email));
        res.status(404).json({ message: `One or more users not found: ${missing.join(', ')}` });
        return;
      }
      
      memberIds = users.map(u => u._id);
    }

    const project = await Project.create({
      name,
      description,
      owner: ownerId,
      members: memberIds,
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
    const userId = req.headers['x-user-id'];
    const query = userId ? { $or: [{ owner: userId }, { members: userId }] } : {};

    const projects = await Project.find(query)
      .populate('owner', 'username email')
      .populate('members', 'username email role expertise')
      .populate('evaluation.gradedBy', 'username')
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
      .populate('members', 'username email role expertise')
      .populate('evaluation.gradedBy', 'username');

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
    const { ownerEmail, memberEmails, ...restBody } = req.body;
    let setOperators: any = { ...restBody };

    if (ownerEmail) {
      const ownerUser = await User.findOne({ email: ownerEmail });
      if (!ownerUser) {
        res.status(404).json({ message: `Owner user not found: ${ownerEmail}` });
        return;
      }
      setOperators.owner = ownerUser._id;
    }

    let addToSetOperators: any = {};

    if (memberEmails && Array.isArray(memberEmails) && memberEmails.length > 0) {
      const users = await User.find({
        $or: [
          { email: { $in: memberEmails } },
          { username: { $in: memberEmails } }
        ]
      });

      if (users.length !== memberEmails.length) {
        const foundIdentifiers = users.flatMap(u => [u.email, u.username]);
        const missing = memberEmails.filter(email => !foundIdentifiers.includes(email));
        res.status(404).json({ message: `One or more users not found: ${missing.join(', ')}` });
        return;
      }

      if (users.length > 0) {
        addToSetOperators.members = { $each: users.map(u => u._id) };
      }
    }

    const updateQuery: any = { $set: setOperators };
    if (Object.keys(addToSetOperators).length > 0) {
      updateQuery.$addToSet = addToSetOperators;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateQuery,
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

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'username email role expertise')
     .populate('evaluation.gradedBy', 'username');

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

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/projects/:id/assessment — Add or update project grading assessment
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id/assessment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { interdisciplinary, collaboration, technical, comments, assessor } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          'assessment.interdisciplinary': interdisciplinary,
          'assessment.collaboration': collaboration,
          'assessment.technical': technical,
          'assessment.comments': comments || '',
          'assessment.assessedAt': new Date(),
          'assessment.assessor': assessor || null
        } 
      },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error updating assessment' });
  }
});

export default router;
