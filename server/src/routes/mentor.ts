import { Router, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import ChatHistory from '../models/ChatHistory';
import Feedback from '../models/Feedback';
import User from '../models/User';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('mentor', 'admin'));

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mentor/projects — View ALL projects (mentor overview)
// ───────────────────────────────────────────────────────────────────────────
router.get('/projects', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find()
      .populate('owner', 'username email')
      .populate('members', 'username email role expertise')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Mentor projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mentor/dashboard — Aggregated dashboard data for mentor
// ───────────────────────────────────────────────────────────────────────────
router.get('/dashboard', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [projects, tasks, chatSessions, students] = await Promise.all([
      Project.find().populate('members', 'username role expertise'),
      Task.find(),
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

    // Average reflection score
    const avgReflection =
      chatSessions.length > 0
        ? chatSessions.reduce((sum, s) => sum + s.reflectionScore, 0) / chatSessions.length
        : 0;

    res.json({
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalSessions,
      totalStudents,
      phaseDistribution,
      disciplineCount,
      avgReflection: Math.round(avgReflection),
    });
  } catch (error) {
    console.error('Mentor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/mentor/feedback — Give feedback on a project
// ───────────────────────────────────────────────────────────────────────────
router.post('/feedback', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, content, category, rating } = req.body;

    const feedback = await Feedback.create({
      project: projectId,
      mentor: req.user!.userId,
      content,
      category: category || 'general',
      rating: rating || 3,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: 'Server error creating feedback' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/mentor/feedback/:projectId — Get feedback for a project
// ───────────────────────────────────────────────────────────────────────────
router.get('/feedback/:projectId', async (_req: AuthRequest, res: Response): Promise<void> => {
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
// POST /api/mentor/broadcast — Send a broadcast prompt to all teams
// ───────────────────────────────────────────────────────────────────────────
router.post('/broadcast', async (req: AuthRequest, res: Response): Promise<void> => {
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
            user: req.user!.userId,
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

export default router;
