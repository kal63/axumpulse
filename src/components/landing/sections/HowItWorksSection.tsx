'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Smartphone, 
  Target, 
  Activity,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Subscribe via SMS",
    description: "Simply text 'OK' to our short code to get started with your daily fitness journey.",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    number: "02", 
    icon: Target,
    title: "Set Your Goals",
    description: "Define your fitness aspirations, and our AI will craft a personalized plan for you.",
    color: "from-purple-500 to-pink-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    number: "03",
    icon: Activity,
    title: "Start Training",
    description: "Follow your custom workouts, track progress, and connect with trainers and community.",
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  }
];

interface HowItWorksSectionProps {
  onLoaded?: () => void;
}

export function HowItWorksSection({ onLoaded }: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [glowPosition, setGlowPosition] = useState<number>(0);

  // Create flowing particles between steps
  useEffect(() => {
    const createFlowingParticle = (startX: number, startY: number, endX: number, endY: number, delay: number) => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full pointer-events-none z-30';
      particle.style.left = startX + '%';
      particle.style.top = startY + '%';
      
      if (particlesRef.current) {
        particlesRef.current.appendChild(particle);
        
        // Animate particle flow
        gsap.to(particle, {
          x: endX - startX + '%',
          y: endY - startY + '%',
          duration: 2,
          ease: 'power2.inOut',
          delay: delay,
          onComplete: () => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }
        });
      }
    };

    const startFlowingParticles = () => {
      // Flow from step 1 to step 2
      createFlowingParticle(16.5, 50, 50, 50, 0);
      createFlowingParticle(16.5, 50, 50, 50, 0.5);
      createFlowingParticle(16.5, 50, 50, 50, 1);
      
      // Flow from step 2 to step 3
      createFlowingParticle(50, 50, 83.5, 50, 1.5);
      createFlowingParticle(50, 50, 83.5, 50, 2);
      createFlowingParticle(50, 50, 83.5, 50, 2.5);
    };

    if (isAnimating) {
      const interval = setInterval(startFlowingParticles, 3000);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  // Create flowing glow effect between steps
  useEffect(() => {
    if (!isAnimating) return;

    const startFlowingGlow = () => {
      // Reset glow position
      setGlowPosition(0);
      
      // Animate glow from step 1 to step 3
      gsap.to({}, {
        duration: 4,
        ease: 'power2.inOut',
        onUpdate: function() {
          const progress = this.progress();
          setGlowPosition(progress);
        },
        onComplete: () => {
          // Wait a bit then restart
          setTimeout(() => {
            if (isAnimating) {
              startFlowingGlow();
            }
          }, 2000);
        }
      });
    };

    // Start the glow effect after a delay
    const timer = setTimeout(startFlowingGlow, 3000);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  useGSAP(() => {
    if (!sectionRef.current || !titleRef.current || !subtitleRef.current || !stepsRef.current) return;

    // Create INSANE timeline for section animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => setIsAnimating(true),
        onLeave: () => setIsAnimating(false)
      }
    });

    // CRAZY title animation
    tl.fromTo(
      titleRef.current,
      { 
        y: 100, 
        opacity: 0,
        scale: 0.5,
        rotationX: -90
      },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        rotationX: 0,
        duration: 1.2, 
        ease: 'elastic.out(1, 0.5)' 
      }
    )
    .fromTo(
      subtitleRef.current,
      { 
        y: 50, 
        opacity: 0,
        scale: 0.8,
        rotation: -5
      },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        rotation: 0,
        duration: 0.8, 
        ease: 'back.out(1.7)' 
      },
      '-=0.6'
    );

    // INSANE sequential step animations with continuity
    const stepElements = stepsRef.current.children;
    
    // First, set initial positions
    gsap.set(stepElements, {
      y: 0,
      x: 0,
      rotation: 0,
      scale: 1,
      opacity: 0
    });

    // Animate each step sequentially with continuity effects
    Array.from(stepElements).forEach((step, index) => {
      const stepElement = step as HTMLElement;
      const icon = stepElement.querySelector('.step-icon');
      const number = stepElement.querySelector('.step-number');
      const title = stepElement.querySelector('.step-title');
      const description = stepElement.querySelector('.step-description');
      const arrow = stepElement.querySelector('.step-arrow');

      // Sequential entrance with continuity
      gsap.timeline()
        .to(stepElement, {
          opacity: 1,
          duration: 0.1,
          delay: index * 0.8
        })
        .fromTo(stepElement, {
          y: 100,
          scale: 0.3,
          rotation: 45,
          rotationX: -90
        }, {
          y: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          duration: 1,
          ease: 'elastic.out(1, 0.8)'
        }, 0)
        .fromTo(icon, {
          scale: 0,
          rotation: 360
        }, {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.7)'
        }, 0.2)
        .fromTo(number, {
          scale: 0,
          opacity: 0
        }, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.1)
        .fromTo(title, {
          y: 30,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.3)
        .fromTo(description, {
          y: 20,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.4);

      // Only animate arrow if it exists (not the last step)
      if (arrow) {
        gsap.to(arrow, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.6
        });
      }

      // Add CRAZY hover animations
      stepElement.addEventListener('mouseenter', () => {
        setActiveStep(index);
        
        gsap.timeline()
          .to(stepElement, {
            y: -15,
            scale: 1.05,
            rotationY: 5,
            rotationX: 5,
            duration: 0.4,
            ease: 'power2.out'
          })
          .to(icon, {
            scale: 1.3,
            rotation: 360,
            duration: 0.6,
            ease: 'back.out(1.7)'
          }, 0)
          .to(arrow, {
            scale: 1.2,
            x: 10,
            duration: 0.3,
            ease: 'power2.out'
          }, 0.1);
      });
      
      stepElement.addEventListener('mouseleave', () => {
        setActiveStep(null);
        
        gsap.timeline()
          .to(stepElement, {
            y: 0,
            scale: 1,
            rotationY: 0,
            rotationX: 0,
            duration: 0.4,
            ease: 'power2.out'
          })
          .to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out'
          }, 0)
          .to(arrow, {
            scale: 1,
            x: 0,
            duration: 0.3,
            ease: 'power2.out'
          }, 0);
      });
    });

    // Animate connector line with flowing effect
    if (connectorRef.current) {
      gsap.fromTo(
        connectorRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 2,
          ease: 'power2.out',
          delay: 1.5
        }
      );
    }

    // Report loaded when animations are complete
    setTimeout(() => {
      onLoaded?.();
    }, 4000);

    // Cleanup function
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [onLoaded]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-20 lg:py-32 relative overflow-hidden z-10 scroll-mt-24 md:scroll-mt-28"
    >
      {/* INSANE Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        

        {/* Flowing particles container */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* INSANE Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
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
              Get Started in Minutes
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">Get Started in</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Minutes
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
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>*/}
          </motion.h2>
          
          <div className="relative">
            <motion.p
              ref={subtitleRef}
              className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
            >
              Three simple steps to transform your health and fitness. 
              No complex setup, no lengthy forms—just pure results.
            </motion.p>
            
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            />
          </div>
        </div>

        {/* INSANE Steps with Continuity */}
        <div className="relative max-w-6xl mx-auto">
          {/* Enhanced Connector Line with flowing effect */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transform -translate-y-1/2 z-0 rounded-full">
            <div 
              ref={connectorRef}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 origin-left rounded-full"
            />
            
            {/* Flowing particles on the line */}
            {isAnimating && (
              <>
                <motion.div
                  className="absolute top-1/2 left-0 w-3 h-3 bg-blue-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: ['0%', '100%'],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <motion.div
                  className="absolute top-1/2 left-0 w-2 h-2 bg-purple-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: ['0%', '100%'],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                  }}
                />
              </>
            )}
          </div>

          {/* INSANE Flowing Glow Effect */}
          {isAnimating && (
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-32 transform -translate-y-1/2 z-5 pointer-events-none">
              {/* Main flowing glow */}
              <motion.div
                className="absolute top-1/2 left-0 w-96 h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-cyan-500/20 rounded-full blur-2xl transform -translate-y-1/2"
                style={{
                  left: `${glowPosition * 100}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  opacity: Math.sin(glowPosition * Math.PI) * 0.8 + 0.2
                }}
              />
              
              {/* Secondary trailing glow */}
              <motion.div
                className="absolute top-1/2 left-0 w-64 h-24 bg-gradient-to-r from-cyan-400/15 via-purple-400/25 to-blue-400/15 rounded-full blur-xl transform -translate-y-1/2"
                style={{
                  left: `${Math.max(0, glowPosition - 0.1) * 100}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  opacity: Math.sin(glowPosition * Math.PI) * 0.6 + 0.1
                }}
              />
              
              {/* Pulsing center glow */}
              <motion.div
                className="absolute top-1/2 left-0 w-48 h-16 bg-gradient-to-r from-blue-400/40 via-purple-400/50 to-cyan-400/40 rounded-full blur-lg transform -translate-y-1/2"
                style={{
                  left: `${glowPosition * 100}%`,
                  transform: 'translateX(-50%) translateY(-50%)',
                  opacity: Math.sin(glowPosition * Math.PI * 2) * 0.4 + 0.3
                }}
              />
            </div>
          )}

          <div
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="group relative perspective-1000"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`
                  relative p-8 rounded-2xl border backdrop-blur-sm text-center transform-gpu
                  ${step.bgColor} ${step.borderColor}
                  hover:shadow-2xl transition-all duration-300
                  h-full flex flex-col items-center overflow-hidden
                  ${activeStep === index ? 'ring-2 ring-blue-400/50' : ''}
                `}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <motion.div
                      className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                  </div>

                  {/* Step Number with INSANE animations */}
                  <div className="step-number text-6xl font-bold text-slate-700/30 mb-4 group-hover:text-slate-600/50 transition-colors duration-300 relative">
                    {step.number}
                    
                    {/* Rotating ring around number - using CSS animation for better performance */}
                    <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full rotate-slow" />
                  </div>

                  {/* Icon with INSANE animations */}
                  <div className={`
                    w-24 h-24 rounded-2xl flex items-center justify-center mb-6 relative
                    bg-gradient-to-br ${step.color}
                    group-hover:scale-110 transition-transform duration-300
                    step-icon
                  `}>
                    <step.icon className="w-12 h-12 text-white relative z-10" />
                    
                    {/* Rotating ring around icon - using CSS animation for better performance */}
                    <div className="absolute inset-0 border-2 border-white/30 rounded-2xl rotate-slow" />
                    
                    {/* Pulsing glow - using CSS animation for better performance */}
                    <div 
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-50 pulse-glow`}
                      style={{
                        animationDelay: `${index * 0.3}s`
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="step-title text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="step-description text-slate-300 leading-relaxed flex-grow">
                    {step.description}
                  </p>

                  {/* Enhanced Arrow for desktop with animations */}
                  {index < steps.length - 1 && (
                    <div className="step-arrow hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20 opacity-0">
                      <motion.div 
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 4px 15px rgba(59, 130, 246, 0.3)',
                            '0 8px 25px rgba(59, 130, 246, 0.5)',
                            '0 4px 15px rgba(59, 130, 246, 0.3)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <ArrowRight className="w-7 h-7 text-white" />
                      </motion.div>
                    </div>
                  )}


                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Flowing Glow Effect on Card */}
                  {isAnimating && (
                    <div 
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at ${(glowPosition - (index * 0.5)) * 200}% 50%, 
                          ${index === 0 ? 'rgba(59, 130, 246, 0.3)' : 
                            index === 1 ? 'rgba(147, 51, 234, 0.3)' : 
                            'rgba(34, 197, 94, 0.3)'} 0%, 
                          transparent 70%)`,
                        opacity: Math.max(0, Math.sin((glowPosition - (index * 0.5)) * Math.PI) * 0.8)
                      }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* INSANE Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20 relative"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl blur-xl" />
          
          <div className="relative z-10 p-8">
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
                Text "OK" to Begin
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
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </section>
  );
}
