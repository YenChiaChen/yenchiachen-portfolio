import React, { useState } from "react";
import { useInView } from "../hooks/useInView";
import { useLanguage } from "../contexts/LanguageContext";

export const SkillsSection: React.FC = () => {
  const { t } = useLanguage();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const categories = [
    {
      title: t("skills.categories.ml"),
      items: [
        "MLOps",
        "Green AI",
        "Deep Learning",
        "Log Anomaly Detection",
        "NLP",
        "Image Recognition",
      ],
    },
    {
      title: t("skills.categories.frontend"),
      items: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      title: t("skills.categories.backend"),
      items: [
        "Docker",
        "Kubernetes",
        "Python",
        "Go",
        "C++",
        "Node.js",
        "SQL",
      ],
    },
  ];

  return (
    <section id="skills" className="py-32 bg-surface/30">
      <div className="container mx-auto px-6 md:px-12">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isInView ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mb-16 border-b border-ink/10 pb-4 flex justify-between items-end">
            <h2 className="font-serif text-4xl text-ink">
              {t("skills.title")}
            </h2>
            <span className="font-mono text-xs text-accent tracking-widest uppercase hidden md:block">
              {t("skills.index")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {categories.map((cat, idx) => (
              <SkillCard key={idx} cat={cat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SkillCard: React.FC<{ cat: any }> = ({ cat }) => {
  return (
    <div className="group relative p-6 border border-transparent hover:border-accent/20 transition-colors duration-500 overflow-hidden rounded-sm">
      {/* Moss Green Background Spread */}
      <div className="absolute inset-0 bg-accent/5 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out"></div>

      <div className="relative z-10">
        <h3 className="font-mono text-xs text-sub uppercase tracking-widest mb-6 border-b border-line pb-2 group-hover:text-accent group-hover:border-accent transition-colors">
          {cat.title}
        </h3>
        <ul className="space-y-3">
          {cat.items.map((skill: string) => (
            <li
              key={skill}
              className="font-sans font-light text-ink text-lg flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                {skill}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
