'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Users, Globe } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  loadedSections?: number;
  totalSections?: number;
}

export function LoadingScreen({ 
  message = "Loading immersive experience...", 
  progress = 0, 
  loadedSections = 0, 
  totalSections = 8 
}: LoadingScreenProps) {

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto px-6"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-6"
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2"
        >
          AxumPulse 360
        </motion.h1>
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-300 text-sm mb-8"
        >
          Ethiopia's First AI-Powered Fitness Platform
        </motion.p>
        
            {/* Loading Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400 text-sm mb-4"
            >
              {message}
            </motion.p>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-xs mx-auto mb-4"
            >
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Loading sections...</span>
                <span>{loadedSections}/{totalSections}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>

        {/* Feature Icons */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-slate-500">AI Coach</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-slate-500">Expert Trainers</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-1">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs text-slate-500">4 Languages</span>
          </div>
        </motion.div> */}
      </motion.div>
    </div>
  );
}