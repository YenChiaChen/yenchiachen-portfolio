
import React, { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { BlogSection } from './components/BlogSection';
import { ExperienceSection } from './components/ExperienceSection';
import { AwardsSection } from './components/AwardsSection';
import { AcademicWorkSection } from './components/AcademicWorkSection';
import { ContactSection } from './components/ContactSection';
import { LanguageProvider } from './contexts/LanguageContext';
import { Preloader } from './components/Preloader';
import { SEO } from './components/SEO';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-bg border-t border-line py-12 relative z-10">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-sub tracking-widest uppercase">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-accent rounded-full"></span>
           <span>Designed in Taipei</span>
        </div>
        <div className="mt-4 md:mt-0 opacity-50">&copy; {currentYear} Yen-Chia Chen.</div>
      </div>
    </footer>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <HelmetProvider>
      <LanguageProvider>
        <SEO />
        {loading && <Preloader onComplete={() => setLoading(false)} />}
        
        {/* Main Content - rendered but potentially hidden or underneath until loading is done for smoother transition */}
        <div className={`min-h-screen flex flex-col relative font-sans bg-bg text-ink overflow-hidden transition-opacity duration-1000 ${loading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          {/* Paper Texture Overlay */}
          <div className="fixed inset-0 bg-paper-texture pointer-events-none z-50 opacity-60 mix-blend-multiply"></div>
          
          <Navbar />
          
          <main className="flex-grow relative z-10">
            <HeroSection />
            <AboutSection />
            <ExperienceSection />
            <SkillsSection />
            <ProjectsSection />
            <BlogSection />
            <AwardsSection />
            <ContactSection />
          </main>

          <Footer />
        </div>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
