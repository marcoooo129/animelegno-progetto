
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../types';

interface AIChatProps {
  lang: 'en' | 'it';
}

const AIChat: React.FC<AIChatProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Set initial welcome message based on language
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = lang === 'it' 
        ? "Ciao! 👋 Sono l'assistente dello studio. Chiedimi qualsiasi cosa sui nostri intagli o sugli ordini personalizzati!"
        : "Ciao! 👋 I am your studio assistant. Ask me anything about our wood carvings or custom orders!";
      setMessages([{ role: 'model', text: welcomeText }]);
    }
  }, [lang]); // Only run if lang changes and history is empty, or better yet, don't clear history just append if needed.
  // Actually, keeping history is better. If lang changes, user might switch lang mid chat. 

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Slight delay to allow state update to render before scrolling
    setTimeout(scrollToBottom, 100);

    try {
      const { sendMessageToGemini } = await import('../services/geminiService');
      const responseText = await sendMessageToGemini(userMessage.text);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error('Unable to load the AI assistant:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: lang === 'it'
          ? 'Il servizio AI non è disponibile in questo momento.'
          : 'The AI service is unavailable right now.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[90vw] overflow-hidden rounded-2xl border border-[#5D4037]/50 bg-[#2D1B15] shadow-2xl shadow-black/40 md:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#8D6E63]/30 bg-[#3E2723] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-heading font-bold text-[#F5F5DC] tracking-wider">AnimeLegno AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#F5F5DC]/50 hover:text-[#F5F5DC]" data-hover="true" aria-label="Close assistant">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-64 md:h-80 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#8D6E63] text-white rounded-tr-none'
                        : 'bg-white/10 text-[#EFEBE9] rounded-tl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-lg rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#8D6E63]/30 bg-[#1a0f0a]/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={lang === 'it' ? "Chiedi sui ordini personalizzati..." : "Ask about custom orders..."}
                  className="flex-1 bg-transparent text-[#F5F5DC] placeholder-[#F5F5DC]/30 text-sm focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#8D6E63] p-2 rounded-lg hover:bg-[#6D4C41] transition-colors disabled:opacity-50"
                  data-hover="true"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group z-50 flex size-12 items-center justify-center rounded-full border border-[#D7CCC8]/20 bg-[#3E2723] shadow-lg shadow-black/30 transition-transform duration-150 hover:scale-105 active:scale-95 md:size-14"
        data-hover="true"
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6 text-[#F5F5DC]" />
        ) : (
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#F5F5DC]" />
        )}
      </button>
    </div>
  );
};

export default AIChat;
