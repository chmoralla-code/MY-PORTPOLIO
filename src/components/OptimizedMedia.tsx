'use client';

import React, { useEffect, useRef, useState } from 'react';

interface OptimizedMediaProps {
  src: string;
  alt: string;
  type: 'image' | 'video';
  className?: string;
}

export default function OptimizedMedia({ src, alt, type, className = '' }: OptimizedMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Viewport observer to activate/deactivate media playback
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          
          if (type === 'video' && videoRef.current) {
            if (entry.isIntersecting) {
              // Play when visible
              videoRef.current.play().catch((e) => {
                console.log('Video autoplay deferred by browser policy:', e);
              });
            } else {
              // Pause immediately when scrolled away to save GPU resources
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [type]);

  // Handle page visibility change (pause video if tab is minimized)
  useEffect(() => {
    if (type !== 'video') return;

    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && isVisible && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [type, isVisible]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden bg-neutral-900 border border-white/5 transition-all duration-700 ${className}`}
    >
      {type === 'video' ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 grayscale brightness-[0.8] hover:grayscale-0 hover:brightness-100 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 grayscale brightness-[0.8] hover:grayscale-0 hover:brightness-100 hover:scale-105 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}

      {/* Loading Skeleton Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Elegant minimalist inner border overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/10 hover:border-white/20 transition-colors duration-500" />
    </div>
  );
}
