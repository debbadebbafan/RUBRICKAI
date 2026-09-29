import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';

interface PlainEnglishHelpBannerProps {
  question: string;
  explanation: string;
  tip?: string;
  onOpenLearningGuide?: () => void;
  defaultExpanded?: boolean;
}

export const PlainEnglishHelpBanner: React.FC<PlainEnglishHelpBannerProps> = ({
  question,
  explanation,
  tip,
  onOpenLearningGuide,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-2xl border border-[#833AB4]/15 bg-gradient-to-r from-[#FAF8FF] via-white to-[#FFF5F8]/40 p-4 text-xs transition shadow-2xs">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF8FF] text-[#833AB4] group-hover:scale-105 transition-transform">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="font-bold text-neutral-800 group-hover:text-[#833AB4] transition">
            {question}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-[#833AB4] transition">
          <span className="text-[11px] font-mono font-semibold">
            {isExpanded ? 'Hide guide' : 'Explain simply'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2.5 text-neutral-700 animate-in fade-in duration-150">
          <p className="leading-relaxed text-xs font-medium text-neutral-600">{explanation}</p>
          {tip && (
            <div className="flex items-start gap-2 pt-1 text-xs text-neutral-800 font-semibold bg-white p-2.5 rounded-xl border border-neutral-100 shadow-2xs">
              <Lightbulb className="h-4 w-4 text-[#F77737] shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          )}
          {onOpenLearningGuide && (
            <button
              onClick={onOpenLearningGuide}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#833AB4] hover:text-[#E1306C] transition pt-1"
            >
              <span>Explore all concepts in the Student Learning Guide →</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
