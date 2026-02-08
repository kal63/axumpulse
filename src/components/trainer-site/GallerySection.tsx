'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PublicTrainerDetail, TrainerSiteGalleryImage } from '@/lib/api-client'
import { getImageUrl } from '@/lib/upload-utils'
import { X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface GallerySectionProps {
  trainer: PublicTrainerDetail
}

export function GallerySection({ trainer }: GallerySectionProps) {
  const galleryImages = trainer.site?.galleryImages || []
  const [selectedImage, setSelectedImage] = useState<TrainerSiteGalleryImage | null>(null)

  if (galleryImages.length === 0) {
    return null
  }

  // Sort by order
  const sortedImages = [...galleryImages].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <>
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={getImageUrl(image.url) || image.url}
                  alt={image.caption || 'Gallery image'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <Image
                src={getImageUrl(selectedImage.url) || selectedImage.url}
                alt={selectedImage.caption || 'Gallery image'}
                fill
                className="object-contain"
                unoptimized
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-lg">{selectedImage.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

