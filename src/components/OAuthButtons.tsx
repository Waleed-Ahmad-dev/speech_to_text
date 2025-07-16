'use client';

import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export function OAuthButtons() {
  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-gray-900 text-sm text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Google Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuthSignIn('google')}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-px shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
        >
          <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-transparent via-blue-500/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex h-full w-full items-center justify-center rounded-[11px] bg-gray-900 px-4 py-3 text-white">
            <FaGoogle className="text-xl text-[#4285F4]" />
            <span className="ml-3 font-medium">Google</span>
          </div>
        </motion.button>

        {/* GitHub Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOAuthSignIn('github')}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-px shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]"
        >
          <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-transparent via-purple-500/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative flex h-full w-full items-center justify-center rounded-[11px] bg-gray-900 px-4 py-3 text-white">
            <FaGithub className="text-xl text-gray-200" />
            <span className="ml-3 font-medium">GitHub</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}