
import React from 'react';
import { useInView } from '../hooks/useInView';
import { useLanguage } from '../contexts/LanguageContext';
import { Cpu, Target, History, Sparkles, MoveDown, Terminal, Trophy, Cat } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const pillars = t('about.pillars');

  return (
    <section id="about" className="py-24 md:py-48 bg-white relative overflow-hidden">

      <div className="container mx-auto px-6 md:px-12">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Portrait Column: Fixed RWD height and scale */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start lg:sticky lg:top-32">
            <div className={`relative w-full max-w-[320px] lg:max-w-none transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="aspect-[4/5] bg-bg overflow-hidden relative border border-line p-2 shadow-sm group">
                <div 
                  className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"
                  style={{ backgroundImage: 'url("https://res.cloudinary.com/dcpzacz9d/image/upload/v1755222149/head_cqdr8x.webp")' }}
                ></div>
              </div>
              
              <div className="mt-8 hidden lg:flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-seal"></div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-sub">{t('about.philosophy_label')}</span>
                </div>
                <div className="font-serif italic text-sub text-lg leading-relaxed">
                  {t('about.philosophy_quote')}
                </div>
              </div>
            </div>
          </div>

          {/* Content Column: Clear hierarchy */}
          <div className="lg:col-span-8">
            <div className={`space-y-16 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              
              <div className="max-w-3xl">
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-seal block mb-6">{t('about.badge')}</span>
                <h2 
                  className="font-serif text-4xl md:text-6xl text-ink leading-tight mb-8"
                  dangerouslySetInnerHTML={{ __html: t('about.title') }}
                />
                <p 
                  className="font-sans font-light text-lg md:text-xl text-sub leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t('about.intro') }}
                />
              </div>

              {/* Info Grid: Modular clarity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-seal">
                    <Cpu size={18} strokeWidth={1.5} />
                    <h4 className="font-mono text-[9px] uppercase tracking-widest uppercase">Foundation</h4>
                  </div>
                  <h3 className="font-serif text-xl text-ink">{pillars.foundation.title}</h3>
                  <p 
                    className="font-sans font-light text-sm text-sub leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pillars.foundation.desc }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-seal">
                    <Terminal size={18} strokeWidth={1.5} />
                    <h4 className="font-mono text-[9px] uppercase tracking-widest uppercase">Experience</h4>
                  </div>
                  <h3 className="font-serif text-xl text-ink">{pillars.discipline.title}</h3>
                  <p 
                    className="font-sans font-light text-sm text-sub leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pillars.discipline.desc }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-seal">
                    <Trophy size={18} strokeWidth={1.5} />
                    <h4 className="font-mono text-[9px] uppercase tracking-widest uppercase">Legacy</h4>
                  </div>
                  <h3 className="font-serif text-xl text-ink">{pillars.impact.title}</h3>
                  <p 
                    className="font-sans font-light text-sm text-sub leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pillars.impact.desc }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-seal">
                    <Cat size={18} strokeWidth={1.5} />
                    <h4 className="font-mono text-[9px] uppercase tracking-widest uppercase">Philosophy</h4>
                  </div>
                  <h3 className="font-serif text-xl text-ink">{pillars.vision.title}</h3>
                  <p 
                    className="font-sans font-light text-sm text-sub leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pillars.vision.desc }}
                  />
                </div>

              </div>

              {/* Action Call */}
              {/* <div className="pt-12 border-t border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <a href="#projects" className="group flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full border border-ink flex items-center justify-center group-hover:bg-ink group-hover:text-bg transition-all duration-500">
                    <MoveDown size={20} strokeWidth={1} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-xl text-ink group-hover:text-seal transition-colors">{t('about.action')}</span>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-sub">{t('about.archives')}</span>
                  </div>
                </a>
                
                <div className="font-mono text-[10px] text-sub uppercase tracking-[0.2em] opacity-40">
                  {t('about.status')}
                </div>
              </div> */}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
