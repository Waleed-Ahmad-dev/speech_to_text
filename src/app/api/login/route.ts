import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendLoginEmail } from '@/services/emailService'

export async function POST(request: Request) {
     try {
          const { email } = await request.json()

          if (!email) {
               return NextResponse.json({ error: 'Email is required' }, { status: 400 })
          }

          const user = await prisma.user.findUnique({
               where: { email },
          })

          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 })
          }

          if (!user.emailVerified) {
               return NextResponse.json(
                    { error: 'Email not verified. Please verify your email first.' },
                    { status: 403 }
               )
          }

          await prisma.verificationToken.deleteMany({
               where: { identifier: email }
          })

          const token = crypto.randomBytes(32).toString('hex')
          const expires = new Date(Date.now() + 15 * 60 * 1000)

          await prisma.verificationToken.create({
               data: {
                    identifier: email,
                    token,
                    expires,
               },
          })

          await sendLoginEmail(email, token)

          return NextResponse.json({
               message: 'Login email sent. Please check your inbox.',
          })
     } catch (error) {
          console.error('Login error:', error)
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          )
     }
}