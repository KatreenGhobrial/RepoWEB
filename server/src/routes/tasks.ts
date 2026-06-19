import { Router, Response, Request } from 'express';
import Task from '../models/Task';
const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/tasks — Create a new task
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { project, title, description, assignedTo, status, priority, discipline, dueDate } = req.body;

    const task = await Task.create({
      project,
      title,
      description,
      owner: null,
      assignedTo,
      status: status || 'todo',
      priority: priority || 'medium',
      discipline,
      dueDate,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/tasks/:projectId — Get all tasks for a project
// ───────────────────────────────────────────────────────────────────────────
router.get('/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/tasks/:id — Update a task
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
// ───────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

export default router;
