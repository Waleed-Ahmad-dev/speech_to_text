import { redirect } from 'next/navigation';

export default async function VerifyEmailPage({
     searchParams,
}: {
     searchParams: { token?: string };
}) {
     const token = searchParams.token;

     if (!token) {
          redirect('/signup');
     }

     try {
          const response = await fetch(
               `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
          );
          const data = await response.json();

          if (!response.ok) {
               throw new Error(data.error || 'Verification failed');
          }

          return (
               <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full space-y-8 text-center">
                         <div className="bg-white p-8 rounded shadow-md">
                              <svg
                                   className="mx-auto h-12 w-12 text-green-500"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                   />
                              </svg>
                              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                   Email Verified!
                              </h2>
                              <p className="mt-4 text-gray-600">
                                   Your email has been successfully verified. You can now sign in to
                                   your account.
                              </p>
                              <div className="mt-6">
                                   <a
                                        href="/login"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                   >
                                        Sign In
                                   </a>
                              </div>
                         </div>
                    </div>
               </div>
          );
     } catch (error: any) {
          return (
               <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full space-y-8 text-center">
                         <div className="bg-white p-8 rounded shadow-md">
                              <svg
                                   className="mx-auto h-12 w-12 text-red-500"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                   />
                              </svg>
                              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                   Verification Failed
                              </h2>
                              <p className="mt-4 text-gray-600">
                                   {error.message || 'The verification link is invalid or has expired.'}
                              </p>
                              <div className="mt-6">
                                   <a
                                        href="/signup"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                   >
                                        Try Again
                                   </a>
                              </div>
                         </div>
                    </div>
               </div>
          );
     }
}