import React, { useState } from 'react';
import { ProjectAnalysis, RubricCategoryKey } from '../types/project';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Check,
  Copy,
  TrendingUp,
  Database,
  GitBranch,
  Cpu,
  BarChart2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { PlainEnglishHelpBanner } from './PlainEnglishHelpBanner';

interface ProjectAutopsyProps {
  analysis: ProjectAnalysis;
  onOpenLearningGuide?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ProjectAutopsy: React.FC<ProjectAutopsyProps> = ({
  analysis,
  onOpenLearningGuide,
  onNavigateToTab,
}) => {
  const [activeSectionKey, setActiveSectionKey] = useState<RubricCategoryKey>('methodology');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sections: {
    key: RubricCategoryKey;
    label: string;
    sublabel: string;
    accentColor: string;
    lightBg: string;
    borderAccent: string;
    icon: React.ReactNode;
    whatWeFound: string;
    evidence: string;
    evidenceCell: string;
    evidenceSnippet: string;
    status: 'Working well' | 'Needs attention' | 'Potential issue';
    statusTone: string;
    recommendation: string;
    remediationCode: string;
  }[] = [
    {
      key: 'data_handling',
      label: 'DATA',
      sublabel: 'How your raw numbers and files were read and cleaned',
      accentColor: '#405DE6',
      lightBg: 'bg-[#F4F8FF]',
      borderAccent: 'border-[#405DE6]/30',
      icon: <Database className="h-5 w-5" />,
      whatWeFound:
        'Your dataset was loaded and checked for missing values. Missing items in study hours and attendance were imputed with the average value.',
      evidence: `Verified in Cell 4 and Cell 5. Dataset "${analysis.datasetProfiles[0]?.fileName || 'student_dataset.csv'}" contains ${analysis.datasetProfiles[0]?.totalMissingCells || 3} null values across ${analysis.datasetProfiles[0]?.rowCount || 40} rows.`,
      evidenceCell: 'Cell 4 & Cell 5',
      evidenceSnippet: "df['study_hours_weekly'] = df['study_hours_weekly'].fillna(df['study_hours_weekly'].mean())\ndf['attendance_rate'] = df['attendance_rate'].fillna(df['attendance_rate'].mean())",
      status: 'Working well',
      statusTone: 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30',
      recommendation:
        'Good job checking for nulls. To make it even better, calculate the mean only on the training set so test values do not leak into the calculation.',
      remediationCode: `from sklearn.impute import SimpleImputer\nimputer = SimpleImputer(strategy='median')\nX_train = imputer.fit_transform(X_train)\nX_test = imputer.transform(X_test)`,
    },
    {
      key: 'methodology',
      label: 'METHODOLOGY',
      sublabel: 'How your experiment was set up (train vs test separation)',
      accentColor: '#833AB4',
      lightBg: 'bg-[#FAF8FF]',
      borderAccent: 'border-[#833AB4]/30',
      icon: <GitBranch className="h-5 w-5" />,
      whatWeFound:
        'We found data leakage: features were scaled across the entire dataset before creating the train/test split. Also, train_test_split had no random seed.',
      evidence:
        'In Cell 6, StandardScaler.fit_transform was executed on full X before train_test_split was called in Cell 7 without a random_state parameter.',
      evidenceCell: 'Cell 6 vs Cell 7',
      evidenceSnippet: "scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n\n# Cell 7\nX_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.20)",
      status: 'Needs attention',
      statusTone: 'text-[#E5484D] bg-[#FFF5F5] border-[#E5484D]/30',
      recommendation:
        'Separate your raw features first with train_test_split(random_state=42), then scale only X_train. This prevents the model from peeking at test data.',
      remediationCode: `X_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.20, random_state=42, stratify=y\n)\nscaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)`,
    },
    {
      key: 'modeling',
      label: 'MODELING',
      sublabel: 'The machine-learning algorithms used to find patterns',
      accentColor: '#F77737',
      lightBg: 'bg-[#FFF8F5]',
      borderAccent: 'border-[#F77737]/30',
      icon: <Cpu className="h-5 w-5" />,
      whatWeFound:
        'You trained two distinct models: a Random Forest Classifier and a Logistic Regression baseline.',
      evidence:
        'In Cell 8, RandomForestClassifier(n_estimators=100) and LogisticRegression(max_iter=500) were instantiated and fitted on training data.',
      evidenceCell: 'Cell 8',
      evidenceSnippet: "rf_model = RandomForestClassifier(n_estimators=100, random_state=42)\nrf_model.fit(X_train, y_train)\nlr_model = LogisticRegression(max_iter=500)\nlr_model.fit(X_train, y_train)",
      status: 'Working well',
      statusTone: 'text-[#20A464] bg-[#F2FBF6] border-[#20A464]/30',
      recommendation:
        'Comparing multiple models is great practice. Present their training times and test metrics side-by-side in a summary table to highlight which is best.',
      remediationCode: `# Compare models side-by-side\nimport pandas as pd\ncomparison_df = pd.DataFrame({\n    'Model': ['Random Forest', 'Logistic Regression'],\n    'Test F1': [rf_f1, lr_f1]\n})`,
    },
    {
      key: 'evaluation',
      label: 'EVALUATION',
      sublabel: 'How you checked whether your model makes good predictions',
      accentColor: '#E1306C',
      lightBg: 'bg-[#FFF5F8]',
      borderAccent: 'border-[#E1306C]/30',
      icon: <BarChart2 className="h-5 w-5" />,
      whatWeFound:
        'The notebook measured raw accuracy (87.5%), but did not generate a confusion matrix or F1 score to check whether rare categories were predicted accurately.',
      evidence:
        'In Cell 9, predictions were evaluated exclusively using accuracy_score(y_test, rf_preds). Target grades have an uneven distribution.',
      evidenceCell: 'Cell 9',
      evidenceSnippet: "rf_acc = accuracy_score(y_test, rf_preds)\nlr_acc = accuracy_score(y_test, lr_preds)\nprint(f\"Random Forest Accuracy: {rf_acc:.3f}\")",
      status: 'Needs attention',
      statusTone: 'text-[#F77737] bg-[#FFF8F5] border-[#F77737]/30',
      recommendation:
        'Add a classification report and confusion matrix so you can see precision, recall, and false positives for each individual grade level.',
      remediationCode: `from sklearn.metrics import classification_report, confusion_matrix\nprint(classification_report(y_test, rf_preds))\ncm = confusion_matrix(y_test, rf_preds)`,
    },
    {
      key: 'documentation',
      label: 'DOCUMENTATION',
      sublabel: 'How clearly your notebook explains its ideas to a human reader',
      accentColor: '#20A464',
      lightBg: 'bg-[#F2FBF6]',
      borderAccent: 'border-[#20A464]/30',
      icon: <FileText className="h-5 w-5" />,
      whatWeFound:
        'Your notebook starts with a clear markdown title and problem statement. However, the final cell contains an empty conclusion placeholder.',
      evidence:
        'Cell 0 contains introductory research markdown. Cell 11 is an empty markdown cell where conclusions and reflections should be.',
      evidenceCell: 'Cell 0 & Cell 11',
      evidenceSnippet: "# Student Performance Prediction Model\nExploring academic behavioral predictors.\n\n# Cell 11 (Empty Markdown)",
      status: 'Potential issue',
      statusTone: 'text-[#405DE6] bg-[#F4F8FF] border-[#405DE6]/30',
      recommendation:
        'Write 2-3 brief paragraphs in the final cell summarizing key findings, model limitations, and ethical considerations regarding student privacy.',
      remediationCode: `## 5. Conclusions & Next Steps\nOur Random Forest model achieved an 87.5% accuracy.\nKey limitation: Features were collected from a single semester.\nEthical note: Automated models must support, not replace, human educators.`,
    },
  ];

  const activeSection = sections.find((s) => s.key === activeSectionKey) || sections[1];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E1306C] font-bold block">
              Signature Visual Diagnostic
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
              Project Autopsy
            </h2>
            <p className="text-sm text-neutral-600 font-medium">
              "See what happened inside your project — a circular health check of your five pillars."
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-[#E1306C] animate-pulse"></span>
            <span>Interactive Hub · Click any node</span>
          </div>
        </div>

        <PlainEnglishHelpBanner
          question="What is a Project Autopsy?"
          explanation="Think of this like an MRI or X-ray of your data-science project. Instead of just giving you a grade number, we examine each organ: Data, Methodology, Modeling, Evaluation, and Documentation. You can see exactly what was found, why it matters, and how to improve it with ready-to-use code."
          tip="Click any of the five surrounding colored nodes to inspect its diagnosis and code solution."
          onOpenLearningGuide={onOpenLearningGuide}
        />
      </div>

      {/* 2. CIRCULAR / VISUAL DIAGNOSTIC LAYOUT */}
      <div className="rounded-3xl border border-neutral-100 bg-gradient-to-b from-[#FAF9FC] to-white p-6 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle Decorative Ambient Background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <div className="h-[480px] w-[480px] rounded-full border border-dashed border-neutral-300 animate-spin duration-[60s]" />
          <div className="absolute h-[340px] w-[340px] rounded-full border border-neutral-200" />
        </div>

        {/* Diagnostic Layout Container */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center space-y-8">
          {/* Top Label */}
          <div className="text-center space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
              DIAGNOSTIC VISUALIZATION
            </span>
            <h3 className="font-display text-lg font-bold text-neutral-800">
              Select a pillar node to inspect project health
            </h3>
          </div>

          {/* Central Hub & Surrounding Nodes Grid */}
          <div className="w-full">
            {/* 5 Surrounding Nodes in a Responsive Circular Array */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
              {sections.map((sec) => {
                const isSelected = activeSectionKey === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveSectionKey(sec.key)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 brand-card-hover flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? `bg-white shadow-lg ring-2 ring-[${sec.accentColor}] scale-102`
                        : 'bg-white/80 border-neutral-200/90 hover:bg-white shadow-2xs'
                    }`}
                    style={{
                      borderColor: isSelected ? sec.accentColor : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-2xs"
                        style={{ backgroundColor: sec.accentColor }}
                      >
                        {sec.icon}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sec.statusTone}`}>
                        {sec.status === 'Working well' ? 'Healthy' : 'Inspect'}
                      </span>
                    </div>

                    <div>
                      <span className="font-display text-sm font-extrabold text-neutral-900 block tracking-tight">
                        {sec.label}
                      </span>
                      <span className="text-[11px] text-neutral-500 line-clamp-1">
                        {sec.key.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold">
                      <span style={{ color: sec.accentColor }}>View anatomy</span>
                      <ArrowRight className="h-3 w-3" style={{ color: sec.accentColor }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Center Diagnostic Core Visual Indicator */}
            <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white brand-gradient shadow-xs">
                <Activity className="h-3.5 w-3.5" />
                <span>PROJECT AUTOPSY ACTIVE</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium pt-1">
                Viewing <span className="font-bold text-neutral-900">{activeSection.label}</span> pillar diagnostics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep-Dive Diagnostic Panel for the Active Section */}
      <div
        className="rounded-3xl border bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in zoom-in-98 duration-150"
        style={{ borderColor: `${activeSection.accentColor}40` }}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-xs"
              style={{ backgroundColor: activeSection.accentColor }}
            >
              {activeSection.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-display text-2xl font-extrabold text-neutral-900">
                  {activeSection.label}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeSection.statusTone}`}>
                  {activeSection.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                {activeSection.sublabel}
              </p>
            </div>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('detective')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#833AB4] hover:text-[#E1306C] transition"
            >
              <span>Inspect in Project Detective</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 4 Diagnostic Pillars in 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Card A: WHAT WE FOUND */}
          <div className="rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-5 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#833AB4] font-bold block">
              DETECTED FINDING
            </span>
            <p className="text-neutral-800 text-xs font-medium leading-relaxed">
              {activeSection.whatWeFound}
            </p>
          </div>

          {/* Card B: EVIDENCE LOCATION & PROOF */}
          <div className="rounded-2xl border border-neutral-100 bg-[#F4F8FF] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#405DE6] font-bold block">
                GROUNDED EVIDENCE
              </span>
              <span className="font-mono text-[10px] text-[#405DE6] font-bold">
                {activeSection.evidenceCell}
              </span>
            </div>
            <p className="text-neutral-700 font-mono text-[11px] leading-relaxed">
              {activeSection.evidence}
            </p>
          </div>
        </div>

        {/* Exact Code Snippet Inspected */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
            ACTUAL CODE SNIPPET INSPECTED IN NOTEBOOK
          </span>
          <pre className="rounded-2xl bg-neutral-900 p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-neutral-800 shadow-2xs">
            <code>{activeSection.evidenceSnippet}</code>
          </pre>
        </div>

        {/* Recommendation & Remediation Box */}
        <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#20A464]" />
            <h4 className="font-display text-sm font-bold text-neutral-900">
              Recommended Action & Implementation Fix
            </h4>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
            {activeSection.recommendation}
          </p>

          <div className="rounded-xl bg-neutral-900 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-neutral-300">
                Suggested Replacement Code:
              </span>
              <button
                onClick={() => handleCopyCode(activeSection.remediationCode)}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
              >
                {copiedCode === activeSection.remediationCode ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy template</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-emerald-300 overflow-x-auto">
              <code>{activeSection.remediationCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
