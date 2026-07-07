/**
 * Express Server Entry Point.
 * Sets up the HTTP server, Socket.io for real-time communication, connects to MongoDB,
 * and initializes all API routes and background services (e.g., MQTT).
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import botRoutes from './routes/bot';
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
// Wrap Express in an HTTP server so Socket.io can share the same port
const httpServer = createServer(app);
// Create Socket.io server — allows CORS from the React dev server or deployed URL
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Log every new WebSocket connection and disconnection
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
// Allow cross-origin requests from the React app
app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  credentials: true,
}));
// Parse incoming JSON bodies (limit 10mb to support large library seeds)
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/projects', projectRoutes);    // CRUD for IoT student projects
app.use('/api/tasks', taskRoutes);          // task management per project
app.use('/api/bot', botRoutes);             // Socratic AI chat + conflict detection
app.use('/api/library', libraryRoutes);     // IoT solution library (hardware, protocols, cloud)
app.use('/api/community', communityRoutes); // community forum posts and replies
app.use('/api/users', userRoutes);          // auth, user management, mentor dashboard
app.use('/api/analysis', analysisRoutes);   // interdisciplinary architecture analysis
app.use('/api/mqtt', mqttRoutes);           // live MQTT broker management
app.use('/api/alerts', alertRoutes);        // IoT system alerts
app.use('/api/docs', docRoutes);            // technical documentation per project

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
