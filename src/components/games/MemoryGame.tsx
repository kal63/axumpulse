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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Timer
  useEffect(() => {
    if (gameStarted && !gameComplete && startTime) {
      timerRef.current = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameComplete, startTime]);

  const handleStart = () => {
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleTileClick = (tileId: number) => {
    if (!gameStarted || gameComplete) return;
    
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
        // Match found
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
        // No match, flip back
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            newFlippedTiles.includes(t.id) ? { ...t, flipped: false } : t
          ));
          setFlippedTiles([]);
        }, 1000);
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
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <NeumorphicCard variant="raised" className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
            {matches}/{pairs.length}
          </div>
          <div className="text-xs text-[var(--neumorphic-muted)]">Matches</div>
        </NeumorphicCard>
        <NeumorphicCard variant="raised" className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
            {attempts}
          </div>
          <div className="text-xs text-[var(--neumorphic-muted)]">Attempts</div>
        </NeumorphicCard>
        <NeumorphicCard variant="raised" className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--neumorphic-text)]">
            {formatTime(timeTaken)}
          </div>
          <div className="text-xs text-[var(--neumorphic-muted)]">Time</div>
        </NeumorphicCard>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <motion.button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={tile.matched || flippedTiles.length >= 2}
            className={`
              aspect-square rounded-lg p-3 transition-all
              ${tile.matched 
                ? 'bg-green-500/20 border-2 border-green-500' 
                : tile.flipped
                ? 'bg-[var(--neumorphic-surface)] border-2 border-cyan-500'
                : 'bg-[var(--neumorphic-surface)] border border-[var(--neumorphic-border)] hover:border-cyan-500/50'
              }
            `}
            whileHover={!tile.flipped && !tile.matched ? { scale: 1.05 } : {}}
            whileTap={!tile.flipped && !tile.matched ? { scale: 0.95 } : {}}
          >
            {tile.flipped || tile.matched ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="font-semibold text-sm text-[var(--neumorphic-text)] mb-1">
                  {tile.exercise.name}
                </div>
                {tile.exercise.muscleGroup && (
                  <Badge variant="secondary" className="text-xs">
                    {tile.exercise.muscleGroup}
                  </Badge>
                )}
                {tile.matched && (
                  <CheckCircle className="h-6 w-6 text-green-500 mt-2" />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-2xl">?</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

