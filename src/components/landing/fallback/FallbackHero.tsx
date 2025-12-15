'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, Users, Globe } from 'lucide-react';
import Image from 'next/image';

export function FallbackHero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Dark Background with subtle particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Text Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="text-white">
                  Life with Compound 360
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-slate-300 leading-relaxed"
              >
                AI-driven fitness coaching, expert trainers, and personalized wellness programs—all in <span className="text-blue-400">Amharic, Oromifa, Tigrigna & English</span>
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">24/7</div>
                <div className="text-sm text-slate-400">AI Coach Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">2 ETB</div>
                <div className="text-sm text-slate-400">Daily Subscription</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-1">4</div>
                <div className="text-sm text-slate-400">Languages Supported</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Text 'OK' to Start
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-2" />
                Become a Trainer
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-sm text-slate-400"
            >
              Simply text 'OK' to our short code to get started
            </motion.p>
          </motion.div>

          {/* Image Carousel Fallback - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-96 lg:h-[500px] order-1 lg:order-2"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              
              {/* Placeholder for fitness images */}
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Fitness Journey</h3>
                  <p className="text-slate-300">Your transformation starts here</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
