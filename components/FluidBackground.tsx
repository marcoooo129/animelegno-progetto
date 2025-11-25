/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const DustMotes = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.4 + 0.1
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#8D6E63] will-change-[opacity,transform]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            transform: 'translateZ(0)'
          }}
          initial={{ opacity: p.opacity, y: 0 }}
          animate={{
            opacity: [p.opacity, 0.6, p.opacity],
            y: [0, -50, 0], // Floating upwards like dust/sawdust
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF9]">
      
      <DustMotes />

      {/* Blob 1: Soft Beige/Wood */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[90vw] h-[90vw] bg-[#F5F5DC] rounded-full mix-blend-multiply filter blur-[60px] opacity-60 will-change-transform"
        animate={{
          x: [0, 50, -25, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 2: Warm Tan */}
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[100vw] h-[80vw] bg-[#D7CCC8] rounded-full mix-blend-multiply filter blur-[60px] opacity-50 will-change-transform"
        animate={{
          x: [0, -50, 25, 0],
          y: [0, 50, -25, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 3: Light Oak */}
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#E0E0E0] rounded-full mix-blend-multiply filter blur-[60px] opacity-40 will-change-transform"
        animate={{
          x: [0, 75, -75, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Static Grain Overlay - Simulating Wood Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};

export default FluidBackground;