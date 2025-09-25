// frontend/components/analysis/Confetti.tsx
// Note: You might need to install react-confetti: npm install react-confetti

import React, { useState, useEffect } from 'react';
import ConfettiComponent from 'react-confetti';

export const Confetti: React.FC = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-stop confetti after a few seconds
  const [show, setShow] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000); // Show for 5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <ConfettiComponent
      width={windowSize.width}
      height={windowSize.height}
      recycle={false} // Stop after one burst
      numberOfPieces={200} // Number of confetti pieces
    />
  );
};