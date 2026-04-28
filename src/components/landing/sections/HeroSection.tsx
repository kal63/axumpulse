'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { apiClient, SubscriptionPlan } from '@/lib/api-client';

interface HeroSectionProps {
  onLoaded?: () => void;
}

export function HeroSection({ onLoaded }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

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

  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

  useGSAP(() => {
    if (!leftColRef.current) return;
    const el = leftColRef.current;
    gsap.fromTo(
      el.querySelectorAll('[data-hero-in]'),
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-10 min-h-screen flex items-center overflow-hidden scroll-mt-24 md:scroll-mt-28 bg-[hsl(78,88%,55%)]"
    >
      {/* Radiant Stride: solid brand primary + soft radial glow (see radiant-stride-app Hero + --gradient-glow) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, hsl(78 95% 65% / 0.4), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[min(100vh,860px)]">
          {/* Left — editorial + CTAs (Compound copy unchanged) */}
          <div ref={leftColRef} className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1">
            <div data-hero-in className="inline-flex items-center gap-2 bg-[hsl(222,47%,8%)] text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              Ethiopia&apos;s First AI-Powered Fitness Platform
            </div>

            <h1
              data-hero-in
              className="font-landing-display text-[clamp(2.5rem,8vw,5.5rem)] text-[hsl(222,47%,8%)] uppercase text-balance"
            >
              Transform
              <br />
              <span className="text-[hsl(210,95%,28%)]">Your Life</span>
              <br />
              <span className="text-[hsl(222,47%,8%)]">with Compound 360</span>
            </h1>

            <p
              data-hero-in
              className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-[hsl(222,20%,38%)] font-medium leading-relaxed"
            >
              AI-driven fitness coaching, expert trainers, and personalized wellness programs—all in{' '}
              <span className="text-[hsl(210,95%,30%)] font-semibold">Amharic, Oromifa, Tigrigna & English</span>
            </p>

            <div
              data-hero-in
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10"
            >
              <div>
                <div className="font-landing-display text-2xl text-[hsl(210,95%,28%)]">24/7</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(222,20%,40%)] mt-1">
                  AI Coach Available
                </div>
              </div>
              <div>
                <div className="font-landing-display text-2xl text-[hsl(78,80%,40%)]">ETB 4</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(222,20%,40%)] mt-1">
                  Daily Subscription
                </div>
              </div>
              <div>
                <div className="font-landing-display text-2xl text-[hsl(222,47%,8%)]">4+</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[hsl(222,20%,40%)] mt-1">
                  Languages Supported
                </div>
              </div>
            </div>

            {plans.length > 0 && (
              <div data-hero-in className="mt-8">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {plans.map((plan) => {
                    const getIcon = (level: string) => {
                      switch (level) {
                        case 'silver':
                          return '🥈';
                        case 'gold':
                          return '🥇';
                        case 'diamond':
                          return '💎';
                        case 'platinum':
                          return '👑';
                        default:
                          return '⭐';
                      }
                    };
                    const startingPrice = parseFloat(plan.dailyPrice.toString());
                    return (
                      <Link key={plan.id} href={`/packages/${plan.id}`} className="group">
                        <motion.div
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-3 py-2 rounded-xl bg-white/80 border border-slate-200/90 shadow-sm hover:border-lime-300/80 hover:shadow-md transition-all cursor-pointer backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getIcon(plan.level)}</span>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-slate-900 group-hover:text-[hsl(210,95%,28%)] transition-colors">
                                {plan.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                From{' '}
                                {new Intl.NumberFormat('en-ET', {
                                  style: 'currency',
                                  currency: 'ETB',
                                  minimumFractionDigits: 0,
                                }).format(startingPrice)}
                                /day
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div data-hero-in className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <motion.a
                href="sms:6313?body=OK"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 bg-[hsl(222,47%,8%)] text-white px-8 py-5 rounded-full text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
              >
                <Play className="w-5 h-5" />
                Text &quot;OK&quot; to Start
                <span className="w-8 h-8 rounded-full bg-lime-400 text-[hsl(222,47%,8%)] grid place-items-center group-hover:rotate-12 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </motion.a>
              <Link href="/user/apply">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center text-[hsl(210,95%,28%)] font-bold underline-offset-4 hover:underline px-2 py-3"
                >
                  Become a Trainer
                </motion.button>
              </Link>
            </div>

            <p data-hero-in className="mt-6 text-sm text-[hsl(222,20%,40%)]">
              Simply text <span className="font-mono font-bold text-[hsl(210,95%,28%)]">&quot;OK&quot;</span> to our
              short code to get started
            </p>
          </div>

          {/* Right — hero image (Radiant Stride–style) */}
          <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md lg:max-w-none mx-auto">
            <div className="relative">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_hsl(222_47%_8%_/_0.35)] border border-slate-200/80">
                <Image
                  src="/hero-athlete.jpg"
                  alt="Athlete training with kettlebell"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                />
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live session</div>
                      <div className="font-landing-display text-lg text-slate-900 mt-0.5">Compound 360 · Coach</div>
                    </div>
                    <div className="text-right">
                      <div className="font-landing-display text-2xl text-[hsl(210,95%,28%)]">4+</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">langs</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-lime-400 to-[hsl(210,95%,28%)] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -left-2 sm:-left-4 w-20 h-20 rounded-full bg-[hsl(210,95%,28%)] text-white grid place-items-center font-landing-display text-[10px] uppercase tracking-widest rotate-[-10deg] shadow-lg">
                Live
                <br />
                Now
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-400/80 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2.5 bg-slate-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
