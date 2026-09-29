import React from 'react';
import {
  ArrowRight,
  Play,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Search,
  Activity,
  Bot,
  HelpCircle,
  Eye,
  FileCheck,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react';
import { ProjectAnalysis } from '../types/project';

interface HeroSectionProps {
  onAnalyzeProject: () => void;
  onExploreDemo: () => void;
  onNavigateToTab: (tab: string) => void;
  analysisPreview: ProjectAnalysis;
  onOpenLearningGuide: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeProject,
  onExploreDemo,
  onNavigateToTab,
  analysisPreview,
  onOpenLearningGuide,
}) => {
  const verifiedCount = analysisPreview.findings.filter((f) => f.confidence === 'VERIFIED').length;
  const criticalCount = analysisPreview.findings.filter((f) => f.severity === 'critical').length;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#FAF9FC] to-[#FFFFFF] pt-12 pb-24 border-b border-neutral-100">
      {/* Decorative Vibrant Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-r from-[#833AB4]/10 via-[#E1306C]/10 to-[#F77737]/10 blur-3xl opacity-70" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. HERO HEADER: Title & Subtitle */}
        <div className="mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#E1306C] animate-pulse"></span>
            <span className="font-mono text-[11px] tracking-wide text-neutral-500 uppercase">
              Student Project Review Engine
            </span>
            <span className="text-neutral-300">·</span>
            <span className="brand-gradient-text font-bold">100% Evidence Grounded</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.08] text-balance">
            Understand your project.
            <br />
            <span className="brand-gradient-text">Prove the evidence.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto font-medium">
            RubricAI reviews your data-science project, finds potential issues, shows the evidence, and tells you what to improve.
          </p>
        </div>

        {/* 2. SIMPLE 4-STEP PROCESS DIRECTLY UNDER TITLE */}
        <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-200/90 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-xs space-y-8">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FFF0F5] text-[#E1306C] border border-[#E1306C]/20">
              <Sparkles className="h-3 w-3" />
              Simple 4-Step Process
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              From project to clarity in four steps.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
              You do not need to be an expert in machine learning to understand your results.
            </p>
          </div>

          {/* All 4 Steps Cards in Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {/* Step 1: UPLOAD (Blue) */}
            <div className="relative rounded-2xl border-2 border-[#405DE6]/15 bg-gradient-to-b from-[#F4F8FF]/80 to-white p-5 space-y-3.5 shadow-2xs hover:border-[#405DE6]/40 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#405DE6] text-white font-display font-extrabold text-base shadow-xs group-hover:scale-110 transition-transform">
                  1
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#405DE6] bg-[#405DE6]/10 px-2 py-0.5 rounded-md">
                  Step 1
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-neutral-900 tracking-tight">
                  UPLOAD
                </h3>
                <p className="font-semibold text-xs text-neutral-800 pt-1">
                  "Give RubricAI your notebook and dataset."
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Drop in your <span className="font-mono text-[11px] text-neutral-800 font-semibold">.ipynb</span> notebook or CSV dataset with one click. No API keys needed.
              </p>
            </div>

            {/* Step 2: INVESTIGATE (Pink) */}
            <div className="relative rounded-2xl border-2 border-[#E1306C]/15 bg-gradient-to-b from-[#FFF5F8]/80 to-white p-5 space-y-3.5 shadow-2xs hover:border-[#E1306C]/40 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E1306C] text-white font-display font-extrabold text-base shadow-xs group-hover:scale-110 transition-transform">
                  2
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#E1306C] bg-[#E1306C]/10 px-2 py-0.5 rounded-md">
                  Step 2
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-neutral-900 tracking-tight">
                  INVESTIGATE
                </h3>
                <p className="font-semibold text-xs text-neutral-800 pt-1">
                  "RubricAI examines what is actually inside."
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Inspects real code AST, cell execution sequences, missing values, and train/test splits.
              </p>
            </div>

            {/* Step 3: UNDERSTAND (Orange) */}
            <div className="relative rounded-2xl border-2 border-[#F77737]/15 bg-gradient-to-b from-[#FFF8F5]/80 to-white p-5 space-y-3.5 shadow-2xs hover:border-[#F77737]/40 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F77737] text-white font-display font-extrabold text-base shadow-xs group-hover:scale-110 transition-transform">
                  3
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#F77737] bg-[#F77737]/10 px-2 py-0.5 rounded-md">
                  Step 3
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-neutral-900 tracking-tight">
                  UNDERSTAND
                </h3>
                <p className="font-semibold text-xs text-neutral-800 pt-1">
                  "See what is strong and what needs attention."
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Clear explanations in plain English, backed by grounded evidence from your files.
              </p>
            </div>

            {/* Step 4: IMPROVE (Green) */}
            <div className="relative rounded-2xl border-2 border-[#20A464]/15 bg-gradient-to-b from-[#F2FBF6]/80 to-white p-5 space-y-3.5 shadow-2xs hover:border-[#20A464]/40 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#20A464] text-white font-display font-extrabold text-base shadow-xs group-hover:scale-110 transition-transform">
                  4
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#20A464] bg-[#20A464]/10 px-2 py-0.5 rounded-md">
                  Step 4
                </span>
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-neutral-900 tracking-tight">
                  IMPROVE
                </h3>
                <p className="font-semibold text-xs text-neutral-800 pt-1">
                  "Fix the important things before you submit."
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Get copyable code fixes and a prioritized checklist to submit with complete confidence.
              </p>
            </div>
          </div>

          {/* 3. OPTION FOR START A REVIEW AND EXPLORE DEMO DIRECTLY UNDER STEPS */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col items-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full">
              <button
                onClick={onAnalyzeProject}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-8 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:opacity-95 active:scale-98 transition transform duration-150 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Start a Review →</span>
              </button>
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 bg-white px-7 py-3.5 text-sm font-bold text-neutral-700 hover:border-[#E1306C]/40 hover:bg-[#FFF5F8] hover:text-[#833AB4] transition active:scale-98 shadow-2xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current text-[#F77737]" />
                <span>Explore Demo</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-medium text-neutral-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#20A464]" />
                <span>Jupyter (.ipynb) & Python (.py)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#20A464]" />
                <span>CSV & Excel Datasets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#20A464]" />
                <span>No API keys needed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Hero Visual: Realistic RubricAI Product Composition with Floating Badges */}
        <div className="relative mx-auto max-w-5xl">
          {/* Floating Pill Badges */}
          <div className="hidden lg:flex items-center gap-2 absolute -top-5 -left-6 z-20 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md animate-bounce duration-1000">
            <div className="h-7 w-7 rounded-xl bg-[#FAF8FF] text-[#833AB4] flex items-center justify-center">
              <Search className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">7 findings detected</div>
              <div className="text-[10px] text-neutral-500 font-mono">1 critical must-fix</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 absolute -top-5 -right-6 z-20 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
            <div className="h-7 w-7 rounded-xl bg-[#F2FBF6] text-[#20A464] flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">48 evidence items</div>
              <div className="text-[10px] text-emerald-700 font-medium">100% verified trace</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 -left-4 z-20 rounded-2xl border border-amber-200 bg-[#FFFDF5] px-4 py-2.5 shadow-xl">
            <div className="h-7 w-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">Evaluation needs attention</div>
              <div className="text-[10px] text-amber-700">Add F1 score & confusion matrix</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 -right-4 z-20 rounded-2xl border border-blue-200 bg-[#F4F8FF] px-4 py-2.5 shadow-xl">
            <div className="h-7 w-7 rounded-xl bg-blue-100 text-[#405DE6] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900">Evidence verified</div>
              <div className="text-[10px] text-blue-700 font-mono">Cell 4 · Cell 6 · Line 28</div>
            </div>
          </div>

          {/* Main Dashboard Preview Card */}
          <div className="rounded-3xl border border-neutral-200/90 bg-white p-2 shadow-2xl overflow-hidden brand-card-hover">
            {/* Top Workspace Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 bg-[#FAF9FC] px-6 py-3.5 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E5484D]/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#20A464]/80"></span>
                </div>
                <div className="h-4 w-px bg-neutral-200" />
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold text-neutral-900">
                    {analysisPreview.projectName}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF0F5] text-[#E1306C] border border-[#E1306C]/20">
                    Active Audit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
                <span className="font-mono text-[11px] text-neutral-600">
                  {analysisPreview.evidence.length} evidence points cataloged
                </span>
                <button
                  onClick={() => onNavigateToTab('rubric')}
                  className="font-bold text-[#833AB4] hover:text-[#E1306C] flex items-center gap-1 transition"
                >
                  <span>Open workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 5-Pillar Realistic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-neutral-100 p-2 text-xs">
              {/* Box 1: Project Health */}
              <div className="p-5 space-y-2 bg-[#FAF8FF]/40 rounded-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#833AB4] font-bold block">
                  Project Health
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-neutral-900">
                    {analysisPreview.overallGrade}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 font-mono">
                    ({analysisPreview.overallScore}/100)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#833AB4] to-[#E1306C] rounded-full"
                    style={{ width: `${analysisPreview.overallScore}%` }}
                  />
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed pt-1">
                  Overall foundations are sound. 1 critical methodological item needs attention.
                </p>
              </div>

              {/* Box 2: Grounded Evidence */}
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#405DE6] font-bold block">
                  Grounded Evidence
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold text-neutral-900">
                    {analysisPreview.evidence.length}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">proof items</span>
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Every claim is tied directly to cells in <span className="font-mono text-[10px] text-neutral-800">.ipynb</span> and columns in CSV.
                </p>
              </div>

              {/* Box 3: Findings */}
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F77737] font-bold block">
                  Invariant Findings
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold text-neutral-900">
                    {verifiedCount}
                  </span>
                  <span className="text-xs font-bold text-[#E5484D]">
                    ({criticalCount} must-fix)
                  </span>
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Detected data leakage prior to split and missing random seed for reproducible runs.
                </p>
              </div>

              {/* Box 4: Rubric Pillars */}
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E1306C] font-bold block">
                  Rubric Status
                </span>
                <div className="space-y-1.5 font-medium text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Data</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F2FBF6] text-[#20A464]">
                      Strong (90%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Methodology</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF9F2] text-[#F77737]">
                      Leakage (60%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Evaluation</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF5F8] text-[#E1306C]">
                      Partial (65%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 5: Next Actionable Recommendation */}
              <div className="p-5 space-y-2 bg-[#FFFDF5] rounded-xl flex flex-col justify-between border border-amber-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                    Highest Priority Fix
                  </span>
                  <p className="text-[11px] text-neutral-800 font-semibold leading-snug">
                    Move your StandardScaler fit after train_test_split to prevent feature peeking.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab('readiness')}
                  className="text-[11px] font-bold text-[#833AB4] hover:text-[#E1306C] text-left pt-2 flex items-center gap-1 transition"
                >
                  <span>Readiness checklist</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. "Everything you need before you submit" - MODERN FEATURE EDITORIAL GRID */}
        <div className="space-y-10 border-t border-neutral-100 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block mb-1">
                Comprehensive Toolkit
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                Everything you need before you submit.
              </h2>
            </div>
            <button
              onClick={onOpenLearningGuide}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#833AB4] hover:text-[#E1306C] transition underline"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Need help with terms? Open Student Learning Guide</span>
            </button>
          </div>

          {/* Asymmetric Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: PROJECT DETECTIVE (Spans 2 columns on desktop) - Purple */}
            <div className="md:col-span-2 rounded-3xl border border-[#833AB4]/20 bg-gradient-to-br from-[#FAF8FF] via-white to-white p-7 sm:p-8 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
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
                    PROJECT DETECTIVE
                  </h3>
                  <p className="font-semibold text-neutral-800 text-sm pt-1">
                    "Find problems hiding inside your project."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
                  RubricAI checks your notebook, code and data for warning signs that may affect your project: data leakage before train/test split, unseeded splits, missing value handling, and evaluation gaps.
                </p>

                {/* Mini UI Preview snippet */}
                <div className="rounded-xl border border-neutral-200/80 bg-white p-3.5 space-y-1.5 font-mono text-[11px] text-neutral-700 shadow-2xs">
                  <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                    <span>INSPECTION PREVIEW</span>
                    <span className="text-[#833AB4] font-bold">VERIFIED</span>
                  </div>
                  <div className="text-neutral-900 font-semibold truncate">
                    Found StandardScaler.fit_transform(X) executed before train_test_split.
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('detective')}
                className="inline-flex items-center justify-between rounded-xl bg-[#833AB4] px-5 py-3 text-xs font-bold text-white hover:bg-[#742fa3] shadow-xs transition"
              >
                <span>Find hidden problems →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: PROJECT AUTOPSY - Pink */}
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
                  <h3 className="font-display text-xl font-extrabold text-neutral-900">
                    PROJECT AUTOPSY
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "See what happened inside your project."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Get a visual health check of your data, methodology, model, evaluation and documentation with interactive 5-pillar drill down.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('autopsy')}
                className="inline-flex items-center justify-between rounded-xl bg-[#E1306C] px-5 py-3 text-xs font-bold text-white hover:bg-[#ce2460] shadow-xs transition"
              >
                <span>See what happened inside →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 3: EVIDENCE EXPLORER - Blue */}
            <div className="rounded-3xl border border-[#405DE6]/20 bg-gradient-to-br from-[#F4F8FF] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#405DE6] text-white shadow-xs">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#405DE6]/10 text-[#405DE6]">
                    100% Traceable
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-neutral-900">
                    EVIDENCE EXPLORER
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "See exactly why RubricAI said something."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Jump directly to the notebook cell, code line, or dataset column behind any observation. No guessing.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('evidence')}
                className="inline-flex items-center justify-between rounded-xl bg-[#405DE6] px-5 py-3 text-xs font-bold text-white hover:bg-[#324ece] shadow-xs transition"
              >
                <span>Explore evidence →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 4: FIND HIDDEN ISSUES - Orange */}
            <div className="rounded-3xl border border-[#F77737]/20 bg-gradient-to-br from-[#FFF8F5] via-white to-white p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F77737] text-white shadow-xs">
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F77737]/10 text-[#F77737]">
                    Edge Cases
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-neutral-900">
                    FIND HIDDEN ISSUES
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "Look beyond the surface."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Detects subtle reproducibility gaps, unhandled categorical extremes, and hardcoded local file paths.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('detective')}
                className="inline-flex items-center justify-between rounded-xl bg-[#F77737] px-5 py-3 text-xs font-bold text-white hover:bg-[#e66627] shadow-xs transition"
              >
                <span>Find hidden issues →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 5: ASK RUBRICAI - Purple & Pink */}
            <div className="rounded-3xl border border-[#833AB4]/20 bg-gradient-to-br from-[#FAF8FF] via-white to-[#FFF5F8] p-7 space-y-6 shadow-sm brand-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-xs">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#833AB4]/10 text-[#833AB4]">
                    AI Assistant
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-neutral-900">
                    ASK RUBRICAI
                  </h3>
                  <p className="font-semibold text-neutral-800 text-xs pt-1">
                    "Have a conversation with your project."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Ask questions about your actual files and get instant answers grounded strictly in project evidence.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('ask')}
                className="inline-flex items-center justify-between rounded-xl bg-gradient-to-r from-[#833AB4] to-[#E1306C] px-5 py-3 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
              >
                <span>Ask questions →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 6: BEFORE YOU SUBMIT - Green (Full width span across 3 cols on large screens) */}
            <div className="md:col-span-3 rounded-3xl border border-[#20A464]/20 bg-gradient-to-r from-[#F2FBF6] via-white to-[#F2FBF6] p-7 sm:p-8 space-y-5 shadow-sm brand-card-hover flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#20A464] text-white shadow-xs">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#20A464]/10 text-[#20A464]">
                    Pre-Flight Safety Net
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                    BEFORE YOU SUBMIT
                  </h3>
                  <p className="font-semibold text-neutral-800 text-sm pt-0.5">
                    "Know what to fix before submission."
                  </p>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Get a simple prioritized checklist of the things worth improving before your instructor or evaluator sees it, with copyable code templates.
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('readiness')}
                className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-[#20A464] px-7 py-3.5 text-xs font-bold text-white hover:bg-[#1a8852] shadow-md transition"
              >
                <span>Check readiness →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="rounded-3xl border border-neutral-200/90 bg-gradient-to-r from-[#FAF8FF] via-[#FFF5F8] to-[#FFF8F5] p-8 sm:p-10 text-center space-y-5 shadow-sm">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Ready to verify your student data science project?
            </h3>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto">
              Inspect your machine learning code, verify rubric criteria, and get actionable recommendations in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={onAnalyzeProject}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-8 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:opacity-95 active:scale-98 transition transform duration-150 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Start a Review →</span>
              </button>
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-300 bg-white px-7 py-3.5 text-sm font-bold text-neutral-700 hover:border-[#E1306C]/40 hover:bg-[#FFF5F8] hover:text-[#833AB4] transition active:scale-98 shadow-2xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current text-[#F77737]" />
                <span>Explore Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
