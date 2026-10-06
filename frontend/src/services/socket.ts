import { io, Socket } from 'socket.io-client';
import { authService } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (): Socket | null => {
  if (socket?.connected) {
    return socket;
  }

  const token = authService.getToken();
  
  if (!token) {
    console.warn('No token available for socket connection');
    return null;
  }

  socket = io(API_BASE_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  if (!socket || !socket.connected) {
    return connectSocket();
  }
  return socket;
};

export const reconnectSocket = (): void => {
  disconnectSocket();
  connectSocket();
};

export default {
  connect: connectSocket,
  disconnect: disconnectSocket,
  getSocket,
  reconnect: reconnectSocket,
};

