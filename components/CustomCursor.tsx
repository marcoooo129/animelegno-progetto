
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 20, stiffness: 350, mass: 0.1 }; 
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      // Check for interactive elements
      const isClickable = !!(
        target.closest('[data-hover="true"]') || 
        target.closest('a') || 
        target.closest('button') ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON'
      );
      
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center hidden md:flex"
      style={{ 
        x, 
        y, 
        translateX: '-50%', 
        translateY: '-50%',
        mixBlendMode: 'difference' // The classic high-contrast effect
      }}
    >
      <motion.div
        className="flex items-center justify-center bg-white rounded-full"
        animate={{
          width: isHovering ? 80 : 12,
          height: isHovering ? 80 : 12,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.span 
          className="text-black font-bold uppercase tracking-widest text-[10px]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovering ? 1 : 0,
            scale: isHovering ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          VIEW
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
