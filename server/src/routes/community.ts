import { Router, Response, Request } from 'express';
import CommunityPost from '../models/CommunityPost';
import { io } from '../index';
const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum — Create a forum post
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.headers['x-user-id'];

    const post = await CommunityPost.create({
      author: userId || null,
      title,
      content,
      tags: tags || [],
    });

    const populatedPost = await post.populate('author', 'username avatar role');
    io.emit('new_post', populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/forum — List all forum posts (with optional tag filter)
// ───────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, search } = req.query;

    const query: Record<string, unknown> = {};
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await CommunityPost.find(query)
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
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id)
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
router.post('/:id/reply', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.headers['x-user-id'];

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          replies: {
            author: userId || null,
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

    io.emit('post_updated', post);

    res.json(post);
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ message: 'Server error adding reply' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum/:id/upvote — Toggle upvote on a post
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/upvote', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.headers['x-user-id'] || "anonymous";
    const alreadyUpvoted = post.upvotes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.upvotes.push(userId as unknown as mongoose.Types.ObjectId);
    }

    await post.save();
    
    // We emit post_updated with the entire post populated (optional, or clients can refetch)
    // To keep it simple, just emit the basic upvote event
    io.emit('upvote_update', { postId: post._id, upvotes: post.upvotes.length });

    res.json({ upvotes: post.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ message: 'Server error toggling upvote' });
  }
});

// Need mongoose import for ObjectId type
import mongoose from 'mongoose';

export default router;
