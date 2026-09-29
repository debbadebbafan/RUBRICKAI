import { DatasetColumnSummary, DatasetProfile } from '../types/project';

export function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Regex-based CSV line parser supporting quoted values
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          current += char;
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);

  return { headers, rows };
}

export function profileDataset(fileName: string, csvContent: string): DatasetProfile {
  const { headers, rows } = parseCSV(csvContent);
  const rowCount = rows.length;
  const columnCount = headers.length;

  if (rowCount === 0 || columnCount === 0) {
    return {
      fileName,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      duplicateRows: 0,
      totalMissingCells: 0,
      overallMissingPercentage: 0,
      suspiciousColumns: [],
    };
  }

  // Count duplicate rows
  const rowStringSignatures = new Set<string>();
  let duplicateRows = 0;
  for (const row of rows) {
    const sig = row.join('|||');
    if (rowStringSignatures.has(sig)) {
      duplicateRows++;
    } else {
      rowStringSignatures.add(sig);
    }
  }

  let totalMissingCells = 0;
  const columns: DatasetColumnSummary[] = [];
  const suspiciousColumns: { column: string; reason: string }[] = [];

  for (let colIdx = 0; colIdx < headers.length; colIdx++) {
    const colName = headers[colIdx] || `Column_${colIdx + 1}`;
    const rawValues = rows.map((r) => r[colIdx] ?? '');

    let missingCount = 0;
    const nonMissingValues: string[] = [];

    for (const val of rawValues) {
      const trimmed = val.trim().toLowerCase();
      if (
        trimmed === '' ||
        trimmed === 'null' ||
        trimmed === 'nan' ||
        trimmed === 'none' ||
        trimmed === 'n/a' ||
        trimmed === '?' ||
        trimmed === 'na'
      ) {
        missingCount++;
      } else {
        nonMissingValues.push(val.trim());
      }
    }

    totalMissingCells += missingCount;
    const missingPercentage = rowCount > 0 ? (missingCount / rowCount) * 100 : 0;

    // Detect dtype
    let numericCount = 0;
    let booleanCount = 0;
    const numericParsed: number[] = [];

    for (const val of nonMissingValues) {
      const lower = val.toLowerCase();
      if (lower === 'true' || lower === 'false' || lower === '0' || lower === '1') {
        booleanCount++;
      }
      const num = Number(val);
      if (!isNaN(num) && isFinite(num) && val !== '') {
        numericCount++;
        numericParsed.push(num);
      }
    }

    const isNumeric = nonMissingValues.length > 0 && numericCount / nonMissingValues.length >= 0.85;
    const isBoolean =
      !isNumeric && nonMissingValues.length > 0 && booleanCount === nonMissingValues.length;

    const dtype = isNumeric ? 'numeric' : isBoolean ? 'boolean' : 'categorical';

    const uniqueSet = new Set(nonMissingValues);
    const uniqueCount = uniqueSet.size;

    // Numerical stats
    let mean: number | undefined;
    let std: number | undefined;
    let min: number | undefined;
    let max: number | undefined;
    let skewness: number | undefined;

    if (isNumeric && numericParsed.length > 0) {
      const sum = numericParsed.reduce((a, b) => a + b, 0);
      mean = sum / numericParsed.length;
      min = Math.min(...numericParsed);
      max = Math.max(...numericParsed);

      const variance =
        numericParsed.reduce((acc, val) => acc + Math.pow(val - (mean || 0), 2), 0) /
        numericParsed.length;
      std = Math.sqrt(variance);

      // skewness = m3 / s^3
      if (std > 0) {
        const m3 =
          numericParsed.reduce((acc, val) => acc + Math.pow(val - (mean || 0), 3), 0) /
          numericParsed.length;
        skewness = m3 / Math.pow(std, 3);
      }
    }

    // Top categories
    let topCategories: { value: string; count: number; percentage: number }[] | undefined;
    if (!isNumeric || uniqueCount <= 10) {
      const frequencyMap = new Map<string, number>();
      for (const val of nonMissingValues) {
        frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
      }
      topCategories = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([val, count]) => ({
          value: val,
          count,
          percentage: (count / (nonMissingValues.length || 1)) * 100,
        }));
    }

    // Suspicious column checks
    if (missingPercentage > 40) {
      suspiciousColumns.push({
        column: colName,
        reason: `High proportion of missing values (${missingPercentage.toFixed(1)}%). May require imputation or removal.`,
      });
    }
    if (uniqueCount === 1 && rowCount > 5) {
      suspiciousColumns.push({
        column: colName,
        reason: 'Zero variance / constant column. Provides zero predictive signal to machine learning models.',
      });
    }
    if (
      !isNumeric &&
      uniqueCount === rowCount &&
      rowCount > 10 &&
      (colName.toLowerCase().includes('id') || colName.toLowerCase().includes('name') || colName.toLowerCase().includes('uuid'))
    ) {
      suspiciousColumns.push({
        column: colName,
        reason: 'High cardinality identifier column. Should be excluded from feature set to avoid overfitting on patient/student ID.',
      });
    }

    columns.push({
      name: colName,
      dtype,
      count: rowCount,
      missingCount,
      missingPercentage: Number(missingPercentage.toFixed(1)),
      uniqueCount,
      sampleValues: Array.from(uniqueSet).slice(0, 5),
      mean: mean !== undefined ? Number(mean.toFixed(2)) : undefined,
      std: std !== undefined ? Number(std.toFixed(2)) : undefined,
      min: min !== undefined ? Number(min.toFixed(2)) : undefined,
      max: max !== undefined ? Number(max.toFixed(2)) : undefined,
      skewness: skewness !== undefined ? Number(skewness.toFixed(2)) : undefined,
      topCategories,
    });
  }

  // Detect potential target column
  const targetKeywords = ['target', 'label', 'class', 'grade', 'status', 'churn', 'price', 'outcome', 'y', 'exam_score'];
  let potentialTargetColumn: string | undefined;
  for (const col of columns) {
    const lower = col.name.toLowerCase();
    if (targetKeywords.some((k) => lower === k || lower.endsWith(`_${k}`) || lower.startsWith(`${k}_`))) {
      potentialTargetColumn = col.name;
      break;
    }
  }
  if (!potentialTargetColumn && columns.length > 0) {
    potentialTargetColumn = columns[columns.length - 1].name;
  }

  // Calculate target imbalance if target is categorical or low unique
  let targetImbalanceRatio: number | undefined;
  let targetDistribution: { label: string; count: number; percentage: number }[] | undefined;

  if (potentialTargetColumn) {
    const targetCol = columns.find((c) => c.name === potentialTargetColumn);
    if (targetCol && targetCol.topCategories && targetCol.topCategories.length >= 2) {
      targetDistribution = targetCol.topCategories.map((c) => ({
        label: c.value,
        count: c.count,
        percentage: Number(c.percentage.toFixed(1)),
      }));
      const maxPct = targetDistribution[0].percentage;
      const minPct = targetDistribution[targetDistribution.length - 1].percentage || 1;
      targetImbalanceRatio = Number((maxPct / minPct).toFixed(2));
    }
  }

  const totalCells = rowCount * columnCount;
  const overallMissingPercentage = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;

  return {
    fileName,
    rowCount,
    columnCount,
    columns,
    duplicateRows,
    totalMissingCells,
    overallMissingPercentage: Number(overallMissingPercentage.toFixed(1)),
    potentialTargetColumn,
    targetImbalanceRatio,
    targetDistribution,
    suspiciousColumns,
  };
}
