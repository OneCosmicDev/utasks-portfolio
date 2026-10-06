import { Response } from 'express';
import { Message, User } from '../models';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

const createResponse = <T>(success: boolean, data?: T, message?: string, errors?: Array<{ message: string }>) => ({
  success,
  ...(data !== undefined && { data }),
  ...(message && { message }),
  ...(errors && { errors }),
});

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createResponse(false, undefined, 'Authentication required'));
      return;
    }

    const currentUserId = req.user.id;

    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username email')
      .sort({ username: 1 });

    res.json(createResponse(true, users.map(user => user.toJSON())));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createResponse(false, undefined, 'Authentication required'));
      return;
    }

    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map<string, any>();

    messages.forEach((msg) => {
      const senderObj = msg.sender as any;
      const receiverObj = msg.receiver as any;

      const senderId = senderObj._id.toString();
      const receiverId = receiverObj._id.toString();

      const partnerId = senderId === userId ? receiverId : senderId;

      if (!conversationsMap.has(partnerId)) {
        const partner = senderId === userId ? receiverObj : senderObj;
        const partnerData = partner as any;

        const unreadCount = messages.filter(
          (m) => m.receiver.toString() === userId &&
            m.sender.toString() === partnerId &&
            !m.read
        ).length;

        conversationsMap.set(partnerId, {
          userId: partnerId,
          username: partnerData.username || partnerData.name,
          email: partnerData.email,
          lastMessage: {
            id: msg._id.toString(),
            content: msg.content,
            sender: senderId,
            createdAt: msg.createdAt,
          },
          unreadCount,
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(createResponse(true, conversations));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createResponse(false, undefined, 'Authentication required'));
      return;
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid user ID format'));
      return;
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'username email')
      .populate('receiver', 'username email')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.json(createResponse(true, messages.map(msg => msg.toJSON())));
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createResponse(false, undefined, 'Authentication required'));
      return;
    }

    const { messageId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid message ID format'));
      return;
    }

    const message = await Message.findById(messageId);

    if (!message) {
      res.status(404).json(createResponse(false, undefined, 'Message not found'));
      return;
    }

    if (message.receiver.toString() !== currentUserId) {
      res.status(403).json(createResponse(false, undefined, 'You can only mark your own received messages as read'));
      return;
    }

    message.read = true;
    await message.save();

    res.json(createResponse(true, message.toJSON()));
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};
