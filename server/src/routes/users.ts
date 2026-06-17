import { Router, Response } from 'express';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// GET /api/users
// Fetch all users
// ───────────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
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
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, role, name } = req.body; // Notice 'name' is in user's UI

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, role, ...(name ? { bio: name } : {}) }, // Mapping name to bio if provided, or we can just ignore it since User model doesn't have 'name'
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
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
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

export default router;
