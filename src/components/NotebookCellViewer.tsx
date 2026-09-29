import React, { useState } from 'react';
import { NotebookCell } from '../types/project';
import { FileCode, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface NotebookCellViewerProps {
  cells: NotebookCell[];
  fileName: string;
}

export const NotebookCellViewer: React.FC<NotebookCellViewerProps> = ({ cells, fileName }) => {
  const [filter, setFilter] = useState<'all' | 'code' | 'markdown'>('all');

  const filteredCells = cells.filter((c) => {
    if (filter === 'code') return c.cellType === 'code';
    if (filter === 'markdown') return c.cellType === 'markdown';
    return true;
  });

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 bg-white p-6 sm:p-7">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8FF] text-[#833AB4]">
              <FileCode className="h-4 w-4" />
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-tight text-neutral-900">
              Notebook Cells: {fileName}
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {cells.length} cells ({cells.filter((c) => c.cellType === 'code').length} code, {cells.filter((c) => c.cellType === 'markdown').length} markdown)
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#FAF9FC] border border-neutral-200 rounded-xl text-xs font-bold">
          {(['all', 'code', 'markdown'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition ${
                filter === tab ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cells List */}
      <div className="divide-y divide-neutral-100">
        {filteredCells.map((cell) => {
          const isCode = cell.cellType === 'code';

          return (
            <div key={cell.cellIndex} className="p-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700">Cell {cell.cellIndex}</span>
                  <span>·</span>
                  <span>{cell.cellType.toUpperCase()}</span>
                </span>
                {isCode && (
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    [{cell.executionCount !== null ? cell.executionCount : ' '}]
                  </span>
                )}
              </div>

              {/* Source Display */}
              {isCode ? (
                <div className="rounded-lg bg-neutral-900 p-4 font-mono text-xs text-neutral-100 overflow-x-auto shadow-inner">
                  <pre>
                    <code className="text-neutral-200">{cell.source}</code>
                  </pre>
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-4 text-xs text-neutral-800 leading-relaxed font-sans whitespace-pre-line">
                  {cell.source}
                </div>
              )}

              {/* Cell Outputs */}
              {cell.outputs && cell.outputs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                    Execution Output:
                  </span>
                  {cell.outputs.map((out, outIdx) => (
                    <div key={outIdx} className="space-y-2">
                      {out.text && (
                        <pre className="rounded bg-neutral-50 p-3 font-mono text-[11px] text-neutral-700 overflow-x-auto border border-neutral-150">
                          <code>{out.text}</code>
                        </pre>
                      )}
                      {out.imageSrc && (
                        <div className="rounded border border-neutral-200 bg-white p-2">
                          <img
                            src={out.imageSrc}
                            alt="Notebook visualization output"
                            referrerPolicy="no-referrer"
                            className="max-h-80 mx-auto rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
