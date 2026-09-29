import React from 'react';
import { ProjectAnalysis } from '../types/project';
import {
  FileText,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  FolderGit2,
  FileSpreadsheet,
  Folder,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface ProjectHeaderProps {
  analysis: ProjectAnalysis;
  onOpenReport: () => void;
  onOpenEvidence: () => void;
  onReanalyze: () => void;
  onOpenLearningGuide?: () => void;
  onOpenGoogleDrive?: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  analysis,
  onOpenReport,
  onOpenEvidence,
  onOpenLearningGuide,
  onOpenGoogleDrive,
}) => {
  const verifiedCount = analysis.findings.filter((f) => f.confidence === 'VERIFIED').length;
  const criticalCount = analysis.findings.filter((f) => f.severity === 'critical').length;
  const warningCount = analysis.findings.filter((f) => f.severity === 'warning').length;

  // Determine Project Health qualitative badge & styling
  let healthLabel = 'Strong Foundations';
  let healthTone = 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30';
  let healthDescription = 'Your project meets standard data science practices with sound foundations.';

  if (criticalCount > 0) {
    healthLabel = 'Needs Attention';
    healthTone = 'text-[#E5484D] bg-[#FFF5F5] border-[#E5484D]/30';
    healthDescription = 'We detected a few important items (like data leakage) that should be resolved before you submit.';
  } else if (warningCount > 1) {
    healthLabel = 'Recommended Improvements';
    healthTone = 'text-[#F77737] bg-[#FFF8F5] border-[#F77737]/30';
    healthDescription = 'The project runs well, with a couple of recommended improvements to elevate your grade.';
  } else if (analysis.evidence.length < 3) {
    healthLabel = 'More Evidence Needed';
    healthTone = 'text-[#405DE6] bg-[#F4F8FF] border-[#405DE6]/30';
    healthDescription = 'Upload your full notebook or dataset so RubricAI can verify all five rubric areas.';
  }

  return (
    <div className="border-b border-neutral-100 bg-gradient-to-b from-white to-[#FAF9FC] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top: "Good to see you." & Project Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block">
              Good to see you.
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Colorful Project Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-xs shrink-0">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                {analysis.projectName}
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${healthTone}`}>
                {healthLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed font-medium">
              {healthDescription}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4285F4]/30 bg-[#F4F8FF] px-4 py-2.5 text-xs font-bold text-[#4285F4] shadow-2xs hover:bg-[#FAF8FF] transition cursor-pointer"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Google Drive</span>
              </button>
            )}
            <button
              onClick={onOpenEvidence}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 shadow-2xs hover:border-[#405DE6]/30 hover:bg-[#F4F8FF] hover:text-[#405DE6] transition"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Evidence</span>
            </button>
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generate Full Report</span>
            </button>
          </div>
        </div>

        {/* Clean 4-Card Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Project Health */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 space-y-1 shadow-2xs brand-card-hover">
            <span className="text-[10px] font-mono uppercase text-[#833AB4] font-bold block">
              Project Health
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-extrabold text-neutral-900">
                {analysis.overallGrade}
              </span>
              <span className="font-mono text-xs font-bold text-neutral-400">
                ({analysis.overallScore}/100)
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              {analysis.files.length} file{analysis.files.length > 1 ? 's' : ''} inspected
            </div>
          </div>

          {/* Card 2: Grounded Evidence */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 space-y-1 shadow-2xs brand-card-hover">
            <span className="text-[10px] font-mono uppercase text-[#405DE6] font-bold block">
              Grounded Evidence
            </span>
            <div className="font-display text-2xl font-extrabold text-neutral-900 tabular-nums">
              {analysis.evidence.length}
            </div>
            <div className="text-[11px] text-neutral-500">
              Verified from code & dataset
            </div>
          </div>

          {/* Card 3: Findings */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 space-y-1 shadow-2xs brand-card-hover">
            <span className="text-[10px] font-mono uppercase text-[#F77737] font-bold block">
              Findings
            </span>
            <div className="font-display text-2xl font-extrabold text-neutral-900 tabular-nums">
              {analysis.findings.length}
            </div>
            <div className="text-[11px] text-neutral-500">
              {criticalCount > 0 ? (
                <span className="text-[#E5484D] font-bold">{criticalCount} must-fix item{criticalCount > 1 ? 's' : ''}</span>
              ) : (
                <span className="text-[#20A464] font-bold">All clear</span>
              )}
            </div>
          </div>

          {/* Card 4: Rubric Areas */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-4 space-y-1 shadow-2xs brand-card-hover">
            <span className="text-[10px] font-mono uppercase text-[#E1306C] font-bold block">
              Rubric Areas
            </span>
            <div className="font-display text-2xl font-extrabold text-neutral-900">
              5/5
            </div>
            <div className="text-[11px] text-neutral-500">
              Data, Method, Model, Eval, Doc
            </div>
          </div>
        </div>

        {/* Plain English Help Accordion */}
        <PlainEnglishHelpBanner
          question="What is Evidence Coverage and how does RubricAI review a project?"
          explanation="Evidence Coverage measures how much of your project RubricAI could verify from the actual files you provided. Unlike generic AI tools that guess what your project does, RubricAI never invents evidence. If a requirement is found in your code or dataset, we highlight the exact line number. If something is missing, we explain why it matters and how to add it."
          tip="Click on any card below to see the exact lines in your notebook or dataset where RubricAI verified each step."
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>
    </div>
  );
};
