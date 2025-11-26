import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../utils';

interface Option {
  label: string;
  value: number | string;
}

interface CustomSelectProps {
  value: number | string;
  onChange: (value: number | string) => void;
  options: Option[];
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative w-28", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 bg-white",
          "border-2 border-black transition-all",
          "text-xs font-bold uppercase text-black",
          isOpen ? "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]",
          "focus:outline-none"
        )}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", isOpen && "rotate-180")} strokeWidth={3} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto no-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center justify-between",
                "hover:bg-black hover:text-white transition-colors border-b-2 border-black last:border-b-0",
                option.value === value && "bg-gray-100"
              )}
            >
              {option.label}
              {option.value === value && <Check className="w-3 h-3" strokeWidth={4} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
