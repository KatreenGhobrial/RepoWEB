import { Router, Response, Request } from 'express';
import ChatHistory from '../models/ChatHistory';
import Project from '../models/Project';
import {
  socraticChat,
} from '../services/geminiService';
import { detectConflictsAI, analyzeArchitectureAI } from '../services/analyze';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/bot/chat — Send a message to the Socratic bot
// ───────────────────────────────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, message, sessionId } = req.body;

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    // Load or create chat session
    const sid = sessionId || `session_${Date.now()}`;
    let chatHistory = await ChatHistory.findOne({
      sessionId: sid,
      user: 'anonymous_user',
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        project: projectId,
        user: 'anonymous_user',
        sessionId: sid,
        messages: [],
        detectedPhase: 'ideation',
      });
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Get project context if available
    let projectContext = '';
    let phase = chatHistory.detectedPhase || 'ideation';

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        phase = project.phase;
        projectContext = `Project: ${project.name}\nDevice: ${project.device}\nProtocol: ${project.protocol}\nDatabase: ${project.database}\nPower: ${project.powerSource}\nSensors: ${project.sensors.join(', ')}\nPhase: ${project.phase}`;
      }
    }

    // Build message history for Gemini (exclude system messages, keep last 20)
    const historyForAI = chatHistory.messages
      .filter((m) => m.role !== 'system')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    // Call Socratic AI
    const botReply = await socraticChat(historyForAI, phase, projectContext);

    // Save bot reply
    chatHistory.messages.push({
      role: 'assistant',
      content: botReply,
      timestamp: new Date(),
    });
    chatHistory.detectedPhase = phase;
    await chatHistory.save();

    res.json({
      reply: botReply,
      sessionId: sid,
      phase,
      messageCount: chatHistory.messages.length,
    });
  } catch (error) {
    console.error('Bot chat error:', error);
    res.status(500).json({ message: 'Server error in bot chat' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/bot/analyze — Analyze IoT architecture
// ───────────────────────────────────────────────────────────────────────────
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const analysis = await analyzeArchitectureAI({
      device: project.device,
      protocol: project.protocol,
      database: project.database,
      powerSource: project.powerSource,
      sensors: project.sensors,
      cloudPlatform: project.cloudPlatform,
      components: project.components,
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({ message: 'Server error in analysis' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/bot/detect-conflicts — AI-powered conflict detection
// ───────────────────────────────────────────────────────────────────────────
router.post('/detect-conflicts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { device, protocol, database, powerSource, sensors, cloudPlatform } = req.body;

    const conflicts = await detectConflictsAI({
      device: device || 'ESP32',
      protocol: protocol || 'HTTP',
      database: database || 'MongoDB',
      powerSource: powerSource || 'Battery',
      sensors: sensors || [],
      cloudPlatform: cloudPlatform || '',
    });

    res.json({ conflicts });
  } catch (error) {
    console.error('Conflict detection error:', error);
    res.status(500).json({ message: 'Server error in conflict detection' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/bot/history/:projectId — Get chat history for a project
// ───────────────────────────────────────────────────────────────────────────
router.get('/history/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await ChatHistory.find({
      project: req.params.projectId,
      user: 'anonymous_user',
    })
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json(sessions);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/bot/session/:sessionId — Get specific session
// ───────────────────────────────────────────────────────────────────────────
router.get('/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      user: 'anonymous_user',
    });

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error fetching session' });
  }
});

export default router;
