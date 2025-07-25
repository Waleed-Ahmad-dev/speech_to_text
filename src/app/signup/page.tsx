"use client";
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export default function SignupPage() {
     const router = useRouter();
     const containerRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
          // Subtle background animation on mount
          const interval = setInterval(() => {
               if (containerRef.current) {
                    containerRef.current.style.backgroundPosition = 
                         `${Math.random() * 100}% ${Math.random() * 100}%`;
               }
          }, 30000);

          return () => clearInterval(interval);
     }, []);

     return (
          <div 
               ref={containerRef}
               className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 p-4 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
               style={{
                    backgroundSize: '400% 400%',
                    backgroundPosition: '0% 0%',
               }}
          >
               <div className="max-w-md w-full space-y-6">
                    <div className="text-center">
                         <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                              Create Account
                         </h1>
                         <p className="text-gray-400">Sign up using your favorite provider</p>
                    </div>

                    <div className="space-y-5">
                         <OAuthButtons />
                    </div>

                    <div className="text-center pt-4">
                         <p className="text-gray-400">
                              Already have an account?{' '}
                              <Link 
                                   href="/login" 
                                   className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline-offset-4 hover:underline"
                              >
                                   Sign in
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     );
}