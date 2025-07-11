import prisma from './prisma'
import { cookies } from 'next/headers'

export const getSession = async () => {
     const cookieStore = await cookies()
     const sessionToken = cookieStore.get('sessionToken')?.value
     if (!sessionToken) return null

     const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true }
     })

     if (!session || session.expires < new Date()) {
          return null
     }

     return session
}