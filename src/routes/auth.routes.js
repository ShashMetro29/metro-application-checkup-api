import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema, signupSchema } from '../validators/schemas.js';

const router = Router();

router.post('/signup', validate(signupSchema), asyncHandler(AuthController.signup));
router.post('/register', validate(signupSchema), asyncHandler(AuthController.signup));
router.post('/login', validate(loginSchema), asyncHandler(AuthController.login));
router.get('/me', authenticate, asyncHandler(AuthController.me));

export default router;
