import { EvidenceItem, NotebookCell, RubricCategoryKey } from '../types/project';

export interface ExtractedProjectEvidence {
  evidenceList: EvidenceItem[];
  hasTrainTestSplit: boolean;
  hasRandomState: boolean;
  hasCrossValidation: boolean;
  hasDataLeakageRisk: boolean;
  leakageEvidenceCell?: number;
  modelsFound: string[];
  metricsFound: string[];
  hardcodedPaths: { cell: number; path: string }[];
  missingValueStrategyUsed: boolean;
  duplicateCheckFound: boolean;
  markdownCellCount: number;
  codeCellCount: number;
  hasConclusionMarkdown: boolean;
  chartsGeneratedCount: number;
}

export function extractEvidenceFromNotebook(
  fileName: string,
  cells: NotebookCell[]
): ExtractedProjectEvidence {
  const evidenceList: EvidenceItem[] = [];
  const modelsFound = new Set<string>();
  const metricsFound = new Set<string>();
  const hardcodedPaths: { cell: number; path: string }[] = [];

  let hasTrainTestSplit = false;
  let hasRandomState = false;
  let hasCrossValidation = false;
  let hasDataLeakageRisk = false;
  let leakageEvidenceCell: number | undefined;
  let missingValueStrategyUsed = false;
  let duplicateCheckFound = false;
  let markdownCellCount = 0;
  let codeCellCount = 0;
  let hasConclusionMarkdown = false;
  let chartsGeneratedCount = 0;

  // Track position of scaling and split to detect exact data leakage
  let scalerFitCellIndex = -1;
  let trainTestSplitCellIndex = -1;

  cells.forEach((cell, idx) => {
    const loc = `Cell ${cell.cellIndex}`;
    const code = cell.source;

    if (cell.cellType === 'markdown') {
      markdownCellCount++;
      const lower = code.toLowerCase();
      if (
        lower.includes('conclusion') ||
        lower.includes('summary') ||
        lower.includes('discussion') ||
        lower.includes('future work') ||
        lower.includes('final results')
      ) {
        hasConclusionMarkdown = true;
        evidenceList.push({
          id: `ev-md-conclusion-${cell.cellIndex}`,
          category: 'documentation',
          title: 'Project Conclusion & Synthesis',
          sourceFile: fileName,
          location: loc,
          snippet: code.slice(0, 260) + (code.length > 260 ? '...' : ''),
          type: 'markdown',
          explanation: 'Markdown section dedicated to interpreting results and project takeaways.',
          relevanceScore: 0.9,
          tags: ['documentation', 'conclusions'],
        });
      } else if (lower.includes('introduction') || lower.includes('objective') || lower.includes('problem')) {
        evidenceList.push({
          id: `ev-md-intro-${cell.cellIndex}`,
          category: 'documentation',
          title: 'Problem Framing & Introduction',
          sourceFile: fileName,
          location: loc,
          snippet: code.slice(0, 260) + (code.length > 260 ? '...' : ''),
          type: 'markdown',
          explanation: 'Clear textual description explaining the dataset and data science problem.',
          relevanceScore: 0.85,
          tags: ['documentation', 'objectives'],
        });
      }
      return;
    }

    if (cell.cellType === 'code') {
      codeCellCount++;

      // Check for hardcoded paths
      const pathMatches = code.match(/["']([a-zA-Z]:[\\/][^"'\n]+|\/(Users|home|root|var)[^"'\n]+)["']/g);
      if (pathMatches) {
        pathMatches.forEach((match) => {
          const cleanPath = match.replace(/["']/g, '');
          hardcodedPaths.push({ cell: cell.cellIndex, path: cleanPath });
          evidenceList.push({
            id: `ev-flag-path-${cell.cellIndex}`,
            category: 'methodology',
            title: 'Hard-Coded Absolute File Path',
            sourceFile: fileName,
            location: loc,
            snippet: match,
            type: 'static_flag',
            explanation: `Absolute path found: "${cleanPath}". This breaks portability on peer or grading machines.`,
            relevanceScore: 0.95,
            tags: ['reproducibility', 'paths', 'code_health'],
          });
        });
      }

      // Check Data Handling patterns
      if (/read_csv|read_excel|read_parquet|read_sql/i.test(code)) {
        evidenceList.push({
          id: `ev-data-load-${cell.cellIndex}`,
          category: 'data_handling',
          title: 'Dataset Ingestion & Loading',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /read_/i),
          type: 'code',
          explanation: 'Data imported using tabular file readers into Pandas DataFrame.',
          relevanceScore: 0.8,
          tags: ['data_loading', 'pandas'],
        });
      }

      if (/head\(\)|info\(\)|describe\(\)|shape|dtypes/i.test(code)) {
        evidenceList.push({
          id: `ev-data-inspect-${cell.cellIndex}`,
          category: 'data_handling',
          title: 'Exploratory Structural Inspection',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /head|info|describe|shape|dtypes/i),
          type: 'code',
          explanation: 'Summary statistics, dimensional shape, or dtypes inspected.',
          relevanceScore: 0.85,
          tags: ['eda', 'inspection'],
        });
      }

      if (/isnull\(\)|isna\(\)|missing/i.test(code)) {
        evidenceList.push({
          id: `ev-data-missing-audit-${cell.cellIndex}`,
          category: 'data_handling',
          title: 'Missing Value Audit',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /isnull|isna/i),
          type: 'code',
          explanation: 'Explicit check for null/missing values across DataFrame columns.',
          relevanceScore: 0.9,
          tags: ['missing_values', 'audit'],
        });
      }

      if (/fillna|dropna|SimpleImputer|KNNImputer|IterativeImputer/i.test(code)) {
        missingValueStrategyUsed = true;
        evidenceList.push({
          id: `ev-data-missing-impute-${cell.cellIndex}`,
          category: 'data_handling',
          title: 'Missing Value Remediation / Imputation',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /fillna|dropna|Imputer/i),
          type: 'code',
          explanation: 'Missing values addressed via statistical imputation or record dropping.',
          relevanceScore: 0.95,
          tags: ['imputation', 'cleaning'],
        });
      }

      if (/drop_duplicates|duplicated\(\)/i.test(code)) {
        duplicateCheckFound = true;
        evidenceList.push({
          id: `ev-data-dupes-${cell.cellIndex}`,
          category: 'data_handling',
          title: 'Duplicate Record Audit',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /duplicat/i),
          type: 'code',
          explanation: 'Audit for redundant or duplicate rows within the project dataset.',
          relevanceScore: 0.85,
          tags: ['cleaning', 'duplicates'],
        });
      }

      // Check Scaling & Leakage Detection
      if (/StandardScaler|MinMaxScaler|RobustScaler|Normalizer/i.test(code)) {
        if (/fit_transform|fit\(/i.test(code)) {
          scalerFitCellIndex = cell.cellIndex;
          evidenceList.push({
            id: `ev-scaling-${cell.cellIndex}`,
            category: 'data_handling',
            title: 'Feature Normalization / Scaling',
            sourceFile: fileName,
            location: loc,
            snippet: extractRelevantLines(code, /Scaler|fit_transform/i),
            type: 'code',
            explanation: 'Numerical feature scaling applied via Scikit-Learn transformer.',
            relevanceScore: 0.85,
            tags: ['preprocessing', 'scaling'],
          });
        }
      }

      // Check Methodology patterns (Train/Test Split, Random State)
      if (/train_test_split/i.test(code)) {
        hasTrainTestSplit = true;
        trainTestSplitCellIndex = cell.cellIndex;

        const hasRandomSeedInCall = /random_state\s*=\s*\d+/i.test(code);
        if (hasRandomSeedInCall) {
          hasRandomState = true;
        }

        evidenceList.push({
          id: `ev-method-split-${cell.cellIndex}`,
          category: 'methodology',
          title: 'Train/Test Partitioning',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /train_test_split/i),
          type: 'code',
          explanation: hasRandomSeedInCall
            ? 'Dataset partitioned into train and test subsets with deterministic random_state specified.'
            : 'train_test_split invoked WITHOUT random_state parameter; partitions will vary across executions.',
          relevanceScore: 1.0,
          tags: ['methodology', 'splitting', hasRandomSeedInCall ? 'reproducible' : 'non_reproducible'],
        });
      }

      if (/KFold|StratifiedKFold|cross_val_score|GridSearchCV|RandomizedSearchCV/i.test(code)) {
        hasCrossValidation = true;
        evidenceList.push({
          id: `ev-method-cv-${cell.cellIndex}`,
          category: 'methodology',
          title: 'Cross-Validation & Hyperparameter Tuning',
          sourceFile: fileName,
          location: loc,
          snippet: extractRelevantLines(code, /KFold|cross_val|SearchCV/i),
          type: 'code',
          explanation: 'Rigorous multi-fold validation or parameter search executed.',
          relevanceScore: 0.95,
          tags: ['methodology', 'validation', 'cv'],
        });
      }

      // Check Modeling patterns
      const modelRegexes: [RegExp, string][] = [
        [/RandomForestClassifier|RandomForestRegressor/i, 'Random Forest'],
        [/LogisticRegression/i, 'Logistic Regression'],
        [/XGBClassifier|XGBRegressor/i, 'XGBoost'],
        [/LGBMClassifier|LGBMRegressor/i, 'LightGBM'],
        [/DecisionTreeClassifier|DecisionTreeRegressor/i, 'Decision Tree'],
        [/SVC|SVR/i, 'Support Vector Machine'],
        [/LinearRegression/i, 'Linear Regression'],
        [/KNeighborsClassifier|KNeighborsRegressor/i, 'K-Nearest Neighbors'],
        [/GaussianNB|MultinomialNB/i, 'Naive Bayes'],
        [/GradientBoostingClassifier|GradientBoostingRegressor/i, 'Gradient Boosting'],
      ];

      for (const [regex, modelName] of modelRegexes) {
        if (regex.test(code)) {
          modelsFound.add(modelName);
          evidenceList.push({
            id: `ev-model-${modelName.toLowerCase().replace(/\s+/g, '-')}-${cell.cellIndex}`,
            category: 'modeling',
            title: `${modelName} Algorithm Implementation`,
            sourceFile: fileName,
            location: loc,
            snippet: extractRelevantLines(code, regex),
            type: 'code',
            explanation: `Instantiation or training of ${modelName} model.`,
            relevanceScore: 0.9,
            tags: ['modeling', 'algorithms', modelName.toLowerCase()],
          });
        }
      }

      // Check Evaluation patterns
      const metricRegexes: [RegExp, string][] = [
        [/accuracy_score/i, 'Accuracy'],
        [/f1_score/i, 'F1-Score (Macro/Micro/Weighted)'],
        [/roc_auc_score/i, 'ROC-AUC'],
        [/precision_score/i, 'Precision'],
        [/recall_score/i, 'Recall'],
        [/confusion_matrix/i, 'Confusion Matrix'],
        [/classification_report/i, 'Classification Report'],
        [/mean_squared_error|mean_absolute_error|r2_score/i, 'Regression Error Metrics (MSE/MAE/R²)'],
      ];

      for (const [regex, metricName] of metricRegexes) {
        if (regex.test(code)) {
          metricsFound.add(metricName);
          evidenceList.push({
            id: `ev-eval-${metricName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cell.cellIndex}`,
            category: 'evaluation',
            title: `Evaluation Metric: ${metricName}`,
            sourceFile: fileName,
            location: loc,
            snippet: extractRelevantLines(code, regex),
            type: 'code',
            explanation: `Performance evaluated on test data using ${metricName}.`,
            relevanceScore: 0.9,
            tags: ['evaluation', 'metrics'],
          });
        }
      }

      // Visualizations & Charts
      if (/plt\.show\(\)|plt\.plot|sns\.|px\./i.test(code)) {
        chartsGeneratedCount++;
      }
    }
  });

  // Evaluate Data Leakage:
  // If scaler was fit BEFORE train_test_split was called, or scaler was fit on X before split
  if (scalerFitCellIndex > 0 && trainTestSplitCellIndex > 0 && scalerFitCellIndex < trainTestSplitCellIndex) {
    hasDataLeakageRisk = true;
    leakageEvidenceCell = scalerFitCellIndex;
    evidenceList.push({
      id: `ev-method-leakage-${scalerFitCellIndex}`,
      category: 'methodology',
      title: 'Data Leakage: Preprocessing Scaler Fit Prior to Split',
      sourceFile: fileName,
      location: `Cell ${scalerFitCellIndex} vs Cell ${trainTestSplitCellIndex}`,
      snippet: `Scaler fit at Cell ${scalerFitCellIndex}, while train_test_split occurs downstream at Cell ${trainTestSplitCellIndex}`,
      type: 'static_flag',
      explanation:
        'StandardScaler/MinMaxScaler was fit on the combined dataset before partitioning into train and test sets. Information from test distribution leaked into training features.',
      relevanceScore: 1.0,
      tags: ['leakage', 'critical', 'methodology'],
    });
  }

  return {
    evidenceList,
    hasTrainTestSplit,
    hasRandomState,
    hasCrossValidation,
    hasDataLeakageRisk,
    leakageEvidenceCell,
    modelsFound: Array.from(modelsFound),
    metricsFound: Array.from(metricsFound),
    hardcodedPaths,
    missingValueStrategyUsed,
    duplicateCheckFound,
    markdownCellCount,
    codeCellCount,
    hasConclusionMarkdown,
    chartsGeneratedCount,
  };
}

function extractRelevantLines(code: string, pattern: RegExp): string {
  const lines = code.split('\n');
  const matchedLines: string[] = [];

  lines.forEach((line, idx) => {
    if (pattern.test(line)) {
      const prev = lines[idx - 1] ? lines[idx - 1] + '\n' : '';
      const next = lines[idx + 1] ? '\n' + lines[idx + 1] : '';
      matchedLines.push(`${prev}${line}${next}`.trim());
    }
  });

  if (matchedLines.length > 0) {
    return matchedLines[0].slice(0, 300);
  }
  return code.slice(0, 200);
}
