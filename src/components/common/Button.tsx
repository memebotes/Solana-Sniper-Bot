import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  animated?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glowing = false,
  animated = false,
  children,
  className,
  ...props
}) => {
  const baseStyles = "font-medium rounded-md focus:outline-none transition-all duration-200 disabled:opacity-50";
  
  const variantStyles = {
    primary: "bg-solana-turquoise text-black hover:bg-solana-turquoise/80",
    secondary: "bg-gray-700 text-solana-turquoise hover:bg-gray-600",
    success: "bg-green-500 text-black hover:bg-green-400",
    danger: "bg-red-500 text-white hover:bg-red-400",
    warning: "bg-amber-500 text-black hover:bg-amber-400"
  };
  
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const glowingStyles = glowing 
    ? `shadow-[0_0_10px_rgba(0,255,209,0.7)] hover:shadow-[0_0_15px_rgba(0,255,209,0.9)]` 
    : "";
  
  const animatedStyles = animated 
    ? "relative overflow-hidden after:absolute after:content-[''] after:bg-white/20 after:h-full after:w-full after:left-0 after:top-0 after:transform after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-500" 
    : "";
  
  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        glowingStyles,
        animatedStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;