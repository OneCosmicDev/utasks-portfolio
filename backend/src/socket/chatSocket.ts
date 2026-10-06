import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User, Message } from '../models';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

const onlineUsers = new Map<string, string>();

export const initializeChatSocket = (io: SocketIOServer) => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const secret = process.env.JWT_SECRET || 'utasks-default-secret-change-in-production';
      const decoded = jwt.verify(token, secret) as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const username = socket.username!;

    console.log(`User connected: ${username} (${userId})`);

    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit('user_online', { userId, username });

    const onlineUsersList = Array.from(onlineUsers.keys());
    socket.emit('online_users', onlineUsersList);

    socket.on('private_message', async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content || !content.trim()) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          read: false,
        });

        await message.populate('sender', 'username email');
        await message.populate('receiver', 'username email');

        const messageData = message.toJSON();

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', messageData);
        }

        socket.emit('message_sent', messageData);
      } catch (error) {
        console.error('Error sending private message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId,
          username,
          isTyping,
        });
      }
    });

    socket.on('message_read', async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        if (message.receiver.toString() !== userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        message.read = true;
        await message.save();

        const senderSocketId = onlineUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read_notification', {
            messageId,
            readBy: userId,
          });
        }

        socket.emit('message_read_confirmed', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${username} (${userId})`);

      onlineUsers.delete(userId);

      socket.broadcast.emit('user_offline', { userId, username });
    });
  });

  return io;
};

export { onlineUsers };

