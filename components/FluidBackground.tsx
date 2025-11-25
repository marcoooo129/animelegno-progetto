
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DustMotes = () => {
  // Reduce particle count significantly for better performance
  const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 20;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10, // Slower, less updates
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1
    }));
  }, [particleCount]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#8D6E63] will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{ opacity: p.opacity, y: 0 }}
          animate={{
            opacity: [p.opacity, 0.4, p.opacity],
            y: [0, -30, 0], // Reduced movement range
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear", // Linear is cheaper to calculate
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF9]">
      
      <DustMotes />

      {/* Optimized Blobs: Reduced Blur on Mobile, Simpler Animations */}
      
      {/* Blob 1: Soft Beige/Wood */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[90vw] h-[90vw] bg-[#F5F5DC] rounded-full mix-blend-multiply filter blur-[30px] md:blur-[60px] opacity-60 will-change-transform"
        animate={{
          x: [0, 30, 0], // Reduced movement
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Blob 2: Warm Tan */}
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[100vw] h-[80vw] bg-[#D7CCC8] rounded-full mix-blend-multiply filter blur-[30px] md:blur-[60px] opacity-50 will-change-transform"
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Blob 3: Light Oak */}
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#E0E0E0] rounded-full mix-blend-multiply filter blur-[30px] md:blur-[60px] opacity-40 will-change-transform"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Static Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};

export default FluidBackground;
