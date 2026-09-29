import React from 'react';
import { ProjectAnalysis } from '../types/project';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface InvestigationTimelineProps {
  timeline: ProjectAnalysis['timelineSteps'];
  analyzedAt: string;
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  timeline,
  analyzedAt,
}) => {
  const totalDuration = timeline.reduce((sum, step) => sum + step.durationMs, 0);

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block">
            Execution Invariants & Trace
          </span>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-2xs">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
              Investigation Timeline
            </h3>
          </div>
          <p className="text-xs text-neutral-600 font-medium">
            Chronological audit trail of deterministic parsing, invariant checks, and evidence extraction.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9FC] border border-neutral-200 text-xs font-mono text-neutral-600 font-bold shrink-0">
          <Clock className="h-3.5 w-3.5 text-[#E1306C]" />
          <span>Execution: {totalDuration}ms</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#833AB4] before:via-[#E1306C] before:to-[#20A464]">
        {timeline.map((step, index) => {
          const isWarning = step.status === 'warning';
          const isSkipped = step.status === 'skipped';

          return (
            <div key={index} className="relative space-y-1">
              {/* Dot */}
              <div
                className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-2xs ${
                  isWarning
                    ? 'bg-[#F77737]'
                    : isSkipped
                      ? 'bg-neutral-300'
                      : 'bg-[#20A464]'
                }`}
              />

              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-display text-sm font-bold text-neutral-900">{step.step}</h4>
                <span className="font-mono text-[11px] text-neutral-400 font-bold tabular-nums">
                  {step.durationMs}ms
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-normal">{step.details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
