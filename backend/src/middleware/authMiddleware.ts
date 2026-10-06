import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const createResponse = (success: boolean, message?: string) => ({
  success,
  ...(message && { message }),
});

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json(createResponse(false, 'Access denied. No token provided.'));
      return;
    }

    const secret = process.env.JWT_SECRET || 'utasks-default-secret-change-in-production';
    
    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        res.status(401).json(createResponse(false, 'User not found. Token is invalid.'));
        return;
      }

      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      };

      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json(createResponse(false, 'Token has expired. Please login again.'));
        return;
      }
      if (jwtError.name === 'JsonWebTokenError') {
        res.status(401).json(createResponse(false, 'Invalid token.'));
        return;
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json(createResponse(false, 'Server error during authentication.'));
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      next();
      return;
    }

    const secret = process.env.JWT_SECRET || 'utasks-default-secret-change-in-production';
    
    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        };
      }
    } catch {
    }

    next();
  } catch (error) {
    next();
  }
};

export const checkOwnership = (resourceUserIdField: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (!req.user) {
      res.status(401).json(createResponse(false, 'Authentication required.'));
      return;
    }

    if (resourceUserId && resourceUserId !== req.user.id) {
      res.status(403).json(createResponse(false, 'You do not have permission to access this resource.'));
      return;
    }

    next();
  };
};

