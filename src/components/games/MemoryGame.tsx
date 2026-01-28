'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, Trophy, RotateCcw } from 'lucide-react';

interface ExercisePair {
  exercise1: {
    name: string;
    muscleGroup?: string;
    description?: string;
  };
  exercise2: {
    name: string;
    muscleGroup?: string;
    description?: string;
  };
}

interface MemoryGameProps {
  pairs: ExercisePair[];
  onComplete: (matches: number, attempts: number, timeTaken: number) => void;
  xpReward: number;
}

interface Tile {
  id: number;
  exercise: {
    name: string;
    muscleGroup?: string;
    description?: string;
  };
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

export function MemoryGame({ pairs, onComplete, xpReward }: MemoryGameProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [initialReveal, setInitialReveal] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tiles from pairs
  useEffect(() => {
    const newTiles: Tile[] = [];
    pairs.forEach((pair, pairIndex) => {
      newTiles.push(
        {
          id: pairIndex * 2,
          exercise: pair.exercise1,
          pairId: pairIndex,
          flipped: false,
          matched: false
        },
        {
          id: pairIndex * 2 + 1,
          exercise: pair.exercise2,
          pairId: pairIndex,
          flipped: false,
          matched: false
        }
      );
    });
    
    // Shuffle tiles
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i], newTiles[j]] = [newTiles[j], newTiles[i]];
    }
    
    setTiles(newTiles);
  }, [pairs]);

  // Initial reveal - show all cards for 3 seconds when game starts
  useEffect(() => {
    if (gameStarted && initialReveal) {
      // Show all tiles initially
      setTiles(prev => prev.map(t => ({ ...t, flipped: true })));
      
      // Hide them after 3 seconds
      revealTimeoutRef.current = setTimeout(() => {
        setTiles(prev => prev.map(t => ({ ...t, flipped: false })));
        setInitialReveal(false);
      }, 3000);
    }

    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, [gameStarted, initialReveal]);

  // Timer
  useEffect(() => {
    if (gameStarted && !gameComplete && startTime && !initialReveal) {
      timerRef.current = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameComplete, startTime, initialReveal]);

  const handleStart = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleTileClick = (tileId: number) => {
    if (!gameStarted || gameComplete || initialReveal) return;
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.flipped || tile.matched) return;
    if (flippedTiles.length >= 2) return;

    // Flip tile
    const newFlippedTiles = [...flippedTiles, tileId];
    setFlippedTiles(newFlippedTiles);

    setTiles(prev => prev.map(t => 
      t.id === tileId ? { ...t, flipped: true } : t
    ));

    // Check for match when 2 tiles are flipped
    if (newFlippedTiles.length === 2) {
      setAttempts(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedTiles;
      const firstTile = tiles.find(t => t.id === firstId);
      const secondTile = tiles.find(t => t.id === secondId);

      if (firstTile && secondTile && firstTile.pairId === secondTile.pairId) {
        // Match found - keep them visible
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.pairId === firstTile.pairId ? { ...t, matched: true, flipped: true } : t
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === pairs.length) {
              // Game complete
              const finalTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
              setGameComplete(true);
              onComplete(newMatches, attempts + 1, finalTime);
            }
            return newMatches;
          });
          setFlippedTiles([]);
        }, 500);
      } else {
        // No match, show for 2 seconds then flip back
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            newFlippedTiles.includes(t.id) ? { ...t, flipped: false } : t
          ));
          setFlippedTiles([]);
        }, 2000); // Show for 2 seconds before hiding
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="text-center">
        <NeumorphicCard variant="raised" className="p-8">
          <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] mb-4">
            Memory Game
          </h2>
          <p className="text-[var(--neumorphic-muted)] mb-6">
            Match exercise pairs to win! Find all {pairs.length} pairs.
          </p>
          <Button
            onClick={handleStart}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            Start Game
          </Button>
        </NeumorphicCard>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <NeumorphicCard variant="raised" className="p-8">
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
            Game Complete!
          </h2>
          <p className="text-xl text-[var(--neumorphic-muted)] mb-6">
            You matched all {pairs.length} pairs in {formatTime(timeTaken)}!
          </p>
          <div className="space-y-2 mb-6">
            <div className="text-sm text-[var(--neumorphic-muted)]">
              Attempts: {attempts}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold text-[var(--neumorphic-text)]">
                +{xpReward} XP
              </span>
            </div>
          </div>
        </NeumorphicCard>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Stats - Compact */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <NeumorphicCard variant="raised" className="p-2 text-center">
          <div className="text-lg font-bold text-[var(--neumorphic-text)]">
            {matches}/{pairs.length}
          </div>
          <div className="text-[10px] text-[var(--neumorphic-muted)]">Matches</div>
        </NeumorphicCard>
        <NeumorphicCard variant="raised" className="p-2 text-center">
          <div className="text-lg font-bold text-[var(--neumorphic-text)]">
            {attempts}
          </div>
          <div className="text-[10px] text-[var(--neumorphic-muted)]">Attempts</div>
        </NeumorphicCard>
        <NeumorphicCard variant="raised" className="p-2 text-center">
          <div className="text-lg font-bold text-[var(--neumorphic-text)]">
            {formatTime(timeTaken)}
          </div>
          <div className="text-[10px] text-[var(--neumorphic-muted)]">Time</div>
        </NeumorphicCard>
      </div>

      {/* Game Grid - More compact */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-1.5 sm:gap-2 max-w-5xl mx-auto">
        {tiles.map((tile) => (
          <motion.button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={tile.matched || flippedTiles.length >= 2 || initialReveal}
            className={`
              aspect-square rounded-md p-1 sm:p-1.5 transition-all
              ${tile.matched 
                ? 'bg-green-500/20 border border-green-500' 
                : tile.flipped
                ? 'bg-[var(--neumorphic-surface)] border border-cyan-500'
                : 'bg-[var(--neumorphic-surface)] border border-[var(--neumorphic-border)] hover:border-cyan-500/50'
              }
              ${initialReveal ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileHover={!tile.flipped && !tile.matched && !initialReveal ? { scale: 1.05 } : {}}
            whileTap={!tile.flipped && !tile.matched && !initialReveal ? { scale: 0.95 } : {}}
          >
            {tile.flipped || tile.matched ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-0.5">
                <div className="font-semibold text-[10px] sm:text-[11px] text-[var(--neumorphic-text)] line-clamp-2 leading-tight">
                  {tile.exercise.name}
                </div>
                {tile.exercise.muscleGroup && (
                  <Badge variant="secondary" className="text-[8px] px-0.5 py-0 h-3 leading-tight">
                    {tile.exercise.muscleGroup}
                  </Badge>
                )}
                {tile.matched && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center relative overflow-hidden rounded">
                {/* Card back gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700"></div>
                
                {/* Diagonal stripe pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 8px,
                    rgba(255, 255, 255, 0.15) 8px,
                    rgba(255, 255, 255, 0.15) 16px
                  )`
                }}></div>
                
                {/* Corner decorative elements */}
                <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-white/40 rounded-tl"></div>
                <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-white/40 rounded-tr"></div>
                <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-white/40 rounded-bl"></div>
                <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-white/40 rounded-br"></div>
                
                {/* Center logo/icon */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <svg 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white/90" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <div className="text-[7px] sm:text-[9px] text-white/90 font-bold tracking-wider mt-0.5">
                    FITNESS
                  </div>
                </div>
                
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 pointer-events-none"></div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
      
      {initialReveal && (
        <div className="text-center mt-2">
          <p className="text-xs text-[var(--neumorphic-muted)]">
            Memorize the pairs... Cards will hide in a moment!
          </p>
        </div>
      )}
    </div>
  );
}

