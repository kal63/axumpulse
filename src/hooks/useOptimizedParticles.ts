import { useEffect, useRef } from 'react';

interface UseOptimizedParticlesOptions {
  interval?: number; // Interval in ms (default: 1000)
  maxParticles?: number; // Max concurrent particles (default: 8)
  particleDuration?: number; // How long particles last in ms (default: 5000)
  enabled?: boolean; // Whether particles are enabled (default: true)
}

export function useOptimizedParticles(
  options: UseOptimizedParticlesOptions = {}
) {
  const {
    interval = 1000,
    maxParticles = 8,
    particleDuration = 5000,
    enabled = true
  } = options;

  const particlesRef = useRef<HTMLDivElement>(null);
  const particleCountRef = useRef(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    // Intersection Observer to pause particles when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      {
        threshold: 0,
        rootMargin: '100px' // Start creating particles 100px before visible
      }
    );

    if (particlesRef.current?.parentElement) {
      observer.observe(particlesRef.current.parentElement);
    }

    const createParticle = () => {
      // Skip if section not visible or too many particles
      if (!isVisibleRef.current || particleCountRef.current >= maxParticles) {
        return;
      }

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
      particle.style.willChange = 'transform, opacity';
      particle.style.transform = 'translateZ(0)'; // GPU acceleration

      const container = particlesRef.current;
      if (container) {
        container.appendChild(particle);
        particleCountRef.current++;

        // Remove particle after animation
        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle);
            particleCountRef.current--;
          }
        }, particleDuration);
      }
    };

    const intervalId = setInterval(createParticle, interval);

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [enabled, interval, maxParticles, particleDuration]);

  return particlesRef;
}

