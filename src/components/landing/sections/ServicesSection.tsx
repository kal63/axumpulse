'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useOptimizedParticles } from '@/hooks/useOptimizedParticles';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dumbbell,
  Smartphone,
  Heart,
  Utensils,
  MessageCircle,
  BarChart3,
  Sparkles
} from 'lucide-react';


interface ServicesSectionProps {
  onLoaded?: () => void;
}

export function ServicesSection({ onLoaded }: ServicesSectionProps) {
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

  const services = [
    {
      icon: Dumbbell,
      title: "In-Person Training",
      description: "Open group classes, private sessions, and specialized training at Compound BST gym.",
      features: [
        "Strength & HIIT Classes",
        "Muay Thai & Kickboxing", 
        "Transformation Programs",
        "Form & Safety Workshops"
      ],
      color: "blue"
    },
    {
      icon: Smartphone,
      title: "Digital Coaching",
      description: "AI-powered virtual coaching with personalized workout and nutrition plans.",
      features: [
        "24/7 AI Virtual Coach",
        "Personalized Workout Plans",
        "Progress Tracking",
        "Habit Building Tools"
      ],
      color: "cyan"
    },
    {
      icon: Heart,
      title: "Medical Integration",
      description: "Access to licensed doctors for health consultations and injury prevention.",
      features: [
        "Health Q&A Forum",
        "E-Consultations",
        "Injury Prevention",
        "Recovery Protocols"
      ],
      color: "red"
    },
    {
      icon: Utensils,
      title: "Nutrition Guidance",
      description: "Culturally adapted meal plans using local Ethiopian ingredients and foods.",
      features: [
        "Ethiopian Cuisine Focus",
        "Local Ingredient Lists",
        "Budget-Friendly Options",
        "Dietary Restrictions"
      ],
      color: "green"
    },
    {
      icon: MessageCircle,
      title: "Community Support",
      description: "Connect with fellow Ethiopians on the same fitness journey.",
      features: [
        "Q&A Forums",
        "Group Challenges",
        "Progress Sharing",
        "Peer Support"
      ],
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed tracking and insights into your fitness journey.",
      features: [
        "Visual Dashboards",
        "Habit Tracking",
        "Milestone Celebrations",
        "Performance Analytics"
      ],
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        icon: 'text-sky-600',
        iconBox: 'bg-sky-500/15',
        bg: 'from-sky-500/8 to-sky-600/8',
        border: 'border-sky-500/25',
        dot: 'bg-sky-500',
      },
      cyan: {
        icon: 'text-sky-500',
        iconBox: 'bg-sky-500/15',
        bg: 'from-sky-500/8 to-lime-500/8',
        border: 'border-sky-500/25',
        dot: 'bg-sky-500',
      },
      red: {
        icon: 'text-rose-500',
        iconBox: 'bg-rose-500/15',
        bg: 'from-rose-500/8 to-pink-500/8',
        border: 'border-rose-500/25',
        dot: 'bg-rose-500',
      },
      green: {
        icon: 'text-emerald-600',
        iconBox: 'bg-emerald-500/15',
        bg: 'from-emerald-500/8 to-lime-500/8',
        border: 'border-emerald-500/25',
        dot: 'bg-emerald-500',
      },
      purple: {
        icon: 'text-violet-600',
        iconBox: 'bg-violet-500/15',
        bg: 'from-violet-500/8 to-sky-500/8',
        border: 'border-violet-500/25',
        dot: 'bg-violet-500',
      },
      orange: {
        icon: 'text-amber-600',
        iconBox: 'bg-amber-500/15',
        bg: 'from-amber-500/8 to-lime-500/8',
        border: 'border-amber-500/25',
        dot: 'bg-amber-500',
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-20 lg:py-32 relative overflow-hidden z-10 scroll-mt-24 md:scroll-mt-28"
    >
      {/* Animated background particles */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(12, 74, 110, 0.08) 0%, transparent 50%)'
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
              className="absolute inset-0 bg-gradient-to-r from-lime-500 via-sky-600 to-sky-900 bg-clip-text text-transparent opacity-20"
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
              Our Services
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 text-slate-900">Our</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-lime-600 via-sky-600 to-sky-900 bg-clip-text text-transparent">
              Services
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
            className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
          >
            Comprehensive fitness and health solutions for every need
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto" ref={cardsRef}>
          {services.map((service, index) => {
            const colors = getColorClasses(service.color);
            const IconComponent = service.icon;
            
            return (
              <Card 
                key={index}
                className={`bg-white/90 backdrop-blur-sm border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden ${colors.border}`}
              >
                {/* Glowing effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <CardContent className="p-6 relative z-10">
                  <div className={`w-14 h-14 ${'iconBox' in colors ? colors.iconBox : ''} rounded-2xl flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  
                  <ul className="text-slate-600 text-sm space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className={`w-1.5 h-1.5 ${'dot' in colors ? colors.dot : 'bg-slate-400'} rounded-full mr-2 flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
