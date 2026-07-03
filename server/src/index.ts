import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import botRoutes from './routes/bot';
import mentorRoutes from './routes/mentor';
import libraryRoutes from './routes/library';
import communityRoutes from './routes/community';
import userRoutes from './routes/users';
import analysisRoutes from './routes/analysis';
import mqttRoutes from './routes/mqtt';
import alertRoutes from './routes/alerts';
import docRoutes from './routes/docs';
import { initMqttService } from './services/mqttService';
import { startKeepAlive } from './services/keepAliveService';

// Load environment variables
dotenv.config();

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  const userIdentifier = socket.handshake.query.userId || 'Anonymous';
  console.log(`[Socket] User '${userIdentifier}' connected (ID: ${socket.id})`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket] User '${userIdentifier}' disconnected (ID: ${socket.id})`);
  });
});

// Initialize MQTT Service (This bridges MQTT and WebSocket!)
initMqttService(io);

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/docs', docRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------
const startServer = async () => {
  // Try connecting to DB, but don't block server start
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 BridgeBot server & WebSocket running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    
    // Start keep-alive self-pings
    startKeepAlive(PORT);
  });
};

startServer();
