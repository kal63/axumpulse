"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/shared/header";
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
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AxumPulseLandingPage() {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <Header scrolled={scrolled} showLogin={true} />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(150,50%,15%)] via-[hsl(150,50%,18%)] to-[hsl(150,45%,25%)] pt-[80px] sm:pt-0">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(150,50%,15%)]/95 via-[hsl(150,50%,18%)]/95 to-[hsl(150,45%,25%)]/90" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[hsl(140,70%,50%)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(145,65%,55%)]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[hsl(140,70%,50%)]/20 backdrop-blur-sm border border-[hsl(145,65%,55%)]/30 rounded-full px-4 py-2 mb-4">
              <Zap className="w-4 h-4 text-[hsl(145,65%,55%)]" />
              <span className="text-sm font-medium text-[hsl(145,65%,55%)]">Ethiopia's First AI-Powered Fitness Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your Life with
              <span className="block mt-2 bg-gradient-to-r from-[hsl(140,70%,50%)] to-[hsl(145,65%,55%)] bg-clip-text text-transparent">
                Compound 360
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-driven fitness coaching, expert trainers, and personalized wellness programs—all in Amharic, Oromifa, Tigrigna & English
            </p>

            {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg"
                  className="bg-[hsl(140,70%,50%)] hover:bg-[hsl(145,65%,55%)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl font-semibold cursor-pointer"
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Text "OK" to Start
                </Button>
                <Link href="/user/apply">
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 border-2 border-white/50 text-white hover:bg-white hover:text-[hsl(150,50%,15%)] backdrop-blur-sm text-lg px-8 py-6 rounded-xl font-semibold group transition-all duration-300 bg-transparent h-9 cursor-pointer"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Become a Trainer
                </button>
                </Link>

              </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-[hsl(145,65%,55%)] mr-2" />
                  <span className="text-3xl font-bold text-white">24/7</span>
                </div>
                <p className="text-white/80 text-sm">AI Coach Available</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Smartphone className="w-6 h-6 text-[hsl(145,65%,55%)] mr-2" />
                  <span className="text-3xl font-bold text-white">2 ETB</span>
                </div>
                <p className="text-white/80 text-sm">Daily Subscription</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-[hsl(145,65%,55%)] mr-2" />
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <p className="text-white/80 text-sm">Languages Supported</p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete fitness ecosystem designed for Ethiopian users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-[hsl(140,70%,50%)]/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 lg:py-32 bg-[hsl(150,50%,15%)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[hsl(140,70%,50%)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(145,65%,55%)] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-white/80">
              Three simple steps to transform your health and fitness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-[hsl(140,70%,50%)]/30" 
                       style={{ transform: "translateY(-50%)" }} 
                  />
                )}

                <Card className="relative z-10 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 h-full">
                  <CardContent className="p-6 lg:p-8 text-center">
                    <div className="text-6xl font-bold text-[hsl(140,70%,50%)]/20 mb-4">
                      {step.number}
                    </div>

                    <div className="inline-flex p-4 bg-[hsl(140,70%,50%)]/20 rounded-2xl mb-6">
                      <step.icon className="w-8 h-8 text-[hsl(145,65%,55%)]" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">
                      {step.title}
                    </h3>

                    <p className="text-white/80 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              No hidden fees. No contracts. Just 2 ETB daily via direct carrier billing.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-[hsl(140,70%,50%)]/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center pb-8 pt-8 bg-gradient-to-br from-[hsl(140,70%,50%)] to-[hsl(145,65%,55%)] rounded-t-xl">
                <div className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Most Popular</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Daily Access</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-white">2</span>
                  <span className="text-2xl font-semibold text-white/90">ETB</span>
                  <span className="text-lg text-white/80">/day</span>
                </div>
                <p className="text-white/90 mt-2">First 3 days free!</p>
              </CardHeader>

              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">24/7 AI Virtual Coach with personalized guidance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">Unlimited access to workout programs & meal plans</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">Browse and book certified trainers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">Medical Q&A and e-consultation booking</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">Community challenges and progress tracking</span>
          </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[hsl(140,70%,50%)]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-[hsl(140,70%,50%)]" />
                    </div>
                    <span className="text-foreground">Full content in 4 languages</span>
          </li>
                </ul>

                  <Button 
                    size="lg"
                    className="w-full bg-[hsl(140,70%,50%)] hover:bg-[hsl(145,65%,55%)] text-white shadow-md hover:shadow-lg transition-all duration-300 text-lg py-6 rounded-xl font-semibold cursor-pointer"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Text "OK" to Subscribe
                  </Button>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong className="text-foreground">Easy Payment:</strong> Paid via Ethio Telecom direct carrier billing. Cancel anytime by texting 'STOP' to the short code.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-2xl mx-auto mt-12 text-center">
            <p className="text-muted-foreground">
              Your subscription automatically renews daily until you cancel. No credit cards needed—just simple airtime deduction.
            </p>
          </div>
        </div>
      </section>

        {/* About Us Section */}
        <section id="about" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  About Compound 360
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Ethiopia's first end-to-end, AI-driven fitness and wellness platform that empowers trainees, certified trainers, and medical professionals within a unified, multilingual ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">Our Vision</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    An Ethiopia where safe, culturally tuned fitness guidance is accessible to everyone—at home, at work, outdoors, or in the gym.
                  </p>
                  <h3 className="text-2xl font-bold text-foreground mb-6">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Deliver trustworthy coaching and motivating programs through a hybrid model (on-ground classes + digital guidance), removing barriers of cost, language, location, and time.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Users className="w-12 h-12 text-[hsl(140,70%,50%)] mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">24/7 AI Coach</h4>
                    <p className="text-sm text-muted-foreground">Personalized guidance anytime</p>
                  </Card>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Globe className="w-12 h-12 text-[hsl(140,70%,50%)] mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">4 Languages</h4>
                    <p className="text-sm text-muted-foreground">Amharic, Oromifa, Tigrigna, English</p>
                  </Card>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Heart className="w-12 h-12 text-[hsl(140,70%,50%)] mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Medical Integration</h4>
                    <p className="text-sm text-muted-foreground">Licensed doctors on platform</p>
                  </Card>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Smartphone className="w-12 h-12 text-[hsl(140,70%,50%)] mx-auto mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">SMS Onboarding</h4>
                    <p className="text-sm text-muted-foreground">Text "OK" to get started</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:py-32 bg-[hsl(150,50%,15%)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(140,70%,50%)] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(145,65%,55%)] rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Our Services
              </h2>
              <p className="text-lg text-white/80">
                Comprehensive fitness and health solutions for every need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <Dumbbell className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">In-Person Training</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Open group classes, private sessions, and specialized training at Compound BST gym.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Strength & HIIT Classes</li>
                    <li>• Muay Thai & Kickboxing</li>
                    <li>• Transformation Programs</li>
                    <li>• Form & Safety Workshops</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <Smartphone className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Digital Coaching</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    AI-powered virtual coaching with personalized workout and nutrition plans.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• 24/7 AI Virtual Coach</li>
                    <li>• Personalized Workout Plans</li>
                    <li>• Progress Tracking</li>
                    <li>• Habit Building Tools</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Medical Integration</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Access to licensed doctors for health consultations and injury prevention.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Health Q&A Forum</li>
                    <li>• E-Consultations</li>
                    <li>• Injury Prevention</li>
                    <li>• Recovery Protocols</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <Utensils className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Nutrition Guidance</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Culturally adapted meal plans using local Ethiopian ingredients and foods.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Ethiopian Cuisine Focus</li>
                    <li>• Local Ingredient Lists</li>
                    <li>• Budget-Friendly Options</li>
                    <li>• Dietary Restrictions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Community Support</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Connect with fellow Ethiopians on the same fitness journey.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Q&A Forums</li>
                    <li>• Group Challenges</li>
                    <li>• Progress Sharing</li>
                    <li>• Peer Support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[hsl(140,70%,50%)]/20 rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-7 h-7 text-[hsl(140,70%,50%)]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Progress Analytics</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Detailed tracking and insights into your fitness journey.
                  </p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Visual Dashboards</li>
                    <li>• Habit Tracking</li>
                    <li>• Milestone Celebrations</li>
                    <li>• Performance Analytics</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* For Trainers Section */}
        <section id="for-trainers" className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">For Trainers</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Join Compound 360 as a certified trainer. Reach more clients, publish content, and grow your brand—all with local support and tools.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <UserCheck className="w-10 h-10 text-[hsl(140,70%,50%)] mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Verified Profile</h4>
                <p className="text-sm text-muted-foreground">Showcase your certifications and expertise</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Video className="w-10 h-10 text-[hsl(140,70%,50%)] mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Publish Content</h4>
                <p className="text-sm text-muted-foreground">Upload videos and plans for your audience</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <BarChart3 className="w-10 h-10 text-[hsl(140,70%,50%)] mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-2">Grow Your Business</h4>
                <p className="text-sm text-muted-foreground">Analytics, moderation, and client tools</p>
              </Card>
            </div>
            
            {/* Important Message for Trainers */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-amber-800 mb-2">Important: Account Required</h4>
                    <p className="text-amber-700 mb-3">
                      To apply as a trainer, you must first <strong>create an account</strong> and <strong>subscribe to Compound 360</strong>. 
                      This ensures you have access to our platform and understand our community before joining as a trainer.
                    </p>
                    <div className="text-center">
                      <Link href="/login" className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium">
                        Login to Apply →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link href="/user/apply">
                <Button size="lg" className="bg-[hsl(140,70%,50%)] hover:bg-[hsl(145,65%,55%)] text-white cursor-pointer">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Company Section */}
        <section id="company" className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  About Compound BST
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  The driving force behind Compound 360 - Ethiopia's premier fitness and wellness company
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">Our Story</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Compound BST is a private gym and performance training company based in Addis Ababa (Bole, Rwanda area). Known as a local "Place of Change," we blend expert in-person coaching with modern digital experiences to help people build safe, sustainable fitness habits.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    To extend our impact beyond a single facility, we developed Compound 360—a multilingual fitness and health platform that brings structured coaching, challenges, and community support to users nationwide.
                  </p>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[hsl(140,70%,50%)]/10 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-[hsl(140,70%,50%)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Certified Trainers</h4>
                        <p className="text-sm text-muted-foreground">Professional, qualified instructors</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[hsl(140,70%,50%)]/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[hsl(140,70%,50%)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Safety First</h4>
                        <p className="text-sm text-muted-foreground">Editorial standards & safety protocols</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[hsl(140,70%,50%)]/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-[hsl(140,70%,50%)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Proven Results</h4>
                        <p className="text-sm text-muted-foreground">Multi-year track record of success</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(140,70%,50%)]/10 to-[hsl(145,65%,55%)]/10 rounded-2xl p-8 mb-16">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Compound BST?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[hsl(140,70%,50%)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-[hsl(140,70%,50%)]" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Hybrid Delivery</h4>
                      <p className="text-sm text-muted-foreground">Proven on-ground coaching plus scalable digital guidance</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[hsl(140,70%,50%)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-[hsl(140,70%,50%)]" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Culturally Tuned</h4>
                      <p className="text-sm text-muted-foreground">Programs aligned with Ethiopian foods and routines</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[hsl(140,70%,50%)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-[hsl(140,70%,50%)]" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Language Inclusion</h4>
                      <p className="text-sm text-muted-foreground">Multilingual content for clarity and comfort</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[hsl(140,70%,50%)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-[hsl(140,70%,50%)]" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Frictionless Start</h4>
                      <p className="text-sm text-muted-foreground">SMS onboarding and DCB-only subscriptions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-6">Our Location</h3>
                <Card className="max-w-2xl mx-auto p-6">
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-8 h-8 text-[hsl(140,70%,50%)]" />
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground">Compound BST Gym</h4>
                      <p className="text-muted-foreground">Bole, Rwanda Area</p>
                      <p className="text-muted-foreground">Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-[hsl(150,50%,15%)] via-[hsl(150,50%,18%)] to-[hsl(150,45%,25%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(140,70%,50%)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(145,65%,55%)]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[hsl(140,70%,50%)]/20 backdrop-blur-sm border border-[hsl(145,65%,55%)]/30 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-[hsl(145,65%,55%)]">🎉 First 3 days FREE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Your Transformation Today
            </h2>

            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of Ethiopians building healthier habits with AI-powered coaching, expert trainers, and a supportive community—all for just 2 ETB per day.
            </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="bg-[hsl(140,70%,50%)] hover:bg-[hsl(145,65%,55%)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg px-10 py-7 rounded-xl font-semibold cursor-pointer"
                >
                  <Smartphone className="mr-2 h-6 w-6" />
                  Text "OK" to Get Started
                </Button>
                <button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 border-2 border-white/50 text-white hover:bg-white hover:text-[hsl(150,50%,15%)] backdrop-blur-sm text-lg px-8 py-6 rounded-xl font-semibold group transition-all duration-300 bg-transparent h-14 cursor-pointer"
                >
                  View Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-white/70 text-sm mb-4">Trusted by</p>
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
                <span className="font-semibold">Ethio Telecom</span>
                <span className="text-2xl">•</span>
                <span className="font-semibold">Compound BST Gym</span>
                <span className="text-2xl">•</span>
                <span className="font-semibold">Licensed Medical Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(150,50%,15%)] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[hsl(140,70%,50%)] to-[hsl(145,65%,55%)] bg-clip-text text-transparent">
                Compound 360
              </h3>
              <p className="text-white/80 mb-4 leading-relaxed">
                Ethiopia's premier AI-driven fitness and health platform. Transform your life with personalized coaching in your language.
              </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(140,70%,50%)]/20 flex items-center justify-center transition-colors cursor-pointer">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(140,70%,50%)]/20 flex items-center justify-center transition-colors cursor-pointer">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[hsl(140,70%,50%)]/20 flex items-center justify-center transition-colors cursor-pointer">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('about')} className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">About Us</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Features</button></li>
                <li><button onClick={() => scrollToSection('for-trainers')} className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">For Trainers</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Pricing</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Services</button></li>
                <li><Link href="/apply" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Become a Trainer</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Help Center</a></li>
                <li><a href="#" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href="#" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="#" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Cancellation Policy</a></li>
                <li><a href="#" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[hsl(145,65%,55%)] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">
                    Compound BST Gym<br />
                    Bole, Rwanda Area<br />
                    Addis Ababa, Ethiopia
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[hsl(145,65%,55%)] flex-shrink-0" />
                  <a href="tel:+251" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">
                    +251 XXX XXX XXX
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[hsl(145,65%,55%)] flex-shrink-0" />
                  <a href="mailto:info@axumpulse360.com" className="text-white/80 hover:text-[hsl(145,65%,55%)] transition-colors cursor-pointer">
                    info@axumpulse360.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/70">
            <p>
              © {new Date().getFullYear()} Compound 360 by Compound BST. All rights reserved.
            </p>
            <p className="mt-2 text-sm">
              Powered by Ethio Telecom Value-Added Services
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
