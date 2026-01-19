import { UserRole } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      userId: string; // Alias for id
      email: string;
      role: UserRole;
      name?: string;
      emailVerified?: boolean;
      authorProfileId?: string;
      readerProfileId?: string;
      profileId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// Helper type for authenticated requests (when JwtAuthGuard is used)
export interface AuthenticatedRequest extends ExpressRequest {
  user: Express.User;
}

export {};
