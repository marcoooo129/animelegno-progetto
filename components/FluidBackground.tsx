
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

const WoodGrainLines = () => {
  // Abstract curves representing wood grain or chisel flows
  return (
    <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blurLine" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      
      {/* Curve 1: Large sweeping flow */}
      <motion.path
        fill="none"
        stroke="#8D6E63"
        strokeWidth="1.5"
        initial={{ d: "M-100,200 Q400,0 800,400 T1800,200" }}
        animate={{
          d: [
            "M-100,200 Q400,0 800,400 T1800,200",
            "M-100,250 Q400,50 800,450 T1800,250",
            "M-100,200 Q400,0 800,400 T1800,200"
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Curve 2: Tighter grain */}
      <motion.path
        fill="none"
        stroke="#A1887F"
        strokeWidth="1"
        initial={{ d: "M-100,600 Q500,400 1000,800 T2000,500" }}
        animate={{
          d: [
            "M-100,600 Q500,400 1000,800 T2000,500",
            "M-100,550 Q500,350 1000,750 T2000,450",
            "M-100,600 Q500,400 1000,800 T2000,500"
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      
       {/* Curve 3: Vertical accent */}
       <motion.path
        fill="none"
        stroke="#D7CCC8"
        strokeWidth="2"
        initial={{ d: "M200,-100 Q400,500 100,1200" }}
        animate={{
          d: [
            "M200,-100 Q400,500 100,1200",
            "M250,-100 Q450,500 150,1200",
            "M200,-100 Q400,500 100,1200"
          ]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
};

const SunBeams = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Warm Light Top Right */}
            <motion.div 
                className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-b from-[#F5F5DC] to-transparent opacity-60 blur-[100px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Shadow/Depth Bottom Left */}
            <motion.div 
                className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-t from-[#D7CCC8]/30 to-transparent opacity-40 blur-[80px]"
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    )
}

const FluidBackground: React.FC = () => {
  // A subtle paper-like grain texture
  const grainSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E`;

  return (
    <div className="fixed inset-0 z-0 bg-[#FAFAF9] pointer-events-none">
      
      {/* 1. Atmospheric Lighting (Sunbeams) */}
      <SunBeams />

      {/* 2. Architectural / Organic Lines */}
      <WoodGrainLines />

      {/* 3. Texture Overlay (Paper/Wood Texture) */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.15] mix-blend-multiply"
        style={{ backgroundImage: `url("${grainSvg}")` }}
      />
      
      {/* 4. Vignette for focus */}
      <div className="absolute inset-0 z-[2] bg-radial-gradient from-transparent to-[#FAFAF9]/80 pointer-events-none" />
    </div>
  );
};

export default FluidBackground;
