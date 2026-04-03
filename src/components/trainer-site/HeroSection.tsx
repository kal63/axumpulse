'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/upload-utils'
import { PublicTrainerDetail } from '@/lib/api-client'
import { UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  trainer: PublicTrainerDetail
  onSubscribe?: () => void
  /** When set, overrides site `ctaText` for the main button label */
  ctaLabel?: string
}

export function HeroSection({ trainer, onSubscribe, ctaLabel }: HeroSectionProps) {
  const site = trainer.site
  const heroBg = site?.heroBackgroundImage
  const headline = site?.headline || trainer.user.name
  const subheadline = site?.subheadline
  const bio = site?.bio || trainer.trainer.bio
  const ctaText = ctaLabel || site?.ctaText || 'Subscribe to This Trainer'
  const theme = site?.theme || {}

  const primaryColor = theme.primaryColor || '#3b82f6'
  const ctaColor = theme.ctaColor || primaryColor

  return (
    <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image or Gradient */}
      {heroBg ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={getImageUrl(heroBg) || heroBg}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
      ) : (
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${theme.secondaryColor || '#8b5cf6'} 100%)`
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: theme.fontFamily || 'inherit' }}
          >
            {headline}
          </h1>
          
          {subheadline && (
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              {subheadline}
            </p>
          )}

          {bio && (
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {bio}
            </p>
          )}

          {Array.isArray(trainer.trainer.specialties) && trainer.trainer.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {trainer.trainer.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {onSubscribe && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onSubscribe}
                size="lg"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: ctaColor,
                  color: 'white',
                }}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {ctaText}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

