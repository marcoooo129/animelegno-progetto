
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Instagram, Mail, MessageCircle, Menu, X, ChevronLeft, ChevronRight, PenTool, Gem, Hammer, Lock, ShieldCheck, Globe } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import CustomCursor from './components/CustomCursor';
import ProductCard from './components/ArtistCard';
import AIChat from './components/AIChat';
import AdminDashboard from './components/AdminDashboard';
import { Product } from './types';
import { ProductService } from './services/productService';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    nav: { portfolio: 'Portfolio', custom: 'Custom', contact: 'Contact', request: 'Request Custom', admin: 'Admin Login' },
    hero: {
      location: 'Handcrafted in Florence',
      badge: 'Anime Art',
      subtitle: 'Where Wood Meets Animation',
      desc: 'Bespoke wood carvings of your favorite characters, brought to life with Italian craftsmanship.',
      cta: 'Explore Collection'
    },
    portfolio: {
      title: 'Our',
      titleHighlight: 'Masterpieces',
      desc: 'Each piece is individually carved, sanded, and treated to create a timeless tribute to the stories you love.'
    },
    custom: {
      title: 'Commission Your',
      titleHighlight: 'DREAM PIECE',
      steps: [
        { title: '1. Chat', desc: 'Tell us your character and vision.' },
        { title: '2. Design', desc: 'We sketch a draft for your approval.' },
        { title: '3. Deposit', desc: 'Secure your slot to start production.' },
        { title: '4. Create', desc: 'We carve, finish, and ship to you.' }
      ],
      note: {
        title: 'Note on Custom Orders',
        desc: 'Custom designs require a +€5.00 design fee added to the base price of the carving size.'
      }
    },
    contact: {
      title: 'GET IN TOUCH',
      subtitle: 'Ready to start your commission? Contact us directly.'
    },
    footer: {
      rights: 'AnimeLegno Studio. Florence, Italy.',
      madeIn: 'Handmade with ❤️ in Firenze',
      staff: 'Staff Login'
    },
    modal: {
      dimensions: 'Dimensions',
      inquire: 'Inquire on WhatsApp'
    }
  },
  it: {
    nav: { portfolio: 'Portfolio', custom: 'Personalizza', contact: 'Contatti', request: 'Richiedi Custom', admin: 'Login Staff' },
    hero: {
      location: 'Fatto a mano a Firenze',
      badge: 'Arte Anime',
      subtitle: 'Dove il Legno Incontra l\'Animazione',
      desc: 'Intagli in legno su misura dei tuoi personaggi preferiti, portati in vita dall\'artigianato italiano.',
      cta: 'Esplora Collezione'
    },
    portfolio: {
      title: 'I Nostri',
      titleHighlight: 'Capolavori',
      desc: 'Ogni pezzo è intagliato, levigato e trattato singolarmente per creare un tributo senza tempo alle storie che ami.'
    },
    custom: {
      title: 'Commissiona il Tuo',
      titleHighlight: 'PEZZO DA SOGNO',
      steps: [
        { title: '1. Chat', desc: 'Raccontaci il personaggio e la tua visione.' },
        { title: '2. Design', desc: 'Disegniamo una bozza per la tua approvazione.' },
        { title: '3. Acconto', desc: 'Assicura il tuo posto per iniziare la produzione.' },
        { title: '4. Creazione', desc: 'Intagliamo, rifiniamo e spediamo a te.' }
      ],
      note: {
        title: 'Nota sugli Ordini Personalizzati',
        desc: 'I design personalizzati richiedono un supplemento di €5,00 aggiunto al prezzo base.'
      }
    },
    contact: {
      title: 'CONTATTACI',
      subtitle: 'Pronto per iniziare la tua commissione? Contattaci direttamente.'
    },
    footer: {
      rights: 'AnimeLegno Studio. Firenze, Italia.',
      madeIn: 'Fatto a mano con ❤️ a Firenze',
      staff: 'Accesso Staff'
    },
    modal: {
      dimensions: 'Dimensioni',
      inquire: 'Richiedi su WhatsApp'
    }
  }
};

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [portfolio, setPortfolio] = useState<Product[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to reload data
  
  // Language State
  const [lang, setLang] = useState<'en' | 'it'>('en');
  const t = TRANSLATIONS[lang];

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
  
  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'it' : 'en');
  };

  // Reusable Language Toggle Component
  const LanguageToggle = () => (
    <div 
      onClick={toggleLanguage}
      className="relative flex items-center bg-[#E7E5E4]/50 backdrop-blur-sm border border-[#D7CCC8] rounded-full p-1 cursor-pointer w-[4.5rem] h-8 shadow-inner hover:bg-[#D7CCC8]/50 transition-colors"
      role="button"
      aria-label="Switch Language"
    >
      {/* Sliding Background */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-[#3E2723] shadow-md"
        initial={false}
        animate={{
          x: lang === 'en' ? 0 : '100%',
          width: '50%' // occupy half the width roughly minus padding
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      
      {/* Labels */}
      <div className={`flex-1 text-center text-[10px] font-bold z-10 transition-colors duration-300 select-none ${lang === 'en' ? 'text-[#F5F5DC]' : 'text-[#5D4037]'}`}>
        EN
      </div>
      <div className={`flex-1 text-center text-[10px] font-bold z-10 transition-colors duration-300 select-none ${lang === 'it' ? 'text-[#F5F5DC]' : 'text-[#5D4037]'}`}>
        IT
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen text-[#44403C] selection:bg-[#D7CCC8] selection:text-[#3E2723] cursor-auto md:cursor-none overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat lang={lang} />

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
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 md:py-6 bg-[#FAFAF9]/95 md:bg-[#FAFAF9]/90 md:backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="font-heading text-lg md:text-2xl font-bold tracking-tight text-[#3E2723] cursor-default z-50 flex items-center gap-2">
          AnimeLegno Studio
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-10 text-sm font-medium tracking-wide uppercase text-[#5D4037]">
            {['Portfolio', 'Custom', 'Contact'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())}
                className="hover:text-[#8D6E63] transition-colors cursor-pointer bg-transparent border-none"
                data-hover="true"
              >
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => scrollToSection('custom')}
            className="hidden md:inline-block border border-[#5D4037] px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#5D4037] hover:text-white transition-all duration-300 text-[#5D4037] rounded-full cursor-pointer bg-transparent"
            data-hover="true"
          >
            {t.nav.request}
          </button>
          
          {/* Language Switcher Desktop (High End) */}
          <div data-hover="true">
             <LanguageToggle />
          </div>
        </div>

        {/* Mobile Controls (Menu + Lang) */}
        <div className="md:hidden flex items-center gap-3 z-50">
          <LanguageToggle />
          
          <button 
            className="text-[#3E2723] relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
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
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
              </button>
            ))}
            
            <div className="w-16 h-px bg-[#D7CCC8] my-4"></div>
            
            <button 
              onClick={() => { setMobileMenuOpen(false); setShowAdmin(true); }}
              className="flex items-center gap-2 text-sm font-bold text-[#8D6E63] uppercase tracking-widest bg-white/50 px-6 py-3 rounded-full border border-[#D7CCC8]"
            >
              <Lock className="w-4 h-4" /> {t.nav.admin}
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
            <span>{t.hero.location}</span>
            <span className="w-1.5 h-1.5 bg-[#8D6E63] rounded-full"/>
            <span>{t.hero.badge}</span>
          </motion.div>

          {/* Main Title */}
          <div className="relative w-full flex justify-center items-center flex-col pb-4">
            <h1 className="text-[13vw] md:text-[8vw] leading-[1.2] font-bold tracking-tight text-center text-[#3E2723] p-2">
              <GradientText text="AnimeLegno" />
            </h1>
            <p className="text-lg md:text-3xl font-serif italic text-[#5D4037] mt-1 md:mt-4">
              {t.hero.subtitle}
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
            {t.hero.desc}
          </motion.p>

          <motion.button
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             onClick={() => scrollToSection('portfolio')}
             className="mt-8 md:mt-10 px-8 py-3 bg-[#3E2723] text-white rounded-full font-medium tracking-wide hover:bg-[#5D4037] transition-colors shadow-lg shadow-[#3E2723]/20"
             data-hover="true"
          >
            {t.hero.cta}
          </motion.button>
        </motion.div>
      </header>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="relative z-10 py-12 md:py-32">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center mb-10 md:mb-16 px-4 text-center">
             <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723] mb-4">
              {t.portfolio.title} <span className="text-[#8D6E63]">{t.portfolio.titleHighlight}</span>
            </h2>
            <p className="text-[#5D4037] max-w-2xl text-sm md:text-base">
              {t.portfolio.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {portfolio.filter(p => p.inStock).map((product) => (
              <ProductCard 
                key={product.id} 
                artist={product} 
                onClick={() => setSelectedProduct(product)} 
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOM SERVICE SECTION */}
      <section id="custom" className="relative z-10 py-12 md:py-32 bg-[#EFEBE9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723] mb-6">
              {t.custom.title} <br/> <GradientText text={t.custom.titleHighlight} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: MessageCircle, ...t.custom.steps[0] },
              { icon: PenTool, ...t.custom.steps[1] },
              { icon: Gem, ...t.custom.steps[2] },
              { icon: Hammer, ...t.custom.steps[3] },
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
               ✨ <span className="font-bold underline">{t.custom.note.title}</span> ✨
             </p>
             <p className="mt-2 text-white/90 text-sm md:text-base">
               {t.custom.note.desc}
             </p>
          </div>
        </div>
      </section>

      {/* CONTACT / FOOTER SECTION */}
      <section id="contact" className="relative z-10 py-12 md:py-32 px-4 md:px-6 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
             <h2 className="text-3xl md:text-6xl font-heading font-bold text-[#3E2723]">
               {t.contact.title}
             </h2>
             <p className="text-[#8D6E63] font-medium mt-4">
               {t.contact.subtitle}
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
            <span className="text-[#8D6E63] text-xs">{t.footer.madeIn}</span>
            
            {/* Admin Entry Point */}
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-1.5 text-[#5D4037] hover:text-[#3E2723] bg-white/50 px-3 py-1.5 rounded-full border border-[#D7CCC8] transition-all hover:bg-white"
              title="Staff Access (Ctrl + Shift + L)"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.footer.staff}</span>
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
            // PERFORMANCE: Remove backdrop-blur-sm on mobile to prevent lag. Only background color.
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 bg-[#3E2723]/90 md:bg-[#3E2723]/60 md:backdrop-blur-sm cursor-auto"
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
                    alt={lang === 'it' ? selectedProduct.name_it : selectedProduct.name} 
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
                        {lang === 'it' ? (selectedProduct.category_it || selectedProduct.category) : selectedProduct.category}
                     </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#3E2723] leading-none mb-2">
                    {lang === 'it' ? (selectedProduct.name_it || selectedProduct.name) : selectedProduct.name}
                  </h3>
                  
                  <p className="text-2xl text-[#5D4037] font-medium mb-6">
                    {selectedProduct.price}
                  </p>
                  
                  <div className="h-px w-full bg-[#E7E5E4] mb-6" />
                  
                  <div className="mb-6">
                    <p className="text-xs text-[#8D6E63] uppercase tracking-widest mb-1">{t.modal.dimensions}</p>
                    <p className="text-[#3E2723] font-medium">{selectedProduct.dimensions}</p>
                  </div>

                  <p className="text-[#5D4037] leading-relaxed text-base font-light mb-8">
                    {lang === 'it' ? (selectedProduct.description_it || selectedProduct.description) : selectedProduct.description}
                  </p>

                  <a 
                    href={`https://wa.me/390000000000?text=Hi, I am interested in the ${selectedProduct.name} carving.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-colors w-full md:w-auto shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t.modal.inquire}
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
