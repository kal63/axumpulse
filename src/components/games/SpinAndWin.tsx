'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  prizes?: string[]; // Optional array of prizes/challenges to display
}

export function SpinAndWin({ exercise, onSpin, spinning, onComplete, xpReward, prizes }: SpinAndWinProps) {
  const [hasSpun, setHasSpun] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<string | null>(null);
  const [pendingSpin, setPendingSpin] = useState(false);
  const controls = useAnimation();
  const currentRotationRef = useRef(0);

  // Default prizes/challenges if not provided
  const defaultPrizes = [
    'Push-ups',
    'Sit-ups',
    'Squats',
    'Plank',
    'Jumping Jacks',
    'Burpees',
    'Lunges',
    'Mountain Climbers'
  ];
  
  // Ensure the current backend-selected exercise is representable on the wheel
  const wheelPrizes = useMemo(() => {
    const base = (prizes && prizes.length > 0) ? prizes : defaultPrizes;
    const exName = exercise?.name?.trim();

    // If backend returns something outside the base list, include it so we can land on it.
    const merged = exName && !base.includes(exName) ? [...base, exName] : [...base];

    // Keep wheel size reasonable (8 segments). Ensure exercise stays included.
    const unique = Array.from(new Set(merged));
    if (unique.length <= 8) return unique;

    if (exName && unique.includes(exName)) {
      const withoutEx = unique.filter(x => x !== exName).slice(0, 7);
      return [...withoutEx, exName];
    }

    return unique.slice(0, 8);
  }, [exercise?.name, prizes]);

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

    const exName = exercise?.name?.trim();
    if (!exName) return;

    const targetIndex = wheelPrizes.indexOf(exName);
    if (targetIndex === -1) return;

    const baseRotations = 6; // feel-good spin
    const targetRotation = rotationForTargetIndex(targetIndex);

    // Make it a big forward spin from current position (CSS rotation is clockwise-positive).
    // Framer uses absolute rotate values, so accumulate.
    const current = currentRotationRef.current;
    const finalRotation = current + baseRotations * 360 + targetRotation;
    currentRotationRef.current = finalRotation;

    setWinningSegment(exName);

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
                  <span 
                    className="text-sm font-bold text-white whitespace-nowrap block"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
                      transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    {prize}
                  </span>
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

