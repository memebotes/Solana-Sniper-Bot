import React, { useEffect, useRef } from 'react';

interface LiveLedDisplayProps {
  value: string;
  label: string;
  color?: 'green' | 'red' | 'turquoise';
  size?: 'sm' | 'md' | 'lg';
  blinking?: boolean;
}

const LiveLedDisplay: React.FC<LiveLedDisplayProps> = ({
  value,
  label,
  color = 'turquoise',
  size = 'md',
  blinking = false
}) => {
  const displayRef = useRef<HTMLDivElement>(null);
  
  const colorClasses = {
    green: "text-green-400",
    red: "text-red-400",
    turquoise: "text-solana-turquoise"
  };
  
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };
  
  useEffect(() => {
    if (displayRef.current && blinking) {
      displayRef.current.classList.add('opacity-60');
      setTimeout(() => {
        displayRef.current?.classList.remove('opacity-60');
      }, 150);
    }
  }, [value, blinking]);

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div 
        ref={displayRef}
        className={`font-mono font-bold ${colorClasses[color]} ${sizeClasses[size]} tracking-wider transition-opacity duration-150 led-text-shadow`}
      >
        {value}
      </div>
    </div>
  );
};

export default LiveLedDisplay;