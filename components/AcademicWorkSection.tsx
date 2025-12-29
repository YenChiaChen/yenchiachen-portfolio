
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const AcademicWorkSection: React.FC = () => {
  const { t } = useLanguage();
  const works = t('academic.items');

  return (
    <section id="academic" className="py-32 bg-surface border-y border-line">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="font-serif text-3xl text-ink mb-12 text-center">{t('academic.title')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {works.map((work: any, index: number) => (
                <div key={index} className="p-8 border border-line hover:border-accent/50 transition-colors bg-bg">
                    <div className="font-mono text-xs text-sub/50 mb-4">Ref. 00{index+1}</div>
                    <h3 className="font-serif text-xl text-ink mb-4">{work.title}</h3>
                    <p className="font-sans font-light text-sub text-sm leading-relaxed">
                        {work.desc}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};
