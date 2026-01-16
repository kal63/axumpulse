'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient, PublicTrainer } from '@/lib/api-client';
import { getImageUrl } from '@/lib/upload-utils';
import { 
  User,
  Award,
  Sparkles,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TrainersSectionProps {
  onLoaded?: () => void;
}

export function TrainersSection({ onLoaded }: TrainersSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [trainers, setTrainers] = useState<PublicTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReportedLoaded, setHasReportedLoaded] = useState(false);

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await apiClient.getPublicTrainers();
        if (response.success && response.data) {
          // Handle both { items: [...] } and direct array response
          const trainersList = Array.isArray(response.data) 
            ? response.data 
            : (response.data.items || []);
          setTrainers(trainersList);
        }
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

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
    if (!sectionRef.current || loading) return;

    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const cards = cardsRef.current?.children;

    if (!title || !subtitle) return;

    // Create a timeline to track all animations
    const tl = gsap.timeline({
      onComplete: () => {
        // All animations are complete, report loaded
        if (!hasReportedLoaded) {
          onLoaded?.();
          setHasReportedLoaded(true);
        }
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
        if (!hasReportedLoaded) {
          onLoaded?.();
          setHasReportedLoaded(true);
        }
      });
    }

  }, [loading, trainers, onLoaded, hasReportedLoaded]);

  // Format specialty name for display
  const formatSpecialty = (specialty: string): string => {
    return specialty
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <section
      ref={sectionRef}
      id="trainers"
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
              Our Trainers
            </motion.span>
            
            {/* Main text */}
            <span className="relative z-10 text-white">Our</span>
            <br />
            <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Expert Trainers
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
            Meet our certified trainers ready to guide you on your fitness journey
          </motion.p>
        </div>

        {/* Trainers Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white/60">Loading trainers...</div>
          </div>
        ) : trainers.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-white/60">No trainers available at the moment.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch" ref={cardsRef}>
            {trainers.map((trainer) => {
              const profileImageUrl = trainer.profilePicture 
                ? getImageUrl(trainer.profilePicture) 
                : null;
              
              return (
                <Link 
                  key={trainer.userId}
                  href={`/trainers/${trainer.userId}`}
                  className="group h-full"
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 relative overflow-hidden hover:border-blue-500/30 h-full min-h-[100px]">
                    {/* Glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardContent className="p-4 relative z-10 flex flex-row items-center gap-4 h-full">
                      {/* Profile Picture - Left Side */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 group-hover:border-blue-400 transition-colors">
                          {profileImageUrl ? (
                            <Image
                              src={profileImageUrl}
                              alt={trainer.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                              <User className="w-8 h-8 text-white/60" />
                            </div>
                          )}
                          {/* Verified badge */}
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-slate-900">
                            <UserCheck className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Trainer Info - Right Side */}
                      <div className="flex-1 min-w-0">
                        {/* Trainer Name */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                          {trainer.name}
                        </h3>
                        
                        {/* Specialties */}
                        {trainer.specialties && trainer.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {trainer.specialties.slice(0, 2).map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full"
                              >
                                {formatSpecialty(specialty)}
                              </span>
                            ))}
                            {trainer.specialties.length > 2 && (
                              <span className="px-2 py-0.5 text-xs font-medium text-white/60">
                                +{trainer.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">No specialties listed</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

