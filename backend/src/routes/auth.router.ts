import authController from '@/controllers/auth.controller';
import authMiddleware from '@/middlewares/authCheck.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { signinSchema, signupSchema } from '@/validations/auth.validation';
import { Router } from 'express';

const authRouter = Router();

authRouter.get('/me', authMiddleware, authController.getCurrentUser);

authRouter.post('/sign-up', validate(signupSchema), authController.signUp);
authRouter.post('/sign-in', validate(signinSchema), authController.signIn);
authRouter.post('/refresh', authController.refreshTokens);

export default authRouter;
