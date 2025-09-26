'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Set up smooth scrolling
    if (typeof window !== 'undefined' && containerRef.current) {
      // Configure GSAP defaults
      gsap.defaults({ ease: "power2.out", duration: 0.8 });
      
      // Set up scroll triggers for animations
      ScrollTrigger.config({ 
        limitCallbacks: true,
        syncInterval: 100
      });
      
      // Refresh ScrollTrigger on resize
      window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="smooth-scroll-container">
      {children}
      
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        body {
          overflow-x: hidden;
        }
        
        .smooth-scroll-container {
          overflow-x: hidden;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}