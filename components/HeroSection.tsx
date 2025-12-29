
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollParallax } from '../hooks/useScrollParallax';
import { Award, GraduationCap, Code2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const portraitRef = useScrollParallax(-0.05);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                // Avoid division by zero
                const h = totalHeight || 1; 
                const progress = window.scrollY / h;
                
                if (circleRef.current) {
                     // 283 is the strokeDasharray value
                     const offset = 283 - (progress * 283 * 2);
                     circleRef.current.style.strokeDashoffset = String(offset);
                }
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const creds = t('hero.credentials');

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-bg pt-20 pb-20 lg:pb-48">
      
      {/* Background Zen Enso (Subtle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-[85vw] h-[85vw] transform rotate-[-90deg]">
          <circle 
            ref={circleRef}
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.08"
            strokeDasharray="283"
            strokeDashoffset="283"
            className="transition-all duration-75 ease-out"
          />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 h-full flex flex-col justify-center flex-grow">
        {/* Adjusted Grid: Reduced gap to bring text and image closer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
          
          {/* Left: Identity & Credentials Block */}
          <div className="lg:col-span-6 flex flex-col order-2 lg:order-1 z-20">
            <div className="overflow-hidden mb-6">
              <div className="flex items-center gap-3 animate-reveal-right">
                <span className="w-8 h-px bg-seal"></span>
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-seal">
                  {t('hero.role')}
                </span>
              </div>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-ink mb-8 tracking-tight mix-blend-darken">
              <div className="">
                <span className="block animate-reveal-up" style={{ animationDelay: '0.2s' }}>
                  {t('hero.name_first')}
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="block animate-reveal-up italic text-sub/80" style={{ animationDelay: '0.3s' }}>
                  {t('hero.name_last')}
                </span>
              </div>
            </h1>

            <div className="max-w-md animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p 
                className="font-sans font-light text-lg text-sub leading-relaxed mb-10 pl-1"
                dangerouslySetInnerHTML={{ __html: t('hero.value_prop') }}
              />
              
              {/* Credentials - Integrated directly here instead of bottom bar */}
              <div className="flex flex-col gap-5 border-l border-line pl-6 py-2">
                 
                 {/* Academic */}
                 <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-line/30 flex items-center justify-center text-seal group-hover:bg-seal group-hover:text-white transition-all duration-300 shrink-0">
                        <GraduationCap size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-serif text-lg text-ink leading-none mb-1 group-hover:translate-x-1 transition-transform">{creds.academic.value}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-sub/60">{creds.academic.sub}</div>
                    </div>
                 </div>

                 {/* Awards */}
                 <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-line/30 flex items-center justify-center text-seal group-hover:bg-seal group-hover:text-white transition-all duration-300 shrink-0">
                        <Award size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-serif text-lg text-ink leading-none mb-1 group-hover:translate-x-1 transition-transform">{creds.award.value}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-sub/60">{creds.award.sub}</div>
                    </div>
                 </div>

                 {/* Experience */}
                 <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-line/30 flex items-center justify-center text-seal group-hover:bg-seal group-hover:text-white transition-all duration-300 shrink-0">
                        <Code2 size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                        <div className="font-serif text-lg text-ink leading-none mb-1 group-hover:translate-x-1 transition-transform">{creds.exp.value}</div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-sub/60">{creds.exp.sub}</div>
                    </div>
                 </div>

              </div>
            </div>
          </div>

          {/* Right: The Artistic Portrait */}
          {/* Negative margin on LG screens pulls the image closer to the text */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-start lg:-ml-12 relative z-10">
            <div className="relative w-full max-w-[400px] lg:max-w-[500px] aspect-[4/5]" ref={portraitRef}>
              
              {/* Portrait Container - Frameless/Organic look for "drawing on canvas" feel */}
              <div className="relative w-full h-full">
                 {/* The Ink Portrait Component */}
                  <img src="https://res.cloudinary.com/dcpzacz9d/image/upload/c_crop,w_1050,h_1300/v1766891265/%E6%9C%AA%E5%91%BD%E5%90%8D%E7%9A%84%E4%BD%9C%E5%93%81-1_2_uqfdws.webp" />
              </div>
              
            
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in z-20" style={{ animationDelay: '1s' }}>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-sub/40">{t('hero.scroll')}</span>
        <div className="w-px h-12 bg-line relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-seal animate-scroll-hint"></div>
        </div>
      </div>

      {/* Organic/Irregular Divider to Next Section */}
      <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none z-20">
        <svg 
            className="relative block w-full h-[50px] lg:h-[80px]" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
        >
            {/* The white shape is the "About" section rising up irregularly */}
            <path 
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V56.44C47.28,68,98.66,73.58,153.29,66.52,207.24,59.55,263.85,67.15,321.39,56.44Z" 
                className="fill-white" 
            />
            {/* Optional: Add a faint stroke to emphasize the drawing style */}
            <path 
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3" 
                fill="none" 
                stroke="#E5E5E0" 
                strokeWidth="1"
                className="opacity-50"
            />
        </svg>
      </div>
    </section>
  );
};