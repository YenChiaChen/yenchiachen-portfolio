
import React from 'react';
import { useInView } from '../hooks/useInView';
import { useLanguage } from '../contexts/LanguageContext';
import { Award, Trophy } from 'lucide-react';

export const AwardsSection: React.FC = () => {
  const { t } = useLanguage();
  const awards = t('awards.items');
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="awards" className="py-32 relative overflow-hidden bg-bg">
      {/* Background Ink Blot Decoration (Moved slightly) */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-line rounded-full mix-blend-multiply filter blur-[80px] opacity-0 transition-opacity duration-1000 ${isInView ? 'opacity-40' : ''}`}></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
         
         {/* Header */}
         <div className={`flex flex-col items-center mb-16 transition-all duration-700 ${isInView ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <Award strokeWidth={1} className="text-seal mb-4" size={32} />
            <h2 className="font-serif text-4xl text-ink text-center tracking-wide">{t('awards.title')}</h2>
         </div>

         {/* Compact Bento Grid */}
         <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {awards.map((award: any, index: number) => (
                <div 
                    key={index} 
                    className={`group relative bg-white border border-line p-6 hover:border-seal/40 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full min-h-[200px] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                >
                    {/* Top: Year & Icon */}
                    <div className="flex justify-between items-start mb-4">
                        <span className="font-mono text-sm text-seal font-bold border-b border-seal/20 pb-1">{award.year}</span>
                        <Trophy size={16} className="text-line group-hover:text-accent transition-colors" />
                    </div>

                    {/* Middle: Content */}
                    <div>
                        <h3 className="font-serif text-lg text-ink leading-tight mb-2 group-hover:text-seal transition-colors">{award.title}</h3>
                        <div className="text-[10px] font-mono uppercase text-sub tracking-widest mb-3 opacity-60 group-hover:opacity-100">{award.organization}</div>
                        
                        {/* Description shows on hover or always visible but subtle */}
                        <p className="font-sans font-light text-sub text-xs leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                            {award.description}
                        </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-b-transparent border-r-seal/0 group-hover:border-r-seal/10 transition-all duration-300"></div>
                </div>
            ))}
         </div>
      </div>
    </section>
  );
};
