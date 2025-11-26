import React from 'react';
import { EisenhowerQuadrant } from '../types';
import { QUADRANT_CONFIG } from '../constants';
import { cn } from '../utils';

interface QuadrantSelectorProps {
  value: EisenhowerQuadrant;
  onChange: (q: EisenhowerQuadrant) => void;
}

const QuadrantSelector: React.FC<QuadrantSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {(Object.keys(QUADRANT_CONFIG) as EisenhowerQuadrant[]).map((q) => {
        const config = QUADRANT_CONFIG[q];
        const isActive = value === q;
        return (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            className={cn(
              "flex flex-col items-start px-2 py-2 border-2 transition-all duration-100",
              isActive 
                ? cn("border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]", config.color)
                : "border-black bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            <span className={cn(
                "font-black text-xs uppercase", 
                isActive ? "text-black" : "text-gray-600"
            )}>
                {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default QuadrantSelector;