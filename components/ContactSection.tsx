
import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { Copy, Check, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ContactSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const email = "charlisyenchiachen@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contact = t('contact');

  return (
    <section id="contact" className="py-32 bg-surface border-t border-line">
      <div className="container mx-auto px-6 md:px-12">
        
        <div ref={ref} className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                {/* Left: Modest Introduction */}
                <div>
                    <h2 className="font-serif text-3xl text-ink mb-6">
                        {contact.title}
                    </h2>
                    <p className="font-sans font-light text-sub text-sm leading-relaxed max-w-sm">
                        {contact.desc}
                    </p>
                </div>

                {/* Right: Functional Information */}
                <div className="flex flex-col gap-10">
                    
                    {/* Email Block */}
                    <div>
                        <span className="font-mono text-[10px] text-sub uppercase tracking-widest block mb-3 opacity-60">
                            {contact.email_label}
                        </span>
                        
                        <div className="group inline-flex items-center gap-4">
                            <a 
                                href={`mailto:${email}`} 
                                className="font-serif text-2xl md:text-3xl text-ink hover:text-seal transition-colors border-b border-transparent hover:border-seal/20 pb-1"
                            >
                                {email}
                            </a>
                            <button 
                                onClick={copyEmail}
                                className="p-2 rounded-full hover:bg-line/30 text-sub transition-colors relative"
                                aria-label="Copy email"
                            >
                                {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
                                {copied && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-ink text-white px-2 py-1 rounded-sm">
                                        {contact.copied}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div>
                        <span className="font-mono text-[10px] text-sub uppercase tracking-widest block mb-4 opacity-60">
                            {contact.social_label}
                        </span>
                        <div className="flex gap-8">
                            {contact.links && contact.links.map((link: { label: string, url: string }) => (
                                <a 
                                    key={link.label}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 font-sans text-sm text-ink hover:text-seal transition-colors group"
                                >
                                    {link.label}
                                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Subtle Footer Mark */}
            <div className="mt-24 pt-8 border-t border-line/50 flex justify-between items-end">
                <div className="font-mono text-[9px] text-sub uppercase tracking-widest opacity-40">
                    Taipei, Taiwan
                </div>
                {/* A small Hanko (Seal) as a signature */}
                <div className="w-8 h-8 border border-seal/30 rounded-sm flex items-center justify-center text-seal font-serif text-xs opacity-60">
                    陳
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};
