
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({ text, as: Component = 'span', className = '' }) => {
  return (
    <Component className={`relative inline-block font-bold tracking-tight isolate ${className}`}>
      {/* Main Gradient Text - Wood & Gold Tones */}
      <motion.span
        className="absolute inset-0 z-10 block bg-clip-text text-transparent will-change-[background-position] pb-[0.2em]"
        style={{
            backgroundImage: 'linear-gradient(to right, #3E2723 0%, #8D6E63 25%, #F5F5DC 50%, #8D6E63 75%, #3E2723 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
        }}
        animate={{
          backgroundPosition: ['0% center', '-200% center'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
      
      {/* Base layer - ensures visibility if gradient fails or for antialiasing */}
      <span 
        className="block text-[#8D6E63] opacity-30 pb-[0.2em]"
      >
        {text}
      </span>
    </Component>
  );
};

export default GradientText;
