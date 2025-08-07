import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth(): Promise<{
        userId: string;
        has: (params: { plan: string }) => Promise<boolean>;
      }>;
      free_usage?: number;
      plan?: string;
    }
  }
}

export {};
