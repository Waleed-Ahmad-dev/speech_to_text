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
