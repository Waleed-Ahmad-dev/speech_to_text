import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/emailService';

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