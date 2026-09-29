import {
  CodeHealthIssue,
  DetectiveFinding,
  RubricCategoryKey,
  SubmissionChecklistItem,
} from '../types/project';

export interface ReadinessSummary {
  verdict: 'ready' | 'action_required' | 'critical_fixes_needed';
  scoreBadge: string;
  headline: string;
  explanation: string;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  criticalChecks: number;
  highestPriorityFixes: DetectiveFinding[];
  checklist: SubmissionChecklistItem[];
}

export function evaluateSubmissionReadiness(
  findings: DetectiveFinding[],
  codeIssues: CodeHealthIssue[]
): ReadinessSummary {
  const criticalFindings = findings.filter((f) => f.severity === 'critical');
  const warningFindings = findings.filter((f) => f.severity === 'warning');

  const checklist: SubmissionChecklistItem[] = [
    {
      id: 'check-leakage',
      category: 'methodology',
      label: 'Data Leakage Protection',
      description: 'Preprocessing transformers fit strictly on training set after train/test split.',
      status: criticalFindings.some((f) => f.id === 'det-leakage-scaler') ? 'fail' : 'pass',
      findingRef: 'det-leakage-scaler',
      priority: 'must_fix',
    },
    {
      id: 'check-reproducibility',
      category: 'methodology',
      label: 'Random Seed Determinism',
      description: 'Explicit random_state supplied in train_test_split and stochastic model seeds.',
      status: findings.some((f) => f.id === 'det-reproducibility-split') ? 'warning' : 'pass',
      findingRef: 'det-reproducibility-split',
      priority: 'recommended',
    },
    {
      id: 'check-paths',
      category: 'hygiene',
      label: 'Portable File Paths',
      description: 'No local machine absolute paths (e.g. C:\\Users or /home/username).',
      status: findings.some((f) => f.id === 'det-hardcoded-path') ? 'warning' : 'pass',
      findingRef: 'det-hardcoded-path',
      priority: 'must_fix',
    },
    {
      id: 'check-metrics',
      category: 'evaluation',
      label: 'Imbalance-Aware Metric Evaluation',
      description: 'F1, Precision, Recall, or Confusion Matrix used when target classes are skewed.',
      status: criticalFindings.some((f) => f.id === 'det-eval-imbalanced-metric') ? 'fail' : 'pass',
      findingRef: 'det-eval-imbalanced-metric',
      priority: 'must_fix',
    },
    {
      id: 'check-missing',
      category: 'data_handling',
      label: 'Complete Missing Value Strategy',
      description: 'All null/NaN values are either imputed or cleanly filtered with justification.',
      status: criticalFindings.some((f) => f.id === 'det-missing-unhandled') ? 'fail' : 'pass',
      findingRef: 'det-missing-unhandled',
      priority: 'must_fix',
    },
    {
      id: 'check-model-comparison',
      category: 'modeling',
      label: 'Baseline & Algorithm Comparison',
      description: 'Multiple model architectures evaluated or benchmarked against a baseline.',
      status: findings.some((f) => f.id === 'det-model-single') ? 'warning' : 'pass',
      findingRef: 'det-model-single',
      priority: 'recommended',
    },
    {
      id: 'check-cross-val',
      category: 'methodology',
      label: 'Cross-Validation Defense',
      description: '5-fold or 10-fold CV executed to measure metric stability and variance.',
      status: findings.some((f) => f.id === 'det-method-no-cv') ? 'warning' : 'pass',
      findingRef: 'det-method-no-cv',
      priority: 'recommended',
    },
    {
      id: 'check-order',
      category: 'hygiene',
      label: 'Linear Execution Sequence',
      description: 'Notebook execution counts follow clean sequential top-to-bottom order.',
      status: codeIssues.some((c) => c.type === 'out_of_order_cell') ? 'warning' : 'pass',
      priority: 'recommended',
    },
    {
      id: 'check-errors',
      category: 'hygiene',
      label: 'Zero Execution Output Errors',
      description: 'No cells saved with active unhandled Python tracebacks.',
      status: codeIssues.some((c) => c.type === 'syntax_issue') ? 'fail' : 'pass',
      priority: 'must_fix',
    },
    {
      id: 'check-conclusions',
      category: 'documentation',
      label: 'Evidence-Grounded Conclusions',
      description: 'Narrative summary discusses test metrics, business impact, and limitations.',
      status: findings.some((f) => f.id === 'det-doc-sparse') ? 'warning' : 'pass',
      priority: 'recommended',
    },
  ];

  const totalChecks = checklist.length;
  const criticalChecks = checklist.filter((c) => c.status === 'fail').length;
  const warningChecks = checklist.filter((c) => c.status === 'warning').length;
  const passedChecks = checklist.filter((c) => c.status === 'pass').length;

  let verdict: ReadinessSummary['verdict'] = 'ready';
  let scoreBadge = 'Ready for Submission';
  let headline = 'Project is structurally sound and evidence-backed.';
  let explanation =
    'All critical data science invariants pass. Review optional warnings to elevate your final grade.';

  if (criticalChecks > 0) {
    verdict = 'critical_fixes_needed';
    scoreBadge = 'Critical Fixes Required';
    headline = `${criticalChecks} critical methodological violation${criticalChecks > 1 ? 's' : ''} detected.`;
    explanation =
      'Submitting now risks severe grade deductions due to data leakage, invalid metrics, or unhandled errors. Address the must-fix items below.';
  } else if (warningChecks > 0) {
    verdict = 'action_required';
    scoreBadge = 'Action Recommended';
    headline = `${warningChecks} actionable recommendation${warningChecks > 1 ? 's' : ''} identified.`;
    explanation =
      'The core pipeline runs, but reproducibility gaps or missing model comparisons will prevent achieving an A-tier score.';
  }

  const highestPriorityFixes = [
    ...criticalFindings,
    ...warningFindings.filter((w) => w.id === 'det-reproducibility-split' || w.id === 'det-hardcoded-path'),
  ].slice(0, 3);

  return {
    verdict,
    scoreBadge,
    headline,
    explanation,
    totalChecks,
    passedChecks,
    warningChecks,
    criticalChecks,
    highestPriorityFixes,
    checklist,
  };
}
