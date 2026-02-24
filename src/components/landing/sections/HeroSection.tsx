'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { apiClient, SubscriptionPlan } from '@/lib/api-client';
import { WebGLScene } from '@/components/landing/webgl/WebGLScene';
import { FallbackHero } from '@/components/landing/fallback/FallbackHero';
import { LoadingScreen } from '@/components/landing/ui/LoadingScreen';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onLoaded?: () => void;
}

const LANGUAGES = ['English', 'Amharic', 'Oromifa', 'Tigrigna'];

export function HeroSection({ onLoaded }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const packagesRef = useRef<HTMLDivElement>(null);
  
  const webglSupported = useWebGLSupport();
  const prefersReducedMotion = useReducedMotion();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Load subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await apiClient.getSubscriptionPlans();
        if (response.success && response.data) {
          setPlans(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to load subscription plans:', error);
      }
    };
    loadPlans();
  }, []);

  // Report loaded when WebGL is ready or fallback is loaded
  useEffect(() => {
    if (webglSupported && !prefersReducedMotion) {
      // Simulate WebGL loading time
      const timer = setTimeout(() => {
        onLoaded?.();
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      // Complete immediately for fallback
      onLoaded?.();
    }
  }, [webglSupported, prefersReducedMotion, onLoaded]);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline();

    // Animate elements on load
    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo(
      subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(
      packagesRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      ctaRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    );

    // Scroll-triggered animations with cleanup
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(titleRef.current, {
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.out',
        });
      },
      onLeave: () => {
        gsap.to(titleRef.current, {
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
      },
    });

    return () => {
      scrollTrigger.kill();
      tl.kill();
    };
  }, [prefersReducedMotion]);


  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden z-10"
    >

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          
          {/* Left Side - 3D Image Carousel */}
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            {webglSupported && !prefersReducedMotion ? (
              <div className="w-full h-full">
                <WebGLScene />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FallbackHero />
              </div>
            )}
          </div>

          {/* Right Side - Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                Ethiopia's First AI-Powered Fitness Platform
              </motion.div>

              {/* Main Title */}
              <h1
                ref={titleRef}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform Your Life</span>
                <br />
                <span className="text-white">with Compound 360</span>
              </h1>

              {/* Subtitle */}
              <p
                ref={subtitleRef}
                className="text-lg md:text-xl text-slate-300 leading-relaxed"
              >
                AI-driven fitness coaching, expert trainers, and personalized wellness programs—all in{' '}
                <span className="text-blue-400 font-semibold">Amharic, Oromifa, Tigrigna & English</span>
              </p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center lg:justify-start gap-6 text-center lg:text-left"
              >
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-400">24/7</div>
                  <div className="text-slate-400 text-sm">AI Coach Available</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-400">4 ETB</div>
                  <div className="text-slate-400 text-sm">Daily Subscription</div>
                </div>

                <div className="space-y-2 relative inline-block">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-2xl font-bold text-green-400">4</div>
                    </div>

                    {/* Language Selector Dropdown */}
                    <div className="relative">
                      <motion.button
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className="px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700 hover:border-green-500/50 text-green-400 text-sm font-medium transition-all duration-200 flex items-center gap-2 min-w-max h-fit"
                        whileHover={{ borderColor: 'rgba(34, 197, 94, 0.5)' }}
                      >
                      <span>{selectedLanguage}</span>
                      <motion.svg
                        animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </motion.svg>
                    </motion.button>

                    {/* Dropdown Menu */}
                    {isLanguageDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 left-0 z-50 bg-slate-900 border border-slate-700 rounded-md shadow-lg overflow-hidden min-w-max"
                      >
                        {LANGUAGES.map((language) => (
                          <motion.button
                            key={language}
                            onClick={() => {
                              setSelectedLanguage(language);
                              setIsLanguageDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left transition-all duration-150 ${
                              selectedLanguage === language
                                ? 'bg-green-500/20 text-green-400 border-l-2 border-green-400'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-green-400'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            {language}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">Languages Supported</div>
                </div>
              </motion.div>

              {/* Compact Packages Display */}
              {plans.length > 0 && (
                <motion.div
                  ref={packagesRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="pt-4"
                >
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {plans.map((plan) => {
                      const getIcon = (level: string) => {
                        switch (level) {
                          case 'silver': return '🥈'
                          case 'gold': return '🥇'
                          case 'diamond': return '💎'
                          case 'platinum': return '👑'
                          default: return '⭐'
                        }
                      }
                      const startingPrice = parseFloat(plan.dailyPrice.toString())
                      return (
                        <Link
                          key={plan.id}
                          href={`/packages/${plan.id}`}
                          className="group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getIcon(plan.level)}</span>
                              <div className="text-left">
                                <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {plan.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                  From {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(startingPrice)}/day
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <div
                ref={ctaRef}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-8"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-6 text-xl rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={{
                      backgroundSize: '200% 200%'
                    }}
                  />
                  
                  <span className="relative z-10 flex items-center gap-3">
                    <Play className="w-6 h-6" />
                    Text "OK" to Start
                    <motion.div
                      animate={{
                        x: [0, 5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </motion.button>
                <Link href="/user/apply">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
                  >
                    Become a Trainer
                  </motion.button>
                </Link>
              </div>

              {/* SMS Instructions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="pt-8"
              >
                <p className="text-slate-400 text-sm">
                  Simply text <span className="text-blue-400 font-mono font-bold">"OK"</span> to our short code to get started
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-slate-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
