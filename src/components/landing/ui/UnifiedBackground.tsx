'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type PulseTiming = { duration: string; delay: string };

export function UnifiedBackground() {
  const particlesRef = useRef<HTMLDivElement>(null);
  const squaresRef = useRef<HTMLDivElement>(null);
  const [pulseTimings, setPulseTimings] = useState<PulseTiming[]>([]);

  // Generate random pulse timings only on the client to avoid SSR hydration mismatches
  useEffect(() => {
    const timings: PulseTiming[] = Array.from({ length: 64 }).map(() => ({
      duration: `${2 + Math.random() * 2}s`, // 2s - 4s
      delay: `${Math.random() * 2}s`,        // 0s - 2s
    }));
    setPulseTimings(timings);
  }, []);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      const size = Math.random() * 4 + 2; // 2-6px
      const colors = [
        'from-blue-400 to-purple-500',
        'from-cyan-400 to-blue-500',
        'from-purple-400 to-pink-500',
        'from-cyan-400 to-purple-500'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      particle.className = `absolute bg-gradient-to-r ${randomColor} rounded-full opacity-70`;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';

      const container = particlesRef.current;
      if (container) {
        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        }, 5000);
      }
    };

    const interval = setInterval(createParticle, 500); // More frequent
    return () => clearInterval(interval);
  }, []);

  // Create bigger squares with very low opacity
  useEffect(() => {
    const createSquare = () => {
      const square = document.createElement('div');
      const size = Math.random() * 6 + 6; // 6-12px (bigger)
      const colors = [
        'from-blue-500/3 to-purple-500/3',
        'from-cyan-500/3 to-blue-500/3',
        'from-purple-500/3 to-pink-500/3',
        'from-cyan-500/3 to-purple-500/3'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      square.className = `absolute bg-gradient-to-br ${randomColor} rounded-lg opacity-0`;
      square.style.width = size + 'px';
      square.style.height = size + 'px';
      square.style.left = Math.random() * 100 + '%';
      square.style.top = Math.random() * 100 + '%';
      square.style.animationDuration = (Math.random() * 3 + 2) + 's';
      square.style.animationDelay = Math.random() * 1 + 's';

      const container = squaresRef.current;
      if (container) {
        container.appendChild(square);

        // Animate square appearance (very low opacity)
        setTimeout(() => {
          square.style.opacity = '0.15'; // Very low opacity
          square.style.transform = 'scale(1.2) rotate(45deg)';
          square.style.transition = 'all 1.5s ease-in-out';
        }, 100);

        // Remove square after animation
        setTimeout(() => {
          if (container.contains(square)) {
            container.removeChild(square);
          }
        }, 6000);
      }
    };

    const interval = setInterval(createSquare, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Multiple animated gradient orbs - more subtle */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 left-1/6 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Floating particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(59, 130, 246, 0.3), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(147, 51, 234, 0.3), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(6, 182, 212, 0.3), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(59, 130, 246, 0.3), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(147, 51, 234, 0.3), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          animation: 'float 20s linear infinite'
        }}
      />

      {/* Animated grid pattern - bigger squares with very low opacity */}
      <div className="absolute inset-0 opacity-1">
        <div className="grid grid-cols-8 gap-8 h-full">
          {pulseTimings.map((timing, i) => (
            <div
              key={i}
              className="bg-blue-400 rounded-lg animate-pulse"
              style={{
                animationDuration: timing.duration,
                animationDelay: timing.delay,
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>
      </div>

      {/* Glowing squares */}
      <div
        ref={squaresRef}
        className="absolute inset-0"
      />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-100px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
