'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  /** Light Ethio / Radiant-style nav on the marketing home */
  variant?: "default" | "ethio";
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'am', name: 'Amharic' },
  { code: 'om', name: 'Oromifa' },
  { code: 'ti', name: 'Tigrigna' }
];

const LANDING_NAV: { id: string; label: string }[] = [
  { id: 'about', label: 'About Us' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'services', label: 'Services' },
  { id: 'company', label: 'Company' },
  { id: 'for-trainers', label: 'For Trainers' }
];

export default function Header({ scrolled = false, showLogin = true, onMenuClick, showMenuButton = false, variant = "default" }: HeaderProps) {
  const isEthio = variant === "ethio";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isEthio
          ? scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/80'
            : 'bg-transparent'
          : scrolled
            ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-blue-500/20'
            : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={
            isEthio
              ? 'flex items-center justify-between h-16 gap-3 w-full min-w-0'
              : 'flex items-center justify-between h-16'
          }
        >
          {isEthio ? (
            <>
              <Link
                href="/"
                className="shrink-0 flex items-center rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500/50"
                aria-label="Ethio telecom"
              >
                <Image
                  src="/ethiotell.png"
                  alt="Ethio telecom"
                  width={200}
                  height={56}
                  className="h-8 sm:h-9 w-auto max-w-[min(40vw,11rem)] object-contain"
                  priority
                />
              </Link>

              <div className="hidden md:flex flex-1 items-center justify-center min-w-0 px-2 gap-0.5 lg:gap-1">
                {LANDING_NAV.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-2 lg:px-3 py-2 rounded-lg text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap ${
                      scrolled
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                        : 'text-slate-800/95 hover:text-slate-900 hover:bg-white/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 min-w-0">
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-2 group shrink-0"
                  aria-label="Compound 360 home"
                >
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative inline-flex items-center justify-center"
                  >
                    <Image
                      src="/logo.png"
                      alt=""
                      width={100}
                      height={28}
                      className="h-7 w-auto max-h-7 rounded-md bg-white/90 p-0.5 shadow-sm"
                      priority
                    />
                  </motion.div>
                  <span className="text-sm sm:text-base font-bold text-slate-900 max-w-[9rem] sm:max-w-none truncate sm:whitespace-nowrap group-hover:opacity-90 transition-opacity">
                    Compound 360
                  </span>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                  <div className="relative" ref={languageDropdownRef}>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                      className={
                        scrolled
                          ? 'p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                          : 'p-2 rounded-lg text-slate-800/95 hover:text-slate-900 hover:bg-white/30'
                      }
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
                          className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-50 overflow-hidden bg-white border-slate-200 shadow-xl"
                        >
                          {languages.map((lang) => (
                            <motion.button
                              key={lang.code}
                              onClick={() => handleLanguageSelect(lang.code)}
                              className={
                                selectedLanguage === lang.code
                                  ? 'w-full px-4 py-3 text-left bg-lime-100/90 text-slate-900'
                                  : 'w-full px-4 py-3 text-left text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }
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
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="ml-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        asChild
                        className="bg-[hsl(222,47%,8%)] hover:bg-[hsl(222,47%,12%)] text-white font-semibold px-5 py-2 rounded-full shadow-md text-sm"
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                    </motion.div>
                  )}
                </div>

                {showMenuButton ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMenuClick}
                    className={
                      scrolled
                        ? 'md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                        : 'md:hidden p-2 rounded-xl text-slate-800/95 hover:bg-white/30'
                    }
                  >
                    <Menu className="w-6 h-6" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2.5 rounded-xl text-slate-800 hover:bg-white/40"
                    aria-label="Open menu"
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
            </>
          ) : (
            <>
          <Logo size="sm" />

          <div className="hidden md:flex items-center space-x-1">
            {LANDING_NAV.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                  isEthio
                    ? scrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                      : 'text-slate-800/95 hover:text-slate-900 hover:bg-white/30'
                    : scrolled
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
                className={`p-2 rounded-lg font-medium cursor-pointer transition-all duration-300 ${
                  isEthio
                    ? scrolled
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                      : 'text-slate-800/95 hover:text-slate-900 hover:bg-white/30'
                    : scrolled
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
                    className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-50 overflow-hidden ${
                      isEthio
                        ? 'bg-white border-slate-200 shadow-xl'
                        : scrolled
                          ? 'bg-slate-800 border-blue-500/20'
                          : 'bg-slate-900/95 border-blue-500/20'
                      }`}
                  >
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full px-4 py-3 text-left transition-all duration-200 ${
                          isEthio
                            ? selectedLanguage === lang.code
                              ? 'bg-lime-100/90 text-slate-900'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : selectedLanguage === lang.code
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
                  className={
                    isEthio
                      ? "bg-[hsl(222,47%,8%)] hover:bg-[hsl(222,47%,12%)] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  }
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
              className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                isEthio
                  ? scrolled
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                    : 'text-slate-800/95 hover:bg-white/30'
                  : scrolled
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
              className={`md:hidden p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                isEthio
                  ? scrolled
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/90'
                    : 'text-slate-800/95 hover:bg-white/30'
                  : scrolled
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
            </>
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
                className={
                  isEthio
                    ? "px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-xl rounded-2xl mt-4 shadow-xl border border-slate-200/90"
                    : "px-4 pt-4 pb-6 space-y-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl mt-4 shadow-2xl border border-blue-500/20"
                }
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
                    className={
                      isEthio
                        ? "relative block w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 transition-all duration-300 font-medium text-left rounded-lg group overflow-hidden"
                        : "relative block w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 font-medium text-left rounded-lg group overflow-hidden"
                    }
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
                  className={isEthio ? "border-t border-slate-200 mt-2 pt-2" : "border-t border-slate-700 mt-2 pt-2"}
                >
                  <div className="px-4 py-2">
                    <p className={isEthio ? "text-xs text-slate-500 mb-2 flex items-center gap-2" : "text-xs text-slate-400 mb-2 flex items-center gap-2"}>
                      <Globe className="w-4 h-4" />
                      Language
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <motion.button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isEthio
                              ? selectedLanguage === lang.code
                                ? 'bg-lime-100/90 text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              : selectedLanguage === lang.code
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
                      className={
                        isEthio
                          ? "w-full bg-[hsl(222,47%,8%)] hover:bg-[hsl(222,47%,12%)] text-white font-semibold py-3 rounded-full shadow-md transition-all duration-300"
                          : "w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                      }
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
