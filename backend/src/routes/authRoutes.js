import express from 'express';
import { registerPatient, login } from '../controllers/authController.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginRateLimiter, login);

export default router;


