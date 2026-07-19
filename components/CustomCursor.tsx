/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE_SELECTOR = '[data-hover="true"], a, button';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);
  const x = useSpring(mouseX, { damping: 28, stiffness: 360, mass: 0.2 });
  const y = useSpring(mouseY, { damping: 28, stiffness: 360, mass: 0.2 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const updatePosition = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    const updateHoverState = (target: EventTarget | null) => {
      setIsHovering(target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR)));
    };

    const handlePointerOver = (event: PointerEvent) => updateHoverState(event.target);
    const handlePointerOut = (event: PointerEvent) => updateHoverState(event.relatedTarget);

    window.addEventListener('pointermove', updatePosition, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerout', handlePointerOut, { passive: true });

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[120] hidden items-center justify-center md:flex"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        mixBlendMode: 'difference',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="flex size-10 items-center justify-center rounded-full bg-white"
        animate={{ scale: isHovering ? 3 : 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <motion.span
          className="text-xs font-bold uppercase text-black"
          animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 0.34 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          VIEW
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
