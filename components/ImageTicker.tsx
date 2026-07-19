
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { GalleryItem } from '../types';

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

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { GalleryService } = await import('../services/galleryService');
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
      }
    };
    fetchImages();
  }, [refreshTrigger]);

  // Determine which list to use (Real or Demo)
  const displayImages = images.length > 0 ? images : DEMO_IMAGES;

  return (
    <section className="relative z-10 w-full bg-[#FAFAF9] py-16 md:py-24" aria-label="Gallery">
      <div className="mx-auto mb-6 max-w-[1400px] px-4 md:px-6">
        <p className="text-xs uppercase text-[#8D6E63]">Gallery · Process · Details</p>
      </div>

      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:gap-8 md:px-6">
        {displayImages.map((item) => (
          <div
            key={item.id}
            className="group relative h-[280px] flex-shrink-0 snap-start overflow-hidden rounded-sm bg-[#EFEBE9] md:h-[420px]"
          >
            <img
              src={item.image_url}
              alt="Gallery"
              className="h-full w-auto object-cover transition-transform duration-200 md:group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageTicker;
