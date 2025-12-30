
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.projects'), href: '#projects' },
    { label: t('nav.blog'), href: '#blog' },
    { label: t('nav.awards'), href: '#awards' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
          isScrolled ? 'bg-bg/80 backdrop-blur-xl py-4 border-b border-line' : 'bg-transparent py-10 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          
          <a href="#hero" className="flex items-center gap-4 group">
             <div className="relative w-10 h-10 border border-ink flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:bg-seal group-hover:border-seal">
                <span className="font-serif text-xl text-ink group-hover:text-white transition-colors">陳</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
             </div>
             <div className="flex flex-col">
                <span className="font-serif text-sm tracking-widest text-ink">Yen-Chia Chen.</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-sub opacity-50">Precision Engineering</span>
             </div>
          </a>

          <div className="hidden md:flex items-center gap-12">
             {navItems.map((item) => {
               if (item.href === '#projects') {
                 return (
                   <a 
                     key={item.label}
                     href={item.href}
                     className="relative group px-6 py-2 transition-transform duration-300 hover:-translate-y-1"
                   >
                     <div className="absolute inset-0 bg-seal shadow-lg shadow-seal/30 transition-all duration-300 group-hover:shadow-seal/50
                                     rounded-tl-[20px] rounded-tr-[5px] rounded-br-[15px] rounded-bl-[25px] 
                                     transform -rotate-2 group-hover:rotate-1 group-hover:scale-105">
                     </div>
                     
                     <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-white font-semibold">
                         {item.label}
                     </span>
                   </a>
                 );
               }
               
               return (
                 <a 
                   key={item.label} 
                   href={item.href}
                   className="font-mono text-[10px] uppercase tracking-[0.4em] text-sub hover:text-seal transition-all duration-300 relative group"
                 >
                   {item.label}
                   <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-seal transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                 </a>
               );
             })}
             
             <button 
                onClick={() => setLanguage(language === 'zh-TW' ? 'en' : 'zh-TW')}
                className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-[10px] font-mono hover:bg-bg transition-colors"
             >
                {language === 'zh-TW' ? 'EN' : '繁'}
             </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} strokeWidth={1} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-bg z-[200] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <button className="absolute top-10 right-10" onClick={() => setIsMenuOpen(false)}>
            <X size={32} strokeWidth={1} />
          </button>
          <div className="flex flex-col items-center gap-10">
             {navItems.map((item) => (
               <a 
                 key={item.label} 
                 href={item.href}
                 onClick={() => setIsMenuOpen(false)}
                 className={`font-serif text-5xl transition-colors ${item.href === '#projects' ? 'text-seal font-bold' : 'text-ink hover:text-seal'}`}
               >
                 {item.label}
               </a>
             ))}
          </div>
      </div>
    </>
  );
};
