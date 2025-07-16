"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export default function SignupPage() {
     const router = useRouter();
     const [email, setEmail] = useState('');
     const [name, setName] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);
     const [focusedField, setFocusedField] = useState<string | null>(null);
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

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError('');

          try {
               const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name }),
               });

               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.error || 'Signup failed');
               }

               router.push(`/check-email?email=${encodeURIComponent(email)}`);
          } catch (err: any) {
               setError(err.message || 'An error occurred');
               setLoading(false);
          }
     };

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
                         <p className="text-gray-400">Join our community of innovators</p>
                    </div>

                    <div className={`overflow-hidden transition-all duration-500 ease-out ${error ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                         <div className="bg-red-900/30 backdrop-blur-sm border border-red-800/50 text-red-200 px-4 py-3 rounded-lg">
                              {error}
                         </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                         <div className="relative">
                              <label 
                                   htmlFor="name" 
                                   className={`absolute left-4 transition-all duration-300 ease-out ${
                                        focusedField === 'name' || name 
                                        ? 'text-cyan-400 -top-5 text-xs' 
                                        : 'text-gray-500 top-3'
                                   }`}
                              >
                                   Full Name
                              </label>
                              <input
                                   id="name"
                                   name="name"
                                   type="text"
                                   required
                                   className="w-full px-4 py-3 bg-gray-800/40 backdrop-blur-lg border border-gray-700/60 rounded-lg text-white placeholder-transparent focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
                                   placeholder="Full Name"
                                   value={name}
                                   onChange={(e) => setName(e.target.value)}
                                   onFocus={() => setFocusedField('name')}
                                   onBlur={() => !name && setFocusedField(null)}
                              />
                         </div>

                         <div className="relative">
                              <label 
                                   htmlFor="email-address" 
                                   className={`absolute left-4 transition-all duration-300 ease-out ${
                                        focusedField === 'email' || email 
                                        ? 'text-cyan-400 -top-5 text-xs' 
                                        : 'text-gray-500 top-3'
                                   }`}
                              >
                                   Email Address
                              </label>
                              <input
                                   id="email-address"
                                   name="email"
                                   type="email"
                                   autoComplete="email"
                                   required
                                   className="w-full px-4 py-3 bg-gray-800/40 backdrop-blur-lg border border-gray-700/60 rounded-lg text-white placeholder-transparent focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-300"
                                   placeholder="Email address"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   onFocus={() => setFocusedField('email')}
                                   onBlur={() => !email && setFocusedField(null)}
                              />
                         </div>

                         <button
                              type="submit"
                              disabled={loading}
                              className={`w-full py-3.5 px-4 rounded-lg font-medium transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              loading 
                                   ? 'bg-cyan-600/50 cursor-not-allowed' 
                                   : 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500/90 hover:to-blue-500/90 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20'
                              } relative overflow-hidden group`}
                         >
                              <span className="relative z-10 text-white">
                                   {loading ? (
                                        <span className="flex items-center justify-center">
                                             <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                                  Processing...
                                             </span>
                                   ) : (
                                        "Sign Up"
                                   )}
                              </span>
                              <span 
                                   className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                   aria-hidden="true"
                              ></span>
                         </button>
                    </form>

                    <OAuthButtons />

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