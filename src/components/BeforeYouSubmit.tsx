import React, { useState } from 'react';
import { ProjectAnalysis, SubmissionChecklistItem } from '../types/project';
import { evaluateSubmissionReadiness } from '../engine/submissionReadiness';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  CheckCheck,
  Circle,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface BeforeYouSubmitProps {
  analysis: ProjectAnalysis;
  onNavigateToTab?: (tab: string) => void;
  onOpenLearningGuide?: () => void;
}

export const BeforeYouSubmit: React.FC<BeforeYouSubmitProps> = ({
  analysis,
  onNavigateToTab,
  onOpenLearningGuide,
}) => {
  const readiness = evaluateSubmissionReadiness(analysis.findings, analysis.codeHealthIssues);
  const [resolvedItemIds, setResolvedItemIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'needs_attention' | 'done' | 'optional'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleResolved = (id: string) => {
    setResolvedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Categorize into DONE, NEEDS ATTENTION, and OPTIONAL
  const needsAttentionItems = readiness.checklist.filter(
    (item) => item.status === 'fail' && !resolvedItemIds.has(item.id)
  );
  const optionalItems = readiness.checklist.filter(
    (item) => item.status === 'warning' && !resolvedItemIds.has(item.id)
  );
  const doneItems = readiness.checklist.filter(
    (item) => item.status === 'pass' || resolvedItemIds.has(item.id)
  );

  const progressPercentage = Math.round(
    ((doneItems.length) / readiness.totalChecks) * 100
  );

  return (
    <div className="space-y-8">
      {/* 1. Header Card with Encouraging Tone */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#20A464] font-bold block">
              Pre-Submission Checklist
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              Almost there.
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              "Here are the things worth checking before you submit."
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-[#F2FBF6] text-[#20A464] border border-[#20A464]/30 font-bold">
              {doneItems.length} of {readiness.totalChecks} items verified
            </span>
          </div>
        </div>

        {/* Progress Bar & Reassurance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
            <span>Overall Readiness Progress</span>
            <span className="text-[#20A464] font-mono">{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#20A464] via-[#405DE6] to-[#833AB4] rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 font-medium pt-1">
            Check off items as you fix them to track your progress toward submission.
          </p>
        </div>

        <PlainEnglishHelpBanner
          question="How do I use this checklist?"
          explanation="We organized everything into three friendly buckets: ✓ Done (verified by RubricAI in your files), ⚠ Needs attention (critical fixes to protect your grade), and ○ Optional (extra polish to elevate your project). None of these mean you failed — they are quick fixes to help you get the highest grade possible."
          tip="Click any checkbox to mark it as resolved once you adjust your notebook!"
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>

      {/* 2. Priority Action Card ("Fix these first") */}
      {readiness.highestPriorityFixes.length > 0 && (
        <div className="rounded-3xl border border-neutral-200/90 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 sm:p-8 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E1306C] to-[#F77737] text-white shadow-xs">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-white">
                  Fix these first
                </h3>
                <span className="text-xs text-neutral-300">
                  Highest-impact improvements before grading
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-400 font-bold hidden sm:inline">
              1-click code templates available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readiness.highestPriorityFixes.map((fix, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-neutral-800/80 border border-neutral-700 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E5484D]/20 text-[#FF8587]">
                      Must Fix
                    </span>
                    <span className="text-neutral-400">Step {idx + 1}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-neutral-100">
                    {fix.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {fix.whatToDoNext || fix.whatYouCanDo}
                  </p>
                </div>

                {(fix.recommendedCode || fix.codeSnippet) && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>Suggested Fix Code</span>
                      <button
                        onClick={() => handleCopy(`fix-${idx}`, (fix.recommendedCode || fix.codeSnippet)!)}
                        className="hover:text-white flex items-center gap-1"
                      >
                        {copiedId === `fix-${idx}` ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="rounded-xl bg-neutral-900 p-2.5 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                      <code>{fix.recommendedCode || fix.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Three-Bucket Filtered Checklist */}
      <div className="space-y-4">
        {/* Bucket Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold p-1 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Items ({readiness.totalChecks})
          </button>
          <button
            onClick={() => setActiveTab('needs_attention')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'needs_attention'
                ? 'bg-[#E5484D] text-white shadow-xs'
                : 'text-[#E5484D] hover:bg-[#FFF5F5]'
            }`}
          >
            <span>⚠ Needs attention</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {needsAttentionItems.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('optional')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'optional'
                ? 'bg-[#405DE6] text-white shadow-xs'
                : 'text-[#405DE6] hover:bg-[#F4F8FF]'
            }`}
          >
            <span>○ Optional</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {optionalItems.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'done'
                ? 'bg-[#20A464] text-white shadow-xs'
                : 'text-[#20A464] hover:bg-[#F2FBF6]'
            }`}
          >
            <span>✓ Done</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {doneItems.length}
            </span>
          </button>
        </div>

        {/* Checklist Rows */}
        <div className="space-y-3">
          {readiness.checklist
            .filter((item) => {
              const isResolved = resolvedItemIds.has(item.id);
              if (activeTab === 'done') return item.status === 'pass' || isResolved;
              if (activeTab === 'needs_attention') return item.status === 'fail' && !isResolved;
              if (activeTab === 'optional') return item.status === 'warning' && !isResolved;
              return true;
            })
            .map((item) => {
              const isResolved = resolvedItemIds.has(item.id);
              const isPass = item.status === 'pass' || isResolved;
              const isFail = item.status === 'fail' && !isResolved;
              const isWarning = item.status === 'warning' && !isResolved;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4.5 sm:p-5 transition-all duration-200 brand-card-hover flex items-start gap-4 ${
                    isPass
                      ? 'border-emerald-100 bg-[#F2FBF6]/60'
                      : isFail
                        ? 'border-rose-100 bg-[#FFF5F5]/60'
                        : 'border-blue-100 bg-[#F4F8FF]/60'
                  }`}
                >
                  <button
                    onClick={() => toggleResolved(item.id)}
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      isPass
                        ? 'border-[#20A464] bg-[#20A464] text-white shadow-2xs'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {isPass && <Check className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`font-display font-bold text-sm ${isPass ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                        {item.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPass
                            ? 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30'
                            : isFail
                              ? 'text-[#E5484D] bg-[#FFF5F5] border-[#E5484D]/30'
                              : 'text-[#405DE6] bg-[#F4F8FF] border-[#405DE6]/30'
                        }`}
                      >
                        {isPass ? '✓ Done' : isFail ? '⚠ Needs attention' : '○ Optional'}
                      </span>
                    </div>

                    <p className="text-neutral-600 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
