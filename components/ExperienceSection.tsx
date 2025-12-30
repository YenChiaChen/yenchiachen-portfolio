
import React from 'react';
import { useInView } from '../hooks/useInView';
import { useLanguage } from '../contexts/LanguageContext';

export const ExperienceSection: React.FC = () => {
  const { t } = useLanguage();
  const experiences = t('experience.items');

  return (
    <section id="experience" className="py-32">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-4 sticky top-32 h-fit">
            <h2 className="font-serif text-4xl text-ink leading-tight mb-6" dangerouslySetInnerHTML={{ __html: t('experience.title') }}>
            </h2>
            <p className="font-sans font-light text-sub leading-relaxed mb-8">
                {t('experience.sub')}
            </p>
            {/* Decoration */}
            <div className="w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="text-accent animate-spin-slow">
                    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                </svg>
            </div>
        </div>

        <div className="lg:col-span-8 relative pl-8 lg:pl-16">
            <div className="space-y-20">
                {experiences.map((exp: any, index: number) => (
                    <TimelineItem key={index} exp={exp} index={index} isLast={index === experiences.length - 1} />
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

const TimelineItem: React.FC<{ exp: any; index: number; isLast: boolean }> = ({ exp, index, isLast }) => {
  const { ref, isInView } = useInView({ threshold: 0.4 });

  return (
    <div ref={ref} className="relative group">
        
        {/* Bamboo Stalk (Growing Line) */}
        {!isLast && (
             <div className="absolute left-[-33px] lg:left-[-65px] top-4 h-full w-px bg-line overflow-hidden">
                <div className={`w-full bg-accent/50 transition-all duration-[1500ms] ease-out ${isInView ? 'h-full' : 'h-0'}`}></div>
             </div>
        )}

        {/* Node (Sprouting Animation) */}
        <div className={`absolute left-[-37px] lg:left-[-69px] top-2 w-2 h-2 rounded-full border border-accent bg-bg z-10 transition-all duration-500 delay-300 ${isInView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
             <div className={`absolute inset-0 rounded-full bg-accent opacity-0 ${isInView ? 'animate-ping' : ''}`}></div>
        </div>

        {/* Decorative Leaves sprouting from the node */}
        <div className={`absolute left-[-35px] lg:left-[-67px] top-[-5px] pointer-events-none transition-all duration-700 delay-500 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" className="text-accent fill-current transform -rotate-45">
                 <path d="M12,2C12,2 4,10 4,16C4,21 10,22 12,22C14,22 20,21 20,16C20,10 12,2 12,2Z" />
             </svg>
        </div>

        {/* Content */}
        <div className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <span className="font-mono text-xs text-sub uppercase tracking-wider mb-1 block group-hover:text-accent transition-colors">
                {exp.period}
            </span>
            <h3 className="font-serif text-3xl text-ink mb-2 group-hover:translate-x-2 transition-transform duration-300">
                {exp.role}
            </h3>
            <h4 className="font-sans font-medium text-seal text-sm mb-6 flex items-center gap-2">
                {exp.company}
                <span className="w-8 h-px bg-seal/20"></span>
            </h4>
            <ul className="space-y-4">
                 {exp.desc.map((item: string, i: number) => (
                   <li key={i} className="font-sans font-light text-sub text-base leading-relaxed pl-6 relative">
                     <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-line group-hover:bg-accent transition-colors duration-300"></span>
                     {item}
                   </li>
                 ))}
            </ul>
        </div>
    </div>
  );
};
