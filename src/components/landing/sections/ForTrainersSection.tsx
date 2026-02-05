'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useOptimizedParticles } from '@/hooks/useOptimizedParticles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  UserCheck,
  Video,
  BarChart3,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';


interface ForTrainersSectionProps {
  onLoaded?: () => void;
}

export function ForTrainersSection({ onLoaded }: ForTrainersSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useOptimizedParticles({
    interval: 1500, // Reduced from 500ms to 1500ms
    maxParticles: 6,
    particleDuration: 5000
  });

  useGSAP(() => {
    if (!sectionRef.current) return;

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cards = cardsRef.current?.children;

    if (!title || !subtitle || !cards) return;

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

    // Cards entrance animation
    tl.fromTo(cards,
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
        stagger: 0.2,
        ease: 'power3.out'
      },
      "-=0.6" // Start 0.6s before the previous animation ends
    );

  }, [onLoaded]);

  const trainerFeatures = [
    {
      icon: UserCheck,
      title: "Verified Profile",
      description: "Showcase your certifications and expertise",
      color: "blue"
    },
    {
      icon: Video,
      title: "Publish Content",
      description: "Upload videos and plans for your audience",
      color: "cyan"
    },
    {
      icon: BarChart3,
      title: "Grow Your Business",
      description: "Analytics, moderation, and client tools",
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        icon: 'text-blue-400',
        bg: 'from-blue-500/10 to-purple-500/10',
        border: 'border-blue-500/20'
      },
      cyan: {
        icon: 'text-cyan-400',
        bg: 'from-cyan-500/10 to-blue-500/10',
        border: 'border-cyan-500/20'
      },
      purple: {
        icon: 'text-purple-400',
        bg: 'from-purple-500/10 to-pink-500/10',
        border: 'border-purple-500/20'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section
      ref={sectionRef}
      id="for-trainers"
      className="py-20 lg:py-32 relative overflow-hidden z-10 scroll-mt-24 md:scroll-mt-28"
    >
      {/* Animated background particles - full opacity to blend with TrainersSection overlay */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
        }}
      />
      
      {/* Top overlay to blend seamlessly with TrainersSection - matching its bottom overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 25%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.1) 75%, transparent 100%)'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h2
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 relative"
          >
            {/* Animated background text - using CSS animation for better performance */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent opacity-20 gradient-animation"
            >
              For Trainers
            </span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">For</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Trainers
            </span>
            
            {/* Floating sparkles - using CSS animations for better performance */}
            <div className="absolute -top-4 -right-4">
              <div className="w-8 h-8 sparkle-animation-1">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="absolute -bottom-2 -left-4">
              <div className="w-6 h-6 sparkle-animation-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto"
          >
            Join Compound 360 as a certified trainer. Reach more clients, publish content, and grow your brand—all with local support and tools.
          </motion.p>
        </div>

        {/* Trainer Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10" ref={cardsRef}>
          {trainerFeatures.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const IconComponent = feature.icon;
            
            return (
              <Card 
                key={index}
                className={`p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/10 group relative overflow-hidden ${colors.border}`}
              >
                {/* Glowing effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`w-10 h-10 ${colors.icon.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Important Message for Trainers */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-amber-800 mb-2">Important: Subscription Required</h4>
                <p className="text-amber-700 mb-3">
                  To apply as a trainer, you must first <strong>subscribe to Compound 360</strong>. 
                  This ensures you have access to our platform and understand our community before joining as a trainer.
                </p>
                <div className="text-center">
                  <Link href="/login" className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium">
                    Login to Apply →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="text-center">
          <Link href="/user/apply">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Award className="mr-2 h-5 w-5" />
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
