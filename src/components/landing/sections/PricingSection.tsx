'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Zap, 
  Smartphone, 
  Sparkles,
  Play,
  ArrowRight
} from 'lucide-react';
import { apiClient, SubscriptionPlan } from '@/lib/api-client';


interface PricingSectionProps {
  onLoaded?: () => void;
}

export function PricingSection({ onLoaded }: PricingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.getSubscriptionPlans();
        if (response.success && response.data) {
          setPlans(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

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
    if (!sectionRef.current || loading) return;

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cards = cardsRef.current?.children;

    if (!title || !subtitle) return;

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

    // Cards entrance animation (only if cards exist)
    if (cards && cards.length > 0) {
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
          stagger: 0.15,
          ease: 'power3.out'
        },
        "-=0.6" // Start 0.6s before the previous animation ends
      );
    } else {
      // If no cards, just report loaded after title/subtitle
      tl.call(() => {
        onLoaded?.();
      });
    }

  }, [onLoaded, loading, plans]);

  const getPackageIcon = (level: string) => {
    switch (level) {
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'diamond': return '💎'
      case 'platinum': return '👑'
      default: return '⭐'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', { 
      style: 'currency', 
      currency: 'ETB', 
      minimumFractionDigits: 0 
    }).format(price)
  }

  const getPackageGradient = (level: string) => {
    switch (level) {
      case 'silver': return 'from-slate-500/20 via-slate-600/20 to-slate-700/20'
      case 'gold': return 'from-yellow-500/20 via-amber-600/20 to-orange-600/20'
      case 'diamond': return 'from-cyan-500/20 via-blue-600/20 to-indigo-600/20'
      case 'platinum': return 'from-purple-500/20 via-pink-600/20 to-rose-600/20'
      default: return 'from-blue-500/20 via-purple-600/20 to-pink-600/20'
    }
  }

  const getPackageBorder = (level: string) => {
    switch (level) {
      case 'silver': return 'border-slate-500/50'
      case 'gold': return 'border-yellow-500/50'
      case 'diamond': return 'border-cyan-500/50'
      case 'platinum': return 'border-purple-500/50'
      default: return 'border-blue-500/50'
    }
  }

  const getPackageTextColor = (level: string) => {
    switch (level) {
      case 'silver': return 'text-slate-300'
      case 'gold': return 'text-yellow-300'
      case 'diamond': return 'text-cyan-300'
      case 'platinum': return 'text-purple-300'
      default: return 'text-blue-300'
    }
  }

  return (
    <section
      ref={sectionRef}
      id="pricing"
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
            {/*
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
            </div>*/}
            {/*
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
            </div>*/}
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto"
          >
            Choose the perfect plan for your fitness journey. Flexible pricing with multiple subscription options.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white/60">Loading packages...</div>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white/60">No packages available at the moment.</div>
          </div>
        ) : (
          <div 
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          >
            {plans.map((plan, index) => {
              const features = typeof plan.features === 'string' 
                ? JSON.parse(plan.features) 
                : plan.features || []
              const dailyPrice = parseFloat(plan.dailyPrice.toString())
              const monthlyPrice = parseFloat(plan.monthlyPrice.toString())
              const isPopular = plan.level === 'gold' || plan.level === 'diamond'
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card className={`bg-gradient-to-br ${getPackageGradient(plan.level)} backdrop-blur-sm border ${getPackageBorder(plan.level)} hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden group h-full flex flex-col`}>
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-3 py-1">
                          <span className="text-xs font-bold text-white">Popular</span>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Package Icon & Name */}
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">{getPackageIcon(plan.level)}</div>
                        <h3 className={`text-2xl font-bold ${getPackageTextColor(plan.level)} mb-1`}>
                          {plan.name}
                        </h3>
                        <p className="text-white/60 text-sm capitalize">{plan.level} Level</p>
                      </div>

                      {/* Price Display */}
                      <div className="text-center mb-6">
                        <div className="mb-2">
                          <span className={`text-4xl font-bold ${getPackageTextColor(plan.level)}`}>
                            {formatPrice(dailyPrice)}
                          </span>
                          <span className="text-white/60 text-lg ml-1">/day</span>
                        </div>
                        <div className="text-white/70 text-sm">
                          or {formatPrice(monthlyPrice)}/month
                        </div>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-3 mb-6 flex-1">
                        {features.slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <Check className={`w-5 h-5 ${getPackageTextColor(plan.level)} mr-2 flex-shrink-0 mt-0.5`} />
                            <span className="text-white/90 text-sm">{feature}</span>
                          </li>
                        ))}
                        {features.length > 4 && (
                          <li className="text-white/60 text-xs italic">
                            +{features.length - 4} more features
                          </li>
                        )}
                      </ul>

                      {/* CTA Button */}
                      <Link href={`/packages/${plan.id}`} className="mt-auto">
                        <Button 
                          className={`w-full bg-gradient-to-r ${plan.level === 'silver' ? 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800' : plan.level === 'gold' ? 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700' : plan.level === 'diamond' ? 'from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700' : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'} text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* View All Packages Link */}
        {!loading && plans.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                View All Packages & Details
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
