import { io } from 'socket.io-client';

/**
 * Global Socket.io Client Instance.
 * Initializes the WebSocket connection to the server.
 * Attaches the current user's ID to the connection query for server-side identification.
 */

// Read the logged-in user from localStorage so we can identify this socket connection
const userStr = localStorage.getItem('currentUser');
let currentUser = null;
try {
  currentUser = userStr ? JSON.parse(userStr) : null;
} catch (e) {}

// Build the query object — sends the user's name or ID to the server on connect
const query = currentUser ? { userId: currentUser.name || currentUser._id } : {};

// Create and export the single shared socket connection for the whole app
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  withCredentials: true,
  autoConnect: true,
  query
});

export default socket;
