'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useOptimizedParticles } from '@/hooks/useOptimizedParticles';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Globe, 
  Heart, 
  Smartphone, 
  MessageSquare,
  Zap,
  MapPin,
  Sparkles
} from 'lucide-react';


interface AboutUsSectionProps {
  onLoaded?: () => void;
}

export function AboutUsSection({ onLoaded }: AboutUsSectionProps) {
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
        ease: 'power3.out',
        onComplete: () => {
          // Add individual floating animations to each card AFTER entrance animation
          Array.from(cards).forEach((card: Element, index: number) => {
            gsap.to(card, {
              y: '+=10',
              duration: 3 + index * 0.5,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: index * 0.2
            });
          });
        }
      },
      "-=0.6" // Start 0.6s before the previous animation ends
    );

  }, [onLoaded]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 lg:py-32 relative overflow-hidden z-10 scroll-mt-24 md:scroll-mt-28"
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
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h2
            ref={titleRef}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 relative"
          >
            {/* Animated background text - using CSS animation for better performance */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent opacity-20 gradient-animation"
            >
              About Compound 360
            </span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">About</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Compound 360
            </span>
            
            {/* Floating sparkles - using CSS animations for better performance */}
            {/*
            <div className="absolute -top-4 -right-4">
              <div className="w-8 h-8 sparkle-animation-1">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="absolute -bottom-2 -left-4">
              <div className="w-6 h-6 sparkle-animation-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>*/}
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto"
          >
            Ethiopia's first end-to-end, AI-driven fitness and wellness platform that empowers trainees, certified trainers, and medical professionals within a unified, multilingual ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold mb-6">
              <span className="text-white">Our </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Vision
              </span>
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed text-lg">
              An Ethiopia where safe, culturally tuned fitness guidance is accessible to everyone—at home, at work, outdoors, or in the gym.
            </p>
            <h3 className="text-3xl font-bold mb-6">
              <span className="text-white">Our </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Mission
              </span>
            </h3>
            <p className="text-white/80 leading-relaxed text-lg">
              Deliver trustworthy coaching and motivating programs through a hybrid model (on-ground classes + digital guidance), removing barriers of cost, language, location, and time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6" ref={cardsRef}>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/10 group relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4 relative z-10" />
              <h4 className="font-semibold text-white mb-2 relative z-10">24/7 AI Coach</h4>
              <p className="text-sm text-white/70 relative z-10">Personalized guidance anytime</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/10 group relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-4 relative z-10" />
              <h4 className="font-semibold text-white mb-2 relative z-10">4 Languages</h4>
              <p className="text-sm text-white/70 relative z-10">Amharic, Oromifa, Tigrigna, English</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/10 group relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Heart className="w-12 h-12 text-red-400 mx-auto mb-4 relative z-10" />
              <h4 className="font-semibold text-white mb-2 relative z-10">Medical Integration</h4>
              <p className="text-sm text-white/70 relative z-10">Licensed doctors on platform</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/5 backdrop-blur-sm border-white/10 group relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Smartphone className="w-12 h-12 text-purple-400 mx-auto mb-4 relative z-10" />
              <h4 className="font-semibold text-white mb-2 relative z-10">SMS Onboarding</h4>
              <p className="text-sm text-white/70 relative z-10">Text "OK" to get started</p>
            </Card>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-white/10">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Why Choose Compound 360?
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Hybrid Delivery</h4>
                <p className="text-white/70">Proven on-ground coaching plus scalable digital guidance</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-10 h-10 text-cyan-400" />
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Culturally Tuned</h4>
                <p className="text-white/70">Programs aligned with Ethiopian foods and routines</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-10 h-10 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Language Inclusion</h4>
                <p className="text-white/70">Multilingual content for clarity and comfort</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-pink-400" />
                </div>
                <h4 className="font-semibold text-white mb-3 text-lg">Frictionless Start</h4>
                <p className="text-white/70">SMS onboarding and DCB-only subscriptions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Our Location
            </span>
          </h3>
          <Card className="max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center space-x-6 relative z-10">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-white text-xl mb-2">Compound BST Gym</h4>
                <p className="text-white/80 text-lg">Bole, Rwanda Area</p>
                <p className="text-white/80 text-lg">Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
