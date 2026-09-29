import React, { useState } from 'react';
import { EvidenceItem, RubricCategoryKey } from '../types/project';
import {
  Search,
  Copy,
  Check,
  FileCode,
  ExternalLink,
  Code2,
  HelpCircle,
  Eye,
  ArrowRight,
  Database,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface EvidenceExplorerProps {
  evidence: EvidenceItem[];
  onSelectEvidenceSnippet?: (item: EvidenceItem) => void;
  onOpenLearningGuide?: () => void;
}

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({
  evidence,
  onSelectEvidenceSnippet,
  onOpenLearningGuide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | RubricCategoryKey>('ALL');
  const [viewSourceItem, setViewSourceItem] = useState<EvidenceItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestedQuestions = [
    { label: 'Where are missing values handled?', query: 'missing' },
    { label: 'What model was used?', query: 'RandomForest' },
    { label: 'Where is train/test split?', query: 'train_test_split' },
    { label: 'How was accuracy evaluated?', query: 'accuracy' },
    { label: 'Where is documentation?', query: 'markdown' },
  ];

  const handleCopy = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEvidence = evidence.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSnippet = item.snippet.toLowerCase().includes(q);
      const matchExplanation = item.explanation.toLowerCase().includes(q);
      const matchLocation = item.location.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchSnippet || matchExplanation || matchLocation || matchTags;
    }
    return true;
  });

  const getSourceBadge = (item: EvidenceItem) => {
    if (item.sourceFile.endsWith('.ipynb')) {
      return {
        label: `NOTEBOOK ${item.location.toUpperCase()}`,
        style: 'bg-[#F4F8FF] text-[#405DE6] border-[#405DE6]/30',
      };
    }
    if (item.sourceFile.endsWith('.csv') || item.location.toLowerCase().includes('column')) {
      return {
        label: `DATASET ${item.location.toUpperCase()}`,
        style: 'bg-[#FFF8F5] text-[#F77737] border-[#F77737]/30',
      };
    }
    return {
      label: `CODE ${item.location.toUpperCase()}`,
      style: 'bg-[#FAF8FF] text-[#833AB4] border-[#833AB4]/30',
    };
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#405DE6] font-bold block">
              100% Traceable Research Engine
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              Evidence Explorer
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              "See exactly why RubricAI said something — jump directly to the notebook, code, or dataset proof."
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
            <span className="px-3 py-1 rounded-full bg-[#F4F8FF] text-[#405DE6] border border-[#405DE6]/20 font-bold">
              {evidence.length} evidence pieces indexed
            </span>
          </div>
        </div>

        {/* 2. Premium Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-4 w-4 text-[#833AB4]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask where something was found... (e.g. 'train_test_split', 'missing values', 'scaler')"
              className="w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-11 pr-20 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#833AB4] focus:outline-none focus:ring-2 focus:ring-[#833AB4]/20 transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-xs text-neutral-400 hover:text-neutral-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Query Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
            <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold shrink-0">
              Quick questions:
            </span>
            {suggestedQuestions.map((q) => (
              <button
                key={q.label}
                onClick={() => setSearchQuery(q.query)}
                className="rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-1 font-semibold text-neutral-600 hover:bg-[#FAF8FF] hover:border-[#833AB4]/30 hover:text-[#833AB4] transition shrink-0 shadow-2xs"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pt-2 border-t border-neutral-100">
          {(['ALL', 'data_handling', 'methodology', 'modeling', 'evaluation', 'documentation'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {cat === 'ALL'
                  ? 'All Evidence'
                  : cat === 'data_handling'
                    ? 'Data'
                    : cat === 'methodology'
                      ? 'Methodology'
                      : cat === 'modeling'
                        ? 'Modeling'
                        : cat === 'evaluation'
                          ? 'Evaluation'
                          : 'Documentation'}
              </button>
            )
          )}
        </div>

        <PlainEnglishHelpBanner
          question="Why does RubricAI care so much about evidence?"
          explanation="Our core principle is 'No evidence → no verified claim.' If a grader, student, or employer looks at this report, every single observation can be clicked to display the exact line of Python code or dataset cell that produced it."
          tip="Click 'View source →' on any evidence item to read its code snippet and relevance score."
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>

      {/* 3. Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvidence.length === 0 ? (
          <div className="md:col-span-2 rounded-3xl border border-neutral-100 bg-white p-12 text-center space-y-2">
            <p className="font-display text-sm font-bold text-neutral-800">
              No evidence matching "{searchQuery}"
            </p>
            <p className="text-xs text-neutral-500">
              Try searching for "imputer", "accuracy", "scaler", or reset the category filter.
            </p>
          </div>
        ) : (
          filteredEvidence.map((item) => {
            const badge = getSourceBadge(item);
            return (
              <div
                key={item.id}
                className="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6 shadow-xs space-y-4 brand-card-hover flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 truncate">
                      {item.sourceFile}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-extrabold text-neutral-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {item.explanation}
                  </p>

                  {/* Code Snippet Box */}
                  <div className="rounded-2xl bg-neutral-900 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>VERIFIED CODE EXTRACT</span>
                      <button
                        onClick={() => handleCopy(item.id, item.snippet)}
                        className="hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedId === item.id ? (
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
                    <pre className="font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{item.snippet}</code>
                    </pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectEvidenceSnippet) {
                        onSelectEvidenceSnippet(item);
                      } else {
                        setViewSourceItem(item);
                      }
                    }}
                    className="font-bold text-[#833AB4] hover:text-[#E1306C] flex items-center gap-1 transition text-xs shrink-0"
                  >
                    <span>View source →</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Source Modal Fallback */}
      {viewSourceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-neutral-100 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-[#833AB4]" />
                <h4 className="font-display font-bold text-base text-neutral-900">
                  {viewSourceItem.title}
                </h4>
              </div>
              <button
                onClick={() => setViewSourceItem(null)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
              >
                Close
              </button>
            </div>
            <pre className="rounded-2xl bg-neutral-900 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
              <code>{viewSourceItem.snippet}</code>
            </pre>
            <p className="text-xs text-neutral-600">{viewSourceItem.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
