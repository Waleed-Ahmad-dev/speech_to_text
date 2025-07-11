import express from 'express';
import { login, signUp, verifyEmail, verifyLogin } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.get('/verify-email', verifyEmail);
router.post('/login', login)
router.get('/verify-login', verifyLogin);

export default router;