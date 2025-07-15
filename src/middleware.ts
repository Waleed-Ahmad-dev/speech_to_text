import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function middleware(request: NextRequest) {
     const protectedRoutes = ['/dashboard', '/account', '/transcribe'];
     const { pathname } = request.nextUrl;


     if (protectedRoutes.some(route => pathname.startsWith(route))) {
          const sessionToken = request.cookies.get('sessionToken')?.value;

          if (!sessionToken) {
               return NextResponse.redirect(new URL('/login', request.url));
          }
          if (pathname === '/login' && sessionToken) {
               return NextResponse.redirect(new URL('/', request.url));
          }

          const session = await prisma.session.findUnique({
               where: { sessionToken },
               include: { user: true }
          });

          if (!session || session.expires < new Date()) {
               // Clear invalid session
               const response = NextResponse.redirect(new URL('/login', request.url));
               response.cookies.delete('sessionToken');
               return response;
          }

          // Add user to request headers
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', session.user.id);

          return NextResponse.next({
               request: {
                    headers: requestHeaders,
               }
          });
     }


     return NextResponse.next();
}