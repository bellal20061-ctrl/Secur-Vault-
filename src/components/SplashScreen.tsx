import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.5,
          type: 'spring',
          stiffness: 150,
        }}
        className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30"
      >
        <Shield size={64} />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-3xl font-bold tracking-tight"
      >
        SecureVault
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-2 text-white/40"
      >
        Your secure password manager.
      </motion.p>
    </motion.div>
  );
};
