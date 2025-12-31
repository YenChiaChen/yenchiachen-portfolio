
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { loadMarkdownContent, getMarkdownContent } from '../utils/markdownLoader.ts';

const POSTS_PER_PAGE = 6;

export const BlogSection: React.FC = () => {
  const { t, language } = useLanguage();
  const blog = t('blog');
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load posts when language changes
  useEffect(() => {
    setLoadingPosts(true);
    loadMarkdownContent<BlogPost>('posts', language)
      .then(data => {
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogPosts(sorted);
        setLoadingPosts(false);
      })
      .catch(err => {
        console.error("Failed to load blog posts", err);
        setLoadingPosts(false);
      });
  }, [language]);
  
  const categories = blog.categories;
  const sectionTopRef = useRef<HTMLDivElement>(null);
  
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [contentMd, setContentMd] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Filtering & Pagination State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryKeys = useMemo(() => ['all', 'frontend', 'backend', 'ml', 'security'], []);

  // 1. Filter Posts
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return blogPosts;
    
    // Check against category (case-insensitive)
    return blogPosts.filter(p => {
        const pCat = p.category?.toLowerCase();
        const target = activeCategory.toLowerCase();
        return pCat === target || pCat?.includes(target);
    });
  }, [activeCategory, blogPosts]);

  // 2. Paginate Filtered Posts
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [currentPage, filteredPosts]);

  // Reset page on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handleCategoryChange = (cat: string) => {
    if (cat === activeCategory) return;
    setIsAnimating(true);
    setTimeout(() => {
        setActiveCategory(cat);
        setIsAnimating(false);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setIsAnimating(true);
      setTimeout(() => {
          setCurrentPage(newPage);
          setIsAnimating(false);
          sectionTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const openPost = async (post: BlogPost) => {
    setSelectedPost(post);
    setIsClosing(false);
    setLoadingContent(true);
    try {
      const text = await getMarkdownContent('posts', post.slug, language);
      setContentMd(text);
    } catch (err) {
      setContentMd('# Error\nCould not load the post content. Please try again later.');
    } finally {
      setLoadingContent(false);
    }
  };

  const closePost = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPost(null);
      setContentMd('');
      setIsClosing(false);
    }, 600);
  };

  return (
    <section id="blog" ref={sectionTopRef} className="py-24 bg-surface/50 relative">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Header & Filter System */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-12 gap-8 border-b border-line pb-6">
             <div className="space-y-4">
                <span className="font-mono text-[10px] text-accent uppercase tracking-[0.4em]">{blog.index}</span>
                <div className="flex items-baseline gap-4">
                   <h2 className="font-serif text-4xl text-ink">{blog.title}</h2>
                   <span className="font-mono text-xs text-sub uppercase tracking-widest hidden sm:inline">{blog.sub}</span>
                </div>
             </div>

             {/* Category Pills */}
             <div className="flex flex-wrap gap-2">
                {categoryKeys.map((key) => (
                    <button
                        key={key}
                        onClick={() => handleCategoryChange(key)}
                        className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 border ${
                            activeCategory === key 
                            ? 'bg-seal text-white border-seal shadow-md' 
                            : 'bg-white text-sub border-line hover:border-seal hover:text-seal'
                        }`}
                    >
                        {categories[key as keyof typeof categories]}
                    </button>
                ))}
             </div>
        </div>

        {/* Masonry Grid Layout (3 cols) */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px] transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {loadingPosts ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center">
                     <div className="animate-pulse font-mono text-xs text-sub">{blog.loading}</div>
                </div>
            ) : currentPosts.length > 0 ? (
                currentPosts.map((post, index) => (
                    <button 
                        key={post.id || post.slug}
                        onClick={() => openPost(post)}
                        className="group flex flex-col items-start text-left bg-white border border-line hover:border-accent/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 relative overflow-hidden h-full p-8"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* No Cover Image in Grid View for cleaner text-heavy layout */}
                        
                        <div className="w-full flex-1 flex flex-col">
                            {/* Top Decoration */}
                            <div className="w-full flex justify-between items-center mb-6 border-b border-line/50 pb-4 group-hover:border-seal/20 transition-colors">
                                <span className="font-mono text-[10px] text-sub uppercase tracking-widest">{post.date}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-line group-hover:bg-seal transition-colors"></div>
                            </div>

                            {/* Title & Category */}
                            <div className="flex-1 mb-6">
                                <div className="mb-3">
                                    <span className="inline-block px-2 py-1 bg-bg text-[9px] font-mono uppercase tracking-wider text-accent border border-line rounded-sm">
                                        {post.category}
                                    </span>
                                </div>
                                <h3 className="font-serif text-2xl text-ink leading-tight group-hover:text-seal transition-colors duration-300">
                                    {post.title}
                                </h3>
                                <p className="mt-4 font-sans font-light text-sm text-sub leading-relaxed line-clamp-4">
                                    {post.excerpt}
                                </p>
                            </div>

                            {/* Bottom Action */}
                            <div className="w-full flex justify-between items-center pt-6 border-t border-line/50 group-hover:border-seal/20 mt-auto">
                                <div className="flex gap-2">
                                    {post.tags && post.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[9px] font-mono text-sub/60">#{tag}</span>
                                    ))}
                                </div>
                                <div className="text-seal opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </button>
                ))
            ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-50">
                    <FileText size={48} className="text-line mb-4" />
                    <p className="font-serif text-xl text-sub italic">No entries found in this sector.</p>
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

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
              className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} 
              onClick={closePost}
            ></div>
            
            <div className={`relative w-full lg:w-2/3 xl:w-1/2 bg-bg h-full shadow-2xl overflow-y-auto border-l border-line ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
                <div className="sticky top-0 z-20 bg-bg/90 backdrop-blur-md border-b border-line p-6 flex justify-between items-center">
                    <span className="font-mono text-[10px] text-sub uppercase tracking-widest">{blog.reading_mode}</span>
                    <button onClick={closePost} className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:bg-ink hover:text-white transition-all duration-300">
                        <X size={20} strokeWidth={1} />
                    </button>
                </div>

                <div className="max-w-2xl mx-auto px-6 py-20">
                    {loadingContent ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <div className="w-2 h-2 bg-seal rounded-full animate-ping"></div>
                            <span className="font-mono text-xs text-sub animate-pulse">{blog.loading}</span>
                        </div>
                    ) : (
                        <article className="animate-fade-in pb-20">
                            <div className="mb-12 border-b border-line pb-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="font-mono text-xs text-accent uppercase tracking-widest">{selectedPost.date}</div>
                                    <span className="px-3 py-1 bg-seal/5 text-seal text-[10px] font-mono uppercase tracking-widest border border-seal/20 rounded-full">
                                        {selectedPost.category}
                                    </span>
                                </div>
                                <h1 className="font-serif text-4xl md:text-6xl text-ink leading-tight mb-6">
                                    {selectedPost.title}
                                </h1>
                                <div className="flex gap-4">
                                    {selectedPost.tags && selectedPost.tags.map(t => <span key={t} className="font-mono text-[10px] text-sub">#{t}</span>)}
                                </div>
                            </div>
                            
                            {/* Detailed View Cover Image - Still kept here for immersion */}
                            {selectedPost.coverImage && (
                                <div className="mb-12 rounded-sm overflow-hidden shadow-xl aspect-video relative">
                                    <img 
                                        src={selectedPost.coverImage} 
                                        alt={selectedPost.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-ink/5 mix-blend-multiply"></div>
                                </div>
                            )}

                            <MarkdownRenderer content={contentMd} />
                            
                            <div className="mt-20 pt-12 border-t border-line flex flex-col items-center">
                                <div className="w-2 h-2 bg-seal rounded-full mb-4"></div>
                                <p className="font-serif italic text-sub">{blog.end}</p>
                                <button onClick={closePost} className="mt-8 font-mono text-xs text-accent uppercase tracking-widest hover:text-seal transition-colors">
                                    {blog.back}
                                </button>
                            </div>
                        </article>
                    )}
                </div>
            </div>

            {/* Mobile Floating Close Button - Outside the transformed container to fix position */}
            <div className={`lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <button 
                    onClick={closePost}
                    className="flex items-center gap-2 px-6 py-3 bg-bg/90 backdrop-blur-md border border-line rounded-full shadow-xl text-ink hover:text-seal hover:border-seal transition-all duration-300 active:scale-95"
                >
                    <X size={16} />
                    <span className="font-mono text-xs uppercase tracking-widest">{blog.back}</span>
                </button>
            </div>
        </div>
      )}
    </section>
  );
};
