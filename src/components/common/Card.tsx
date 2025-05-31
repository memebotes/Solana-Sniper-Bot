import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className,
  glowing = false,
  bordered = true
}) => {
  return (
    <div 
      className={twMerge(
        "bg-gray-900 rounded-lg overflow-hidden",
        bordered && "border border-gray-800",
        glowing && "shadow-[0_0_15px_rgba(0,255,209,0.15)]",
        className
      )}
    >
      {title && (
        <div className="border-b border-gray-800 px-4 py-3 flex items-center">
          <h3 className="text-solana-turquoise font-mono font-bold text-lg">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;