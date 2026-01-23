'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Zap, RotateCw, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SpinAndWinProps {
  exercise: {
    name: string;
    description?: string;
    muscleGroup?: string;
  };
  onSpin: () => void;
  spinning: boolean;
  onComplete: () => void;
  xpReward: number;
}

export function SpinAndWin({ exercise, onSpin, spinning, onComplete, xpReward }: SpinAndWinProps) {
  const [hasSpun, setHasSpun] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const controls = useAnimation();

  const handleSpin = async () => {
    if (spinning || hasSpun) return;
    
    onSpin();
    setHasSpun(true);

    // Animate spin
    await controls.start({
      rotate: 360 * 5 + Math.random() * 360, // 5 full rotations + random
      transition: {
        duration: 3,
        ease: 'easeOut'
      }
    });

    // Show result after animation
    setTimeout(() => {
      setShowResult(true);
    }, 500);
  };

  const handleComplete = () => {
    onComplete();
    // Reset for next spin
    setHasSpun(false);
    setShowResult(false);
    controls.set({ rotate: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Spinning Wheel */}
      <div className="relative mb-8">
        <motion.div
          animate={controls}
          className="w-64 h-64 rounded-full border-8 border-[var(--neumorphic-border)] relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
          }}
        >
          {/* Wheel segments */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%)'
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: i % 2 === 0 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[var(--neumorphic-bg)] border-4 border-[var(--neumorphic-border)] flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500"></div>
          </div>
        </motion.div>
      </div>

      {/* Result Display */}
      {showResult && exercise ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <NeumorphicCard variant="raised" className="p-6 text-center">
            <div className="mb-4">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-2">
                {exercise.name}
              </h3>
              {exercise.muscleGroup && (
                <Badge variant="secondary" className="mb-2">
                  {exercise.muscleGroup}
                </Badge>
              )}
              {exercise.description && (
                <p className="text-sm text-[var(--neumorphic-muted)]">
                  {exercise.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold text-[var(--neumorphic-text)]">
                +{xpReward} XP
              </span>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              Complete Exercise
            </Button>
          </NeumorphicCard>
        </motion.div>
      ) : (
        <NeumorphicCard variant="raised" className="p-6 text-center">
          <p className="text-[var(--neumorphic-muted)] mb-4">
            Spin the wheel to get a random exercise!
          </p>
          <Button
            onClick={handleSpin}
            disabled={spinning || hasSpun}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <RotateCw className={`h-4 w-4 mr-2 ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? 'Spinning...' : hasSpun ? 'Already Spun' : 'Spin the Wheel!'}
          </Button>
        </NeumorphicCard>
      )}
    </div>
  );
}

