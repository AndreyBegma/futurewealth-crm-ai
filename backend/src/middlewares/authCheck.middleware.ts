import { NextFunction, Request, Response } from "express";
import { TokenService } from "@utils/auth/token";

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const payload = TokenService.verifyAccessToken(token);
    
    req.userId = payload.userId;
    req.userEmail = payload.email;
    
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';
    
    res.status(401).json({
      success: false,
      message,
    });
  }
};

export default authMiddleware;