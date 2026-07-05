import { Router, Response, Request } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import Project from '../models/Project';
import Task from '../models/Task';
import ChatHistory from '../models/ChatHistory';
import Feedback from '../models/Feedback';
const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/users/register
// Register a new user
// ───────────────────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, expertise } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      expertise: expertise || [],
    });

    // Don't send back password
    const userWithoutPassword = await User.findById(newUser._id).select('-password');
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/users/login
// Login user
// ───────────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Send back user (without password)
    const userWithoutPassword = await User.findById(user._id).select('-password');
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/users
// Fetch all users
// ───────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Only fetch necessary fields to match the frontend table
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Update a user
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, role, name } = req.body; // Notice 'name' is in user's UI

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// Delete a user
// ───────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// MENTOR QUERIES (Business logic for mentors)
// ───────────────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────────────
// GET /api/users/mentor/projects — View ALL projects (mentor overview)
// ───────────────────────────────────────────────────────────────────────────
router.get('/mentor/projects', async (req: Request, res: Response): Promise<void> => {
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
    console.error('Mentor projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/users/mentor/dashboard — Aggregated dashboard data for mentor
// ───────────────────────────────────────────────────────────────────────────
router.get('/mentor/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'];
    const query = userId ? { $or: [{ owner: userId }, { members: userId }] } : {};

    const [projects, tasks, chatSessions, students] = await Promise.all([
      Project.find(query).populate('members', 'username role expertise'),
      Task.find(), // We could filter tasks by the found projects too, but keeping simple for now
      ChatHistory.find(),
      User.find({ role: 'student' }).select('username expertise discipline'),
    ]);

    // Compute analytics
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const totalSessions = chatSessions.length;
    const totalStudents = students.length;

    // Phase distribution
    const phaseDistribution: Record<string, number> = {};
    projects.forEach((p) => {
      phaseDistribution[p.phase] = (phaseDistribution[p.phase] || 0) + 1;
    });

    // Discipline balance across all projects
    const disciplineCount: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.discipline) {
        disciplineCount[t.discipline] = (disciplineCount[t.discipline] || 0) + 1;
      }
    });

    res.json({
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalSessions,
      totalStudents,
      phaseDistribution,
      disciplineCount,
    });
  } catch (error) {
    console.error('Mentor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/users/mentor/feedback — Give feedback on a project
// ───────────────────────────────────────────────────────────────────────────
router.post('/mentor/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, content, category, rating } = req.body;

    const feedback = await Feedback.create({
      project: projectId,
      mentor: null,
      content,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error creating feedback' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/users/mentor/feedback/:projectId — Get feedback for a project
// ───────────────────────────────────────────────────────────────────────────
router.get('/mentor/feedback/:projectId', async (_req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.find({ project: _req.params.projectId })
      .populate('mentor', 'username')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/users/mentor/broadcast — Send a broadcast prompt to all teams
// ───────────────────────────────────────────────────────────────────────────
router.post('/mentor/broadcast', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    // Create a system message in all active project chat histories
    const activeProjects = await Project.find({ status: 'active' });

    const results = await Promise.all(
      activeProjects.map(async (project) => {
        // Find or create a chat session for the broadcast
        let session = await ChatHistory.findOne({
          project: project._id,
          sessionId: `broadcast_${project._id}`,
        });

        if (!session) {
          session = await ChatHistory.create({
            project: project._id,
            user: 'anonymous_user',
            sessionId: `broadcast_${project._id}`,
            messages: [],
          });
        }

        session.messages.push({
          role: 'system',
          content: `📢 Mentor broadcast: ${message}`,
          timestamp: new Date(),
        });
        await session.save();

        return { projectId: project._id, projectName: project.name };
      })
    );

    res.json({
      message: 'Broadcast sent',
      sentTo: results,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error broadcasting' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/users/mentor/projects/:projectId/evaluation — Evaluate a project
// ───────────────────────────────────────────────────────────────────────────
router.put('/mentor/projects/:projectId/evaluation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.headers['x-user-id'];
    const {
      interdisciplinaryScore,
      interdisciplinaryNotes,
      cooperationScore,
      cooperationNotes,
      technicalScore,
      technicalNotes,
      summaryNotes
    } = req.body;

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          evaluation: {
            interdisciplinaryScore: Number(interdisciplinaryScore) || 0,
            interdisciplinaryNotes: interdisciplinaryNotes || '',
            cooperationScore: Number(cooperationScore) || 0,
            cooperationNotes: cooperationNotes || '',
            technicalScore: Number(technicalScore) || 0,
            technicalNotes: technicalNotes || '',
            summaryNotes: summaryNotes || '',
            gradedBy: userId || null,
            gradedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('evaluation.gradedBy', 'username');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Project evaluation error:', error);
    res.status(500).json({ message: 'Server error updating project evaluation' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/users/mentor/projects/:projectId/phase — Update project phase
// ───────────────────────────────────────────────────────────────────────────
router.put('/mentor/projects/:projectId/phase', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phase } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { phase },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Phase update error:', error);
    res.status(500).json({ message: 'Server error updating phase' });
  }
});

export default router;
