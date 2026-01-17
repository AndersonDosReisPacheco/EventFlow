import { Request } from 'express';

declare global {
  namespace Express {
    interface AuthRequest extends Request {
      userId?: string;
      userRole?: string;
      user?: any;
    }

    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export {};
