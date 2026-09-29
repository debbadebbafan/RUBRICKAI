import React from 'react';
import { CodeHealthIssue, NotebookCell } from '../types/project';
import { Terminal, ShieldAlert, CheckCircle, ArrowRight, CornerDownRight, AlertTriangle, Layers, Sparkles } from 'lucide-react';

interface CodeHealthViewProps {
  issues: CodeHealthIssue[];
  cells: NotebookCell[];
}

export const CodeHealthView: React.FC<CodeHealthViewProps> = ({ issues, cells }) => {
  const codeCells = cells.filter((c) => c.cellType === 'code');
  const executedCells = codeCells.filter((c) => c.executionCount !== null);
  const unexecutedCells = codeCells.filter((c) => c.executionCount === null);

  const highSeverityCount = issues.filter((i) => i.severity === 'high').length;
  const mediumSeverityCount = issues.filter((i) => i.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Code Health Status Overview */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#405DE6] font-bold block">
              Static Code & Execution Invariants
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#405DE6] to-[#60A5FA] text-white shadow-2xs">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
                Code Health & Execution Audit
              </h3>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl font-medium leading-relaxed">
              Static analysis inspects code structure without execution assumptions: detects hard-coded local file paths, non-linear cell sequences, data leakage, and unseeded splits.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">High Priority</span>
              <span className={`font-display text-2xl font-extrabold tabular-nums ${highSeverityCount > 0 ? 'text-[#E5484D]' : 'text-neutral-700'}`}>
                {highSeverityCount}
              </span>
            </div>
            <div className="border-l border-neutral-200 pl-4">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Warnings</span>
              <span className="font-display text-2xl font-extrabold text-[#F77737] tabular-nums">
                {mediumSeverityCount}
              </span>
            </div>
            <div className="border-l border-neutral-200 pl-4">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Cells</span>
              <span className="font-display text-2xl font-extrabold text-neutral-900 tabular-nums">
                {cells.length}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Cell Execution Sequence Strip */}
        <div className="border-t border-neutral-100 pt-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-800">Notebook Execution Sequence:</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {executedCells.length} of {codeCells.length} code cells executed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-3.5 rounded-2xl bg-[#FAF9FC] border border-neutral-100 font-mono text-xs">
            {codeCells.map((cell, idx) => {
              const isOutOfOrder =
                cell.executionCount !== null &&
                idx > 0 &&
                codeCells[idx - 1]?.executionCount !== null &&
                (cell.executionCount || 0) < (codeCells[idx - 1]?.executionCount || 0);

              const hasError = cell.hasErrors;

              return (
                <div
                  key={cell.cellIndex}
                  title={`Cell ${cell.cellIndex} (Execution [${cell.executionCount ?? 'Unrun'}])`}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition flex items-center gap-1 shadow-2xs ${
                    hasError
                      ? 'bg-[#FFF5F5] text-[#E5484D] font-bold border border-[#E5484D]/30'
                      : isOutOfOrder
                        ? 'bg-[#FFF8F5] text-[#F77737] font-bold border border-[#F77737]/30'
                        : cell.executionCount !== null
                          ? 'bg-white border border-neutral-200 text-neutral-700'
                          : 'bg-neutral-200/50 text-neutral-400 border border-transparent'
                  }`}
                >
                  <span className="font-bold">C{cell.cellIndex}</span>
                  <span className="text-[9px] text-neutral-400">[{cell.executionCount ?? '-'}]</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-300"></span>
              <span>Sequential</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#F77737]"></span>
              <span>Out of Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E5484D]"></span>
              <span>Error Recorded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Health Issues List */}
      <div className="space-y-4">
        <h4 className="font-display text-lg font-extrabold text-neutral-900">
          Detected Code Invariant Issues ({issues.length})
        </h4>

        {issues.length === 0 ? (
          <div className="rounded-3xl border border-neutral-100 bg-white p-10 text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-[#20A464] mx-auto" />
            <h4 className="font-display font-bold text-neutral-900">Code Health Perfect</h4>
            <p className="text-xs text-neutral-500">
              No static path, sequence, or structural code flaws were identified.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-3xl border border-neutral-100 bg-white p-5 sm:p-6 shadow-xs space-y-3 brand-card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        issue.severity === 'high'
                          ? 'bg-[#FFF5F5] text-[#E5484D] border-[#E5484D]/30'
                          : 'bg-[#FFF8F5] text-[#F77737] border-[#F77737]/30'
                      }`}
                    >
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="font-display text-sm font-bold text-neutral-900">
                      {issue.message}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-neutral-400">
                    {issue.file} {issue.cellIndex !== undefined ? `· Cell ${issue.cellIndex}` : ''}
                  </span>
                </div>

                {issue.codeSnippet && (
                  <pre className="rounded-2xl bg-neutral-900 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{issue.codeSnippet}</code>
                  </pre>
                )}

                <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6] p-3 text-xs text-neutral-800 space-y-1">
                  <span className="font-bold text-[#20A464] text-[10px] uppercase font-mono block">
                    Recommended Fix
                  </span>
                  <p className="font-medium text-neutral-700">{issue.fixRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
