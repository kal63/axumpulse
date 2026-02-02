'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Zap, RotateCw, Trophy, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SpinAndWinProps {
  exercise: {
    name?: string;
    title?: string; // Challenge format (like "5 Push-ups")
    description?: string;
    requirements?: string; // Challenge requirements (like "Perform 5 push-ups with proper form")
    muscleGroup?: string;
    muscleGroups?: string[];
    sets?: number;
    reps?: string;
    duration?: number;
    restTime?: number;
    equipment?: string;
    category?: string;
    weight?: string;
    // Some APIs might return these variants
    instructions?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | string;
  };
  onSpin: () => void;
  spinning: boolean;
  onComplete: () => void;
  xpReward: number;
  prizes?: Array<{ title: string; xpReward: number }> | string[]; // Optional array of challenges or prize strings
}

export function SpinAndWin({ exercise, onSpin, spinning, onComplete, xpReward, prizes }: SpinAndWinProps) {
  const [hasSpun, setHasSpun] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<string | null>(null);
  const [pendingSpin, setPendingSpin] = useState(false);
  const controls = useAnimation();
  const currentRotationRef = useRef(0);

  // Get the exercise identifier (title or name) for matching
  const getExerciseIdentifier = () => {
    return exercise?.title?.trim() || exercise?.name?.trim() || '';
  };

  // Build wheel prizes from challenges if provided, otherwise use default
  const wheelPrizes = useMemo(() => {
    // Normalize prizes to object format
    let normalizedPrizes: Array<{ title: string; xpReward: number }> = [];
    
    if (prizes && Array.isArray(prizes) && prizes.length > 0) {
      // Check if first item is string or object
      if (typeof prizes[0] === 'string') {
        normalizedPrizes = prizes.map((p: string) => ({ title: p, xpReward: 50 }));
      } else {
        normalizedPrizes = prizes as Array<{ title: string; xpReward: number }>;
      }
    }

    // If we have challenges, use them (ensure exactly 8)
    if (normalizedPrizes.length > 0) {
      if (normalizedPrizes.length < 8) {
        // Fill remaining slots with placeholders
        const placeholders = Array(8 - normalizedPrizes.length).fill(null).map((_, i) => ({
          title: `Challenge ${i + 1}`,
          xpReward: 50
        }));
        return [...normalizedPrizes, ...placeholders].slice(0, 8);
      }
      return normalizedPrizes.slice(0, 8);
    }

    // Fallback to default if no challenges provided
    const defaultPrizes: Array<{ title: string; xpReward: number }> = [
      { title: 'Push-ups', xpReward: 50 },
      { title: 'Sit-ups', xpReward: 50 },
      { title: 'Squats', xpReward: 50 },
      { title: 'Plank', xpReward: 50 },
      { title: 'Jumping Jacks', xpReward: 50 },
      { title: 'Burpees', xpReward: 50 },
      { title: 'Lunges', xpReward: 50 },
      { title: 'Mountain Climbers', xpReward: 50 }
    ];

    const exIdentifier = getExerciseIdentifier();
    if (exIdentifier) {
      // Try to find matching challenge or add it
      const found = defaultPrizes.find(p => p.title === exIdentifier);
      if (!found) {
        defaultPrizes[7] = { title: exIdentifier, xpReward: exercise?.xpReward || 50 };
      }
    }

    return defaultPrizes;
  }, [exercise?.title, exercise?.name, exercise?.xpReward, prizes]);

  const numSegments = wheelPrizes.length;
  const segmentAngle = 360 / numSegments;

  // Segment colors - alternating colors for visual distinction
  const segColors = [
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#8B5CF6', // purple
    '#EC4899', // pink
  ];

  // Compute an absolute rotation (in degrees) that lands the target segment CENTER under the pointer.
  // Our SVG segments start at -90deg (top). Pointer is at the top.
  const rotationForTargetIndex = (targetIndex: number): number => {
    const segmentCenter = -90 + targetIndex * segmentAngle + segmentAngle / 2;
    // We want segmentCenter + rotation ≡ -90 (top). So rotation ≡ -90 - segmentCenter.
    const needed = -90 - segmentCenter;
    return needed;
  };

  const handleSpin = () => {
    if (spinning || hasSpun) return;
    
    onSpin();
    setHasSpun(true);
    setPendingSpin(true);
  };

  // When the backend returns an exercise (spinning -> false), animate wheel to match it.
  useEffect(() => {
    if (!pendingSpin) return;
    if (spinning) return;

    const exIdentifier = getExerciseIdentifier();
    if (!exIdentifier) return;

    // Find target index - wheelPrizes is now always array of objects
    const targetIndex = wheelPrizes.findIndex((p) => p.title === exIdentifier);
    if (targetIndex === -1) return;

    const baseRotations = 6; // feel-good spin
    const targetRotation = rotationForTargetIndex(targetIndex);

    // Make it a big forward spin from current position (CSS rotation is clockwise-positive).
    // Framer uses absolute rotate values, so accumulate.
    const current = currentRotationRef.current;
    const finalRotation = current + baseRotations * 360 + targetRotation;
    currentRotationRef.current = finalRotation;

    setWinningSegment(wheelPrizes[targetIndex].title);

    void controls.start({
      rotate: finalRotation,
      transition: {
        duration: 3,
        ease: [0.17, 0.67, 0.83, 0.67],
      },
    }).then(() => {
      setTimeout(() => setShowResult(true), 300);
      setPendingSpin(false);
    });
  }, [controls, exercise?.name, pendingSpin, spinning, wheelPrizes, segmentAngle]);

  const handleComplete = () => {
    onComplete();
    // Reset for next spin
    setHasSpun(false);
    setShowResult(false);
    setWinningSegment(null);
    setPendingSpin(false);
    currentRotationRef.current = 0;
    controls.set({ rotate: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Spinning Wheel */}
      <div className="relative mb-8">
        {/* Pointer - fixed at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <motion.div
          animate={controls}
          className="w-[400px] h-[400px] rounded-full border-8 border-[var(--neumorphic-border)] relative overflow-hidden"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2), 0 0 20px rgba(0,0,0,0.1)'
          }}
        >
          {/* SVG for segments */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            {wheelPrizes.map((prize, i) => {
              const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
              const centerX = 200;
              const centerY = 200;
              const radius = 200;
              
              const x1 = centerX + radius * Math.cos(startAngle);
              const y1 = centerY + radius * Math.sin(startAngle);
              const x2 = centerX + radius * Math.cos(endAngle);
              const y2 = centerY + radius * Math.sin(endAngle);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={i}
                  d={pathData}
                  fill={segColors[i % segColors.length] || '#8B5CF6'}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Prize/Challenge text */}
          <div className="absolute inset-0">
            {wheelPrizes.map((prize, i) => {
              const segmentCenterAngle = (i * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
              const textRadius = 140;
              const textX = 200 + textRadius * Math.cos(segmentCenterAngle);
              const textY = 200 + textRadius * Math.sin(segmentCenterAngle);
              
              // wheelPrizes is now always array of objects
              const prizeTitle = prize.title;
              const prizeXP = prize.xpReward;
              
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${textX}px`,
                    top: `${textY}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="text-center"
                    style={{
                      transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <span 
                      className="text-sm font-bold text-white whitespace-nowrap block"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {prizeTitle}
                    </span>
                    {prizeXP && (
                      <span 
                        className="text-xs font-semibold text-white whitespace-nowrap block mt-0.5"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        +{prizeXP} XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-[var(--neumorphic-bg)] border-4 border-[var(--neumorphic-border)] flex items-center justify-center shadow-lg z-10">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
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
          <NeumorphicCard variant="raised" className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--neumorphic-text)] mb-2 text-center">
                {exercise.title || exercise.name || 'Challenge'}
              </h3>
              {exercise.description && (
                <p className="text-sm text-[var(--neumorphic-muted)] mb-3 text-center">
                  {exercise.description}
                </p>
              )}
              
              {/* Requirements section - like daily challenges */}
              {exercise.requirements && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-[var(--neumorphic-muted)]" />
                    <span className="text-sm font-medium text-[var(--neumorphic-text)]">
                      Requirements:
                    </span>
                  </div>
                  <p className="text-sm text-[var(--neumorphic-muted)] ml-6">
                    {exercise.requirements}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                {exercise.category && (
                  <Badge variant="secondary">
                    {exercise.category}
                  </Badge>
                )}
                {exercise.muscleGroup && (
                  <Badge variant="secondary">
                    {exercise.muscleGroup}
                  </Badge>
                )}
                {Array.isArray(exercise.muscleGroups) && exercise.muscleGroups.length > 0 && (
                  <Badge variant="secondary">
                    {exercise.muscleGroups.join(', ')}
                  </Badge>
                )}
                {exercise.difficulty && (
                  <Badge variant="secondary" className="capitalize">
                    {exercise.difficulty}
                  </Badge>
                )}
              </div>
              
              {exercise.instructions && !exercise.description && (
                <p className="text-sm text-[var(--neumorphic-muted)] mb-3 text-center">
                  {exercise.instructions}
                </p>
              )}
            </div>

            {/* Extra details (only show if present) */}
            {(exercise.sets || exercise.reps || exercise.duration || exercise.restTime || exercise.equipment || exercise.weight) && (
              <div className="grid grid-cols-2 gap-2 text-sm text-[var(--neumorphic-muted)] mb-4">
                {typeof exercise.sets === 'number' && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Sets:</span> {exercise.sets}
                  </div>
                )}
                {exercise.reps && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Reps:</span> {exercise.reps}
                  </div>
                )}
                {typeof exercise.duration === 'number' && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Duration:</span> {exercise.duration}s
                  </div>
                )}
                {typeof exercise.restTime === 'number' && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Rest:</span> {exercise.restTime}s
                  </div>
                )}
                {exercise.equipment && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2 col-span-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Equipment:</span> {exercise.equipment}
                  </div>
                )}
                {exercise.weight && (
                  <div className="rounded-md border border-[var(--neumorphic-border)] px-3 py-2 col-span-2">
                    <span className="font-semibold text-[var(--neumorphic-text)]">Weight:</span> {exercise.weight}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-4 pt-4 border-t border-[var(--neumorphic-border)]">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                  +{exercise?.xpReward || xpReward} XP
                </span>
              </div>
              {exercise.difficulty && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {exercise.difficulty}
                </Badge>
              )}
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

