import React, { useState } from 'react';
import { ProjectAnalysis } from '../types/project';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Folder,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ProjectAnalysis;
  onOpenGoogleDrive?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onOpenGoogleDrive,
}) => {
  const [copied, setCopied] = useState(false);
  const [csvDownloaded, setCsvDownloaded] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdownReport = () => {
    return `# RubricAI Formal Evaluation Report
**Project Name:** ${analysis.projectName}
**Date of Audit:** ${new Date(analysis.analyzedAt).toLocaleDateString()}
**Overall Grade:** ${analysis.overallGrade} (${analysis.overallScore}/100)
**Core Engine:** ${analysis.executionMode === 'deterministic_engine' ? 'Deterministic Local AST Invariants' : 'AI-Augmented'}

---

## 1. Executive Summary
${analysis.summarySentence}

## 2. 5-Dimension Rubric Score Breakdown
| Dimension | Weight | Score | Grade | Status |
|---|---|---|---|---|
| Data Handling | 20% | ${analysis.rubricScores.data_handling.score}/100 | ${analysis.rubricScores.data_handling.letterGrade} | ${analysis.rubricScores.data_handling.score >= 80 ? 'Proficient' : 'Needs Review'} |
| Methodology | 20% | ${analysis.rubricScores.methodology.score}/100 | ${analysis.rubricScores.methodology.letterGrade} | ${analysis.rubricScores.methodology.score >= 80 ? 'Proficient' : 'Needs Review'} |
| Modeling | 20% | ${analysis.rubricScores.modeling.score}/100 | ${analysis.rubricScores.modeling.letterGrade} | ${analysis.rubricScores.modeling.score >= 80 ? 'Proficient' : 'Needs Review'} |
| Evaluation | 20% | ${analysis.rubricScores.evaluation.score}/100 | ${analysis.rubricScores.evaluation.letterGrade} | ${analysis.rubricScores.evaluation.score >= 80 ? 'Proficient' : 'Needs Review'} |
| Documentation | 20% | ${analysis.rubricScores.documentation.score}/100 | ${analysis.rubricScores.documentation.letterGrade} | ${analysis.rubricScores.documentation.score >= 80 ? 'Proficient' : 'Needs Review'} |

## 3. Key Detective Findings
${analysis.findings
  .map(
    (f, idx) => `### ${idx + 1}. ${f.title} (${f.confidence})
- **Location:** ${f.sourceFile} (${f.location})
- **What We Found:** ${f.whatWeFound}
- **Evidence:** ${f.evidence || f.codeSnippet || 'Extracted AST'}
- **Why It Matters:** ${f.whyItMatters}
- **What To Do Next:** ${f.whatToDoNext || f.whatYouCanDo}
`
  )
  .join('\n')}

## 4. Actionable Recommendations & Code Fixes
${analysis.findings
  .map(
    (f, idx) => `### Recommendation ${idx + 1}: ${f.title}
- **Priority:** ${f.severity.toUpperCase()}
- **Action:** ${f.whatToDoNext || f.whatYouCanDo}
${f.recommendedCode ? `- **Suggested Code:**\n\`\`\`python\n${f.recommendedCode}\n\`\`\`\n` : ''}`
  )
  .join('\n')}

## 5. Submission Readiness
- Total Checks Audited: ${analysis.checklist.length}
- Verified Passes: ${analysis.checklist.filter((c) => c.status === 'pass').length}
- High Priority Must-Fix: ${analysis.checklist.filter((c) => c.status === 'fail').length}

## 6. Limitations & Grounding
"No evidence -> no verified claim." Findings were derived through deterministic AST parsing of project code and source datasets.
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${analysis.projectName.replace(/\s+/g, '_')}_rubricai_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const s = String(val).replace(/\r?\n/g, ' ').trim();
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows: string[] = [];

    // Header & Metadata Block
    rows.push(['# =========================================================================', ''].join(','));
    rows.push(['# RUBRICAI FORMAL PROJECT EVALUATION AUDIT REPORT', ''].join(','));
    rows.push(['# Evidence-grounded review for student data-science projects', ''].join(','));
    rows.push(['# Core Principle: "No evidence -> no verified claim."', ''].join(','));
    rows.push(['# =========================================================================', ''].join(','));
    rows.push(['Metric / Attribute', 'Value'].join(','));
    rows.push(['Project Name', escapeCSV(analysis.projectName)].join(','));
    rows.push(['Audit Timestamp (UTC)', escapeCSV(new Date(analysis.analyzedAt).toISOString())].join(','));
    rows.push(['Overall Score (out of 100)', escapeCSV(analysis.overallScore)].join(','));
    rows.push(['Overall Letter Grade', escapeCSV(analysis.overallGrade)].join(','));
    rows.push([
      'Execution Engine',
      escapeCSV(
        analysis.executionMode === 'deterministic_engine'
          ? 'Deterministic Local AST Invariants'
          : 'AI-Augmented'
      ),
    ].join(','));
    rows.push(['Total Evidence Items Extracted', escapeCSV(analysis.evidence.length)].join(','));
    rows.push(['Total Diagnostic Findings', escapeCSV(analysis.findings.length)].join(','));
    rows.push([
      'Verified Findings Count',
      escapeCSV(analysis.findings.filter((f) => f.confidence === 'VERIFIED').length),
    ].join(','));
    rows.push(['Executive Summary', escapeCSV(analysis.summarySentence)].join(','));
    rows.push('');

    // SECTION 1: 5-DIMENSION RUBRIC SCORES (20% EACH)
    rows.push(['# =========================================================================', '', '', '', '', '', '', ''].join(','));
    rows.push(['# SECTION 1: 5-DIMENSION RUBRIC SCORES (EQUAL 20% WEIGHT EACH)', '', '', '', '', '', '', ''].join(','));
    rows.push(['# =========================================================================', '', '', '', '', '', '', ''].join(','));
    rows.push([
      'Rubric Category',
      'Weight (%)',
      'Category Score (0-100)',
      'Weighted Score (pts)',
      'Letter Grade',
      'Proficiency Status',
      'Key Strengths',
      'Identified Gaps',
    ].join(','));

    Object.values(analysis.rubricScores).forEach((cat) => {
      rows.push([
        escapeCSV(cat.name),
        escapeCSV('20%'),
        escapeCSV(cat.score),
        escapeCSV(cat.weightedScore),
        escapeCSV(cat.letterGrade),
        escapeCSV(cat.score >= 80 ? 'Proficient' : 'Action Recommended'),
        escapeCSV(cat.strengths.join('; ')),
        escapeCSV(cat.gaps.join('; ')),
      ].join(','));
    });
    rows.push('');

    // Detailed criteria breakdown
    const allCriteria = Object.values(analysis.rubricScores).flatMap((cat) =>
      (cat.criteria || []).map((crit) => ({ categoryName: cat.name, crit }))
    );
    if (allCriteria.length > 0) {
      rows.push(['# DETAILED RUBRIC CRITERIA BREAKDOWN', '', '', '', '', '', '', ''].join(','));
      rows.push([
        'Category',
        'Criterion Name',
        'Earned Points',
        'Max Points',
        'Status',
        'Criterion Summary',
        'Evidence Found',
        'Evidence Gaps',
      ].join(','));
      allCriteria.forEach(({ categoryName, crit }) => {
        rows.push([
          escapeCSV(categoryName),
          escapeCSV(crit.name),
          escapeCSV(crit.earnedPoints),
          escapeCSV(crit.maxPoints),
          escapeCSV(crit.status.toUpperCase()),
          escapeCSV(crit.summary),
          escapeCSV((crit.evidenceFound || []).join('; ')),
          escapeCSV((crit.evidenceGaps || []).join('; ')),
        ].join(','));
      });
      rows.push('');
    }

    // SECTION 2: KEY FINDINGS & EVIDENCE-GROUNDED INVARIANTS
    rows.push(['# =========================================================================', '', '', '', '', '', '', '', '', '', ''].join(','));
    rows.push(['# SECTION 2: KEY FINDINGS & EVIDENCE-GROUNDED INVARIANTS', '', '', '', '', '', '', '', '', '', ''].join(','));
    rows.push(['# =========================================================================', '', '', '', '', '', '', '', '', '', ''].join(','));
    rows.push([
      'Finding ID',
      'Finding Title',
      'Category',
      'Confidence Level',
      'Severity',
      'Source File',
      'Location',
      'What We Found',
      'Evidence Grounding',
      'Why It Matters',
      'Score Impact (pts)',
    ].join(','));

    analysis.findings.forEach((f) => {
      rows.push([
        escapeCSV(f.id),
        escapeCSV(f.title),
        escapeCSV(f.category),
        escapeCSV(f.confidence),
        escapeCSV(f.severity),
        escapeCSV(f.sourceFile),
        escapeCSV(f.location),
        escapeCSV(f.whatWeFound),
        escapeCSV(f.evidence || f.codeSnippet || 'Static AST inspection'),
        escapeCSV(f.whyItMatters),
        escapeCSV(f.scoreImpactPoints !== undefined ? `-${f.scoreImpactPoints}` : '0'),
      ].join(','));
    });
    rows.push('');

    // SECTION 3: ACTIONABLE RECOMMENDATIONS & FIX STEPS
    rows.push(['# =========================================================================', '', '', '', '', '', ''].join(','));
    rows.push(['# SECTION 3: ACTIONABLE RECOMMENDATIONS & FIX STEPS', '', '', '', '', '', ''].join(','));
    rows.push(['# =========================================================================', '', '', '', '', '', ''].join(','));
    rows.push([
      'Rec ID',
      'Target Area / Finding',
      'Priority / Severity',
      'Target File',
      'Target Location',
      'Recommended Action (What To Do Next)',
      'Suggested Code Fix / Implementation',
    ].join(','));

    // Recommendations derived from findings
    analysis.findings.forEach((f, idx) => {
      rows.push([
        escapeCSV(`REC-${idx + 1}`),
        escapeCSV(f.title),
        escapeCSV(f.severity.toUpperCase()),
        escapeCSV(f.sourceFile),
        escapeCSV(f.location),
        escapeCSV(f.whatToDoNext || f.whatYouCanDo || 'Review code structure and align with rubric.'),
        escapeCSV(f.recommendedCode || 'N/A'),
      ].join(','));
    });

    // Additional Code Health specific recommendations
    if (analysis.codeHealthIssues && analysis.codeHealthIssues.length > 0) {
      analysis.codeHealthIssues.forEach((issue, idx) => {
        rows.push([
          escapeCSV(`CODE-REC-${idx + 1}`),
          escapeCSV(`Code Health: ${issue.message}`),
          escapeCSV(issue.severity.toUpperCase()),
          escapeCSV(issue.file),
          escapeCSV(
            issue.cellIndex !== undefined
              ? `Cell ${issue.cellIndex}`
              : issue.line
                ? `Line ${issue.line}`
                : 'Global'
          ),
          escapeCSV(issue.fixRecommendation),
          escapeCSV(issue.codeSnippet ? `Current: ${issue.codeSnippet}` : 'N/A'),
        ].join(','));
      });
    }
    rows.push('');

    // SECTION 4: SUBMISSION READINESS CHECKLIST
    rows.push(['# =========================================================================', '', '', '', ''].join(','));
    rows.push(['# SECTION 4: SUBMISSION READINESS CHECKLIST', '', '', '', ''].join(','));
    rows.push(['# =========================================================================', '', '', '', ''].join(','));
    rows.push(['Check Item', 'Category', 'Status', 'Priority', 'Guidance / Recommendation'].join(','));

    analysis.checklist.forEach((item) => {
      rows.push([
        escapeCSV(item.label),
        escapeCSV(item.category),
        escapeCSV(item.status.toUpperCase()),
        escapeCSV(item.priority.toUpperCase()),
        escapeCSV(item.description),
      ].join(','));
    });

    const csvContent = rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute(
      'download',
      `${analysis.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_rubric_report.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-neutral-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Report Top Bar */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-neutral-900 leading-tight">
                Professional Project Review Report
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Evidence-grounded audit summary & offline exports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-2xs transition ${
                csvDownloaded
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-[#20A464] bg-[#20A464] text-white hover:bg-[#1a8852]'
              }`}
              title="Export report key findings, rubric scores, and recommendations as a formatted CSV file"
            >
              {csvDownloaded ? (
                <Check className="h-3.5 w-3.5 text-emerald-700" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5" />
              )}
              <span>{csvDownloaded ? 'CSV Exported!' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
              title="Copy markdown formatted report to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-50"
              title="Download complete report payload as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>

            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4285F4]/30 bg-[#F4F8FF] px-3 py-2 text-xs font-bold text-[#4285F4] transition hover:bg-[#FAF8FF] shadow-2xs cursor-pointer"
                title="Save report to Google Drive"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Save to Drive</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-neutral-800"
              title="Print or save as PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="ml-2 rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 transition"
              title="Close report dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Printable Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10 text-neutral-900 font-sans print:p-0 print:overflow-visible">
          {/* Cover Header */}
          <div className="border-b-2 border-neutral-900 pb-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-500 font-bold">
              <span className="brand-gradient-text font-bold">RubricAI Academic Audit Series</span>
              <span>{new Date(analysis.analyzedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              {analysis.projectName}
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl font-medium">
              An evidence-backed formal review verifying methodological rigor, reproducibility invariants, data integrity, and machine learning hygiene.
            </p>
          </div>

          {/* Quick Export Callout Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-100 bg-[#F2FBF6] print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#20A464] text-white shadow-2xs">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-neutral-900">
                  Offline Records & Spreadsheet Export
                </div>
                <div className="text-[11px] text-neutral-600">
                  Download a structured CSV with Key Findings, 5-Dimension Rubric Scores, and Actionable Recommendations for Excel or Google Sheets.
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-[#20A464] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1a8852] transition"
            >
              {csvDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              <span>{csvDownloaded ? 'CSV Exported Successfully!' : 'Download CSV Report'}</span>
            </button>
          </div>

          {/* Key Metric Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-neutral-100 bg-[#FAF9FC] font-mono text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Overall Score</span>
              <div className="font-display text-3xl font-extrabold text-neutral-900 tabular-nums">
                {analysis.overallScore}/100
              </div>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Letter Grade</span>
              <div className="font-display text-3xl font-extrabold text-neutral-900">{analysis.overallGrade}</div>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Evidence Items</span>
              <div className="font-display text-3xl font-extrabold text-neutral-900 tabular-nums">
                {analysis.evidence.length}
              </div>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Execution Mode</span>
              <div className="text-xs font-bold text-neutral-800 pt-1">
                Deterministic AST
              </div>
            </div>
          </div>

          {/* 1. Rubric Summary Table */}
          <section className="space-y-4">
            <h3 className="font-display text-xl font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
              1. Five-Pillar Rubric Breakdown (20% Weight Each)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 font-mono text-[11px] text-neutral-600">
                  <tr>
                    <th className="py-2.5 px-3">Rubric Category</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Category Score</th>
                    <th className="py-2.5 px-3">Weighted Pts</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3">Assessment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-xs">
                  {Object.values(analysis.rubricScores).map((cat) => (
                    <tr key={cat.key}>
                      <td className="py-2.5 px-3 font-sans font-semibold text-neutral-900">
                        {cat.name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500">20%</td>
                      <td className="py-2.5 px-3 tabular-nums font-bold">{cat.score} / 100</td>
                      <td className="py-2.5 px-3 tabular-nums">+{cat.weightedScore} pts</td>
                      <td className="py-2.5 px-3 font-bold">{cat.letterGrade}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase font-medium ${
                            cat.score >= 80
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {cat.score >= 80 ? 'Proficient' : 'Action Recommended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Key Findings & Invariants */}
          <section className="space-y-4">
            <h3 className="font-display text-xl font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
              2. Key Invariant Findings & Evidence
            </h3>
            <div className="space-y-4">
              {analysis.findings.map((f, i) => (
                <div key={f.id} className="rounded-2xl border border-neutral-200 p-4.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">
                      2.{i + 1} {f.title}
                    </span>
                    <span className="font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 uppercase font-bold">
                      {f.confidence} · {f.severity}
                    </span>
                  </div>
                  <div className="text-neutral-500 font-mono text-[11px]">
                    Location: {f.sourceFile} · {f.location}
                  </div>
                  <div className="text-neutral-800 leading-relaxed">
                    <strong>What We Found:</strong> {f.whatWeFound}
                  </div>
                  <div className="text-neutral-700 leading-relaxed">
                    <strong>Evidence:</strong> {f.evidence}
                  </div>
                  <div className="text-neutral-600 leading-relaxed">
                    <strong>Why It Matters:</strong> {f.whyItMatters}
                  </div>
                  <div className="text-neutral-800 leading-relaxed font-semibold bg-[#FAF9FC] p-3 rounded-xl border border-neutral-150">
                    <strong>Recommended Next Step:</strong> {f.whatToDoNext || f.whatYouCanDo}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Actionable Recommendations & Implementation Guide */}
          <section className="space-y-4">
            <h3 className="font-display text-xl font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
              3. Actionable Recommendations & Code Fixes
            </h3>
            <div className="space-y-3">
              {analysis.findings.map((f, i) => (
                <div key={`rec-${f.id}`} className="rounded-2xl border border-neutral-200 bg-[#FAF9FC]/60 p-4.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-[#833AB4]" />
                      Recommendation 3.{i + 1}: {f.title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                      f.severity === 'critical' ? 'bg-[#FFF5F5] text-[#E5484D] border border-[#E5484D]/30' : 'bg-[#FFF8F5] text-[#F77737] border border-[#F77737]/30'
                    }`}>
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed font-medium">
                    {f.whatToDoNext || f.whatYouCanDo}
                  </p>
                  {f.recommendedCode && (
                    <div className="mt-2">
                      <div className="text-[10px] font-mono text-neutral-500 mb-1 font-bold">Recommended Code Solution:</div>
                      <pre className="rounded-xl bg-neutral-900 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                        <code>{f.recommendedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Submission Readiness Summary */}
          <section className="space-y-4">
            <h3 className="font-display text-xl font-extrabold text-neutral-900 border-b border-neutral-200 pb-2">
              4. Submission Readiness Checklist Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {analysis.checklist.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900">{item.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      item.status === 'pass'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'warning'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Limitations & Academic Integrity */}
          <section className="space-y-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 leading-relaxed">
            <h4 className="font-semibold text-neutral-900 text-sm">5. Verification Methodology & Limitations</h4>
            <p>
              RubricAI adheres to the principle "No evidence → no verified claim." All diagnostic findings represent static inspection of code AST and dataset parameters. Static inspection does not execute arbitrary untrusted student code unless recorded execution output cells are available.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

