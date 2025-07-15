'use client';

import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export function OAuthButtons() {
     const handleOAuthSignIn = (provider: 'google' | 'github') => {
          signIn(provider, { callbackUrl: '/' });
     };

     return (
          <div className="mt-6">
               <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                         <span className="px-2 bg-white text-gray-500">
                              Or continue with
                         </span>
                    </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                         onClick={() => handleOAuthSignIn('google')}
                         className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                         <FaGoogle className="h-5 w-5 text-blue-500" />
                         <span className="ml-2">Google</span>
                    </button>
                    <button
                         onClick={() => handleOAuthSignIn('github')}
                         className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                         <FaGithub className="h-5 w-5 text-gray-800" />
                         <span className="ml-2">GitHub</span>
                    </button>
               </div>
          </div>
     );
}