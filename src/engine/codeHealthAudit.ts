import { CodeHealthIssue, NotebookCell } from '../types/project';

export function auditCodeHealth(
  fileName: string,
  cells: NotebookCell[]
): CodeHealthIssue[] {
  const issues: CodeHealthIssue[] = [];

  // 1. Audit Execution Sequence (Out-of-order cells)
  let prevExecutionCount = 0;
  cells.forEach((cell) => {
    if (cell.cellType === 'code' && cell.executionCount !== null) {
      if (cell.executionCount < prevExecutionCount && cell.executionCount > 0) {
        issues.push({
          id: `health-order-${cell.cellIndex}`,
          type: 'out_of_order_cell',
          severity: 'medium',
          message: `Non-linear cell execution: Cell [${cell.executionCount}] was executed after Cell [${prevExecutionCount}].`,
          file: fileName,
          cellIndex: cell.cellIndex,
          codeSnippet: cell.source.slice(0, 150),
          fixRecommendation:
            'Restart your kernel and run cells from top to bottom (Cell -> Run All) to confirm clean execution order.',
        });
      }
      prevExecutionCount = cell.executionCount;
    }
  });

  // 2. Audit Output Errors (cells that halted with unhandled exceptions)
  cells.forEach((cell) => {
    if (cell.hasErrors) {
      const errorOutput = cell.outputs?.find((o) => o.outputType === 'error');
      issues.push({
        id: `health-err-${cell.cellIndex}`,
        type: 'syntax_issue',
        severity: 'high',
        message: `Cell halted with error in recorded output: ${errorOutput?.text || 'Exception raised'}`,
        file: fileName,
        cellIndex: cell.cellIndex,
        codeSnippet: cell.source.slice(0, 150),
        fixRecommendation:
          'Resolve the syntax or runtime error in this cell before exporting the final notebook.',
      });
    }
  });

  // 3. Audit Hardcoded Local Absolute Paths
  cells.forEach((cell) => {
    if (cell.cellType === 'code') {
      const match = cell.source.match(/["']([a-zA-Z]:[\\/][^"'\n]+|\/(Users|home|root)[^"'\n]+)["']/);
      if (match) {
        issues.push({
          id: `health-path-${cell.cellIndex}`,
          type: 'hardcoded_path',
          severity: 'high',
          message: `Hardcoded local absolute path detected: "${match[1]}"`,
          file: fileName,
          cellIndex: cell.cellIndex,
          codeSnippet: match[0],
          fixRecommendation:
            'Convert to relative path (e.g. "./data.csv" or os.path.join(".", "data.csv")) so graders can run your code.',
        });
      }
    }
  });

  // 4. Audit Unused Imports (safely detectable)
  const allCode = cells.map((c) => c.source).join('\n');
  const importRegex = /(?:import\s+([a-zA-Z0-9_]+)|from\s+[a-zA-Z0-9_.]+\s+import\s+([a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+))?)/g;
  const importedAliases: { name: string; cellIndex: number }[] = [];

  cells.forEach((cell) => {
    if (cell.cellType === 'code') {
      let match;
      const cellCode = cell.source;
      const re = /(?:import\s+([a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+))?|from\s+[a-zA-Z0-9_.]+\s+import\s+([a-zA-Z0-9_]+)(?:\s+as\s+([a-zA-Z0-9_]+))?)/g;
      while ((match = re.exec(cellCode)) !== null) {
        const alias = match[4] || match[3] || match[2] || match[1];
        if (alias && alias !== 'as' && alias !== 'import') {
          importedAliases.push({ name: alias, cellIndex: cell.cellIndex });
        }
      }
    }
  });

  importedAliases.forEach((imp) => {
    // Count occurrences of the alias across the whole notebook
    const occurrences = (allCode.match(new RegExp(`\\b${imp.name}\\b`, 'g')) || []).length;
    // If it only occurs once (the import statement itself), it's likely unused
    if (occurrences === 1 && !['warnings', 'sys', 'os'].includes(imp.name)) {
      issues.push({
        id: `health-unused-${imp.name}-${imp.cellIndex}`,
        type: 'unused_import',
        severity: 'low',
        message: `Imported symbol '${imp.name}' does not appear to be utilized anywhere in the notebook.`,
        file: fileName,
        cellIndex: imp.cellIndex,
        codeSnippet: `import ... ${imp.name}`,
        fixRecommendation:
          'Remove unused imports to keep your dependencies clean and minimize notebook overhead.',
      });
    }
  });

  // 5. Audit Empty Code Cells
  cells.forEach((cell) => {
    if (cell.cellType === 'code' && cell.source.trim() === '') {
      issues.push({
        id: `health-empty-${cell.cellIndex}`,
        type: 'empty_cell',
        severity: 'low',
        message: `Empty code cell [Cell ${cell.cellIndex}] left in notebook.`,
        file: fileName,
        cellIndex: cell.cellIndex,
        codeSnippet: '# (empty)',
        fixRecommendation: 'Delete empty remnant cells prior to project submission.',
      });
    }
  });

  return issues;
}
