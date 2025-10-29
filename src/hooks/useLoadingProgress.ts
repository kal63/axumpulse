'use client';

import { useState, useEffect, useCallback } from 'react';

interface LoadingProgressOptions {
  duration?: number;
  steps?: string[];
  onComplete?: () => void;
}

export function useLoadingProgress({
  duration = 2000,
  steps = [
    "Initializing 3D engine...",
    "Loading fitness images...",
    "Preparing AI coach...",
    "Setting up multilingual support...",
    "Almost ready..."
  ],
  onComplete
}: LoadingProgressOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
    
    // Update current step based on progress
    const stepIndex = Math.floor((newProgress / 100) * steps.length);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [steps.length]);

  const completeLoading = useCallback(() => {
    setProgress(100);
    setCurrentStep(steps.length - 1);
    setTimeout(() => {
      setIsLoading(false);
      onComplete?.();
    }, 500);
  }, [steps.length, onComplete]);

  useEffect(() => {
    if (!isLoading) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until manually completed
      
      updateProgress(progressPercent);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        // Don't complete automatically - wait for manual completion
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading, duration, updateProgress]);

  return {
    progress,
    isLoading,
    currentStep,
    currentMessage: steps[currentStep] || steps[steps.length - 1],
    updateProgress,
    completeLoading,
    setIsLoading
  };
}
