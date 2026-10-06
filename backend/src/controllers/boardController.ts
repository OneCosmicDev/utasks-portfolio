import { Request, Response } from 'express';
import { Board, User } from '../models';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';

const createResponse = <T>(success: boolean, data?: T, message?: string, errors?: Array<{ message: string }>) => ({
  success,
  ...(data !== undefined && { data }),
  ...(message && { message }),
  ...(errors && { errors }),
});

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, userId } = req.body;

    const boardUserId = req.user?.id || userId;
    if (!name) {
      res.status(400).json(createResponse(false, undefined, 'Name is required'));
      return;
    }

    if (!boardUserId) {
      res.status(400).json(createResponse(false, undefined, 'User ID is required'));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(boardUserId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid user ID format'));
      return;
    }

    if (req.user && req.user.id !== boardUserId) {
      res.status(403).json(createResponse(false, undefined, 'You can only create boards for yourself'));
      return;
    }

    const user = await User.findById(boardUserId);
    if (!user) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    const board = await Board.create({ name, description, userId: boardUserId });

    res.status(201).json(createResponse(true, board.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Create board error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getBoardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid board ID format'));
      return;
    }

    const board = await Board.findById(id);

    if (!board) {
      res.status(404).json(createResponse(false, undefined, 'Board not found'));
      return;
    }

    if (req.user && board.userId.toString() !== req.user.id) {
      res.status(403).json(createResponse(false, undefined, 'You do not have access to this board'));
      return;
    }

    res.json(createResponse(true, board.toJSON()));
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid board ID format'));
      return;
    }

    const existingBoard = await Board.findById(id);

    if (!existingBoard) {
      res.status(404).json(createResponse(false, undefined, 'Board not found'));
      return;
    }

    if (req.user && existingBoard.userId.toString() !== req.user.id) {
      res.status(403).json(createResponse(false, undefined, 'You do not have permission to update this board'));
      return;
    }

    const updateData: { name?: string; description?: string; userId?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (userId !== undefined) updateData.userId = userId;

    const board = await Board.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(createResponse(true, board!.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Update board error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid board ID format'));
      return;
    }

    const existingBoard = await Board.findById(id);

    if (!existingBoard) {
      res.status(404).json(createResponse(false, undefined, 'Board not found'));
      return;
    }

    if (req.user && existingBoard.userId.toString() !== req.user.id) {
      res.status(403).json(createResponse(false, undefined, 'You do not have permission to delete this board'));
      return;
    }

    await Board.findOneAndDelete({ _id: id });

    res.json(createResponse(true, undefined, 'Board deleted successfully'));
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getBoardsByUserId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid user ID format'));
      return;
    }

    if (req.user && req.user.id !== userId) {
      res.status(403).json(createResponse(false, undefined, 'You can only access your own boards'));
      return;
    }

    const boards = await Board.find({ userId }).sort({ createdAt: -1 });

    res.json(createResponse(true, boards.map(board => board.toJSON())));
  } catch (error) {
    console.error('Get boards by user error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getMyBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(createResponse(false, undefined, 'Authentication required'));
      return;
    }

    const boards = await Board.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json(createResponse(true, boards.map(board => board.toJSON())));
  } catch (error) {
    console.error('Get my boards error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};
