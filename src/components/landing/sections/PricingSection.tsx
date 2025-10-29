'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Zap, 
  Smartphone, 
  Sparkles,
  Play
} from 'lucide-react';


interface PricingSectionProps {
  onLoaded?: () => void;
}

export function PricingSection({ onLoaded }: PricingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-60';
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

    const interval = setInterval(createParticle, 800);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const card = cardRef.current;

    if (!title || !subtitle || !card) return;

    // Create a timeline to track all animations
    const tl = gsap.timeline({
      onComplete: () => {
        // All animations are complete, report loaded
        onLoaded?.();
      }
    });

    // Create sparkle elements
    const sparkles = Array.from({ length: 8 }, (_, i) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'absolute w-1 h-1 bg-cyan-400 rounded-full opacity-0';
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      title.appendChild(sparkle);
      return sparkle;
    });

    // Title animation with sparkles
    tl.fromTo(title, 
      { 
        y: 100, 
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        onComplete: () => {
          // Animate sparkles
          sparkles.forEach((sparkle, index) => {
            gsap.to(sparkle, {
              opacity: 1,
              scale: 1.5,
              duration: 0.3,
              delay: index * 0.1,
              yoyo: true,
              repeat: 1,
              ease: 'power2.out'
            });
          });
        }
      }
    );

    // Subtitle animation
    tl.fromTo(subtitle,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      },
      "-=0.8" // Start 0.8s before the previous animation ends
    );

    // Card entrance animation
    tl.fromTo(card,
      { 
        y: 150, 
        opacity: 0,
        scale: 0.8,
        rotationX: 15
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1,
        ease: 'power3.out'
      },
      "-=0.6" // Start 0.6s before the previous animation ends
    );

  }, [onLoaded]);

  const pricingFeatures = [
    "24/7 AI Virtual Coach with personalized guidance",
    "Unlimited access to workout programs & meal plans",
    "Browse and book certified trainers",
    "Medical Q&A and e-consultation booking",
    "Community challenges and progress tracking",
    "Full content in 4 languages"
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-20 lg:py-32 relative overflow-hidden z-10"
    >
      {/* Animated background particles */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mb-16 mx-auto">
          <motion.h2
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 relative"
          >
            {/* Animated background text */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent opacity-20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Simple, Affordable Pricing
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">Simple, Affordable</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
            
            {/* Floating sparkles */}
            <div className="absolute -top-4 -right-4">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="w-8 h-8"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>
            
            <div className="absolute -bottom-2 -left-4">
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="w-6 h-6"
              >
                <Sparkles className="w-full h-full text-purple-400" />
              </motion.div>
            </div>
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto"
          >
            No hidden fees. No contracts. Just 2 ETB daily via direct carrier billing.
          </motion.p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto">
          <motion.div ref={cardRef}>
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group-hover:scale-105 relative overflow-hidden group">
              <CardContent className="p-8 text-center">
                {/* Most Popular Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full px-4 py-1 mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <span className="text-white text-sm font-medium">Most Popular</span>
                </motion.div>

                {/* Daily Access Label */}
                <motion.div
                  className="text-white/80 text-sm mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  Daily Access
                </motion.div>

                {/* Price Display */}
                <div className="mb-8">
                  <motion.div
                    className="text-6xl font-bold mb-2 flex items-center justify-center"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6, type: "spring", bounce: 0.4 }}
                  >
                    <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      2ETB
                    </span>
                    <span className="text-white/80 text-2xl ml-2">/day</span>
                  </motion.div>
                  
                  <motion.div
                    className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                  >
                    <span className="text-green-400 text-sm font-medium">• First 3 days free!</span>
                  </motion.div>
                </div>
                <ul className="space-y-4 mb-8">
                  {pricingFeatures.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start group/item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200">
                        <Check className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white/90 group-hover/item:text-blue-400 transition-colors duration-200">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Play className="mr-2 h-5 w-5" />
                    Text "OK" to Subscribe
                  </span>
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>

                <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg group-hover:bg-white/10 transition-colors duration-300">
                  <p className="text-sm text-white/70 text-center">
                    <strong className="text-white">Easy Payment:</strong> Paid via Ethio Telecom direct carrier billing. Cancel anytime by texting 'STOP' to the short code.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
