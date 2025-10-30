import type { Request, Response } from 'express';
import authService from '@/services/auth.service';

class AuthController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { accessToken: result.tokens.accessToken },
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { accessToken: result.tokens.accessToken },
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async refreshTokens(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { accessToken: tokens.accessToken },
      });
    } catch (error) {
      console.error('Token refresh error:', error);

      res.clearCookie('refreshToken');
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get current user error:', error);

      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  }
}

export default new AuthController();
