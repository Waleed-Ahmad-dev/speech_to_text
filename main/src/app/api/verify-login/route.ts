import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
     try {
          const token = request.nextUrl.searchParams.get('token')

          if (!token) {
               return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
          }

          const verificationToken = await prisma.verificationToken.findUnique({
               where: { token },
          })

          if (!verificationToken) {
               return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
          }

          if (verificationToken.expires < new Date()) {
               await prisma.verificationToken.delete({ where: { token } })
               return NextResponse.json({ error: 'Token expired' }, { status: 400 })
          }

          const user = await prisma.user.findUnique({
               where: { email: verificationToken.identifier },
          })

          if (!user) {
               return NextResponse.json({ error: 'User not found' }, { status: 404 })
          }

          const sessionToken = crypto.randomBytes(32).toString('hex')
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

          await prisma.session.create({
               data: {
                    sessionToken,
                    userId: user.id,
                    expires,
               },
          })

          await prisma.verificationToken.delete({ where: { token } })

          const response = NextResponse.json({
               message: 'Login successful',
               user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
               },
          })

          response.cookies.set('sessionToken', sessionToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
               maxAge: 30 * 24 * 60 * 60,
               path: '/',
          })

          return response
     } catch (error) {
          console.error('Login verification error:', error)
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          )
     }
}