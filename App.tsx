
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Instagram, Mail, MessageCircle, Menu, X, ChevronLeft, ChevronRight, PenTool, Gem, Hammer, Lock, ShieldCheck } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import CustomCursor from './components/CustomCursor';
import ProductCard from './components/ArtistCard';
import AIChat from './components/AIChat';
import AdminDashboard from './components/AdminDashboard';
import { Product } from './types';
import { ProductService } from './services/productService';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [portfolio, setPortfolio] = useState<Product[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to reload data

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const data = await ProductService.getAll();
      setPortfolio(data);
    };
    loadData();
  }, [refreshTrigger]);

  // Handle keyboard navigation for modal and Admin Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Admin Shortcut: Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setShowAdmin(true);
      }

      if (!selectedProduct) return;
      if (e.key === 'ArrowLeft') navigateProduct('prev');
      if (e.key === 'ArrowRight') navigateProduct('next');
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, portfolio]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navigateProduct = (direction: 'next' | 'prev') => {
    if (!selectedProduct) return;
    const currentIndex = portfolio.findIndex(a => a.id === selectedProduct.id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % portfolio.length;
    } else {
      nextIndex = (currentIndex - 1 + portfolio.length) % portfolio.length;
    }
    setSelectedProduct(portfolio[nextIndex]);
  };
  
  return (
    <div className="relative min-h-screen text-[#44403C] selection:bg-[#D7CCC8] selection:text-[#3E2723] cursor-auto md:cursor-none overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat />

      {/* Admin Dashboard Overlay */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDashboard 
            onClose={() => setShowAdmin(false)} 
            onUpdate={() => setRefreshTrigger(prev => prev + 1)} 
          />
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 md:py-6 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="font-heading text-lg md:text-2xl font-bold tracking-tight text-[#3E2723] cursor-default z-50 flex items-center gap-2">
          AnimeLegno Studio
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 text-sm font-medium tracking-wide uppercase text-[#5D4037]">
          {['Portfolio', 'Custom', 'Contact'].map((item) => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="hover:text-[#8D6E63] transition-colors cursor-pointer bg-transparent border-none"
              data-hover="true"
            >
              {item}
            </button>
          ))}
        </div>
        <button 
          onClick={() => scrollToSection('custom')}
          className="hidden md:inline-block border border-[#5D4037] px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#5D4037] hover:text-white transition-all duration-300 text-[#5D4037] rounded-full cursor-pointer bg-transparent"
          data-hover="true"
        >
          Request Custom
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-[#3E2723] z-50 relative w-10 h-10 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#FAFAF9] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {['Portfolio', 'Custom', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-3xl font-heading font-bold text-[#3E2723] hover:text-[#8D6E63] transition-colors uppercase bg-transparent border-none"
              >
                {item}
              </button>
            ))}
            
            <div className="w-16 h-px bg-[#D7CCC8] my-4"></div>
            
            <button 
              onClick={() => { setMobileMenuOpen(false); setShowAdmin(true); }}
              className="flex items-center gap-2 text-sm font-bold text-[#8D6E63] uppercase tracking-widest bg-white/50 px-6 py-3 rounded-full border border-[#D7CCC8]"
            >
              <Lock className="w-4 h-4" /> Admin Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <header className="relative h-[100svh] min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div 
          style={{ y, opacity }}
          className="z-10 text-center flex flex-col items-center w-full max-w-6xl pb-16 md:pb-20"
        >
           {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-2 md:gap-4 text-[10px] md:text-sm font-medium text-[#5D4037] tracking-[0.2em] uppercase mb-4 md:mb-6 bg-white/50 px-4 py-2 md:px-6 md:py-2 rounded-full backdrop-blur-sm border border-[#D7CCC8]"
          >
            <span>Handcrafted in Florence</span>
            <span className="w-1.5 h-1.5 bg-[#8D6E63] rounded-full"/>
            <span>Anime Art</span>
          </motion.div>

          {/* Main Title */}
          <div className="relative w-full flex justify-center items-center flex-col pb-4">
            <h1 className="text-[13vw] md:text-[8vw] leading-[1.2] font-bold tracking-tight text-center text-[#3E2723] p-2">
              <GradientText text="AnimeLegno" />
            </h1>
            <p className="text-lg md:text-3xl font-serif italic text-[#5D4037] mt-1 md:mt-4">
              Where Wood Meets Animation
            </p>
          </div>
          
          <motion.div
             initial={{ scaleX: 0 }}
             animate={{ scaleX: 1 }}
             transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
             className="w-16 md:w-24 h-1 bg-[#8D6E63] mt-4 mb-6 md:mb-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-sm md:text-xl font-light max-w-xl mx-auto text-[#44403C] leading-relaxed px-4"
          >
            Bespoke wood carvings of your favorite characters, brought to life with Italian craftsmanship.
          </motion.p>

          <motion.button
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             onClick={() => scrollToSection('portfolio')}
             className="mt-8 md:mt-10 px-8 py-3 bg-[#3E2723] text-white rounded-full font-medium tracking-wide hover:bg-[#5D4037] transition-colors shadow-lg shadow-[#3E2723]/20"
             data-hover="true"
          >
            Explore Collection
          </motion.button>
        </motion.div>
      </header>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="relative z-10 py-16 md:py-32">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center mb-10 md:mb-16 px-4 text-center">
             <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723] mb-4">
              Our <span className="text-[#8D6E63]">Masterpieces</span>
            </h2>
            <p className="text-[#5D4037] max-w-2xl text-sm md:text-base">
              Each piece is individually carved, sanded, and treated to create a timeless tribute to the stories you love.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {portfolio.filter(p => p.inStock).map((product) => (
              <ProductCard key={product.id} artist={product} onClick={() => setSelectedProduct(product)} />
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOM SERVICE SECTION */}
      <section id="custom" className="relative z-10 py-16 md:py-32 bg-[#EFEBE9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723] mb-6">
              Commission Your <br/> <GradientText text="DREAM PIECE" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: MessageCircle, title: '1. Chat', desc: 'Tell us your character and vision.' },
              { icon: PenTool, title: '2. Design', desc: 'We sketch a draft for your approval.' },
              { icon: Gem, title: '3. Deposit', desc: 'Secure your slot to start production.' },
              { icon: Hammer, title: '4. Create', desc: 'We carve, finish, and ship to you.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-[#FAFAF9] p-6 md:p-8 rounded-2xl shadow-sm border border-[#D7CCC8] flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F5F5DC] rounded-full flex items-center justify-center md:mb-6 text-[#8D6E63] flex-shrink-0">
                  <step.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#3E2723] mb-1 md:mb-3">{step.title}</h3>
                  <p className="text-[#5D4037] text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 md:mt-16 bg-[#3E2723] text-[#F5F5DC] p-6 md:p-8 rounded-2xl max-w-3xl mx-auto text-center shadow-xl transform rotate-1">
             <p className="text-lg md:text-xl font-medium">
               ✨ <span className="font-bold underline">Note on Custom Orders</span> ✨
             </p>
             <p className="mt-2 text-white/90 text-sm md:text-base">
               Custom designs require a <span className="font-bold text-[#FFA000]">+€5.00 design fee</span> added to the base price of the carving size.
             </p>
          </div>
        </div>
      </section>

      {/* CONTACT / FOOTER SECTION */}
      <section id="contact" className="relative z-10 py-16 md:py-32 px-4 md:px-6 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
             <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723]">
               GET IN TOUCH
             </h2>
             <p className="text-[#8D6E63] font-medium mt-4">
               Ready to start your commission? Contact us directly.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <a 
              href="https://instagram.com/animelegno_firenze" // Placeholder link
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg border border-[#E7E5E4] flex flex-col items-center transition-all duration-300"
              data-hover="true"
            >
              <div className="bg-gradient-to-tr from-purple-500 to-orange-500 text-white p-3 md:p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="font-bold text-lg text-[#3E2723]">Instagram</h3>
              <p className="text-sm text-[#8D6E63] mt-2">@animelegno_firenze</p>
            </a>

            <a 
              href="https://wa.me/390000000000" // Placeholder link
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg border border-[#E7E5E4] flex flex-col items-center transition-all duration-300 transform md:-translate-y-4"
              data-hover="true"
            >
              <div className="bg-green-500 text-white p-3 md:p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="font-bold text-lg text-[#3E2723]">WhatsApp</h3>
              <p className="text-sm text-[#8D6E63] mt-2">Chat Directly</p>
            </a>

            <a 
              href="mailto:hello@animelegno.com" 
              className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg border border-[#E7E5E4] flex flex-col items-center transition-all duration-300"
              data-hover="true"
            >
              <div className="bg-[#3E2723] text-white p-3 md:p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="font-bold text-lg text-[#3E2723]">Email</h3>
              <p className="text-sm text-[#8D6E63] mt-2">hello@animelegno.com</p>
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#E7E5E4] py-8 md:py-12 bg-[#F5F5F4]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="text-center md:text-left">
             <div className="font-heading text-xl md:text-2xl font-bold tracking-tight text-[#3E2723]">AnimeLegno Studio</div>
             <div className="text-xs text-[#8D6E63] mt-2">
               © 2024 AnimeLegno Studio. Florence, Italy.
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <span className="text-[#8D6E63] text-xs">Handmade with ❤️ in Firenze</span>
            {/* Admin Entry Point */}
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-1.5 text-[#5D4037] hover:text-[#3E2723] bg-white/50 px-3 py-1.5 rounded-full border border-[#D7CCC8] transition-all hover:bg-white"
              title="Staff Access (Ctrl + Shift + L)"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Staff Login</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 bg-[#3E2723]/60 backdrop-blur-sm cursor-auto"
          >
            <motion.div
              initial={{ y: "100%", md: { scale: 0.9, y: 20 } } as any}
              animate={{ y: 0, md: { scale: 1, y: 0 } } as any}
              exit={{ y: "100%", md: { scale: 0.9, y: 20 } } as any}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full md:h-auto md:max-w-5xl bg-[#FAFAF9] md:rounded-2xl overflow-y-auto flex flex-col md:flex-row shadow-2xl shadow-black/20"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/60 backdrop-blur-md text-[#3E2723] hover:bg-[#3E2723] hover:text-white transition-colors shadow-sm md:bg-white/80 md:top-4 md:right-4"
                data-hover="true"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons (Updated: Centered on Image for Mobile) */}
              <button
                onClick={(e) => { e.stopPropagation(); navigateProduct('prev'); }}
                className="absolute left-2 top-[20vh] -translate-y-1/2 z-30 p-2 rounded-full bg-white/60 text-[#3E2723] backdrop-blur-md shadow-sm md:shadow-lg md:bg-white/90 md:left-4 md:top-1/2 md:translate-y-[-50%] md:bottom-auto md:p-3 hover:scale-110 transition-transform"
                data-hover="true"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateProduct('next'); }}
                className="absolute right-2 top-[20vh] -translate-y-1/2 z-30 p-2 rounded-full bg-white/60 text-[#3E2723] backdrop-blur-md shadow-sm md:shadow-lg md:bg-white/90 md:right-8 md:top-1/2 md:translate-y-[-50%] md:bottom-auto md:p-3 hover:scale-110 transition-transform"
                data-hover="true"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Side */}
              <div className="w-full h-[40vh] md:h-auto md:w-1/2 relative overflow-hidden bg-[#EFEBE9] flex-shrink-0">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={selectedProduct.id}
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                {/* Mobile gradient overlay for text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] via-transparent to-transparent md:hidden h-full"></div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2 p-6 pb-12 md:p-12 flex flex-col justify-center relative bg-[#FAFAF9]">
                <motion.div
                  key={selectedProduct.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 text-[#8D6E63] mb-4">
                     <span className="font-mono text-sm tracking-widest uppercase px-2 py-1 bg-[#EFEBE9] rounded-md">
                        {selectedProduct.category}
                     </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#3E2723] leading-none mb-2">
                    {selectedProduct.name}
                  </h3>
                  
                  <p className="text-2xl text-[#5D4037] font-medium mb-6">
                    {selectedProduct.price}
                  </p>
                  
                  <div className="h-px w-full bg-[#E7E5E4] mb-6" />
                  
                  <div className="mb-6">
                    <p className="text-xs text-[#8D6E63] uppercase tracking-widest mb-1">Dimensions</p>
                    <p className="text-[#3E2723] font-medium">{selectedProduct.dimensions}</p>
                  </div>

                  <p className="text-[#5D4037] leading-relaxed text-base font-light mb-8">
                    {selectedProduct.description}
                  </p>

                  <a 
                    href={`https://wa.me/390000000000?text=Hi, I am interested in the ${selectedProduct.name} carving.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-colors w-full md:w-auto shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Inquire on WhatsApp
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
