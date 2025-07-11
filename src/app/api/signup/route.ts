import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/services/emailService'

export async function POST(request: Request) {
     try {
          const { email, name } = await request.json()

          if (!email) {
               return NextResponse.json({ error: 'Email is required' }, { status: 400 })
          }

          const existingUser = await prisma.user.findUnique({
               where: { email },
          })

          if (existingUser) {
               return NextResponse.json(
                    { 
                         error: existingUser.emailVerified 
                              ? 'Email already in use' 
                              : 'Verification email already sent. Please check your inbox.'
                    },
                    { status: 400 }
               )
          }

          const user = await prisma.user.create({
               data: {
                    email,
                    name,
                    emailVerified: null,
               },
          })

          const token = crypto.randomBytes(32).toString('hex')
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

          await prisma.verificationToken.create({
               data: {
                    identifier: email,
                    token,
                    expires,
               },
          })

          await sendVerificationEmail(email, token)

          return NextResponse.json({
               message: 'Verification email sent. Please check your inbox.',
               userId: user.id,
          }, { status: 201 })
     } catch (error) {
          console.error('Signup error:', error)
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          )
     }
}