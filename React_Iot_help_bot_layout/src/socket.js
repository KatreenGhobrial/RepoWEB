import { io } from 'socket.io-client';

/**
 * Global Socket.io Client Instance.
 * Initializes the WebSocket connection to the server.
 * Attaches the current user's ID to the connection query for server-side identification.
 */

const userStr = localStorage.getItem('currentUser');
let currentUser = null;
try {
  currentUser = userStr ? JSON.parse(userStr) : null;
} catch (e) {}
const query = currentUser ? { userId: currentUser.name || currentUser._id } : {};

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: true,
  query
});

export default socket;
