'use client';

import React from 'react';
import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.08,        // lower lerp value = smoother, more premium inertia feel
        duration: 1.2,     // duration of scroll animations
        smoothWheel: true, // enable smooth wheel scrolling
        touchMultiplier: 1.5,
        infinite: false
      }}
    >
      {children}
    </ReactLenis>
  );
}
