// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt' // Add this import

export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;

     // Use NextAuth's getToken to handle session detection
     const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET
     });

     const isAuthenticated = !!token;

     // Redirect logged-in users away from login page
     if (pathname === '/login' && isAuthenticated) {
          return NextResponse.redirect(new URL('/', request.url));
     }

     const protectedRoutes = [
          '/',
          '/dashboard',
          '/account',
          '/transcribe'
     ];

     const isProtectedRoute = protectedRoutes.some(route => 
          pathname === route || pathname.startsWith(`${route}/`)
     );

     if (isProtectedRoute && !isAuthenticated) {
          return NextResponse.redirect(new URL('/login', request.url));
     }

     // Add user to request headers if authenticated
     if (isAuthenticated) {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', token.sub || '');
     
          return NextResponse.next({
               request: {
                    headers: requestHeaders,
               }
          });
     }

     return NextResponse.next();
}