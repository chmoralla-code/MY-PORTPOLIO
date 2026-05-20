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
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Reset loaded/error state when src or type changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
  }, [src, type]);

  // Handle intersection observer for smart lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            setHasBeenVisible(true);
            
            if (type === 'video' && videoRef.current) {
              videoRef.current.play().catch((e) => {
                console.log('Video autoplay deferred by browser policy:', e);
              });
            }
          } else {
            if (type === 'video' && videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      { 
        rootMargin: '200px', // Start loading 200px before coming into viewport
        threshold: 0.01 
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [type, src]);

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

  // Handle cached images onload bug
  useEffect(() => {
    if (type === 'image' && imgRef.current && hasBeenVisible) {
      if (imgRef.current.complete) {
        setIsLoaded(true);
      }
    }
  }, [hasBeenVisible, src, type]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden bg-neutral-900 border border-white/5 transition-all duration-700 ${className}`}
    >
      {type === 'video' ? (
        <video
          ref={videoRef}
          src={hasBeenVisible ? src : undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setIsLoaded(true)}
          onLoadedData={() => setIsLoaded(true)}
          onError={() => {
            setIsError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-700 grayscale brightness-[0.8] hover:grayscale-0 hover:brightness-100 ${
            isLoaded && !isError ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      ) : (
        <img
          ref={imgRef}
          src={hasBeenVisible ? src : undefined}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setIsError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-700 grayscale brightness-[0.8] hover:grayscale-0 hover:brightness-100 hover:scale-105 ${
            isLoaded && !isError ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}

      {/* Loading Skeleton Indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* High-aesthetic Monospace Media Error Fallback */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070707] border border-red-500/20 font-mono p-4 text-center select-none z-10">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none" />
          <div className="text-[10px] text-red-500 font-bold uppercase tracking-[0.25em] mb-1 animate-pulse">
            [ MEDIA ERROR ]
          </div>
          <div className="text-[8px] text-white/50 uppercase tracking-[0.2em] mb-4">
            DECODING FAILED
          </div>
          <div className="text-[7px] text-white/30 uppercase tracking-[0.1em] border border-white/10 px-2 py-1 bg-white/[0.02] max-w-[90%] truncate font-mono">
            {src ? src.substring(src.lastIndexOf('/') + 1) : 'UNKNOWN_REF'}
          </div>
        </div>
      )}

      {/* Elegant minimalist inner border overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/10 hover:border-white/20 transition-colors duration-500 z-20" />
    </div>
  );
}
