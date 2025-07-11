import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

          await prisma.user.update({
               where: { email: verificationToken.identifier },
               data: { emailVerified: new Date() },
          })

          await prisma.verificationToken.delete({ where: { token } })

          return NextResponse.json({ message: 'Email verified successfully' })
     } catch (error) {
          console.error('Verification error:', error)
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          )
     }
}