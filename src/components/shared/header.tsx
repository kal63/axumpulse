'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';

interface HeaderProps {
  scrolled?: boolean;
  showLogin?: boolean;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'Amharic' },
  { code: 'om', name: 'Oromifa' },
  { code: 'ti', name: 'Tigrigna' }
];

export default function Header({ scrolled = false, showLogin = true, onMenuClick, showMenuButton = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    setIsLanguageOpen(false);
    // i18n logic will be added here later
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      console.log('[Header] Nav click:', sectionId, 'current path:', window.location.pathname);
    }

    const element = document.getElementById(sectionId);
    if (element) {
      // Use native scrollIntoView; sections use scroll-mt-* to account for header height
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 1000);
    } else {
      router.push(`/#${sectionId}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-blue-500/20'
        : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { id: 'about', label: 'About Us' },
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'services', label: 'Services' },
              { id: 'company', label: 'Company' },
              { id: 'for-trainers', label: 'For Trainers' }
            ].map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${scrolled
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            ))}

            {/* Language Selector */}
            <div className="relative ml-2" ref={languageDropdownRef}>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${scrolled
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-50 overflow-hidden ${scrolled
                      ? 'bg-slate-800 border-blue-500/20'
                      : 'bg-slate-900/95 border-blue-500/20'
                      }`}
                  >
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 ${selectedLanguage === lang.code
                          ? 'bg-blue-500/20 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {lang.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {showLogin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="ml-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Link href="/login">
                    Login
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {showMenuButton ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${scrolled
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                : 'text-white hover:bg-white/10'
                }`}
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-3 rounded-xl cursor-pointer transition-all duration-300 ${scrolled
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                : 'text-white hover:bg-white/10'
                }`}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-4 pt-4 pb-6 space-y-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl mt-4 shadow-2xl border border-blue-500/20"
              >
                {[
                  { id: 'about', label: 'About Us' },
                  { id: 'features', label: 'Features' },
                  { id: 'how-it-works', label: 'How It Works' },
                  { id: 'pricing', label: 'Pricing' },
                  { id: 'services', label: 'Services' },
                  { id: 'company', label: 'Company' },
                  { id: 'for-trainers', label: 'For Trainers' }
                ].map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    onClick={() => scrollToSection(item.id)}
                    className="relative block w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 font-medium text-left rounded-lg group overflow-hidden"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                ))}

                {/* Mobile Language Selector */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + 7 * 0.05 }}
                  className="border-t border-slate-700 mt-2 pt-2"
                >
                  <div className="px-4 py-2">
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Language
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <motion.button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${selectedLanguage === lang.code
                            ? 'bg-blue-500/20 text-white'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {lang.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {showLogin && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="px-4 pt-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          console.log('[Header] Mobile login click, current path:', window.location.pathname);
                        }
                        setIsMenuOpen(false);
                        router.push('/login');
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      Login
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
