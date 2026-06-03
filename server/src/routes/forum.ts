import { Router, Response } from 'express';
import ForumPost from '../models/ForumPost';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum — Create a forum post
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, tags } = req.body;

    const post = await ForumPost.create({
      author: req.user!.userId,
      title,
      content,
      tags: tags || [],
    });

    const populated = await post.populate('author', 'username avatar role');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/forum — List all forum posts (with optional tag filter)
// ───────────────────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tag, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await ForumPost.find(filter)
      .populate('author', 'username avatar role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('List posts error:', error);
    res.status(500).json({ message: 'Server error listing posts' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/forum/:id — Get a single post with replies
// ───────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum/:id/reply — Add a reply to a post
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/reply', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          replies: {
            author: req.user!.userId,
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ message: 'Server error adding reply' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum/:id/upvote — Toggle upvote on a post
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/upvote', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user!.userId;
    const alreadyUpvoted = post.upvotes.some(
      (id) => id.toString() === userId
    );

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.upvotes.push(userId as unknown as mongoose.Types.ObjectId);
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server error toggling upvote' });
  }
});

// Need mongoose import for ObjectId type
import mongoose from 'mongoose';

export default router;
