import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
     service: 'gmail', // use 'gmail' instead of manually setting host/port
     auth: {
          user: process.env.EMAIL_USER,      // Gmail address (e.g., yourname@gmail.com)
          pass: process.env.EMAIL_PASSWORD,  // App password (not your actual Gmail password)
     },
});

export const sendVerificationEmail = async (email: string, token: string) => {
     const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

     await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify Your Email',
          html: `
               <p>Please click the link below to verify your email:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>
          `,
     });
};

export const sendLoginEmail = async (email: string, token: string) => {
     const loginUrl = `${process.env.BASE_URL}/verify-login?token=${token}`;

     await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Your Login Link',
          html: `
               <p>Click the link below to log in:</p>
               <a href="${loginUrl}">Login to Your Account</a>
               <p>This link will expire in 15 minutes.</p>
          `,
     });
};