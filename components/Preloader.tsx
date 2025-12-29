
import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Start, 1: Hello, 2: Nihao, 3: Exit
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Hello (English)
      setStage(1);
      await new Promise(r => setTimeout(r, 1200)); // Quicker duration
      
      // Stage 2: NiHao (Chinese)
      setStage(2);
      await new Promise(r => setTimeout(r, 1200)); // Quicker duration

      // Stage 3: Exit Animation (Fade Out)
      setIsExiting(true);
      await new Promise(r => setTimeout(r, 800)); // Match transition duration

      onComplete();
    };

    sequence();
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-bg flex items-center justify-center overflow-hidden transition-opacity duration-800 ease-out ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative w-full max-w-lg h-80 flex items-center justify-center">
        
        {/* Animated Background Blob - Yellow (Highlight) */}
        <div 
            className={`absolute rounded-full bg-highlight mix-blend-multiply blur-2xl transition-all duration-[800ms] ease-spring
                ${stage === 1 ? 'w-32 h-32 top-1/2 left-1/2 -translate-x-12 -translate-y-8 opacity-100' : ''}
                ${stage === 2 ? 'w-40 h-40 top-1/2 left-1/2 translate-x-16 translate-y-6 opacity-100' : ''}
                ${isExiting ? 'scale-110 opacity-0' : ''}
            `}
        ></div>

        {/* Dynamic Text Container */}
        <div className="relative z-10 w-full flex justify-center items-center text-center">
            
            {/* Stage 1: Hello */}
            {stage === 1 && (
                <BouncyText text="Hello." />
            )}

            {/* Stage 2: NiHao */}
            {stage === 2 && (
                <BouncyText text="你好" />
            )}
        </div>
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-paper-texture opacity-40 pointer-events-none"></div>
    </div>
  );
};

// Component for Staggered Bouncy Text
const BouncyText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <h1 className="font-display text-5xl md:text-6xl text-ink tracking-widest flex justify-center flex-wrap">
            {text.split('').map((char, i) => (
                <span 
                    key={i} 
                    className="inline-block animate-pop-in opacity-0 min-w-[0.5em] mx-2" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                >
                    {char}
                </span>
            ))}
        </h1>
    );
};
