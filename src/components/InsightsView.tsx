import React, { useState, useEffect } from 'react';
import { ProjectAnalysis } from '../types/project';
import {
  Search,
  Activity,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  FileCheck,
  TrendingUp,
  Cpu,
  Eye,
  Check,
} from 'lucide-react';
import { ProjectDetective } from './ProjectDetective';
import { ProjectAutopsy } from './ProjectAutopsy';
import { BeforeYouSubmit } from './BeforeYouSubmit';
import { CodeHealthView } from './CodeHealthView';

interface InsightsViewProps {
  analysis: ProjectAnalysis;
  initialSubTab?: 'overview' | 'detective' | 'autopsy' | 'readiness' | 'code_health';
  onNavigateToTab: (tab: string) => void;
  onOpenLearningGuide: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  analysis,
  initialSubTab = 'overview',
  onNavigateToTab,
  onOpenLearningGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detective' | 'autopsy' | 'readiness' | 'code_health'>(
    initialSubTab
  );

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const handleTabChange = (tab: 'overview' | 'detective' | 'autopsy' | 'readiness' | 'code_health') => {
    setActiveTab(tab);
    if (tab === 'overview') {
      onNavigateToTab('insights');
    } else {
      onNavigateToTab(tab);
    }
  };

  const verifiedFindings = analysis.findings.filter((f) => f.confidence === 'VERIFIED');
  const criticalFindings = analysis.findings.filter((f) => f.severity === 'critical');
  const hiddenIssues = analysis.findings.filter((f) => f.isHiddenIssue);
  const highCodeIssues = analysis.codeHealthIssues.filter((i) => i.severity === 'high');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-500">
          <button
            onClick={() => onNavigateToTab('overview')}
            className="text-neutral-700 hover:underline font-semibold"
          >
            {analysis.projectName}
          </button>
          <span>/</span>
          <span className="text-neutral-900 font-bold">Insights Suite</span>
          {activeTab !== 'overview' && (
            <>
              <span>/</span>
              <span className="text-[#833AB4] font-bold capitalize">
                {activeTab === 'readiness' ? 'Before You Submit' : activeTab.replace('_', ' ')}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onOpenLearningGuide}
          className="text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1.5 font-medium"
        >
          <HelpCircle className="h-3.5 w-3.5 text-[#833AB4]" />
          <span>Beginner Learning Guide</span>
        </button>
      </div>

      {/* Main Suite Header */}
      <div className="rounded-3xl border border-neutral-100 bg-gradient-to-r from-white via-[#FAF9FC] to-[#FFF5F8]/40 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white px-3 py-1 text-xs font-semibold text-neutral-800 shadow-2xs">
              <Sparkles className="h-3 w-3 text-[#E1306C]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#833AB4] font-bold">
                Project Intelligence Suite
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-600 font-medium">4 Diagnostic Lenses</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              Project Insights & Diagnostics
            </h1>
            <p className="text-sm text-neutral-600 font-medium max-w-2xl leading-relaxed">
              Explore deep findings, anatomical rubric diagnostics, pre-flight submission readiness, and code execution health — all grounded in your actual code and data.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 text-center shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Total Findings
              </span>
              <span className="font-display text-2xl font-extrabold text-neutral-900 tabular-nums">
                {analysis.findings.length}
              </span>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-[#FFFDF5] p-3.5 text-center shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block">
                Must-Fix Items
              </span>
              <span className="font-display text-2xl font-extrabold text-[#E5484D] tabular-nums">
                {criticalFindings.length}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-[#F2FBF6] p-3.5 text-center shadow-2xs">
              <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                Overall Grade
              </span>
              <span className="font-display text-2xl font-extrabold text-neutral-900 tabular-nums">
                {analysis.overallGrade}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-neutral-200/60 pt-4">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <span>Overview & Hub</span>
          </button>

          <button
            onClick={() => handleTabChange('detective')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'detective'
                ? 'bg-[#833AB4] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-[#FAF8FF] hover:text-[#833AB4]'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Project Detective</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeTab === 'detective' ? 'bg-white/20 text-white' : 'bg-[#FAF8FF] text-[#833AB4]'
              }`}
            >
              {analysis.findings.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('autopsy')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'autopsy'
                ? 'bg-[#E1306C] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-[#FFF5F8] hover:text-[#E1306C]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Project Autopsy</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeTab === 'autopsy' ? 'bg-white/20 text-white' : 'bg-[#FFF5F8] text-[#E1306C]'
              }`}
            >
              5 Pillars
            </span>
          </button>

          <button
            onClick={() => handleTabChange('readiness')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'readiness'
                ? 'bg-[#20A464] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-[#F2FBF6] hover:text-[#20A464]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Before You Submit</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeTab === 'readiness' ? 'bg-white/20 text-white' : 'bg-[#F2FBF6] text-[#20A464]'
              }`}
            >
              Checklist
            </span>
          </button>

          <button
            onClick={() => handleTabChange('code_health')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'code_health'
                ? 'bg-[#405DE6] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-[#F4F8FF] hover:text-[#405DE6]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Code Health</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeTab === 'code_health' ? 'bg-white/20 text-white' : 'bg-[#F4F8FF] text-[#405DE6]'
              }`}
            >
              {analysis.codeHealthIssues.length} issues
            </span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW & HUB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Project Detective */}
            <div className="rounded-3xl border border-[#833AB4]/20 bg-gradient-to-br from-[#FAF8FF] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#833AB4] text-white shadow-xs">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#833AB4]/10 text-[#833AB4]">
                    Deep Diagnostic
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                    Project Detective
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "Find problems hiding inside your project."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Checks your notebook AST, execution sequences, and data profiles for hidden warnings: data leakage before train/test split, unseeded splits, and unhandled edge cases.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Total</span>
                    <span className="font-extrabold text-neutral-900 text-base">{analysis.findings.length}</span>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Verified</span>
                    <span className="font-extrabold text-[#20A464] text-base">{verifiedFindings.length}</span>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Hidden Issues</span>
                    <span className="font-extrabold text-[#F77737] text-base">{hiddenIssues.length}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('detective')}
                className="inline-flex items-center justify-between rounded-xl bg-[#833AB4] px-5 py-3 text-xs font-bold text-white hover:bg-[#742fa3] shadow-xs transition cursor-pointer"
              >
                <span>Open Project Detective →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: Project Autopsy */}
            <div className="rounded-3xl border border-[#E1306C]/20 bg-gradient-to-br from-[#FFF5F8] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E1306C] text-white shadow-xs">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E1306C]/10 text-[#E1306C]">
                    Visual Anatomy
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                    Project Autopsy
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "See what happened inside your project."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Interactive circular diagnostic hub breaking down project health across Data, Methodology, Modeling, Evaluation, and Documentation with evidence links.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.values(analysis.rubricScores).map((score) => (
                    <span
                      key={score.key}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-neutral-200/80 text-neutral-700 flex items-center gap-1.5"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          score.score >= 80
                            ? 'bg-[#20A464]'
                            : score.score >= 65
                            ? 'bg-[#405DE6]'
                            : score.score >= 50
                            ? 'bg-[#F77737]'
                            : 'bg-[#E5484D]'
                        }`}
                      />
                      <span>{score.name}: {score.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleTabChange('autopsy')}
                className="inline-flex items-center justify-between rounded-xl bg-[#E1306C] px-5 py-3 text-xs font-bold text-white hover:bg-[#ce2460] shadow-xs transition cursor-pointer"
              >
                <span>Launch Project Autopsy →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 3: Before You Submit */}
            <div className="rounded-3xl border border-[#20A464]/20 bg-gradient-to-br from-[#F2FBF6] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#20A464] text-white shadow-xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#20A464]/10 text-[#20A464]">
                    Pre-Flight Checklist
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                    Before You Submit
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "Know what to fix before submission."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Simple prioritized checklist of actionable improvements, ranked from Critical Must-Fix items to Polish, complete with copy-pasteable code fixes.
                </p>

                <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-700">Checklist Health</span>
                    <span className="text-[#20A464]">
                      {analysis.checklist.filter((c) => c.status === 'pass').length} / {analysis.checklist.length} Passed
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#20A464] rounded-full transition-all"
                      style={{
                        width: `${Math.round(
                          (analysis.checklist.filter((c) => c.status === 'pass').length / Math.max(1, analysis.checklist.length)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('readiness')}
                className="inline-flex items-center justify-between rounded-xl bg-[#20A464] px-5 py-3 text-xs font-bold text-white hover:bg-[#1a8852] shadow-xs transition cursor-pointer"
              >
                <span>Review Submission Checklist →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 4: Code Health */}
            <div className="rounded-3xl border border-[#405DE6]/20 bg-gradient-to-br from-[#F4F8FF] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#405DE6] text-white shadow-xs">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#405DE6]/10 text-[#405DE6]">
                    Execution & Static Audit
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                    Code Health
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "Audit cell sequences and static code structure."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Audits your notebook cell execution order, out-of-order execution counts, missing random seeds, and absolute file path references.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-bold">Notebook Cells</span>
                    <span className="font-extrabold text-neutral-900 text-base">{analysis.notebookCells.length}</span>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-bold">High Priority Issues</span>
                    <span className={`font-extrabold text-base ${highCodeIssues.length > 0 ? 'text-[#E5484D]' : 'text-neutral-700'}`}>
                      {highCodeIssues.length}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('code_health')}
                className="inline-flex items-center justify-between rounded-xl bg-[#405DE6] px-5 py-3 text-xs font-bold text-white hover:bg-[#324ece] shadow-xs transition cursor-pointer"
              >
                <span>Inspect Code Health →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECT DETECTIVE SUB-TAB */}
      {activeTab === 'detective' && (
        <ProjectDetective
          findings={analysis.findings}
          onOpenLearningGuide={onOpenLearningGuide}
        />
      )}

      {/* 3. PROJECT AUTOPSY SUB-TAB */}
      {activeTab === 'autopsy' && (
        <ProjectAutopsy
          analysis={analysis}
          onOpenLearningGuide={onOpenLearningGuide}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {/* 4. BEFORE YOU SUBMIT SUB-TAB */}
      {activeTab === 'readiness' && (
        <BeforeYouSubmit
          analysis={analysis}
          onNavigateToTab={onNavigateToTab}
          onOpenLearningGuide={onOpenLearningGuide}
        />
      )}

      {/* 5. CODE HEALTH SUB-TAB */}
      {activeTab === 'code_health' && (
        <CodeHealthView
          issues={analysis.codeHealthIssues}
          cells={analysis.notebookCells}
        />
      )}
    </div>
  );
};
