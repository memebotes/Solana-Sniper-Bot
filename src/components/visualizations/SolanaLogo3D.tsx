import React, { useEffect, useRef } from 'react';

interface SolanaLogo3DProps {
  speed: number;
  size?: number;
}

const SolanaLogo3D: React.FC<SolanaLogo3DProps> = ({ 
  speed,
  size = 120
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    
    const drawLogo = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Size of logo (40% of canvas)
      const logoSize = canvas.width * 0.4;
      
      // Calculate 3D effect based on rotation
      const perspective = 0.3;
      const depth = Math.sin(rotationRef.current) * perspective;
      
      // Colors
      const mainColor = '#00FFD1';
      const shadowColor = 'rgba(0, 255, 209, 0.3)';
      
      // Draw shadow
      ctx.beginPath();
      ctx.ellipse(
        centerX, 
        centerY + logoSize * 0.4, 
        logoSize * 0.8, 
        logoSize * 0.2, 
        0, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = shadowColor;
      ctx.fill();
      
      // Draw main shape with 3D effect
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current * 0.2);
      ctx.scale(1 + depth, 1 - depth);
      
      // Draw the simplified Solana logo (stylized S)
      ctx.beginPath();
      ctx.moveTo(-logoSize * 0.5, logoSize * 0.2);
      ctx.lineTo(logoSize * 0.5, logoSize * 0.2);
      ctx.lineTo(logoSize * 0.3, -logoSize * 0.2);
      ctx.lineTo(-logoSize * 0.3, -logoSize * 0.2);
      ctx.closePath();
      
      // Add glow effect
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 15 + Math.sin(rotationRef.current * 2) * 5;
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(
        -logoSize * 0.5, 
        0, 
        logoSize * 0.5, 
        0
      );
      gradient.addColorStop(0, '#00B4D8');
      gradient.addColorStop(1, mainColor);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.restore();
      
      // Rotate for next frame
      rotationRef.current += 0.02 * (speed / 50);
      
      // Continue animation
      animationRef.current = requestAnimationFrame(drawLogo);
    };
    
    drawLogo();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size, speed]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="mx-auto"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-solana-turquoise font-mono text-sm font-bold">
          {speed.toFixed(0)} ms
        </div>
      </div>
    </div>
  );
};

export default SolanaLogo3D;