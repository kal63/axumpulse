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
      icon: Users,
      title: "Expert Trainers",
      description: "Connect with certified Ethiopian fitness professionals for personalized training sessions and expert guidance.",
    },
    {
      icon: Smartphone,
      title: "SMS-Based Access",
      description: "Start your fitness journey instantly by simply texting 'OK' to our short code. No app downloads required.",
    },
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Monitor your progress with comprehensive health metrics, workout tracking, and personalized insights.",
    },
    {
      icon: Zap,
      title: "Quick Workouts",
      description: "Get fit with 15-30 minute workouts designed for busy schedules. Perfect for Ethiopian lifestyle.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Text to Start",
      description: "Simply text 'OK' to our short code to begin your fitness journey instantly.",
      icon: MessageSquare,
    },
    {
      step: "2", 
      title: "Get Your Plan",
      description: "Receive a personalized workout plan based on your fitness level and goals.",
      icon: Target,
    },
    {
      step: "3",
      title: "Start Training",
      description: "Follow your AI coach's guidance and track your progress in real-time.",
      icon: Activity,
    },
    {
      step: "4",
      title: "Achieve Goals",
      description: "Reach your fitness goals with consistent support and motivation.",
      icon: Trophy,
    },
  ];

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: "2 ETB",
      period: "per day",
      description: "Perfect for getting started",
      features: [
        "AI Virtual Coach",
        "Basic Workout Plans", 
        "Progress Tracking",
        "SMS Support",
        "Multilingual Support"
      ],
      popular: false,
    },
    {
      name: "Premium Plan", 
      price: "5 ETB",
      period: "per day",
      description: "Most popular choice",
      features: [
        "Everything in Basic",
        "Expert Trainer Access",
        "Advanced Workout Plans",
        "Nutrition Guidance",
        "Priority Support",
        "Challenges & Rewards"
      ],
      popular: true,
    },
    {
      name: "Elite Plan",
      price: "10 ETB", 
      period: "per day",
      description: "For serious fitness enthusiasts",
      features: [
        "Everything in Premium",
        "1-on-1 Personal Training",
        "Custom Meal Plans",
        "Advanced Analytics",
        "24/7 Priority Support",
        "Exclusive Content"
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Alemayehu Tadesse",
      role: "Software Engineer",
      location: "Addis Ababa",
      content: "AxumPulse 360 has transformed my fitness routine. The AI coach in Amharic makes it so easy to understand and follow. I've lost 15kg in 3 months!",
      rating: 5,
    },
    {
      name: "Fatuma Ahmed",
      role: "Teacher", 
      location: "Dire Dawa",
      content: "As a busy teacher, I love the quick workouts. The SMS system is perfect for my schedule. The trainer support is amazing!",
      rating: 5,
    },
    {
      name: "Yonas Gebre",
      role: "Business Owner",
      location: "Bahir Dar", 
      content: "The multilingual support is incredible. I can train in Oromifa and my whole family uses it. Best fitness platform in Ethiopia!",
      rating: 5,
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "50+", label: "Certified Trainers" },
    { number: "4", label: "Languages Supported" },
    { number: "95%", label: "User Satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <Header scrolled={scrolled} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
              Ethiopia's First AI-Powered Fitness Platform
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transform Your Life
              </span>
              <br />
              <span className="text-white">with AxumPulse 360</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              AI-driven fitness coaching, expert trainers, and personalized wellness programs—all in{' '}
              <span className="text-blue-400 font-semibold">Amharic, Oromifa, Tigrigna & English</span>
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-slate-400 text-sm">AI Coach Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-400">2 ETB</div>
                <div className="text-slate-400 text-sm">Daily Subscription</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-400">4</div>
                <div className="text-slate-400 text-sm">Languages Supported</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg"
              >
                Text "OK" to Start
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-4 text-lg"
              >
                Become a Trainer
              </Button>
            </div>

            {/* SMS Instructions */}
            <div className="pt-8">
              <p className="text-slate-400 text-sm">
                Simply text <span className="text-blue-400 font-mono font-bold">"OK"</span> to our short code to get started
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose AxumPulse 360?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Experience the future of fitness with AI-powered coaching, expert trainers, and culturally relevant content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Get started with AxumPulse 360 in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Choose the plan that fits your fitness goals and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500/50 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-blue-400">{plan.price}</span>
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-slate-300 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    } text-white font-semibold py-3`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Trainers Section */}
      <section id="trainers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Join Our Trainer Network
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Become part of Ethiopia's leading fitness platform and help thousands of people achieve their health goals. 
                Earn money while making a positive impact in your community.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Earn Competitive Rates</h3>
                    <p className="text-slate-300">Get paid for every session and build a sustainable income stream.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Reach More Clients</h3>
                    <p className="text-slate-300">Connect with clients across Ethiopia through our platform.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Professional Development</h3>
                    <p className="text-slate-300">Access training resources and grow your expertise.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <p className="text-amber-400 text-sm font-medium">
                  <strong>Important:</strong> You need to create an account and login to apply as a trainer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/user/apply">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3">
                    Apply Now
                  </Button>
                </Link>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-3">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Trainer Benefits</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Flexible Schedule</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Remote Training</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Client Management</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Payment Processing</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <span className="text-slate-300">Marketing Support</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Join thousands of Ethiopians who have transformed their lives with AxumPulse 360
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                    <p className="text-slate-500 text-sm">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Join the growing community of fitness enthusiasts across Ethiopia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                About AxumPulse 360
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                We're on a mission to make fitness accessible, affordable, and culturally relevant for every Ethiopian. 
                Our AI-powered platform combines cutting-edge technology with local expertise to deliver personalized 
                fitness experiences in your preferred language.
              </p>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Founded by fitness enthusiasts who understand the unique challenges and opportunities in Ethiopia, 
                AxumPulse 360 is more than just a fitness app—it's a movement towards a healthier, stronger nation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3">
                  Learn More
                </Button>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-3">
                  Contact Us
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Our Mission</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Health for All</h4>
                      <p className="text-slate-300">Making fitness accessible to every Ethiopian, regardless of location or income.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Cultural Relevance</h4>
                      <p className="text-slate-300">Fitness content that respects and celebrates Ethiopian culture and traditions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Innovation</h4>
                      <p className="text-slate-300">Leveraging AI and technology to deliver personalized fitness experiences.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            Join thousands of Ethiopians who are already on their fitness journey with AxumPulse 360. 
            Start today and experience the difference AI-powered coaching can make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 text-lg"
            >
              Text "OK" to Start Now
            </Button>
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-4 text-lg"
              >
                Sign In to Your Account
              </Button>
            </Link>
          </div>
          
          <p className="text-slate-400 text-sm mt-6">
            No credit card required • Cancel anytime • 24/7 support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">💪</span>
                </div>
                <span className="text-xl font-bold text-white">AxumPulse 360</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Ethiopia's first AI-powered fitness platform, making health and wellness accessible to everyone.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-300 hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-300 hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#trainers" className="text-slate-300 hover:text-blue-400 transition-colors">For Trainers</a></li>
                <li><a href="#about" className="text-slate-300 hover:text-blue-400 transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-blue-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 AxumPulse 360. All rights reserved. Made with ❤️ in Ethiopia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

