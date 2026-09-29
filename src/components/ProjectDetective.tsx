import React, { useState } from 'react';
import { DetectiveFinding, FindingConfidence } from '../types/project';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Eye,
  Search,
  ArrowRight,
  HelpCircle,
  FileCode,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface ProjectDetectiveProps {
  findings: DetectiveFinding[];
  onSelectFindingSnippet?: (finding: DetectiveFinding) => void;
  onNavigateToEvidence?: (location: string) => void;
  onOpenLearningGuide?: () => void;
}

export const ProjectDetective: React.FC<ProjectDetectiveProps> = ({
  findings,
  onOpenLearningGuide,
}) => {
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | FindingConfidence>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'critical' | 'warning' | 'positive'>('ALL');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [isScanningHidden, setIsScanningHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRunHiddenScan = () => {
    setIsScanningHidden(true);
    setTimeout(() => {
      setIsScanningHidden(false);
      setShowHiddenOnly(true);
    }, 450);
  };

  const hiddenCount = findings.filter((f) => f.isHiddenIssue).length;

  const filteredFindings = findings.filter((f) => {
    if (showHiddenOnly && !f.isHiddenIssue) return false;
    if (confidenceFilter !== 'ALL' && f.confidence !== confidenceFilter) return false;
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchFound = f.whatWeFound.toLowerCase().includes(q);
      const matchEvidence = f.evidence.toLowerCase().includes(q);
      const matchMatters = f.whyItMatters.toLowerCase().includes(q);
      const matchNext = f.whatToDoNext.toLowerCase().includes(q);
      const matchLoc = f.location.toLowerCase().includes(q);
      return matchTitle || matchFound || matchEvidence || matchMatters || matchNext || matchLoc;
    }
    return true;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const timelineSteps = [
    { title: 'UNDERSTAND', desc: 'Scan notebook AST & data profiles', color: 'from-[#405DE6] to-[#60A5FA]' },
    { title: 'SEARCH', desc: 'Trace imports, splits & models', color: 'from-[#833AB4] to-[#A855F7]' },
    { title: 'CHECK', desc: 'Verify leakage & invariant checks', color: 'from-[#E1306C] to-[#F43F5E]' },
    { title: 'VERIFY', desc: 'No claim without verified proof', color: 'from-[#F77737] to-[#FB923C]' },
    { title: 'EXPLAIN', desc: 'Plain-English fixes & next steps', color: 'from-[#20A464] to-[#34D399]' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header & Plain-English Subtitle */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-100 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block">
              Automated Code & Invariant Audit
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              Project Detective
            </h2>
            <p className="text-sm text-neutral-600 font-medium max-w-2xl leading-relaxed">
              "Let's look for things your project might have missed — backed strictly by verified code and dataset proof."
            </p>
          </div>

          {/* Prominent "Find Hidden Issues" Button */}
          <div className="space-y-1.5 shrink-0 max-w-sm">
            <button
              onClick={handleRunHiddenScan}
              disabled={isScanningHidden}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-lg hover:opacity-95 transition active:scale-98 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              <span>{isScanningHidden ? 'Scanning your project...' : 'Find hidden issues'}</span>
              {!isScanningHidden && (
                <span className="ml-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/25">
                  {hiddenCount} found
                </span>
              )}
            </button>
            <p className="text-[11px] text-neutral-500 text-center font-medium">
              Checks beyond the syllabus for subtle edge-case warnings
            </p>
          </div>
        </div>

        {/* 2. Colorful Animated Investigation Timeline */}
        <div className="space-y-2.5 pt-2">
          <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold block">
            Investigation Timeline Pipeline
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {timelineSteps.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-3.5 space-y-1 overflow-hidden group brand-card-hover"
              >
                <div
                  className={`h-1 w-full rounded-full bg-gradient-to-r ${step.color} mb-2`}
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-neutral-400">
                    0{idx + 1}
                  </span>
                  <span className="font-display text-xs font-extrabold text-neutral-900 tracking-wider">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <PlainEnglishHelpBanner
          question="What does Project Detective look for?"
          explanation="Project Detective performs invariant auditing: we check whether data was transformed before or after train/test split, whether models have reproducible random seeds, whether missing values were imputed properly, and whether metrics fit your data distribution. We never accuse your code of runtime errors unless confirmed."
          tip="Findings marked VERIFIED have exact cell line numbers. POTENTIAL findings recommend a good practice."
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings (e.g. 'leakage', 'scaler', 'seed', 'metric')..."
            className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#833AB4] focus:outline-none focus:ring-2 focus:ring-[#833AB4]/20 transition shadow-2xs"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold p-1 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              severityFilter === 'ALL'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              severityFilter === 'critical'
                ? 'bg-[#E5484D] text-white'
                : 'text-[#E5484D] hover:bg-[#FFF5F5]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>Critical</span>
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              severityFilter === 'warning'
                ? 'bg-[#F77737] text-white'
                : 'text-[#F77737] hover:bg-[#FFF8F5]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>Attention</span>
          </button>
          <button
            onClick={() => setSeverityFilter('positive')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              severityFilter === 'positive'
                ? 'bg-[#20A464] text-white'
                : 'text-[#20A464] hover:bg-[#F2FBF6]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span>Healthy</span>
          </button>
        </div>
      </div>

      {/* 4. Filtered Findings Cards with Visual Separation */}
      <div className="space-y-5">
        {filteredFindings.length === 0 ? (
          <div className="rounded-3xl border border-neutral-100 bg-white p-12 text-center space-y-3 shadow-xs">
            <ShieldCheck className="h-8 w-8 text-[#20A464] mx-auto" />
            <h3 className="font-display text-lg font-bold text-neutral-900">
              No matching findings detected
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your filter or search query to see all audit items.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            // Visual accent styling based on confidence & severity
            let statusBadge = {
              label: 'Verified Claim',
              color: 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30',
              accentBorder: 'border-l-4 border-l-[#20A464]',
            };

            if (finding.severity === 'critical') {
              statusBadge = {
                label: 'Critical Issue',
                color: 'text-[#E5484D] bg-[#FFF5F5] border-[#E5484D]/30',
                accentBorder: 'border-l-4 border-l-[#E5484D]',
              };
            } else if (finding.severity === 'warning') {
              statusBadge = {
                label: 'Needs Attention',
                color: 'text-[#F77737] bg-[#FFF8F5] border-[#F77737]/30',
                accentBorder: 'border-l-4 border-l-[#F77737]',
              };
            }

            return (
              <div
                key={finding.id}
                className={`rounded-3xl border border-neutral-100 bg-white p-6 sm:p-7 shadow-xs space-y-5 brand-card-hover ${statusBadge.accentBorder}`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-bold uppercase">
                        {finding.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {finding.sourceFile} · {finding.location}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-extrabold text-neutral-900">
                      {finding.title}
                    </h3>
                  </div>

                  {finding.scoreImpactPoints !== undefined && (
                    <span className="text-xs font-mono font-bold text-[#E5484D] px-2.5 py-1 rounded-xl bg-[#FFF5F5] border border-[#E5484D]/20 self-start sm:self-auto">
                      -{finding.scoreImpactPoints} pts rubric impact
                    </span>
                  )}
                </div>

                {/* 4 Visually Separated Zones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Zone 1: WHAT WE FOUND */}
                  <div className="rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-4 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#833AB4] font-bold block">
                      WHAT WE FOUND
                    </span>
                    <p className="text-neutral-800 leading-relaxed font-medium">
                      {finding.whatWeFound}
                    </p>
                  </div>

                  {/* Zone 2: EVIDENCE */}
                  <div className="rounded-2xl border border-neutral-100 bg-[#F4F8FF] p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#405DE6] font-bold block">
                        EVIDENCE GROUNDING
                      </span>
                      <span className="font-mono text-[10px] text-[#405DE6] font-bold">
                        {finding.location}
                      </span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-mono text-[11px]">
                      {finding.evidence}
                    </p>
                  </div>

                  {/* Zone 3: WHY IT MATTERS */}
                  <div className="rounded-2xl border border-neutral-100 bg-[#FFFDF5] p-4 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F77737] font-bold block">
                      WHY IT MATTERS
                    </span>
                    <p className="text-neutral-700 leading-relaxed">
                      {finding.whyItMatters}
                    </p>
                  </div>

                  {/* Zone 4: WHAT TO DO NEXT */}
                  <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6] p-4 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#20A464] font-bold block">
                      WHAT TO DO NEXT
                    </span>
                    <p className="text-neutral-900 leading-relaxed font-semibold">
                      {finding.whatToDoNext || finding.whatYouCanDo}
                    </p>
                  </div>
                </div>

                {/* Recommended Code Solution (if present) */}
                {finding.recommendedCode && (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-900 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Recommended Code Fix</span>
                      </span>
                      <button
                        onClick={() => handleCopyCode(finding.id, finding.recommendedCode!)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
                      >
                        {copiedId === finding.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy solution</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-neutral-100 overflow-x-auto p-1 leading-relaxed">
                      <code>{finding.recommendedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
