
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from '../types';
import { GalleryService } from '../services/galleryService';

interface ImageTickerProps {
  refreshTrigger?: number;
}

// Fallback images (High-end wood/craft/anime aesthetic) to ensure the ticker is never invisible
const DEMO_IMAGES: GalleryItem[] = [
    { id: 'd1', image_url: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=800&auto=format&fit=crop' }, // One Piece Figure style
    { id: 'd2', image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop' }, // Wood texture
    { id: 'd3', image_url: 'https://images.unsplash.com/photo-1589330694653-418b72462a4d?q=80&w=800&auto=format&fit=crop' }, // Craftsmanship
    { id: 'd4', image_url: 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?q=80&w=800&auto=format&fit=crop' }, // Wood carving tools
    { id: 'd5', image_url: 'https://images.unsplash.com/photo-1610214840509-c189af04b76e?q=80&w=800&auto=format&fit=crop' }, // Artistic sketch
];

const ImageTicker: React.FC<ImageTickerProps> = ({ refreshTrigger = 0 }) => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await GalleryService.getAll();
        console.log("Ticker fetched images:", data);
        if (data && data.length > 0) {
            setImages(data);
        } else {
            // If DB is empty, use demo images so the UI isn't broken
            setImages(DEMO_IMAGES);
        }
      } catch (err) {
        console.error("Ticker fetch error, using demo:", err);
        setImages(DEMO_IMAGES);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [refreshTrigger]);

  // Determine which list to use (Real or Demo)
  const displayImages = images.length > 0 ? images : DEMO_IMAGES;

  // Duplicate images for smooth infinite loop (x4 to fill wide screens)
  const duplicatedImages = [...displayImages, ...displayImages, ...displayImages, ...displayImages];

  return (
    <div className="w-full relative z-10 py-16 md:py-32 bg-transparent overflow-hidden">
      {/* 
         High-end Gradient Fades (Masks)
         Seamlessly blends the slider into the page background.
         The masks use the page base color but fade to transparent to allow the underlying grain to peek through the center.
      */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-[#FAFAF9] via-[#FAFAF9]/80 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-[#FAFAF9] via-[#FAFAF9]/80 to-transparent z-20 pointer-events-none"></div>

      {/* Decorative Title (Vertical) */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-multiply opacity-30">
         <span className="text-[#3E2723] text-xs font-serif italic tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            Gallery &middot; Process &middot; Details
         </span>
      </div>

      <motion.div
        className="flex gap-8 md:gap-20 items-center pl-4"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: Math.max(60, displayImages.length * 15), // Slow, museum-like pace
        }}
        style={{ width: "fit-content" }}
      >
        {duplicatedImages.map((item, index) => (
          <motion.div 
            key={`${item.id}-${index}`} 
            className="relative h-[300px] md:h-[500px] aspect-[2/3] flex-shrink-0 bg-[#EFEBE9]/50 backdrop-blur-sm overflow-hidden group rounded-sm"
            initial="rest"
            whileHover="hover"
          >
            <motion.img
              src={item.image_url}
              alt="Gallery"
              className="w-full h-full object-cover grayscale md:grayscale-[0.8]" // Default: B&W/Muted
              variants={{
                rest: { scale: 1.05, filter: "grayscale(0.8) contrast(0.9)" },
                hover: { scale: 1.15, filter: "grayscale(0) contrast(1.1)" } // Hover: Full Color & Zoom
              }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              loading="lazy"
            />
            
            {/* Subtle grain overlay for texture */}
            <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ImageTicker;
