
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { Search } from 'lucide-react';

interface ProductCardProps {
  artist: Product; // Keeping prop name 'artist' for minimal interface change in App.tsx usage
  onClick: () => void;
  lang: 'en' | 'it';
}

const ProductCard: React.FC<ProductCardProps> = ({ artist: product, onClick, lang }) => {
  const displayName = lang === 'it' ? (product.name_it || product.name) : product.name;
  const displayCategory = lang === 'it' ? (product.category_it || product.category) : product.category;

  return (
    <motion.div
      className="group relative h-[400px] w-full overflow-hidden bg-white cursor-pointer rounded-xl shadow-md md:hover:shadow-2xl transition-all duration-500"
      initial="rest"
      whileHover="hover"
      whileTap="hover"
      animate="rest"
      data-hover="true"
      onClick={onClick}
    >
      {/* Image Background with Zoom and Filter */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        {/* Only animate scale/filter on desktop (hover) to prevent lag on mobile scroll */}
        <motion.img 
          src={product.image} 
          alt={displayName} 
          className="h-full w-full object-cover"
          variants={{
            rest: { scale: 1, filter: "brightness(1)" },
            hover: { 
              scale: 1.1, 
              filter: "brightness(0.9)",
              transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
            }
          }}
        />
        
        {/* Overlay on Hover (Desktop only) */}
        <motion.div 
          className="hidden md:flex absolute inset-0 bg-black/20 items-center justify-center backdrop-blur-[2px]"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.3 }}
        >
           <motion.div 
             className="bg-white/95 text-[#3E2723] px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2"
             variants={{
               rest: { y: 20, opacity: 0 },
               hover: { y: 0, opacity: 1 }
             }}
             transition={{ duration: 0.3, delay: 0.1 }}
           >
             <span className="uppercase tracking-widest text-xs font-bold">View Details</span>
             <Search className="w-4 h-4" />
           </motion.div>
        </motion.div>
      </div>

      {/* Info Label - Always visible at bottom, shifts slightly on hover */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none rounded-b-xl"
        variants={{
          rest: { y: 0 },
          hover: { y: -4 }
        }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-white font-heading text-xl font-bold uppercase tracking-wider drop-shadow-md">
          {displayName}
        </h3>
        <p className="text-[#F5F5DC] text-xs uppercase tracking-widest mt-1 opacity-90">
          {displayCategory}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
