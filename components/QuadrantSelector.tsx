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
    <div className="grid grid-cols-2 gap-2 mt-2">
      {(Object.keys(QUADRANT_CONFIG) as EisenhowerQuadrant[]).map((q) => {
        const config = QUADRANT_CONFIG[q];
        const isActive = value === q;
        return (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            className={cn(
              "flex flex-col items-start p-2 rounded border text-xs transition-all",
              isActive 
                ? cn("border-transparent ring-2 ring-offset-1", config.color, "ring-gray-300")
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            <span className="font-semibold">{config.label}</span>
            <span className="opacity-70 text-[10px] mt-0.5">{config.description}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuadrantSelector;