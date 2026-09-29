import React, { useState } from 'react';
import { RubricCategoryScore, RubricCategoryKey, EvidenceItem } from '../types/project';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Database,
  GitBranch,
  Cpu,
  BarChart2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface RubricOverviewProps {
  rubricScores: Record<RubricCategoryKey, RubricCategoryScore>;
  overallScore: number;
  overallGrade: string;
  evidence: EvidenceItem[];
  onSelectEvidenceSnippet: (item: EvidenceItem) => void;
  onOpenLearningGuide?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const RubricOverview: React.FC<RubricOverviewProps> = ({
  rubricScores,
  overallScore,
  overallGrade,
  evidence,
  onSelectEvidenceSnippet,
  onOpenLearningGuide,
  onNavigateToTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RubricCategoryKey>('methodology');

  // Vibrant theme configuration for the 5 Rubric Categories
  const categoryThemes: Record<
    RubricCategoryKey,
    {
      title: string;
      icon: React.ReactNode;
      accentColor: string;
      cardBg: string;
      borderColor: string;
      barGradient: string;
      badgeColor: string;
      plainWhatItIs: string;
      plainDescription: (score: number, gaps: string[]) => string;
      topFinding: string;
    }
  > = {
    data_handling: {
      title: 'Data Handling',
      icon: <Database className="h-4 w-4" />,
      accentColor: '#405DE6',
      cardBg: 'bg-gradient-to-br from-[#F4F8FF] via-white to-white',
      borderColor: 'border-[#405DE6]/25',
      barGradient: 'from-[#405DE6] to-[#60A5FA]',
      badgeColor: 'text-[#405DE6] bg-[#F4F8FF] border-[#405DE6]/30',
      plainWhatItIs: 'Cleaning and preparing the raw data before teaching the computer.',
      plainDescription: (score) =>
        score >= 80
          ? 'We verified that your dataset was loaded, inspected, and checked for missing values.'
          : 'Your data was loaded, but some data-cleaning checks like missing value or duplicate handling could be improved.',
      topFinding: 'Missing values checked and imputed with mean values.',
    },
    methodology: {
      title: 'Methodology',
      icon: <GitBranch className="h-4 w-4" />,
      accentColor: '#833AB4',
      cardBg: 'bg-gradient-to-br from-[#FAF8FF] via-white to-white',
      borderColor: 'border-[#833AB4]/25',
      barGradient: 'from-[#833AB4] to-[#C084FC]',
      badgeColor: 'text-[#833AB4] bg-[#FAF8FF] border-[#833AB4]/30',
      plainWhatItIs: 'The scientific setup: separating study data from quiz data fairly.',
      plainDescription: (score, gaps) =>
        gaps.some((g) => g.includes('leakage'))
          ? 'Needs attention: We found evidence that data scaling happened before the train/test split, causing data leakage.'
          : 'Your train/test partitions were created, but ensure a random seed is set for reproducibility.',
      topFinding: 'Preprocessing scaler was fit across the entire dataset before split.',
    },
    modeling: {
      title: 'Modeling',
      icon: <Cpu className="h-4 w-4" />,
      accentColor: '#F77737',
      cardBg: 'bg-gradient-to-br from-[#FFF8F5] via-white to-white',
      borderColor: 'border-[#F77737]/25',
      barGradient: 'from-[#F77737] to-[#FDBA74]',
      badgeColor: 'text-[#F77737] bg-[#FFF8F5] border-[#F77737]/30',
      plainWhatItIs: 'Choosing and training algorithms to learn patterns.',
      plainDescription: (score) =>
        score >= 80
          ? 'We verified that multiple models were trained, allowing you to compare their performance.'
          : 'A machine-learning model was trained, but comparing against a simpler baseline model is recommended.',
      topFinding: 'Random Forest and Logistic Regression models trained.',
    },
    evaluation: {
      title: 'Evaluation',
      icon: <BarChart2 className="h-4 w-4" />,
      accentColor: '#E1306C',
      cardBg: 'bg-gradient-to-br from-[#FFF5F8] via-white to-white',
      borderColor: 'border-[#E1306C]/25',
      barGradient: 'from-[#E1306C] to-[#F472B6]',
      badgeColor: 'text-[#E1306C] bg-[#FFF5F8] border-[#E1306C]/30',
      plainWhatItIs: 'Checking how well your model actually performs on unseen data.',
      plainDescription: (score) =>
        score >= 80
          ? 'Performance was evaluated using appropriate metrics across test data.'
          : 'We found evidence that your model was evaluated, but relying solely on raw accuracy can hide errors on rare categories.',
      topFinding: 'Accuracy was measured (87.5%), but a confusion matrix or F1 score was not found.',
    },
    documentation: {
      title: 'Documentation',
      icon: <FileText className="h-4 w-4" />,
      accentColor: '#20A464',
      cardBg: 'bg-gradient-to-br from-[#F2FBF6] via-white to-white',
      borderColor: 'border-[#20A464]/25',
      barGradient: 'from-[#20A464] to-[#4ADE80]',
      badgeColor: 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30',
      plainWhatItIs: 'Explaining your research, charts, and conclusions in plain English.',
      plainDescription: (score) =>
        score >= 80
          ? 'Good presentation: Markdown cells explain the problem framing and summarize key takeaways.'
          : 'Add more narrative explanations and visual charts to guide your reader through the steps.',
      topFinding: 'Introductory and concluding discussion markdown sections present.',
    },
  };

  const getFriendlyStatus = (score: number, gaps: string[]) => {
    if (gaps.some((g) => g.includes('leakage'))) {
      return { label: 'Needs attention', tone: 'text-[#E5484D] bg-[#FFF5F5] border-[#E5484D]/30' };
    }
    if (score >= 85) {
      return { label: 'Strong', tone: 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30' };
    }
    if (score >= 70) {
      return { label: 'Solid', tone: 'text-[#405DE6] bg-[#F4F8FF] border-[#405DE6]/30' };
    }
    return { label: 'Action recommended', tone: 'text-[#F77737] bg-[#FFF8F5] border-[#F77737]/30' };
  };

  const selectedCategoryScore = rubricScores[selectedCategory];
  const selectedTheme = categoryThemes[selectedCategory];
  const categoryEvidence = evidence.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* 1. Header with Plain English Description */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block">
              5 Core Dimensions · 20% Weight Each
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              The Five-Pillar Rubric Review
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              "We check the five areas that university professors and industry evaluators care about."
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Overall Score
              </span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="font-display text-2xl font-extrabold text-neutral-900">{overallGrade}</span>
                <span className="font-mono text-xs font-bold text-neutral-500">({overallScore}/100)</span>
              </div>
            </div>
          </div>
        </div>

        <PlainEnglishHelpBanner
          question="How does RubricAI evaluate each of the five areas?"
          explanation="Every project is evaluated across 5 equal 20% categories: Data Handling, Methodology, Modeling, Evaluation, and Documentation. Unlike human graders who might skim, RubricAI searches for concrete proof in your code, markdown, and dataset. If proof exists, points are earned. If a gap is found, we give you the exact lines of code to fix it."
          tip="Click on any rubric card below to inspect its detailed checklist and evidence snippets."
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>

      {/* 2. The 5 Colorful Category Cards with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(Object.keys(rubricScores) as RubricCategoryKey[]).map((catKey) => {
          const cat = rubricScores[catKey];
          const theme = categoryThemes[catKey];
          const isSelected = selectedCategory === catKey;
          const status = getFriendlyStatus(cat.score, cat.gaps);
          const evidenceCount = evidence.filter((e) => e.category === catKey).length;

          return (
            <div
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`rounded-2xl border p-5 space-y-3 cursor-pointer transition-all duration-200 brand-card-hover flex flex-col justify-between ${
                theme.cardBg
              } ${
                isSelected
                  ? `${theme.borderColor} ring-2 ring-[${theme.accentColor}]/20 shadow-md`
                  : 'border-neutral-200/80 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-2xs"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    {theme.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.tone}`}>
                    {status.label}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-neutral-900 text-sm">
                    {theme.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-snug pt-0.5">
                    {theme.plainWhatItIs}
                  </p>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-neutral-700">{cat.score}%</span>
                    <span className="text-[10px] text-neutral-400">+{cat.weightedScore} pts</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.barGradient} rounded-full`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                <span>{evidenceCount} evidence items</span>
                <span
                  className="font-bold flex items-center gap-0.5 transition"
                  style={{ color: theme.accentColor }}
                >
                  <span>Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Deep Dive for the Selected Category */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-xs"
              style={{ backgroundColor: selectedTheme.accentColor }}
            >
              {selectedTheme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-extrabold text-neutral-900">
                  {selectedTheme.title} Details
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedTheme.badgeColor}`}>
                  Weight: 20%
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                {selectedTheme.plainWhatItIs}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-400 text-[10px] block uppercase font-bold">Category Score</span>
              <span className="font-display text-xl font-extrabold text-neutral-900">{selectedCategoryScore.score} / 100</span>
            </div>
            <div className="border-l border-neutral-200 pl-4">
              <span className="text-neutral-400 text-[10px] block uppercase font-bold">Grade</span>
              <span className="font-display text-xl font-extrabold text-neutral-900">{selectedCategoryScore.letterGrade}</span>
            </div>
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#20A464]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verified Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-neutral-700">
              {selectedCategoryScore.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#20A464] shrink-0 mt-1.5"></span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-[#FFFDF5] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span>Gaps & Opportunities to Improve</span>
            </div>
            <ul className="space-y-2 text-xs text-neutral-700">
              {selectedCategoryScore.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Criteria Checklist */}
        <div className="space-y-3 pt-2">
          <h4 className="font-display text-sm font-bold text-neutral-900">
            Criteria Breakdown ({selectedCategoryScore.criteria.length} audited items)
          </h4>
          <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 overflow-hidden text-xs">
            {selectedCategoryScore.criteria.map((crit) => (
              <div key={crit.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/60 transition">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        crit.status === 'passed'
                          ? 'bg-[#20A464]'
                          : crit.status === 'partial'
                            ? 'bg-[#F77737]'
                            : 'bg-[#E5484D]'
                      }`}
                    />
                    <span className="font-bold text-neutral-900">{crit.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      ({crit.earnedPoints} / {crit.maxPoints} pts)
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed pl-4">
                    {crit.summary}
                  </p>
                </div>
                <span
                  className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    crit.status === 'passed'
                      ? 'bg-[#F2FBF6] text-[#20A464] border border-[#20A464]/30'
                      : crit.status === 'partial'
                        ? 'bg-[#FFF8F5] text-[#F77737] border border-[#F77737]/30'
                        : 'bg-[#FFF5F5] text-[#E5484D] border border-[#E5484D]/30'
                  }`}
                >
                  {crit.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grounded Evidence Items in this Category */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-neutral-900">
              Grounded Evidence in {selectedTheme.title} ({categoryEvidence.length} items)
            </h4>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('evidence')}
                className="text-xs font-bold text-[#833AB4] hover:text-[#E1306C] flex items-center gap-1 transition"
              >
                <span>Open in Evidence Explorer</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryEvidence.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectEvidenceSnippet(item)}
                className="rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-4 text-xs space-y-2 cursor-pointer brand-card-hover hover:border-[#833AB4]/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 truncate max-w-[200px]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[10px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-600">
                    {item.location}
                  </span>
                </div>
                <pre className="rounded-xl bg-neutral-900 p-2.5 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                  <code>{item.snippet.slice(0, 90)}...</code>
                </pre>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                  <span>File: {item.sourceFile}</span>
                  <span className="text-[#833AB4] font-bold">Click to view snippet →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
