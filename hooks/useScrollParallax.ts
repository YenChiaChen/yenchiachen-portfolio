
import { useEffect, useRef } from 'react';

/**
 * Returns a ref to be attached to an element for parallax effect.
 * Uses direct DOM manipulation for performance.
 * @param speed - The speed factor (e.g., 0.5 for half speed, -0.2 for reverse).
 */
export const useScrollParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const offset = window.scrollY * speed;
            ref.current.style.transform = `translateY(${offset}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return ref;
};
