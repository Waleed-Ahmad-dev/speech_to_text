import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;
     const sessionToken = request.cookies.get('sessionToken')?.value;

     // Redirect logged-in users from /login to /transcribe
     if (pathname === '/login' && sessionToken) {
          return NextResponse.redirect(new URL('/transcribe', request.url));
     }

     const protectedExactRoutes = ['/'];
     const protectedPrefixRoutes = ['/dashboard', '/account', '/transcribe'];

     if (protectedExactRoutes.includes(pathname) || protectedPrefixRoutes.some(route => pathname.startsWith(route))) {
          if (!sessionToken) {
               return NextResponse.redirect(new URL('/login', request.url));
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