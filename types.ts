
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  dimensions: string;
  price: string;
  description: string;
  inStock: boolean;
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
