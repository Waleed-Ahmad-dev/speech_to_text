import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendLoginEmail, sendVerificationEmail } from '../services/emailService';

const prisma = new PrismaClient();

export const signUp = async (req: Request, res: Response): Promise<void> => {
     const { email, name } = req.body;

     try {
          // Validate input
          if (!email) {
               res.status(400).json({ error: 'Email is required' });
               return;
          }

          // Check for existing user
          const existingUser = await prisma.user.findUnique({
               where: { email },
          });

          if (existingUser) {
               res.status(400).json({ 
                    error: existingUser.emailVerified 
                         ? 'Email already in use' 
                         : 'Verification email already sent. Please check your inbox.'
                    });
               return;
          }

          // Create new user
          const user = await prisma.user.create({
               data: {
                    email,
                    name,
                    emailVerified: null, // Explicitly set to null
               },
          });

          // Generate verification token
          const token = crypto.randomBytes(32).toString('hex');
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          // Save verification token
          await prisma.verificationToken.create({
               data: {
                    identifier: email,
                    token,
                    expires,
               },
          });

          // Send verification email
          await sendVerificationEmail(email, token);

          res.status(201).json({
               message: 'Verification email sent. Please check your inbox.',
               userId: user.id,
          });
     } catch (error) {
          console.error('Signup error:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
     const { token } = req.query;

     try {
          if (!token || typeof token !== 'string') {
               res.status(400).json({ error: 'Invalid token' });
               return;
          }

          const verificationToken = await prisma.verificationToken.findUnique({
               where: { token },
          });

          if (!verificationToken) {
               res.status(400).json({ error: 'Invalid token' });
               return;
          }

          if (verificationToken.expires < new Date()) {
               await prisma.verificationToken.delete({ where: { token } });
               res.status(400).json({ error: 'Token expired' });
               return;
          }

          // Update user verification status
          await prisma.user.update({
               where: { email: verificationToken.identifier },
               data: { emailVerified: new Date() },
          });

          // Delete verification token
          await prisma.verificationToken.delete({ where: { token } });

          res.status(200).json({ message: 'Email verified successfully' });
     } catch (error) {
          console.error('Verification error:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
};

export const login = async (req: Request, res: Response): Promise<void> => {
     const { email } = req.body;

     try {
          // Validate input
          if (!email) {
               res.status(400).json({ error: 'Email is required' });
               return;
          }

          // Check if user exists
          const user = await prisma.user.findUnique({
               where: { email },
          });

          if (!user) {
               res.status(404).json({ error: 'User not found' });
               return;
          }

          // Check if email is verified
          if (!user.emailVerified) {
               res.status(403).json({ 
                    error: 'Email not verified. Please verify your email first.' 
               });
               return;
          }

          // Delete any existing login tokens for this email
          await prisma.verificationToken.deleteMany({
               where: { identifier: email }
          });

          // Generate login token
          const token = crypto.randomBytes(32).toString('hex');
          const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

          // Save login token
          await prisma.verificationToken.create({
               data: {
                    identifier: email,
                    token,
                    expires,
               },
          });

          // Send login email
          await sendLoginEmail(email, token);

          res.status(200).json({
               message: 'Login email sent. Please check your inbox.',
          });
     } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
};

export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
     const { token } = req.query;

     try {
          if (!token || typeof token !== 'string') {
               res.status(400).json({ error: 'Invalid token' });
               return;
          }

          // Verify token
          const verificationToken = await prisma.verificationToken.findUnique({
               where: { token },
          });

          if (!verificationToken) {
               res.status(400).json({ error: 'Invalid token' });
               return;
          }

          if (verificationToken.expires < new Date()) {
               await prisma.verificationToken.delete({ where: { token } });
               res.status(400).json({ error: 'Token expired' });
               return;
          }

          // Get user
          const user = await prisma.user.findUnique({
               where: { email: verificationToken.identifier },
          });

          if (!user) {
               res.status(404).json({ error: 'User not found' });
               return;
          }

          // Create session (using your Session model)
          const sessionToken = crypto.randomBytes(32).toString('hex');
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

          await prisma.session.create({
               data: {
                    sessionToken,
                    userId: user.id,
                    expires,
               },
          });

          // Delete used token
          await prisma.verificationToken.delete({ where: { token } });

          // Set session cookie (adjust based on your frontend needs)
          res.cookie('sessionToken', sessionToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
               maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });

          res.status(200).json({
               message: 'Login successful',
               user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
               },
          });
     } catch (error) {
          console.error('Login verification error:', error);
          res.status(500).json({ error: 'Internal server error' });
     }
};