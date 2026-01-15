"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/shared/header";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { FeaturesSection } from "@/components/landing/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/sections/HowItWorksSection";
import { PricingSection } from "@/components/landing/sections/PricingSection";
import { AboutUsSection } from "@/components/landing/sections/AboutUsSection";
import { ServicesSection } from "@/components/landing/sections/ServicesSection";
import { TrainersSection } from "@/components/landing/sections/TrainersSection";
import { ForTrainersSection } from "@/components/landing/sections/ForTrainersSection";
import { CompanySection } from "@/components/landing/sections/CompanySection";
import Footer from "@/components/shared/footer";
import {
  Smartphone,
  Zap,
  Users,
  Brain,
  Globe,
  Heart,
  TrendingUp,
  Calendar,
  Shield,
  MessageSquare,
  UserPlus,
  Check,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  Target,
  Clock,
  DollarSign,
  BookOpen,
  UserCheck,
  Activity,
  Dumbbell,
  Utensils,
  Bed,
  MessageCircle,
  Video,
  FileText,
  BarChart3,
  Trophy,
  Gift,
  Settings,
  ChevronDown
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { LoadingScreen } from "@/components/landing/ui/LoadingScreen";
import { UnifiedBackground } from "@/components/landing/ui/UnifiedBackground";

export default function AxumPulseLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading Compound 360...");
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // Debug React version for DevTools compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('React version:', React.version);
      console.log('React DOM version:', ReactDOM.version);
    }
  }, []);

  // Refs for inline sections
  const ctaRef = useRef<HTMLElement>(null);

  // Real loading logic - wait for all sections to report loaded
  useEffect(() => {
    const requiredSections = ['hero', 'features', 'how-it-works', 'pricing', 'about', 'services', 'trainers', 'for-trainers', 'company'];
    const progress = Math.round((loadedSections.size / requiredSections.length) * 100);
    console.log(`Loading progress: ${loadedSections.size}/${requiredSections.length} sections loaded (${progress}%)`);

    // Update loading message based on progress
    if (loadedSections.size === 0) {
      setLoadingMessage("Initializing Compound 360...");
    } else if (loadedSections.size < 3) {
      setLoadingMessage("Loading core features...");
    } else if (loadedSections.size < 6) {
      setLoadingMessage("Preparing your experience...");
    } else if (loadedSections.size < requiredSections.length) {
      setLoadingMessage("Almost ready...");
    } else {
      setLoadingMessage("Ready to transform your life!");
    }

    if (loadedSections.size >= requiredSections.length) {
      console.log('🎊 All sections loaded! Hiding loading screen in 800ms...');
      setTimeout(() => {
        console.log('🚀 Loading screen hidden!');
        setIsLoading(false);
      }, 800); // Slightly longer delay to show the final message
    }
  }, [loadedSections]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback loading timeout reached - forcing loading screen to disappear');
      setIsLoading(false);
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Function for sections to report when they're loaded
  const onSectionLoaded = useCallback((sectionName: string) => {
    console.log(`🎉 Section loaded: ${sectionName} (${new Date().toISOString()})`);
    setLoadedSections(prev => {
      if (prev.has(sectionName)) {
        console.log(`⚠️ Section ${sectionName} already loaded, skipping...`);
        return prev; // Don't update if already loaded
      }
      const newSet = new Set([...prev, sectionName]);
      console.log(`📊 Loaded sections: ${Array.from(newSet).join(', ')} (${newSet.size}/9)`);
      return newSet;
    });
  }, []);

  // Check when inline sections are mounted
  useEffect(() => {
    const checkInlineSections = () => {
      if (ctaRef.current && !loadedSections.has('cta')) {
        setTimeout(() => onSectionLoaded('cta'), 100);
      }
    };

    checkInlineSections();
  }, [loadedSections, onSectionLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation when coming from other pages
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash) {
        // Wait a bit for the page to load, then scroll to the section
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Handle initial hash
    handleHashNavigation();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Virtual Coach",
      description: "Get 24/7 personalized guidance with our intelligent AI coach that adapts to your progress, answers questions, and keeps you motivated.",
    },
    {
      icon: Globe,
      title: "Multilingual Platform",
      description: "Full support in Amharic, Oromifa, Tigrigna, and English. Train in your preferred language with culturally relevant content.",
    },
    {
      icon: Heart,
      title: "Medical Integration",
      description: "Access licensed doctors for health Q&A, injury prevention protocols, and e-consultations—all within the platform.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual dashboards track your workouts, nutrition, sleep, and milestones with detailed analytics and insights.",
    },
    {
      icon: Calendar,
      title: "Certified Trainers",
      description: "Browse verified trainers, book sessions, and access expert-created workout programs and meal plans.",
    },
    {
      icon: Shield,
      title: "Community Support",
      description: "Join challenges, share progress, and connect with fellow Ethiopians on the same fitness journey.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Text to Subscribe",
      description: "Send 'OK' to our short code and receive your login credentials via SMS. No app stores, no cards—just simple airtime billing.",
    },
    {
      number: "02",
      icon: UserPlus,
      title: "Set Your Goals",
      description: "Complete your profile with health stats, fitness goals, dietary preferences, and language choice. Our AI creates your personalized plan.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Start Training",
      description: "Follow your daily workouts, track meals, join challenges, and connect with trainers. Your transformation begins today.",
    },
  ];

  console.log(`Rendering main content - loadedSections: ${loadedSections.size}, isLoading: ${isLoading}`);

  return (
    <main className="min-h-screen relative">
      {/* Loading Screen Overlay 
          - Blocks interactions while loading
          - Becomes non-interactive & invisible after loading */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <LoadingScreen
          message={loadingMessage}
          progress={Math.round((loadedSections.size / 9) * 100)}
          loadedSections={loadedSections.size}
          totalSections={9}
        />
      </div>

      {/* Unified Background */}
      <UnifiedBackground />

      {/* Navigation Bar */}
      <Header scrolled={scrolled} showLogin={true} />

      {/* Hero Section */}
      <HeroSection onLoaded={() => onSectionLoaded('hero')} />

      {/* Features Section */}
      <FeaturesSection onLoaded={() => onSectionLoaded('features')} />

      {/* How It Works Section */}
      <HowItWorksSection onLoaded={() => onSectionLoaded('how-it-works')} />

      {/* Pricing Section */}
      <PricingSection onLoaded={() => onSectionLoaded('pricing')} />

      {/* About Us Section */}
      <AboutUsSection onLoaded={() => onSectionLoaded('about')} />

      {/* Services Section */}
      <ServicesSection onLoaded={() => onSectionLoaded('services')} />

      {/* Trainers Section */}
      <TrainersSection onLoaded={() => onSectionLoaded('trainers')} />

      {/* For Trainers Section */}
      <ForTrainersSection onLoaded={() => onSectionLoaded('for-trainers')} />

      {/* Company Section */}
      <CompanySection onLoaded={() => onSectionLoaded('company')} />


      {/* Footer */}
      <Footer />
    </main>
  );
}
