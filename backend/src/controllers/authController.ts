import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import mongoose from 'mongoose';

const createResponse = <T>(success: boolean, data?: T, message?: string, errors?: Array<{ message: string }>) => ({
  success,
  ...(data !== undefined && { data }),
  ...(message && { message }),
  ...(errors && { errors }),
});

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'utasks-default-secret-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign({ id: userId }, secret, { expiresIn: expiresIn as any });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json(createResponse(false, undefined, 'Username, email, and password are required'));
      return;
    }

    if (password.length < 6) {
      res.status(400).json(createResponse(false, undefined, 'Password must be at least 6 characters'));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json(createResponse(false, undefined, 'User with this email already exists'));
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json(createResponse(false, undefined, 'Username is already taken'));
      return;
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user._id.toString());

    res.status(201).json(createResponse(true, {
      user: user.toJSON(),
      token,
    }));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Register error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json(createResponse(false, undefined, 'Email and password are required'));
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json(createResponse(false, undefined, 'Invalid email or password'));
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json(createResponse(false, undefined, 'Invalid email or password'));
      return;
    }

    const token = generateToken(user._id.toString());

    res.json(createResponse(true, {
      user: user.toJSON(),
      token,
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json(createResponse(false, undefined, 'Not authorized'));
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    res.json(createResponse(true, user.toJSON()));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json(createResponse(true, undefined, 'Logged out successfully'));
};

export const legacyRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email) {
      res.status(400).json(createResponse(false, undefined, 'Username and email are required'));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json(createResponse(false, undefined, 'User with this email already exists'));
      return;
    }

    const userPassword = password || 'default123';
    const user = await User.create({ username, email, password: userPassword });

    res.status(201).json(createResponse(true, user.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Legacy register error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const legacyGetUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid user ID format'));
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    res.json(createResponse(true, user.toJSON()));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const legacyDeleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid user ID format'));
      return;
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json(createResponse(false, undefined, 'User not found'));
      return;
    }

    res.json(createResponse(true, undefined, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

