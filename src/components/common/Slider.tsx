import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  valueDisplay?: boolean;
  valueLabels?: Record<number, string>;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
  valueDisplay = true,
  valueLabels,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Get the percentage of the slider
  const percentage = ((value - min) / (max - min)) * 100;

  // Display value from valueLabels if available
  const displayValue = valueLabels ? valueLabels[value] || value : value;

  return (
    <div className={twMerge("w-full", className)}>
      {label && (
        <div className="flex justify-between mb-2">
          <label className="text-sm text-gray-400">{label}</label>
          {valueDisplay && (
            <span className="text-sm font-mono text-solana-turquoise">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-solana-turquoise [&::-webkit-slider-thumb]:hover:bg-white [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:shadow-[0_0_5px_rgba(0,255,209,0.7)]"
        />
        <div
          className="absolute h-2 rounded-l-full bg-solana-turquoise/50 pointer-events-none"
          style={{ width: `${percentage}%`, top: 0, left: 0 }}
        />
      </div>
    </div>
  );
};

export default Slider;