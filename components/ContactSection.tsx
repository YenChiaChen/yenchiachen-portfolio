
import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ContactSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("charlisyenchiachen@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const locations = t('contact.locations');

  return (
    <section id="contact" className="py-32 bg-surface border-t border-line">
      <div className="container mx-auto px-6 md:px-12 text-center">
        
        <div ref={ref} className={`transition-all duration-1000 relative ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-ink mx-auto mb-8"></div>
            
            <h2 
              className="font-serif text-5xl md:text-7xl text-ink mb-8"
              dangerouslySetInnerHTML={{ __html: t('contact.title') }}
            />
            
            <p className="font-sans font-light text-sub text-lg max-w-lg mx-auto mb-12 leading-relaxed">
                {t('contact.desc')}
            </p>

            {/* Interactive Email Button */}
            <div className="inline-flex flex-col gap-4 items-center">
                <a 
                    href="mailto:charlisyenchiachen@gmail.com" 
                    className="inline-flex items-center gap-4 px-12 py-5 border border-ink text-ink font-serif italic text-xl hover:bg-ink hover:text-bg transition-all duration-500 shadow-[4px_4px_0px_rgba(44,44,44,0.1)] hover:shadow-[0px_0px_0px_rgba(44,44,44,0)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                    Say Hello <ArrowRight strokeWidth={1} />
                </a>
                
                <button 
                    onClick={copyEmail}
                    className="text-xs font-mono text-sub uppercase tracking-widest hover:text-seal transition-colors flex items-center gap-2"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? t('contact.copied') : t('contact.copy')}
                </button>
            </div>

            <div className="mt-24 flex justify-center gap-12 font-mono text-xs tracking-widest uppercase text-sub/50">
                {locations.map((loc: string) => (
                    <span key={loc} className="hover:text-ink cursor-pointer transition-colors">{loc}</span>
                ))}
            </div>

            {/* Final Minimalist Touch - A single Red Drop (The period of the page) */}
            <div className={`absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 transition-all duration-700 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-line"></div>
                    <div className="w-4 h-4 rounded-full bg-seal shadow-md animate-pulse"></div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};
