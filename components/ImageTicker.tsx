/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GalleryItem } from '../types';

const GALLERY_IMAGES: GalleryItem[] = [
  { id: 'woodcraft-01', image_url: '/gallery/woodcraft-01.jpg' },
  { id: 'woodcraft-02', image_url: '/gallery/woodcraft-02.jpg' },
  { id: 'woodcraft-03', image_url: '/gallery/woodcraft-03.jpg' },
  { id: 'woodcraft-04', image_url: '/gallery/woodcraft-04.jpg' },
  { id: 'woodcraft-05', image_url: '/gallery/woodcraft-05.jpg' },
];

const ImageTicker: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex shrink-0 gap-6 pr-6 md:gap-12 md:pr-12"
            aria-hidden={groupIndex === 1 ? 'true' : undefined}
          >
            {GALLERY_IMAGES.map((item, index) => (
              <div
                key={`${groupIndex}-${item.id}`}
                className="group relative h-[300px] aspect-[2/3] shrink-0 overflow-hidden rounded-sm bg-[#EFEBE9] md:h-[460px]"
              >
                <img
                  src={item.image_url}
                  alt={groupIndex === 0 ? `Gallery image ${index + 1}` : ''}
                  className="size-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                  loading="eager"
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
