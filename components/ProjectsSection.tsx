
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowUpRight, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Project } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { loadMarkdownContent, getMarkdownContent } from '../utils/markdownLoader';

const PROJECTS_PER_PAGE = 6;

export const ProjectsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const projects = t('projects');
  
  // State for loaded projects
  const [projectArchive, setProjectArchive] = useState<Project[]>([]);
  const [loadingArchive, setLoadingArchive] = useState(true);

  // Load projects when language changes
  useEffect(() => {
    setLoadingArchive(true);
    loadMarkdownContent<Project>('projects', language)
      .then(data => {
        setProjectArchive(data);
        setLoadingArchive(false);
      })
      .catch(err => {
        console.error("Failed to load projects", err);
        setLoadingArchive(false);
      });
  }, [language]);
  
  const categories = projects.categories;
  const sectionTopRef = useRef<HTMLDivElement>(null);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [contentMd, setContentMd] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Filter & Pagination State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Derive unique categories
  const categoryKeys = useMemo(() => ['all', 'web', 'paper','security', 'nlp'], []);

  // 1. Filter Projects
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'all') return projectArchive;
    
    // Mapping internal category keys to display strings found in markdown frontmatter
    const catMap: Record<string, string> = {
        'web': 'Web App',
        'paper': 'Paper',
        'security': 'Security',
        'nlp' : 'NLP',
    };
    
    // Check against mapped value or direct value (case-insensitive for robustness)
    return projectArchive.filter(p => {
       const pCat = p.category?.toLowerCase();
       const target = (catMap[activeCategory] || activeCategory).toLowerCase();
       return pCat === target || pCat?.includes(target);
    });
  }, [activeCategory, projectArchive]);

  // 2. Paginate Filtered Projects
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  
  const currentProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [currentPage, filteredProjects]);

  const handleCategoryChange = (cat: string) => {
    if (cat === activeCategory) return;
    
    // 1. Start Fade Out
    setIsAnimating(true);
    
    // 2. Wait for fade out to complete (300ms matches CSS duration)
    setTimeout(() => {
        setActiveCategory(cat);
        setCurrentPage(1); // Reset page while invisible
        
        // 3. Small delay to ensure DOM updates with new content before fading back in
        setTimeout(() => {
            setIsAnimating(false);
        }, 50);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsAnimating(true);
      setTimeout(() => {
          setCurrentPage(newPage);
          // Scroll to top of section
          sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          setTimeout(() => {
            setIsAnimating(false);
          }, 50);
      }, 300);
    }
  };

  const openProject = async (project: Project) => {
    setSelectedProject(project);
    setIsClosing(false);
    setLoadingContent(true);
    try {
      const text = await getMarkdownContent('projects', project.slug, language);
      setContentMd(text);
    } catch (err) {
      setContentMd(`# Error\nCould not load the case study for "${project.title}".`);
    } finally {
      setLoadingContent(false);
    }
  };

  const closeProject = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedProject(null);
      setContentMd('');
      setIsClosing(false);
    }, 600); 
  };

  return (
    <section id="projects" ref={sectionTopRef} className="py-24 border-t border-line bg-surface/30 min-h-screen">
      <div className="container mx-auto px-6 md:px-12">
        
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-12 gap-8">
            <div className="max-w-xl">
                <span className="font-mono text-xs text-seal uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-seal"></span>
                    {projects.index}
                </span>
                <h2 
                  className="font-serif text-4xl md:text-5xl text-ink leading-tight relative z-10"
                  dangerouslySetInnerHTML={{ __html: projects.title }}
                />
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {categoryKeys.map((key) => (
                    <button
                        key={key}
                        onClick={() => handleCategoryChange(key)}
                        className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 border ${
                            activeCategory === key 
                            ? 'bg-ink text-white border-ink' 
                            : 'bg-transparent text-sub border-line hover:border-accent hover:text-accent'
                        }`}
                    >
                        {categories[key as keyof typeof categories]}
                    </button>
                ))}
            </div>
        </div>

        {/* Projects Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px] transition-all duration-300 ease-in-out transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {loadingArchive ? (
                <div className="col-span-full py-20 flex justify-center">
                    <div className="animate-pulse font-mono text-xs text-sub">{projects.loading}</div>
                </div>
            ) : currentProjects.length > 0 ? (
                currentProjects.map((project, index) => (
                    // Using h-full here ensures the button fills the grid cell height
                    <ProjectCard 
                        key={project.slug} 
                        project={project} 
                        index={(currentPage - 1) * PROJECTS_PER_PAGE + index} 
                        onClick={() => openProject(project)}
                    />
                ))
            ) : (
                <div className="col-span-full py-20 text-center">
                    <p className="font-serif text-xl text-sub italic">No projects found in this category.</p>
                </div>
            )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-8 border-t border-line/50 pt-8">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${currentPage === 1 ? 'text-line cursor-not-allowed' : 'text-sub hover:text-seal'}`}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            
            <div className="flex items-center gap-3">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 rounded-full border transition-all duration-300 font-mono text-[10px] ${currentPage === i + 1 ? 'border-seal text-seal bg-seal/5' : 'border-transparent text-sub hover:border-line'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${currentPage === totalPages ? 'text-line cursor-not-allowed' : 'text-sub hover:text-seal'}`}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
              className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} 
              onClick={closeProject}
            ></div>
            
            <div className={`relative w-full lg:w-2/3 xl:w-1/2 bg-bg h-full shadow-2xl overflow-y-auto border-l border-line ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
                <div className="sticky top-0 z-20 bg-bg/90 backdrop-blur-md border-b border-line p-6 flex justify-between items-center">
                    <span className="font-mono text-[10px] text-sub uppercase tracking-widest">{projects.case_study_label}: {selectedProject.slug}</span>
                    <button onClick={closeProject} className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:bg-seal hover:text-white transition-all duration-300">
                        <X size={20} strokeWidth={1} />
                    </button>
                </div>

                <div className="max-w-2xl mx-auto px-6 py-20">
                    {loadingContent ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-2 h-2 bg-seal rounded-full animate-ping"></div>
                            <span className="font-mono text-xs text-sub animate-pulse">{projects.loading}</span>
                        </div>
                    ) : (
                        <article className="animate-fade-in pb-20">
                            <div className="mb-12 border-b border-line pb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="font-mono text-xs text-accent uppercase tracking-widest">{selectedProject.type}</span>
                                    {selectedProject.achievement && (
                                        <span className="px-2 py-0.5 bg-seal text-white text-[9px] uppercase tracking-wide border border-seal/20">{selectedProject.achievement}</span>
                                    )}
                                </div>
                                <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight mb-8">
                                    {selectedProject.title}
                                </h1>
                                <div className="gap-8 font-sans">
                                    <div>
                                        <div className="text-[10px] font-mono text-sub uppercase tracking-widest mb-1">{projects.tech_stack}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tags?.map(tag => <span key={tag} className="text-sm text-ink">{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Project Banner Image */}
                            {selectedProject.imageUrl && (
                                <div className="mb-12 rounded-sm overflow-hidden shadow-xl aspect-video relative">
                                    <img 
                                        src={selectedProject.imageUrl} 
                                        alt={selectedProject.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-ink/5 mix-blend-multiply"></div>
                                </div>
                            )}

                            <MarkdownRenderer content={contentMd} />
                            
                            <div className="mt-20 pt-12 border-t border-line flex flex-col items-center">
                                <div className="w-3 h-3 bg-seal rounded-full mb-4"></div>
                                <p className="font-serif italic text-sub">{projects.end_archive}</p>
                                <button onClick={closeProject} className="mt-8 font-mono text-xs text-accent uppercase tracking-widest hover:text-seal transition-colors flex items-center gap-2">
                                    {projects.close} <ArrowRight size={14} />
                                </button>
                            </div>
                        </article>
                    )}
                </div>
            </div>

            {/* Mobile Floating Close Button - Outside the transformed container to fix position */}
            <div className={`lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <button 
                    onClick={closeProject}
                    className="flex items-center gap-2 px-6 py-3 bg-bg/90 backdrop-blur-md border border-line rounded-full shadow-xl text-ink hover:text-seal hover:border-seal transition-all duration-300 active:scale-95"
                >
                    <X size={16} />
                    <span className="font-mono text-xs uppercase tracking-widest">{projects.close}</span>
                </button>
            </div>
        </div>
      )}
    </section>
  );
};

// Compact Project Card
const ProjectCard: React.FC<{ project: Project; index: number; className?: string; onClick: () => void }> = ({ project, index, className, onClick }) => {
  const imageUrl = project.imageUrl || `https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop&sig=${index}`;

  return (
    <button onClick={onClick} className={`group flex flex-col relative text-left w-full h-full transition-all duration-700 animate-fade-in ${className}`}>
        {/* Simplified index number to reduce visual noise */}
        <div className="absolute -top-6 -left-0 font-serif text-4xl text-line opacity-50 select-none group-hover:text-accent/40 transition-colors duration-500 z-0">
            {String(index + 1).padStart(2, '0')}
        </div>

        {/* Tighter Aspect Ratio (4/3 -> 3/2) for cleaner grid */}
        <div className="aspect-[3/2] w-full bg-line/20 mb-4 overflow-hidden relative z-10 shadow-sm group-hover:shadow-xl group-hover:shadow-accent/10 transition-all duration-500 border border-transparent group-hover:border-seal/20 flex-shrink-0">
            {/* Switched to img tag for better performance and lazy loading support */}
            <img 
                src={imageUrl} 
                alt={project.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-seal mix-blend-multiply transform origin-left scale-x-0 group-hover:animate-ink-spread opacity-0"></div>
        </div>

        <div className="relative z-10 pr-2 flex flex-col flex-1">
            <div className="flex justify-between items-start flex-1">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-[10px] text-accent uppercase tracking-wider">{project.category}</span>
                        {/* Added Achievement Badge with Red Background */}
                        {project.achievement && (
                            <span className="px-2 py-0.5 bg-seal text-white text-[9px] font-mono uppercase tracking-widest shadow-sm rounded-sm">
                                {project.achievement}
                            </span>
                        )}
                    </div>
                    <h3 className="font-serif text-2xl text-ink group-hover:text-seal transition-colors duration-300 mb-2 leading-tight">
                        {project.title}
                    </h3>
                    <p className="font-sans font-light text-sub text-xs leading-relaxed max-w-sm line-clamp-2">
                        {project.description}
                    </p>
                </div>
                
                <div className="w-8 h-8 rounded-full border border-line group-hover:border-seal flex items-center justify-center transition-all duration-300 group-hover:rotate-45 group-hover:bg-seal group-hover:text-white shrink-0 mt-1">
                    <ArrowUpRight size={14} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    </button>
  );
};
