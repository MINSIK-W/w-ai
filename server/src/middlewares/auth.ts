import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/express';

interface UserPrivateMetadata {
  free_usage?: number;
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const { userId, has } = await req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found',
      });
    }

    const hasPremiumPlan = await has({ plan: 'premium' });
    const user = await clerkClient.users.getUser(userId);

    const privateMetadata = user.privateMetadata as UserPrivateMetadata;

    if (!hasPremiumPlan && typeof privateMetadata.free_usage === 'number') {
      req.free_usage = privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? 'premium' : 'free';
    next();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Authentication failed';
    console.error('Auth middleware error:', err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
};
