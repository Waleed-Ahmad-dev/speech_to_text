"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
     const [email, setEmail] = useState('');
     const [message, setMessage] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const router = useRouter();

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsLoading(true);

          try {
               const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
               });

               const data = await response.json();
               if (response.ok) {
                    setMessage('Login email sent! Please check your inbox.');
               } else {
                    setMessage(data.error || 'An error occurred');
               }
          } catch (error) {
               setMessage('Failed to connect to server');
          } finally {
               setIsLoading(false);
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
               <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                   Email address
                              </label>
                              <input
                                   id="email"
                                   name="email"
                                   type="email"
                                   autoComplete="email"
                                   required
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="your@email.com"
                                   disabled={isLoading}
                              />
                         </div>

                         <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                         >
                              {isLoading ? 'Sending login link...' : 'Send Magic Link'}
                         </button>
                    </form>

                    {message && (
                         <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
                              {message}
                         </div>
                    )}
               </div>
          </div>
     );
}