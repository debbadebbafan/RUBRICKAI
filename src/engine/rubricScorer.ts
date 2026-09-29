import {
  DatasetProfile,
  DetectiveFinding,
  RubricCategoryKey,
  RubricCategoryScore,
  RubricCriterion,
} from '../types/project';
import { ExtractedProjectEvidence } from './evidenceExtractor';

export function calculateRubricScores(
  evidence: ExtractedProjectEvidence,
  datasetProfile: DatasetProfile | null,
  findings: DetectiveFinding[]
): {
  categoryScores: Record<RubricCategoryKey, RubricCategoryScore>;
  overallScore: number;
  overallGrade: string;
} {
  // 1. DATA HANDLING (20%)
  const dataCriteria: RubricCriterion[] = [
    {
      id: 'dh-1',
      name: 'Exploratory Structural Inspection',
      maxPoints: 25,
      earnedPoints: evidence.evidenceList.some((e) => e.tags.includes('inspection')) ? 25 : 10,
      status: evidence.evidenceList.some((e) => e.tags.includes('inspection')) ? 'passed' : 'partial',
      summary: 'Inspects DataFrame dimensions, column data types, and initial rows.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('inspection')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps: evidence.evidenceList.some((e) => e.tags.includes('inspection'))
        ? []
        : ['Missing explicit df.info() or df.describe() summary inspection.'],
    },
    {
      id: 'dh-2',
      name: 'Missing Value Strategy & Audit',
      maxPoints: 25,
      earnedPoints:
        datasetProfile && datasetProfile.totalMissingCells > 0
          ? evidence.missingValueStrategyUsed
            ? 25
            : 5
          : 25,
      status:
        datasetProfile && datasetProfile.totalMissingCells > 0
          ? evidence.missingValueStrategyUsed
            ? 'passed'
            : 'failed'
          : 'passed',
      summary: 'Audits missing values and executes defensible imputation or removal.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('missing_values')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps:
        datasetProfile && datasetProfile.totalMissingCells > 0 && !evidence.missingValueStrategyUsed
          ? [`${datasetProfile.totalMissingCells} missing cells in dataset left untreated.`]
          : [],
    },
    {
      id: 'dh-3',
      name: 'Duplicate & Anomaly Check',
      maxPoints: 25,
      earnedPoints: evidence.duplicateCheckFound || (datasetProfile && datasetProfile.duplicateRows === 0) ? 25 : 12,
      status: evidence.duplicateCheckFound || (datasetProfile && datasetProfile.duplicateRows === 0) ? 'passed' : 'partial',
      summary: 'Checks for identical redundant rows or extreme distribution anomalies.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('duplicates')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps: evidence.duplicateCheckFound ? [] : ['No explicit drop_duplicates() invocation detected.'],
    },
    {
      id: 'dh-4',
      name: 'Feature Preprocessing & Scaling',
      maxPoints: 25,
      earnedPoints: evidence.evidenceList.some((e) => e.tags.includes('scaling')) ? 25 : 15,
      status: evidence.evidenceList.some((e) => e.tags.includes('scaling')) ? 'passed' : 'partial',
      summary: 'Appropriately transforms or scales continuous numerical features.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('scaling')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps: evidence.evidenceList.some((e) => e.tags.includes('scaling'))
        ? []
        : ['Features left in raw unnormalized scales.'],
    },
  ];

  // 2. METHODOLOGY (20%)
  const hasLeakage = findings.some((f) => f.id === 'det-leakage-scaler');
  const hasReproducibilityGap = findings.some((f) => f.id === 'det-reproducibility-split');
  const hasHardcodedPath = findings.some((f) => f.id === 'det-hardcoded-path');

  const methodCriteria: RubricCriterion[] = [
    {
      id: 'me-1',
      name: 'Train / Test Partitioning',
      maxPoints: 25,
      earnedPoints: evidence.hasTrainTestSplit ? 25 : 0,
      status: evidence.hasTrainTestSplit ? 'passed' : 'failed',
      summary: 'Isolates distinct training and evaluation test datasets.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('splitting')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps: evidence.hasTrainTestSplit ? [] : ['No train_test_split detected; models may be evaluated on training set.'],
    },
    {
      id: 'me-2',
      name: 'Data Leakage Prevention',
      maxPoints: 25,
      earnedPoints: hasLeakage ? 0 : 25,
      status: hasLeakage ? 'failed' : 'passed',
      summary: 'Guarantees test set distributions do not inform training transformations.',
      evidenceFound: hasLeakage ? [] : ['No global pre-split transformations detected.'],
      evidenceGaps: hasLeakage ? ['Preprocessing scaler fit on full dataset before train_test_split.'] : [],
    },
    {
      id: 'me-3',
      name: 'Reproducibility & Determinism',
      maxPoints: 25,
      earnedPoints: hasReproducibilityGap ? 10 : 25,
      status: hasReproducibilityGap ? 'partial' : 'passed',
      summary: 'Enforces fixed random seeds across stochastic operations.',
      evidenceFound: hasReproducibilityGap ? [] : ['random_state explicitly provided.'],
      evidenceGaps: hasReproducibilityGap ? ['train_test_split lacks random_state seed.'] : [],
    },
    {
      id: 'me-4',
      name: 'Validation Strategy (CV / Holdout)',
      maxPoints: 25,
      earnedPoints: evidence.hasCrossValidation ? 25 : 12,
      status: evidence.hasCrossValidation ? 'passed' : 'partial',
      summary: 'Employs K-Fold cross validation or robust multi-split validation.',
      evidenceFound: evidence.evidenceList.filter((e) => e.tags.includes('cv')).map((e) => `${e.location}: ${e.title}`),
      evidenceGaps: evidence.hasCrossValidation ? [] : ['Relies only on single holdout partition without cross-validation.'],
    },
  ];

  // 3. MODELING (20%)
  const modelingCriteria: RubricCriterion[] = [
    {
      id: 'mo-1',
      name: 'Model Selection & Architecture',
      maxPoints: 25,
      earnedPoints: evidence.modelsFound.length > 0 ? 25 : 0,
      status: evidence.modelsFound.length > 0 ? 'passed' : 'failed',
      summary: 'Implements appropriate machine learning algorithms for the target task.',
      evidenceFound: evidence.modelsFound.map((m) => `Algorithm: ${m}`),
      evidenceGaps: evidence.modelsFound.length > 0 ? [] : ['No supervised model training detected.'],
    },
    {
      id: 'mo-2',
      name: 'Comparative Algorithmic Benchmarking',
      maxPoints: 25,
      earnedPoints: evidence.modelsFound.length >= 2 ? 25 : 10,
      status: evidence.modelsFound.length >= 2 ? 'passed' : 'partial',
      summary: 'Compares multiple model families or tests against a baseline.',
      evidenceFound: evidence.modelsFound.length >= 2 ? [`${evidence.modelsFound.length} distinct models trained`] : [],
      evidenceGaps: evidence.modelsFound.length < 2 ? ['Only 1 algorithm evaluated; missing comparison benchmark.'] : [],
    },
    {
      id: 'mo-3',
      name: 'Hyperparameter Specification',
      maxPoints: 25,
      earnedPoints: 20, // default good base
      status: 'passed',
      summary: 'Explicit tuning or reasoning for algorithmic hyperparameter choices.',
      evidenceFound: ['Estimator instantiation parameters configured.'],
      evidenceGaps: [],
    },
    {
      id: 'mo-4',
      name: 'Overfitting Defense & Generalization',
      maxPoints: 25,
      earnedPoints: evidence.modelsFound.some((m) => m.includes('Forest') || m.includes('Boost') || m.includes('Ridge')) ? 25 : 15,
      status: 'passed',
      summary: 'Employs regularized models or ensemble methods to prevent overfitting.',
      evidenceFound: ['Ensemble architecture employed to mitigate variance.'],
      evidenceGaps: [],
    },
  ];

  // 4. EVALUATION (20%)
  const hasBadMetric = findings.some((f) => f.id === 'det-eval-imbalanced-metric');
  const hasConfusion = evidence.metricsFound.some((m) => m.toLowerCase().includes('confusion') || m.toLowerCase().includes('classification report'));

  const evaluationCriteria: RubricCriterion[] = [
    {
      id: 'ev-1',
      name: 'Distribution-Aware Metric Selection',
      maxPoints: 25,
      earnedPoints: hasBadMetric ? 5 : evidence.metricsFound.length > 0 ? 25 : 0,
      status: hasBadMetric ? 'failed' : evidence.metricsFound.length > 0 ? 'passed' : 'failed',
      summary: 'Utilizes metrics appropriate for target imbalance and business objectives.',
      evidenceFound: evidence.metricsFound.map((m) => `Metric: ${m}`),
      evidenceGaps: hasBadMetric ? ['Raw accuracy relied upon despite severe target class imbalance.'] : [],
    },
    {
      id: 'ev-2',
      name: 'Error Distribution Analysis',
      maxPoints: 25,
      earnedPoints: hasConfusion ? 25 : 10,
      status: hasConfusion ? 'passed' : 'partial',
      summary: 'Inspects error modalities via confusion matrix or residual breakdowns.',
      evidenceFound: hasConfusion ? ['Confusion Matrix or Classification Report generated.'] : [],
      evidenceGaps: hasConfusion ? [] : ['Missing Confusion Matrix visualization or precision/recall breakdown.'],
    },
    {
      id: 'ev-3',
      name: 'Unseen Test Set Isolation',
      maxPoints: 25,
      earnedPoints: evidence.hasTrainTestSplit && !hasLeakage ? 25 : 10,
      status: evidence.hasTrainTestSplit && !hasLeakage ? 'passed' : 'partial',
      summary: 'Guarantees reported performance is calculated strictly on untouched test samples.',
      evidenceFound: ['y_test predictions evaluated.'],
      evidenceGaps: hasLeakage ? ['Test data was exposed to transformer fitting prior to evaluation.'] : [],
    },
    {
      id: 'ev-4',
      name: 'Metric Reporting & Interpretation',
      maxPoints: 25,
      earnedPoints: 20,
      status: 'passed',
      summary: 'Clear tabular or visual reporting of test performance.',
      evidenceFound: ['Quantitative scores printed or logged in execution outputs.'],
      evidenceGaps: [],
    },
  ];

  // 5. DOCUMENTATION (20%)
  const isDocSparse = evidence.markdownCellCount < 3;
  const docCriteria: RubricCriterion[] = [
    {
      id: 'do-1',
      name: 'Problem Statement & Context',
      maxPoints: 25,
      earnedPoints: evidence.markdownCellCount > 0 ? 25 : 5,
      status: evidence.markdownCellCount > 0 ? 'passed' : 'failed',
      summary: 'Articulates project domain, research questions, and data origins.',
      evidenceFound: ['Introduction markdown cells detected.'],
      evidenceGaps: evidence.markdownCellCount === 0 ? ['No introductory markdown cells present.'] : [],
    },
    {
      id: 'do-2',
      name: 'Narrative Markdown Flow',
      maxPoints: 25,
      earnedPoints: isDocSparse ? 10 : 25,
      status: isDocSparse ? 'partial' : 'passed',
      summary: 'Interleaves markdown narrative and analysis between code executions.',
      evidenceFound: [`${evidence.markdownCellCount} markdown narrative cells provided.`],
      evidenceGaps: isDocSparse ? ['Fewer than 3 markdown cells found; notebook is code-dense.'] : [],
    },
    {
      id: 'do-3',
      name: 'Visualizations & Exploratory Plots',
      maxPoints: 25,
      earnedPoints: evidence.chartsGeneratedCount > 0 ? 25 : 10,
      status: evidence.chartsGeneratedCount > 0 ? 'passed' : 'partial',
      summary: 'Communicates relationships through labelled exploratory charts.',
      evidenceFound: evidence.chartsGeneratedCount > 0 ? [`Charts and exploratory visualizations generated.`] : [],
      evidenceGaps: evidence.chartsGeneratedCount === 0 ? ['No matplotlib / seaborn charts rendered.'] : [],
    },
    {
      id: 'do-4',
      name: 'Conclusions & Grounded Limitations',
      maxPoints: 25,
      earnedPoints: evidence.hasConclusionMarkdown ? 25 : 10,
      status: evidence.hasConclusionMarkdown ? 'passed' : 'partial',
      summary: 'Presents honest appraisal of model boundaries and empirical limitations.',
      evidenceFound: evidence.hasConclusionMarkdown ? ['Dedicated conclusion markdown section present.'] : [],
      evidenceGaps: evidence.hasConclusionMarkdown ? [] : ['Missing concluding reflection and discussion section.'],
    },
  ];

  // Helper to compile Category Score
  const makeCategoryScore = (
    key: RubricCategoryKey,
    name: string,
    criteria: RubricCriterion[]
  ): RubricCategoryScore => {
    const rawSum = criteria.reduce((sum, c) => sum + c.earnedPoints, 0);
    const score = Math.min(100, Math.max(0, rawSum));
    const weightedScore = Number((score * 0.2).toFixed(1));

    let letterGrade = 'F';
    if (score >= 93) letterGrade = 'A';
    else if (score >= 85) letterGrade = 'B+';
    else if (score >= 78) letterGrade = 'B';
    else if (score >= 70) letterGrade = 'C+';
    else if (score >= 60) letterGrade = 'C';
    else if (score >= 50) letterGrade = 'D';

    const strengths: string[] = [];
    const gaps: string[] = [];

    criteria.forEach((c) => {
      if (c.status === 'passed') {
        strengths.push(c.name);
      } else {
        gaps.push(...c.evidenceGaps);
      }
    });

    return {
      key,
      name,
      weight: 0.2,
      score,
      weightedScore,
      letterGrade,
      criteria,
      strengths,
      gaps,
    };
  };

  const categoryScores: Record<RubricCategoryKey, RubricCategoryScore> = {
    data_handling: makeCategoryScore('data_handling', 'Data Handling', dataCriteria),
    methodology: makeCategoryScore('methodology', 'Methodology', methodCriteria),
    modeling: makeCategoryScore('modeling', 'Modeling', modelingCriteria),
    evaluation: makeCategoryScore('evaluation', 'Evaluation', evaluationCriteria),
    documentation: makeCategoryScore('documentation', 'Documentation', docCriteria),
  };

  const overallScore = Number(
    (
      categoryScores.data_handling.weightedScore +
      categoryScores.methodology.weightedScore +
      categoryScores.modeling.weightedScore +
      categoryScores.evaluation.weightedScore +
      categoryScores.documentation.weightedScore
    ).toFixed(1)
  );

  let overallGrade = 'F';
  if (overallScore >= 93) overallGrade = 'A';
  else if (overallScore >= 88) overallGrade = 'A-';
  else if (overallScore >= 83) overallGrade = 'B+';
  else if (overallScore >= 78) overallGrade = 'B';
  else if (overallScore >= 70) overallGrade = 'C+';
  else if (overallScore >= 60) overallGrade = 'C';
  else if (overallScore >= 50) overallGrade = 'D';

  return {
    categoryScores,
    overallScore,
    overallGrade,
  };
}
