import React, { useState } from 'react';
import { DatasetProfile } from '../types/project';
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { parseCSV } from '../engine/datasetAnalyzer';

interface DatasetViewerProps {
  datasetProfile: DatasetProfile;
  rawCSV: string;
}

export const DatasetViewer: React.FC<DatasetViewerProps> = ({ datasetProfile, rawCSV }) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'preview'>('columns');
  const { headers, rows } = parseCSV(rawCSV);
  const previewRows = rows.slice(0, 10);

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white shadow-xs overflow-hidden">
      {/* Dataset Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 bg-white p-6 sm:p-7">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4F8FF] text-[#405DE6]">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-tight text-neutral-900">
              Dataset Profile: {datasetProfile.fileName}
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {datasetProfile.rowCount} observations · {datasetProfile.columnCount} features · {datasetProfile.totalMissingCells} missing cells ({datasetProfile.overallMissingPercentage}%)
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF9FC] border border-neutral-200 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('columns')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'columns' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Column Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'preview' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Data Preview
          </button>
        </div>
      </div>

      {/* Suspicious Alerts (if any) */}
      {datasetProfile.suspiciousColumns.length > 0 && (
        <div className="bg-amber-50/40 border-b border-amber-100 p-4 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Dataset Invariants Flagged:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5 text-amber-800 text-[11px]">
            {datasetProfile.suspiciousColumns.map((sc, i) => (
              <li key={i}>
                <strong>{sc.column}:</strong> {sc.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'columns' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Missing</th>
                  <th className="py-2.5 px-3">Uniques</th>
                  <th className="py-2.5 px-3">Mean / Mode</th>
                  <th className="py-2.5 px-3">Range [Min, Max]</th>
                  <th className="py-2.5 px-3">Sample Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-[11px] text-neutral-700">
                {datasetProfile.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-neutral-50/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">
                      {col.name}
                      {datasetProfile.potentialTargetColumn === col.name && (
                        <span className="ml-1.5 text-[9px] bg-neutral-900 text-white px-1.5 py-0.5 rounded font-sans uppercase">
                          Target
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500">{col.dtype}</td>
                    <td className="py-2.5 px-3 tabular-nums">
                      {col.missingCount > 0 ? (
                        <span className="text-rose-600 font-semibold">
                          {col.missingCount} ({col.missingPercentage}%)
                        </span>
                      ) : (
                        <span className="text-emerald-700">0%</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">{col.uniqueCount}</td>
                    <td className="py-2.5 px-3 tabular-nums text-neutral-800">
                      {col.mean !== undefined ? col.mean : col.topCategories?.[0]?.value || '-'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-neutral-500">
                      {col.min !== undefined && col.max !== undefined
                        ? `[${col.min}, ${col.max}]`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 truncate max-w-xs text-neutral-500">
                      {col.sampleValues.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-[11px]">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="py-2 px-3 text-neutral-400">#</th>
                  {headers.map((h) => (
                    <th key={h} className="py-2 px-3 font-semibold text-neutral-800">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-600">
                {previewRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50/50">
                    <td className="py-2 px-3 text-neutral-400">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 truncate max-w-[140px]">
                        {cell === '' ? <span className="text-rose-400 italic">null</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[11px] text-neutral-400 text-right">
              Showing first 10 rows of {datasetProfile.rowCount}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
