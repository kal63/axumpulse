'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users,
  Globe,
  MessageSquare,
  Zap,
  MapPin,
  Sparkles
} from 'lucide-react';


interface CompanySectionProps {
  onLoaded?: () => void;
}

export function CompanySection({ onLoaded }: CompanySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Create floating particles
  useEffect(() => {
    const createParticle = () => {
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

    const interval = setInterval(createParticle, 500);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const content = contentRef.current;

    if (!title || !subtitle || !content) return;

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

    // Content animation
    tl.fromTo(content,
      { 
        y: 50, 
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      },
      "-=0.6" // Start 0.6s before the previous animation ends
    );

  }, [onLoaded]);

  const features = [
    {
      icon: Users,
      title: "Hybrid Delivery",
      description: "Proven on-ground coaching plus scalable digital guidance",
      color: "blue"
    },
    {
      icon: Globe,
      title: "Culturally Tuned",
      description: "Programs aligned with Ethiopian foods and routines",
      color: "cyan"
    },
    {
      icon: MessageSquare,
      title: "Language Inclusion",
      description: "Multilingual content for clarity and comfort",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Frictionless Start",
      description: "SMS onboarding and DCB-only subscriptions",
      color: "orange"
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
      },
      orange: {
        icon: 'text-orange-400',
        bg: 'from-orange-500/10 to-yellow-500/10',
        border: 'border-orange-500/20'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section
      ref={sectionRef}
      id="company"
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
              About Compound BST
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">About</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Compound BST
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
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto"
          >
            The driving force behind Compound 360 - Ethiopia's premier fitness and wellness company
          </motion.p>
        </div>

        {/* Main Content */}
        <div ref={contentRef} className="max-w-6xl mx-auto">
          {/* Company Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed mb-6">
                At Compound BST, we believe fitness should be accessible, culturally relevant, and technologically advanced. 
                We're building Ethiopia's first comprehensive fitness ecosystem that combines the best of traditional 
                training methods with cutting-edge AI technology.
              </p>
              <p className="text-white/80 leading-relaxed">
                Our hybrid approach ensures that every Ethiopian can access world-class fitness guidance, whether they 
                prefer in-person training at our state-of-the-art gym or digital coaching through our AI-powered platform.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <h4 className="text-xl font-bold text-white mb-4">Why Choose Compound BST?</h4>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>Proven track record in Ethiopian fitness market</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>Cultural understanding and local expertise</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>Innovation in fitness technology and delivery</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>Commitment to community health and wellness</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
