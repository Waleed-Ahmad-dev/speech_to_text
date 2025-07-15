import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function CheckEmailPage({
     searchParams,
}: {
     searchParams: { email?: string };
}) {
     const email = searchParams.email;

     if (!email) {
          redirect('/signup');
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
                              Check your email
                         </h2>
                         <p className="mt-4 text-gray-600">
                              We've sent a verification link to{' '}
                              <span className="font-semibold">{email}</span>. Please check your
                              inbox and click the link to verify your account.
                         </p>
                         <div className="mt-6">
                              <Link
                                   href="/login"
                                   className="text-blue-600 hover:text-blue-500 font-medium"
                              >
                                   Go to login
                              </Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}