import { Router, Response, Request } from 'express';
import CommunityPost from '../models/CommunityPost';
import User from '../models/User';
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
// GET /api/forum/similar — Check for similar posts
// ───────────────────────────────────────────────────────────────────────────
router.get('/similar', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.query;
    if (!title || typeof title !== 'string') {
      res.json([]);
      return;
    }

    const words = title
      .split(/\s+/)
      .map(w => w.replace(/[^\w]/g, '').trim())
      .filter(w => w.length > 3);

    if (words.length === 0) {
      res.json([]);
      return;
    }

    const regexQueries = words.map(word => ({
      $or: [
        { title: { $regex: word, $options: 'i' } },
        { content: { $regex: word, $options: 'i' } }
      ]
    }));

    const posts = await CommunityPost.find({ $or: regexQueries })
      .populate('author', 'username avatar role')
      .limit(5);

    res.json(posts);
  } catch (error) {
    console.error('Similar posts error:', error);
    res.status(500).json({ message: 'Server error listing similar posts' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/forum/:id — Get a single post with replies
// ───────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role')
      .populate('replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.replies.author', 'username avatar role');

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

// Helper function to find a comment recursively anywhere in the nested reply tree
function findReplyInTree(replies: any[], replyId: string): any {
  for (const reply of replies) {
    if (reply._id.toString() === replyId) {
      return reply;
    }
    if (reply.replies && reply.replies.length > 0) {
      const found = findReplyInTree(reply.replies, replyId);
      if (found) return found;
    }
  }
  return null;
}

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
            replies: [],
          },
        },
      },
      { new: true }
    )
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role')
      .populate('replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.replies.author', 'username avatar role');

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
// POST /api/forum/:id/reply/:replyId — Add a nested reply to a comment at any depth
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/reply/:replyId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.headers['x-user-id'];

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = findReplyInTree(post.replies, req.params.replyId as string);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.replies && comment.replies.length >= 10) {
      res.status(400).json({ message: 'Maximum of 10 replies reached for this comment' });
      return;
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push({
      author: userId || null,
      content,
      createdAt: new Date(),
      replies: [],
    } as any);

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role')
      .populate('replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.replies.author', 'username avatar role');

    io.emit('post_updated', populatedPost);

    res.json(populatedPost);
  } catch (error) {
    console.error('Nested reply error:', error);
    res.status(500).json({ message: 'Server error adding nested reply' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/forum/:id/reply/:replyId/rate — Rate a comment/reply at any depth (toggle)
// ───────────────────────────────────────────────────────────────────────────
router.post('/:id/reply/:replyId/rate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = findReplyInTree(post.replies, req.params.replyId as string);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const user = await User.findById(userId);
    const isMentor = user && user.role === 'mentor';
    const weight = isMentor ? 3 : 1;

    if (!comment.ratings) {
      comment.ratings = [];
    }

    const existingIndex = comment.ratings.findIndex(
      (r: any) => r.user && r.user.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      // Toggle off / delete rating
      comment.ratings.splice(existingIndex, 1);
    } else {
      // Add rating
      comment.ratings.push({
        user: userId as any,
        value: 1,
        score: weight,
      });
    }

    // Recalculate score
    comment.score = comment.ratings.reduce((sum: number, r: any) => sum + r.score, 0);

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role')
      .populate('replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.replies.author', 'username avatar role');

    io.emit('post_updated', populatedPost);

    res.json(populatedPost);
  } catch (error) {
    console.error('Rate comment error:', error);
    res.status(500).json({ message: 'Server error rating comment' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/forum/:id/reply/:replyId — Edit a comment/reply at any depth
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id/reply/:replyId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = findReplyInTree(post.replies, req.params.replyId as string);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Security check: Only the author can edit their comment
    if (!comment.author || comment.author.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Forbidden: You can only edit your own comments' });
      return;
    }

    comment.content = content;

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username avatar role')
      .populate('replies.author', 'username avatar role')
      .populate('replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.author', 'username avatar role')
      .populate('replies.replies.replies.replies.author', 'username avatar role');

    io.emit('post_updated', populatedPost);

    res.json(populatedPost);
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ message: 'Server error editing comment' });
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
