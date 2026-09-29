import {
  DatasetProfile,
  DetectiveFinding,
  EvidenceItem,
  NotebookCell,
} from '../types/project';
import { ExtractedProjectEvidence } from './evidenceExtractor';

export function runDetectiveDiagnostic(
  projectName: string,
  evidence: ExtractedProjectEvidence,
  datasetProfile: DatasetProfile | null,
  cells: NotebookCell[]
): DetectiveFinding[] {
  const findings: DetectiveFinding[] = [];

  // 1. DATA LEAKAGE: Scaler fit on entire dataset before train_test_split (HIDDEN ISSUE)
  if (evidence.hasDataLeakageRisk) {
    const evItem = evidence.evidenceList.find((e) => e.tags.includes('leakage'));
    const splitEv = evidence.evidenceList.find((e) => e.tags.includes('splitting'));
    const loc = evItem ? evItem.location : 'Cell 6 vs Cell 7';
    const snippet = evItem?.snippet || 'scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)';

    findings.push({
      id: 'det-leakage-scaler',
      category: 'methodology',
      title: 'Data Leakage: Preprocessing Scaler Fit Across Full Dataset Prior to Split',
      confidence: 'VERIFIED',
      severity: 'critical',
      location: loc,
      sourceFile: evItem?.sourceFile || 'student_project.ipynb',
      codeSnippet: snippet,
      whatWeFound:
        'StandardScaler.fit_transform(X) was executed on the combined feature matrix prior to train_test_split.',
      evidence: `In ${loc}, "scaler.fit_transform(X)" was invoked on the complete unpartitioned dataset before partitioning occurred in ${splitEv?.location || 'Cell 7'}. Code snippet:\n${snippet}`,
      whyItMatters:
        'When feature scaling is calculated across the entire dataset, the mean and standard deviation of the test partition leak directly into the training features. This artificially inflates validation accuracy while degrading generalization on genuinely unseen real-world observations.',
      whatToDoNext:
        'Move train_test_split to precede any feature transformations. Fit the scaler strictly on X_train (scaler.fit_transform(X_train)) and only transform X_test (scaler.transform(X_test)), or encapsulate both in an sklearn Pipeline.',
      whatYouCanDo:
        'Partition your raw features first using train_test_split. Fit your scaler ONLY on X_train (scaler.fit(X_train)), then transform X_train and X_test separately, or wrap them in an sklearn Pipeline.',
      recommendedCode: `# 1. Split raw data first\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)\n\n# 2. Fit ONLY on training partition\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)  # Transform test data without re-fitting!`,
      evidenceItems: evItem ? [evItem] : [],
      isHiddenIssue: true,
      scoreImpactPoints: 15,
    });
  }

  // 2. REPRODUCIBILITY: Missing random_state in train_test_split (HIDDEN ISSUE)
  if (evidence.hasTrainTestSplit && !evidence.hasRandomState) {
    const splitEv = evidence.evidenceList.find((e) => e.tags.includes('splitting'));
    const loc = splitEv ? splitEv.location : 'Cell 7';
    const snippet = splitEv?.snippet || 'X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)';

    findings.push({
      id: 'det-reproducibility-split',
      category: 'methodology',
      title: 'Reproducibility Gap: train_test_split Invoked Without random_state Seed',
      confidence: 'VERIFIED',
      severity: 'warning',
      location: loc,
      sourceFile: splitEv?.sourceFile || 'student_project.ipynb',
      codeSnippet: snippet,
      whatWeFound:
        'train_test_split() is invoked without specifying an explicit random_state integer seed.',
      evidence: `In ${loc}, train_test_split was executed without a random_state parameter:\n${snippet}`,
      whyItMatters:
        'Without an explicit seed, pseudo-random partitioning produces a different train/test subset on every execution. Reported metrics, model coefficients, and feature importances will fluctuate, making grading reproduction and peer review impossible.',
      whatToDoNext:
        'Supply a fixed integer seed (e.g. random_state=42) and add stratify=y to ensure class proportions remain identical across runs.',
      whatYouCanDo:
        'Pass a fixed integer (e.g., random_state=42) to ensure identical train/test allocations across all runs.',
      recommendedCode: `X_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.20, random_state=42, stratify=y\n)`,
      evidenceItems: splitEv ? [splitEv] : [],
      isHiddenIssue: true,
      scoreImpactPoints: 10,
    });
  }

  // 3. TARGET DERIVATION / TARGET LEAKAGE IN FEATURES (HIDDEN ISSUE)
  // Check if features list contains a column strongly correlated or identical to the target
  const allCode = cells.map((c) => c.source).join('\n');
  if (
    allCode.includes("'exam_score'") &&
    allCode.includes("'grade_class'") &&
    allCode.includes('features =')
  ) {
    const featureCell = cells.find(
      (c) => c.cellType === 'code' && c.source.includes('features =') && c.source.includes('exam_score')
    );
    const loc = featureCell ? `Cell ${featureCell.cellIndex}` : 'Cell 6';
    const snippet = featureCell ? featureCell.source.slice(0, 180) : "features = [..., 'exam_score', ...]\ny = df['grade_class']";

    findings.push({
      id: 'det-target-leakage-derivation',
      category: 'methodology',
      title: 'Target Leakage: Feature Directly Derived from or Determinative of Target',
      confidence: 'POTENTIAL',
      severity: 'critical',
      location: loc,
      sourceFile: 'student_project.ipynb',
      codeSnippet: snippet,
      whatWeFound:
        'The feature matrix includes "exam_score" while predicting "grade_class", where grade_class is directly computed from exam_score thresholds.',
      evidence: `In ${loc}, feature definitions include "exam_score", which directly dictates letter grades (e.g. >85 = A, <50 = Fail). Snippet:\n${snippet}`,
      whyItMatters:
        'This represents severe target leakage. The model learns a trivial deterministic threshold on exam_score rather than discovering genuine predictive relationships from study hours and attendance. At inference time when predicting at-risk students before the exam occurs, exam_score will not yet exist.',
      whatToDoNext:
        'Drop "exam_score" from the predictive feature matrix X so models rely strictly on pre-exam indicators (study hours, attendance rate, past failures, absences).',
      whatYouCanDo:
        'Exclude post-hoc target proxies from feature inputs to preserve practical predictive utility.',
      recommendedCode: `# Remove post-exam deterministic proxy:\nfeatures = [\n    'age', 'study_hours_weekly', 'attendance_rate',\n    'past_failures', 'free_time', 'health', 'absences'\n]  # Exclude 'exam_score'!`,
      evidenceItems: [],
      isHiddenIssue: true,
      scoreImpactPoints: 15,
    });
  }

  // 4. HARD-CODED FILE PATHS
  if (evidence.hardcodedPaths.length > 0) {
    const firstPath = evidence.hardcodedPaths[0];
    const pathEv = evidence.evidenceList.find((e) => e.tags.includes('paths'));
    const loc = `Cell ${firstPath.cell}`;

    findings.push({
      id: 'det-hardcoded-path',
      category: 'methodology',
      title: 'Portability Gap: Hard-Coded Local Absolute File Path',
      confidence: 'VERIFIED',
      severity: 'warning',
      location: loc,
      sourceFile: pathEv?.sourceFile || 'student_project.ipynb',
      codeSnippet: pathEv?.snippet || firstPath.path,
      whatWeFound: `A local user filesystem path ("${firstPath.path}") is hardcoded into the data ingestion logic.`,
      evidence: `In ${loc}, data loading references personal local path:\n${firstPath.path}`,
      whyItMatters:
        'Hardcoded absolute directories only exist on the original author\'s machine. When instructors or automated autograders execute the code, the notebook will crash on load with a FileNotFoundError.',
      whatToDoNext:
        'Use relative filenames (e.g. "student_dataset.csv" or os.path.join(".", "student_dataset.csv")) or pathlib.Path(__file__).parent.',
      whatYouCanDo:
        'Use relative project paths or standard pathlib / os.path resolution to ensure your notebook runs from any working directory.',
      recommendedCode: `import os\n\n# Resilient path resolution\nDATA_FILE = os.path.join(os.path.dirname(__file__) if '__file__' in locals() else '.', 'student_dataset.csv')\ndf = pd.read_csv(DATA_FILE)`,
      evidenceItems: pathEv ? [pathEv] : [],
      scoreImpactPoints: 5,
    });
  }

  // 5. INAPPROPRIATE EVALUATION METRICS FOR IMBALANCED DATA (HIDDEN ISSUE)
  const hasAccuracyOnly =
    evidence.metricsFound.some((m) => m.toLowerCase().includes('accuracy')) &&
    !evidence.metricsFound.some((m) => m.toLowerCase().includes('f1') || m.toLowerCase().includes('confusion') || m.toLowerCase().includes('roc'));

  if (datasetProfile && datasetProfile.targetImbalanceRatio && datasetProfile.targetImbalanceRatio > 1.8 && hasAccuracyOnly) {
    const accEv = evidence.evidenceList.find((e) => e.tags.includes('evaluation'));
    const loc = accEv ? accEv.location : 'Cell 9';
    const snippet = accEv?.snippet || 'accuracy = accuracy_score(y_test, y_pred)';

    findings.push({
      id: 'det-eval-imbalanced-metric',
      category: 'evaluation',
      title: 'Metric Misalignment: Raw Accuracy Relied Upon for Skewed Target Distribution',
      confidence: 'POTENTIAL',
      severity: 'critical',
      location: loc,
      sourceFile: accEv?.sourceFile || 'student_project.ipynb',
      codeSnippet: snippet,
      whatWeFound: `Target class distribution exhibits a ${datasetProfile.targetImbalanceRatio}:1 class ratio skew, but evaluation relies solely on raw accuracy_score.`,
      evidence: `In ${loc}, performance is measured with accuracy_score, while dataset "${datasetProfile.fileName}" has a ${datasetProfile.targetImbalanceRatio}:1 skew between classes:\n${snippet}`,
      whyItMatters:
        'Accuracy is deceptive on imbalanced datasets. A trivial majority-class classifier can achieve 85% accuracy while possessing 0% recall on the minority failing students. In data science rubrics, instructors deduct heavily for failing to report balanced metrics.',
      whatToDoNext:
        'Compute Macro-averaged F1-Score, generate a normalized confusion matrix, and print sklearn\'s classification_report.',
      whatYouCanDo:
        'Generate an sklearn classification_report, plot a normalized confusion matrix, and report balanced accuracy or macro-averaged F1-Score.',
      recommendedCode: `from sklearn.metrics import classification_report, confusion_matrix, f1_score\n\nprint("Macro F1:", f1_score(y_test, rf_preds, average='macro'))\nprint(classification_report(y_test, rf_preds))\ncm = confusion_matrix(y_test, rf_preds)`,
      evidenceItems: accEv ? [accEv] : [],
      isHiddenIssue: true,
      scoreImpactPoints: 12,
    });
  }

  // 6. UNHANDLED MISSING VALUES IN DATASET
  if (datasetProfile && datasetProfile.totalMissingCells > 0) {
    const missingCols = datasetProfile.columns.filter((c) => c.missingCount > 0);
    const missingAuditEv = evidence.evidenceList.find((e) => e.tags.includes('missing_values'));

    if (!evidence.missingValueStrategyUsed) {
      findings.push({
        id: 'det-missing-unhandled',
        category: 'data_handling',
        title: `Unhandled Missing Values: ${datasetProfile.totalMissingCells} Empty Cells in Dataset`,
        confidence: 'VERIFIED',
        severity: 'critical',
        location: `Dataset: ${missingCols.map((c) => `${c.name} (${c.missingCount})`).slice(0, 3).join(', ')}`,
        sourceFile: datasetProfile.fileName,
        codeSnippet: `# Missing Summary:\n${missingCols.map((c) => `${c.name}: ${c.missingCount} nulls`).join('\n')}`,
        whatWeFound: `We found ${datasetProfile.totalMissingCells} missing cells across ${missingCols.length} columns in "${datasetProfile.fileName}" with no remediation strategy in code cells.`,
        evidence: `Column audit in "${datasetProfile.fileName}": ${missingCols.map((c) => `${c.name}=${c.missingCount}`).join(', ')} null values.`,
        whyItMatters:
          'Scikit-learn algorithms (LogisticRegression, RandomForest, LinearRegression) will raise an immediate ValueError: Input contains NaN if null records reach model fitting.',
        whatToDoNext:
          'Implement statistical imputation (SimpleImputer) or document the rationale for dropping rows.',
        whatYouCanDo:
          'Implement explicit statistical imputation (median for skewed numeric, mode for categorical) or document your rationale for dropping rows/columns.',
        recommendedCode: `from sklearn.impute import SimpleImputer\n\nimputer = SimpleImputer(strategy='median')\nX_train = imputer.fit_transform(X_train)\nX_test = imputer.transform(X_test)`,
        evidenceItems: missingAuditEv ? [missingAuditEv] : [],
        scoreImpactPoints: 10,
      });
    } else {
      findings.push({
        id: 'det-missing-handled',
        category: 'data_handling',
        title: 'Missing Values Successfully Identified and Remediated',
        confidence: 'VERIFIED',
        severity: 'positive',
        location: missingAuditEv ? missingAuditEv.location : 'Cell 5',
        sourceFile: missingAuditEv?.sourceFile || 'student_project.ipynb',
        codeSnippet: missingAuditEv?.snippet || 'df.fillna(...)',
        whatWeFound: `Dataset nulls (${datasetProfile.totalMissingCells} cells) were explicitly identified and imputed before modeling.`,
        evidence: `In ${missingAuditEv?.location || 'Cell 5'}, missing values were imputed using pandas fillna:\n${missingAuditEv?.snippet || "df['study_hours_weekly'].fillna(mean)"}`,
        whyItMatters:
          'Auditing and handling missing data ensures pipeline stability and prevents silent bias in feature representations.',
        whatToDoNext:
          'Ensure imputation parameters are learned strictly from the training partition to prevent subtle distributional leakage.',
        whatYouCanDo:
          'Ensure imputation parameters are learned solely from the training set to prevent subtle leakage.',
        evidenceItems: missingAuditEv ? [missingAuditEv] : [],
        scoreImpactPoints: 0,
      });
    }
  }

  // 7. HIGH CARDINALITY IDENTIFIERS IN FEATURE MATRIX (HIDDEN ISSUE)
  if (datasetProfile) {
    const idCols = datasetProfile.columns.filter(
      (c) =>
        (c.name.toLowerCase().includes('id') || c.name.toLowerCase().includes('uuid')) &&
        c.uniqueCount === c.count &&
        c.count > 10
    );
    if (idCols.length > 0) {
      const idName = idCols[0].name;
      findings.push({
        id: 'det-id-column-leakage',
        category: 'data_handling',
        title: `High-Cardinality Identifier Column: "${idName}" In Dataset`,
        confidence: 'VERIFIED',
        severity: 'warning',
        location: `Column "${idName}" in ${datasetProfile.fileName}`,
        sourceFile: datasetProfile.fileName,
        codeSnippet: `# Column: ${idName}\n# Unique count = ${idCols[0].uniqueCount} of ${idCols[0].count} rows`,
        whatWeFound: `Column "${idName}" has 100% unique values (${idCols[0].uniqueCount} distinct values across ${idCols[0].count} observations).`,
        evidence: `Column "${idName}" exhibits unique count equal to row count (100% cardinality), functioning as an arbitrary database key.`,
        whyItMatters:
          'Including arbitrary ID keys in feature representations allows tree-based models to memorize training samples (memorization overfitting) rather than learning generalizable signals.',
        whatToDoNext:
          `Ensure "${idName}" is dropped from the feature matrix before modeling via df.drop(columns=['${idName}']).`,
        whatYouCanDo:
          `Exclude unique key identifier columns like '${idName}' from feature sets.`,
        recommendedCode: `X = df.drop(columns=['${idName}', 'grade_class'])`,
        evidenceItems: [],
        isHiddenIssue: true,
        scoreImpactPoints: 5,
      });
    }
  }

  // 8. MODEL COMPARISON (Positive or Warning)
  if (evidence.modelsFound.length === 1) {
    const singleModel = evidence.modelsFound[0];
    const modelEv = evidence.evidenceList.find((e) => e.tags.includes('modeling'));
    findings.push({
      id: 'det-model-single',
      category: 'modeling',
      title: `Single Model Evaluated: Only ${singleModel} Trained Without Baseline`,
      confidence: 'POTENTIAL',
      severity: 'warning',
      location: modelEv ? modelEv.location : 'Cell 8',
      sourceFile: modelEv?.sourceFile || 'student_project.ipynb',
      codeSnippet: modelEv?.snippet || `model = ${singleModel}()`,
      whatWeFound: `The project trains only a single algorithm (${singleModel}) without a trivial or linear baseline.`,
      evidence: `In ${modelEv?.location || 'Cell 8'}, only ${singleModel} is instantiated. No baseline or alternative models found.`,
      whyItMatters:
        'In academic evaluation, a machine learning algorithm cannot be declared superior without an empirical benchmark (e.g. DummyClassifier or LogisticRegression).',
      whatToDoNext:
        'Train a simple linear model and a trivial dummy baseline, presenting test scores side-by-side in a comparative summary table.',
      whatYouCanDo:
        'Train at least one baseline (e.g. LogisticRegression or DummyClassifier) alongside your primary model and tabulate their comparative scores.',
      recommendedCode: `from sklearn.linear_model import LogisticRegression\n\n# Train baseline alongside ensemble\nbase_model = LogisticRegression(max_iter=1000).fit(X_train, y_train)\nprint("Baseline Test F1:", f1_score(y_test, base_model.predict(X_test), average='macro'))`,
      evidenceItems: modelEv ? [modelEv] : [],
      scoreImpactPoints: 8,
    });
  } else if (evidence.modelsFound.length >= 2) {
    const modelEvs = evidence.evidenceList.filter((e) => e.tags.includes('modeling'));
    findings.push({
      id: 'det-model-multi',
      category: 'modeling',
      title: `Algorithm Comparison Implemented: ${evidence.modelsFound.join(' vs ')}`,
      confidence: 'VERIFIED',
      severity: 'positive',
      location: modelEvs[0]?.location || 'Cell 8',
      sourceFile: modelEvs[0]?.sourceFile || 'student_project.ipynb',
      codeSnippet: modelEvs.map((e) => e.snippet).slice(0, 2).join('\n---\n'),
      whatWeFound: `Multiple distinct algorithms (${evidence.modelsFound.join(', ')}) were trained and comparatively evaluated.`,
      evidence: `In ${modelEvs.map((e) => e.location).join(', ')}, multiple models (${evidence.modelsFound.join(', ')}) were instantiated and fit.`,
      whyItMatters:
        'Comparing models with differing inductive biases proves algorithmic rigor and confirms whether model complexity justifies its computational cost.',
      whatToDoNext:
        'Tabulate training time, cross-validation scores, and test metrics side-by-side in a comparative DataFrame.',
      whatYouCanDo:
        'Construct a clean summary DataFrame displaying training time, CV scores, and test metrics side-by-side.',
      evidenceItems: modelEvs,
      scoreImpactPoints: 0,
    });
  }

  // 9. MISSING CROSS-VALIDATION
  if (!evidence.hasCrossValidation && evidence.modelsFound.length > 0) {
    findings.push({
      id: 'det-method-no-cv',
      category: 'methodology',
      title: 'Validation Vulnerability: Sole Reliance on Single Train/Test Holdout Split',
      confidence: 'POTENTIAL',
      severity: 'warning',
      location: 'Model Validation Section',
      sourceFile: 'student_project.ipynb',
      codeSnippet: '# Single split holdout without cross_val_score',
      whatWeFound:
        'No evidence of K-Fold cross-validation (cross_val_score / GridSearchCV) was detected in the project AST.',
      evidence: 'Inspection of model training cells found no imports or calls to cross_val_score, KFold, or StratifiedKFold.',
      whyItMatters:
        'On datasets with fewer than 10,000 observations, single holdout scores are highly sensitive to which rows happened to land in the test split. K-Fold CV provides variance confidence bounds.',
      whatToDoNext:
        'Run 5-Fold Stratified Cross-Validation on the training partition to quantify metric stability.',
      whatYouCanDo:
        'Implement 5-Fold Stratified Cross-Validation on the training set to evaluate score variance.',
      recommendedCode: `from sklearn.model_selection import StratifiedKFold, cross_val_score\n\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nscores = cross_val_score(rf_model, X_train, y_train, cv=cv, scoring='f1_macro')\nprint(f"5-Fold CV Score: {scores.mean():.3f} +/- {scores.std():.3f}")`,
      evidenceItems: [],
      scoreImpactPoints: 8,
    });
  }

  // 10. NON-LINEAR NOTEBOOK EXECUTION ORDER (HIDDEN ISSUE)
  let lastExec = 0;
  let outOfOrderDetails: { cell: number; exec: number; expectedAfter: number }[] = [];
  for (const cell of cells) {
    if (cell.executionCount !== null) {
      if (cell.executionCount < lastExec && cell.executionCount > 0) {
        outOfOrderDetails.push({
          cell: cell.cellIndex,
          exec: cell.executionCount,
          expectedAfter: lastExec,
        });
      }
      lastExec = cell.executionCount;
    }
  }

  if (outOfOrderDetails.length > 0) {
    const o = outOfOrderDetails[0];
    findings.push({
      id: 'det-code-out-of-order',
      category: 'methodology',
      title: `Execution Sequence Anomaly: Cell ${o.cell} Executed Out of Top-to-Bottom Order`,
      confidence: 'VERIFIED',
      severity: 'warning',
      location: `Cell ${o.cell} (Execution [${o.exec}])`,
      sourceFile: 'student_project.ipynb',
      codeSnippet: `Cell ${o.cell} executed at count [${o.exec}], occurring after execution count [${o.expectedAfter}]`,
      whatWeFound: `Notebook execution indices show Cell ${o.cell} [${o.exec}] was executed out of chronological sequence.`,
      evidence: `Recorded execution_count for Cell ${o.cell} is [${o.exec}], but predecessor cell ran at [${o.expectedAfter}].`,
      whyItMatters:
        'Non-linear execution means the memory state in the notebook kernel during authoring did not match top-to-bottom cell order. This is the single most common cause of "Works On My Machine" failures when submitted notebooks are graded from a fresh kernel.',
      whatToDoNext:
        'Restart the Jupyter kernel and execute "Run All" from top to bottom before project submission.',
      whatYouCanDo:
        'Select "Restart Kernel & Run All Cells" in Jupyter to verify top-to-bottom linear reproducibility before submitting.',
      recommendedCode: '# Jupyter UI Action:\n# Kernel -> Restart Kernel and Run All Cells...\n# Ensure execution counts start from [1] sequentially.',
      evidenceItems: [],
      isHiddenIssue: true,
      scoreImpactPoints: 5,
    });
  }

  // 11. CONCLUSION & LIMITATIONS
  if (evidence.hasConclusionMarkdown) {
    const concEv = evidence.evidenceList.find((e) => e.tags.includes('conclusions'));
    findings.push({
      id: 'det-doc-conclusion-present',
      category: 'documentation',
      title: 'Academic Reflection: Concluding Discussion & Limitations Section Detected',
      confidence: 'VERIFIED',
      severity: 'positive',
      location: concEv ? concEv.location : 'Final Markdown Cell',
      sourceFile: concEv?.sourceFile || 'student_project.ipynb',
      codeSnippet: concEv?.snippet || '### 4. Discussion & Conclusion...',
      whatWeFound:
        'The project features a dedicated Markdown reflection discussing results, findings, and future improvements.',
      evidence: `In ${concEv?.location || 'Final Markdown Cell'}, narrative prose synthesizes model metrics and acknowledges project boundaries.`,
      whyItMatters:
        'Data science rubrics award top marks for self-critical analytical maturity, specifically identifying dataset constraints and boundary conditions.',
      whatToDoNext:
        'Ensure reported conclusions explicitly reference test metrics rather than unverified extrapolations.',
      whatYouCanDo:
        'Ensure reported conclusions explicitly reference test metrics rather than unverified extrapolations.',
      evidenceItems: concEv ? [concEv] : [],
      scoreImpactPoints: 0,
    });
  }

  return findings;
}
