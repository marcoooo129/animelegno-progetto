/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GalleryItem } from '../types';

interface ImageTickerProps {
  refreshTrigger?: number;
}

const DEMO_IMAGES: GalleryItem[] = [
  { id: 'd1', image_url: 'https://images.unsplash.com/photo-1612404730960-5c7157472611?q=80&w=800&auto=format&fit=crop' },
  { id: 'd2', image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop' },
  { id: 'd3', image_url: 'https://images.unsplash.com/photo-1589330694653-418b72462a4d?q=80&w=800&auto=format&fit=crop' },
  { id: 'd4', image_url: 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?q=80&w=800&auto=format&fit=crop' },
  { id: 'd5', image_url: 'https://images.unsplash.com/photo-1610214840509-c189af04b76e?q=80&w=800&auto=format&fit=crop' },
];

const ImageTicker: React.FC<ImageTickerProps> = ({ refreshTrigger = 0 }) => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { GalleryService } = await import('../services/galleryService');
        const data = await GalleryService.getAll();
        setImages(data.length > 0 ? data : DEMO_IMAGES);
      } catch (error) {
        console.error('Ticker fetch error, using demo images:', error);
        setImages(DEMO_IMAGES);
      }
    };

    fetchImages();
  }, [refreshTrigger]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const displayImages = images.length > 0 ? images : DEMO_IMAGES;
  const duration = Math.max(40, displayImages.length * 9);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full overflow-hidden bg-[#FAFAF9] py-16 md:py-24"
      aria-label="Gallery"
    >
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-20 bg-gradient-to-r from-[#FAFAF9] to-transparent md:w-40" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-20 bg-gradient-to-l from-[#FAFAF9] to-transparent md:w-40" />

      <div className="mx-auto mb-6 max-w-[1400px] px-4 md:px-6">
        <p className="text-xs uppercase text-[#8D6E63]">Gallery · Process · Details</p>
      </div>

      <div
        className="gallery-ticker-track flex w-max"
        data-visible={isVisible}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0 gap-6 pr-6 md:gap-12 md:pr-12"
            aria-hidden={groupIndex === 1 ? 'true' : undefined}
          >
            {displayImages.map((item, index) => (
              <div
                key={`${groupIndex}-${item.id}`}
                className="group relative h-[300px] aspect-[2/3] shrink-0 overflow-hidden rounded-sm bg-[#EFEBE9] md:h-[460px]"
              >
                <img
                  src={item.image_url}
                  alt={groupIndex === 0 ? `Gallery image ${index + 1}` : ''}
                  className="size-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/5" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageTicker;
