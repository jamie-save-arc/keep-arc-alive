import React, { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create high-quality noise pattern
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255;   // A (fully opaque, controlled by CSS)
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <div className="arc-bg" aria-hidden="true">
      {/* Center gradient - static */}
      <div className="arc-bg__center" />
      
      {/* Animated aurora edges */}
      <div className="arc-bg__aurora arc-bg__aurora--top" />
      <div className="arc-bg__aurora arc-bg__aurora--right" />
      <div className="arc-bg__aurora arc-bg__aurora--bottom" />
      <div className="arc-bg__aurora arc-bg__aurora--left" />
      
      {/* Static noise texture for depth */}
      <canvas 
        ref={canvasRef}
        className="arc-bg__noise" 
        width="256" 
        height="256" 
      />
    </div>
  );
};

export default AnimatedBackground;