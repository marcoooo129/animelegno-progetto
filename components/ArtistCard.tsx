
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
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
    <button
      type="button"
      className="group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-xl bg-white text-left shadow-md transition-shadow duration-200 md:hover:shadow-xl"
      data-hover="true"
      onClick={onClick}
      aria-label={`View details for ${displayName}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <img
          src={product.image} 
          alt={displayName} 
          className="h-full w-full object-cover transition-transform duration-200 md:group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        
        <div
          className="absolute inset-0 hidden items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        >
           <div className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[#3E2723] shadow-lg">
             <span className="uppercase tracking-widest text-xs font-bold">View Details</span>
             <Search className="w-4 h-4" />
           </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none rounded-b-xl"
      >
        <h3 className="text-white font-heading text-xl font-bold uppercase tracking-wider drop-shadow-md">
          {displayName}
        </h3>
        <p className="text-[#F5F5DC] text-xs uppercase tracking-widest mt-1 opacity-90">
          {displayCategory}
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
