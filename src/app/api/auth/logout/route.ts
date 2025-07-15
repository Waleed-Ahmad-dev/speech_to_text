import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

import { cookies } from 'next/headers'

export async function POST(request: Request) {
     try {
          const cookieStore = await cookies();
          const sessionToken = cookieStore.get('sessionToken')?.value

          if (!sessionToken) {
               return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
          }

          // Delete session from database
          await prisma.session.delete({
               where: { sessionToken }
          })

          // Clear cookie
          const response = NextResponse.json({ message: 'Logout successful' })
          response.cookies.delete('sessionToken')

          return response
     } catch (error) {
          console.error('Logout error:', error)
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          )
     }
}