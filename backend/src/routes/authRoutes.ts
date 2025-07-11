import express from 'express';
import { signUp, verifyEmail } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.get('/verify-email', verifyEmail);

export default router;