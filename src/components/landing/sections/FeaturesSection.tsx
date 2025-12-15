'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  Brain, 
  Users, 
  Globe, 
  Heart, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Shield,
  Target,
  BarChart3,
  Sparkles,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';


const features = [
  {
    icon: Brain,
    title: "AI-Powered Coaching",
    description: "Personalized workout plans and real-time feedback tailored to your goals and performance.",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: Users,
    title: "Expert Trainers",
    description: "Access to certified Ethiopian trainers for in-person or digital guidance.",
    color: "from-purple-500 to-pink-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: Globe,
    title: "Multilingual Platform",
    description: "Available in Amharic, Oromifa, Tigrigna, and English for a truly local experience.",
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  },
  {
    icon: Heart,
    title: "Medical Integration",
    description: "Seamlessly integrate health data from wearables and medical records for holistic wellness.",
    color: "from-red-500 to-rose-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visualize your fitness journey with detailed analytics, charts, and achievement badges.",
    color: "from-orange-500 to-yellow-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    icon: MessageSquare,
    title: "Community Support",
    description: "Connect with a vibrant community, join challenges, and find workout partners.",
    color: "from-indigo-500 to-purple-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
];

interface FeaturesSectionProps {
  onLoaded?: () => void;
}

export function FeaturesSection({ onLoaded }: FeaturesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-blue-400/30 rounded-full pointer-events-none';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 3 + 's';
      particle.style.animationDuration = (3 + Math.random() * 4) + 's';
      particle.style.animation = 'float 6s ease-in-out infinite';
      
      if (particlesRef.current) {
        particlesRef.current.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 6000);
      }
    };

    const interval = setInterval(createParticle, 200);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !titleRef.current || !subtitleRef.current || !cardsRef.current) return;

    // Create INSANE timeline for section animations
    const tl = gsap.timeline();

    // CRAZY title animation with multiple effects
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

    // INSANE feature cards animation with multiple effects
    const cards = cardsRef.current.children;
    
    // First, set initial positions to ensure they start in grid
    // gsap.set(cards, {
    //   y: 0,
    //   x: 0,
    //   rotation: 0,
    //   rotationX: 0,
    //   rotationY: 0,
    //   scale: 1,
    //   opacity: 0
    // });
    
    // gsap.fromTo(
    //   cards,
    //   { 
    //     y: 150, 
    //     opacity: 0,
    //     scale: 0.3,
    //     rotation: 45,
    //     rotationX: -90,
    //     z: -100
    //   },
    //   {
    //     y: 0,
    //     opacity: 1,
    //     scale: 1,
    //     rotation: 0,
    //     rotationX: 0,
    //     z: 0,
    //     duration: 1.5,
    //     ease: 'elastic.out(1, 0.8)',
    //     stagger: {
    //       amount: 1.5,
    //       from: 'random'
    //     },
    //     onComplete: () => {
    //       // Ensure cards are exactly at grid position after entrance
    //       gsap.set(cards, {
    //         y: 0,
    //         x: 0,
    //         rotation: 0,
    //         rotationX: 0,
    //         rotationY: 0
    //       });
    //     }
    //     // REMOVED scrollTrigger - cards will animate on page load instead
    //   }
    // );

    // // Add CRAZY hover animations for cards
    Array.from(cards).forEach((card, index) => {
      const cardElement = card as HTMLElement;
      const icon = cardElement.querySelector('.feature-icon');
      const title = cardElement.querySelector('.feature-title');
      const description = cardElement.querySelector('.feature-description');
      const sparkles = cardElement.querySelector('.sparkles');
      
      cardElement.addEventListener('mouseenter', () => {
        setHoveredCard(index);
        
        // CRAZY hover animation sequence
        gsap.timeline()
          .to(cardElement, {
            y: -10,
            scale: 1.03,
            rotationY: 3,
            rotationX: 3,
            duration: 0.4,
            ease: 'power2.out'
          })
          .to(icon, {
            scale: 1.3,
            rotation: 360,
            duration: 0.6,
            ease: 'back.out(1.7)'
          }, 0)
          .to(title, {
            scale: 1.1,
            y: -5,
            duration: 0.3,
            ease: 'power2.out'
          }, 0.1)
          .to(sparkles, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          }, 0.2)
          .to(cardElement, {
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.5)',
            duration: 0.3,
            ease: 'power2.out'
          }, 0);
      });
      
      cardElement.addEventListener('mouseleave', () => {
        setHoveredCard(null);
        
        gsap.timeline()
          .to(cardElement, {
            y: 0,
            scale: 1,
            rotationY: 0,
            rotationX: 0,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
            duration: 0.4,
            ease: 'power2.out'
          })
          .to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out'
          }, 0)
          .to(title, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          }, 0)
          .to(sparkles, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: 'power2.out'
          }, 0);
      });
    });

    // Add individual floating animations to each card AFTER entrance animation
    // Wait for the entrance animation to complete before starting floating
    gsap.delayedCall(2.5, () => {
      Array.from(cards).forEach((card, index) => {
        // Use deterministic timing based on index instead of random
        const baseDuration = 3;
        const durationVariation = (index % 3) * 0.5; // 0, 0.5, or 1 second variation
        const delay = index * 0.3; // Staggered delay
        
        gsap.to(card, {
          y: '+=5',
          duration: baseDuration + durationVariation,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: delay
        });
      });
    });

    // Report loaded when animations are actually complete
    // Wait for the entrance animation timeline to complete
    tl.call(() => {
      onLoaded?.();
    }, [], 2.5); // Call after the entrance animations complete

  }, [onLoaded]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-20 lg:py-32 relative overflow-hidden z-10 scroll-mt-24 md:scroll-mt-28"
    >
      {/* INSANE Background Effects */}
      <div className="absolute inset-0">
        {/* Multiple animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Animated grid pattern */}
        {/* <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-blue-400 rounded"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        </div> */}

        {/* Floating particles container */}
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
              Everything You Need to Succeed
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-white relative z-10">to Succeed</span>
            
            {/* Floating sparkles */}
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
            </div>
          </motion.h2>
          
          <div className="relative">
            <motion.p
              ref={subtitleRef}
              className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
            >
              A complete fitness ecosystem designed specifically for Ethiopian users, 
              combining cutting-edge AI technology with local expertise and cultural understanding.
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

        {/* INSANE Features Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative perspective-1000"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Card */}
              <div className={`
                relative p-8 rounded-2xl border backdrop-blur-sm transform-gpu
                ${feature.bgColor} ${feature.borderColor}
                hover:shadow-2xl transition-all duration-300
                h-full flex flex-col overflow-hidden
                ${hoveredCard === index ? 'ring-2 ring-blue-400/50' : ''}
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

                {/* Feature number */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/10 group-hover:text-white/20 transition-colors duration-300">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Icon with INSANE animations */}
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative
                  bg-gradient-to-br ${feature.color}
                  group-hover:scale-110 transition-transform duration-300
                  feature-icon
                `}>
                  <feature.icon className="w-10 h-10 text-white relative z-10" />
                  
                  {/* Rotating ring around icon */}
                  <motion.div
                    className="absolute inset-0 border-2 border-white/30 rounded-2xl"
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                  
                  {/* Pulsing glow */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-50`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 feature-title">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed flex-grow feature-description">
                  {feature.description}
                </p>

                {/* Animated arrow */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                </motion.div>

                {/* Sparkles effect */}
                <div className="sparkles absolute inset-0 opacity-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: 360
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
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
            <motion.p
              className="text-slate-400 text-lg mb-6"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              Ready to experience the future of fitness?
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform: translateZ(0);
        }
        
        /* Ensure cards stay in grid position */
        .grid > * {
          position: relative;
          z-index: 1;
        }
        
        .grid > *:hover {
          z-index: 10;
        }
      `}</style>
    </section>
  );
}
