
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

const ImageTicker: React.FC<ImageTickerProps> = ({ refreshTrigger = 0 }) => {
  const [images, setImages] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const data = await GalleryService.getAll();
      setImages(data);
    };
    fetchImages();
  }, [refreshTrigger]);

  if (images.length === 0) return null;

  // Duplicate images for infinite loop
  const duplicatedImages = [...images, ...images, ...images, ...images];

  return (
    <div className="w-full relative z-10 py-12 md:py-24 bg-[#FAFAF9] overflow-hidden">
      {/* 
         High-end Gradient Fades 
         Matches the page background (#FAFAF9) to create a seamless floating effect 
      */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#FAFAF9] via-[#FAFAF9]/90 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#FAFAF9] via-[#FAFAF9]/90 to-transparent z-20 pointer-events-none"></div>

      {/* Decorative Title (Subtle watermark style) */}
      <div className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none mix-blend-multiply opacity-20">
         <span className="text-[#3E2723] text-sm font-serif italic tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            Curated Collection
         </span>
      </div>

      <motion.div
        className="flex gap-8 md:gap-16 items-center pl-4"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: Math.max(45, images.length * 12), // Slow, elegant scroll
        }}
        style={{ width: "fit-content" }}
      >
        {duplicatedImages.map((item, index) => (
          <motion.div 
            key={`${item.id}-${index}`} 
            className="relative h-[280px] md:h-[450px] aspect-[2/3] flex-shrink-0 overflow-hidden bg-[#EFEBE9] shadow-sm"
            initial="rest"
            whileHover="hover"
          >
            <motion.img
              src={item.image_url}
              alt="Gallery"
              className="w-full h-full object-cover"
              variants={{
                rest: { scale: 1, filter: "saturate(0.9) brightness(1)" },
                hover: { scale: 1.1, filter: "saturate(1.1) brightness(1.05)" }
              }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              loading="lazy"
            />
            
            {/* Very subtle inner border for definition */}
            <div className="absolute inset-0 border border-[#3E2723]/5 pointer-events-none"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ImageTicker;
