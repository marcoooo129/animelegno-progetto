
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface Product {
  id: string;
  sku?: string;          // Stock Keeping Unit
  
  // English
  name: string;
  category: string;      // Anime Name (EN)
  description: string;
  
  // Italian
  name_it?: string;
  category_it?: string;  // Anime Name (IT)
  description_it?: string;

  image: string;
  dimensions: string;
  price: string;
  inStock: boolean;
  
  // Soft Delete flag
  isHidden?: boolean;
}

export interface GalleryItem {
  id: string;
  image_url: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  PORTFOLIO = 'portfolio',
  PROCESS = 'process',
  CONTACT = 'contact',
}
