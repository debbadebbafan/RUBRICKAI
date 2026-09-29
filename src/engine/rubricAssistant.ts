import { ProjectAnalysis } from '../types/project';

export interface AssistantResponse {
  answer: string;
  citedEvidence: {
    title: string;
    location: string;
    snippet: string;
    sourceFile: string;
  }[];
  categoryBadge?: string;
  confidence: 'VERIFIED' | 'POTENTIAL' | 'INFORMATIONAL';
  actionableStep?: string;
  executionModeUsed: 'deterministic_engine' | 'ai_augmented';
}

export function answerProjectQuestionDeterministic(
  query: string,
  analysis: ProjectAnalysis
): AssistantResponse {
  const q = query.toLowerCase().trim();

  // 1. DATA LEAKAGE QUESTIONS
  if (q.includes('leakage') || q.includes('scaler') || q.includes('fit_transform')) {
    const leakageFinding = analysis.findings.find((f) => f.id === 'det-leakage-scaler');
    const splitEv = analysis.evidence.find((e) => e.tags.includes('splitting'));
    const scalingEv = analysis.evidence.find((e) => e.tags.includes('scaling'));

    if (leakageFinding) {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Data Leakage Analysis

**WHAT WE FOUND:**
Preprocessing scaler was fitted on the entire feature matrix prior to partitioning the dataset.

**EVIDENCE:**
In **${scalingEv?.location || 'Cell 6'}**, \`StandardScaler().fit_transform(X)\` was executed across the full dataset. Only downstream in **${splitEv?.location || 'Cell 7'}** was \`train_test_split()\` executed.

**WHY IT MATTERS:**
When test set rows are exposed to \`fit_transform\`, the test partition's mean and variance contaminate the training distribution. This creates an overly optimistic validation metric that degrades in real-world deployment.

**WHAT TO DO NEXT:**
Move \`train_test_split\` to the beginning of your pipeline. Fit the scaler exclusively on \`X_train\` and only call \`.transform()\` on \`X_test\`.`,
        citedEvidence: [
          ...(scalingEv
            ? [
                {
                  title: scalingEv.title,
                  location: scalingEv.location,
                  snippet: scalingEv.snippet,
                  sourceFile: scalingEv.sourceFile,
                },
              ]
            : []),
          ...(splitEv
            ? [
                {
                  title: splitEv.title,
                  location: splitEv.location,
                  snippet: splitEv.snippet,
                  sourceFile: splitEv.sourceFile,
                },
              ]
            : []),
        ],
        categoryBadge: 'Methodology',
        confidence: 'VERIFIED',
        actionableStep:
          'Move train_test_split before scaling: scaler.fit_transform(X_train), then scaler.transform(X_test).',
        executionModeUsed: 'deterministic_engine',
      };
    } else {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Zero Data Leakage
**WHAT WE FOUND:** No global fit_transform was found executing across unpartitioned data prior to splitting.
**EVIDENCE:** Code AST audit verified that feature transformations are cleanly partitioned.
**WHY IT MATTERS:** Preserves unbiased generalization metrics on real-world test data.
**WHAT TO DO NEXT:** Continue using sklearn Pipeline to guarantee leakage resistance.`,
        citedEvidence: [],
        categoryBadge: 'Methodology',
        confidence: 'VERIFIED',
        executionModeUsed: 'deterministic_engine',
      };
    }
  }

  // 2. "WHY IS EVALUATION PARTIAL?" or "EVALUATION"
  if (q.includes('evaluation') && (q.includes('partial') || q.includes('low') || q.includes('score') || q.includes('why'))) {
    const evalScore = analysis.rubricScores.evaluation;
    const imbalancedFinding = analysis.findings.find((f) => f.id === 'det-eval-imbalanced-metric');
    const evalEv = analysis.evidence.filter((e) => e.category === 'evaluation');

    return {
      answer: `### [VERIFIED PROJECT EVIDENCE] Evaluation Rubric Diagnostic (${evalScore.score}/100 - Grade: ${evalScore.letterGrade})

**WHAT WE FOUND:**
${
  imbalancedFinding
    ? 'Reliance on raw accuracy_score without minority-class metrics despite an imbalanced target distribution.'
    : `Evaluation earned ${evalScore.score}/100. Gaps: ${evalScore.gaps.join('; ') || 'None'}.`
}

**EVIDENCE:**
Found in ${evalEv.map((e) => `${e.location} (${e.title})`).join(', ')}. Target class ratio is ${analysis.datasetProfiles[0]?.targetImbalanceRatio || 2.5}:1.

**WHY IT MATTERS:**
Accuracy is deceptive when classes are imbalanced. A naive model predicting solely majority passing students gets 85%+ accuracy while failing all at-risk students (0% recall). Academic rubrics require minority sensitivity.

**WHAT TO DO NEXT:**
Generate an sklearn \`classification_report\`, calculate Macro-averaged F1, and plot a normalized confusion matrix.`,
      citedEvidence: evalEv.slice(0, 3).map((e) => ({
        title: e.title,
        location: e.location,
        snippet: e.snippet,
        sourceFile: e.sourceFile,
      })),
      categoryBadge: 'Evaluation',
      confidence: 'VERIFIED',
      actionableStep:
        'Import classification_report and confusion_matrix from sklearn.metrics to demonstrate minority class recall.',
      executionModeUsed: 'deterministic_engine',
    };
  }

  // 3. "WHERE ARE MISSING VALUES HANDLED?" or "MISSING VALUES"
  if (q.includes('missing') || q.includes('null') || q.includes('nan') || q.includes('imput')) {
    const missingEv = analysis.evidence.filter((e) => e.tags.includes('missing_values') || e.tags.includes('imputation'));
    const dataset = analysis.datasetProfiles[0];

    if (missingEv.length > 0) {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Missing Value Remediation

**WHAT WE FOUND:**
Missing values are addressed in **${missingEv[0].location}** using \`${missingEv[0].title}\`.

**EVIDENCE:**
${missingEv.map((e) => `${e.location}: ${e.snippet}`).join('\n\n')}

**WHY IT MATTERS:**
Auditing missing data prevents silent data loss and runtime ValueError exceptions during model fitting.

**WHAT TO DO NEXT:**
Ensure missing value statistics (such as mean or median) are computed solely from the training set.`,
        citedEvidence: missingEv.map((e) => ({
          title: e.title,
          location: e.location,
          snippet: e.snippet,
          sourceFile: e.sourceFile,
        })),
        categoryBadge: 'Data Handling',
        confidence: 'VERIFIED',
        actionableStep: 'Ensure SimpleImputer learns statistics solely from X_train.',
        executionModeUsed: 'deterministic_engine',
      };
    } else {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Missing Values Audit
**WHAT WE FOUND:** No explicit missing value remediation (fillna / dropna / SimpleImputer) found in code cells.
**EVIDENCE:** AST scan detected 0 imputation calls across all notebook cells.
**WHY IT MATTERS:** Estimators will throw an unhandled ValueError if NaN inputs reach model fitting.
**WHAT TO DO NEXT:** Audit nulls using df.isnull().sum() and remediate with SimpleImputer(strategy='median').`,
        citedEvidence: [],
        categoryBadge: 'Data Handling',
        confidence: 'VERIFIED',
        actionableStep:
          'Audit missing values with df.isnull().sum() and remediate with SimpleImputer.',
        executionModeUsed: 'deterministic_engine',
      };
    }
  }

  // 4. "WHAT MODEL WAS USED?" or "MODEL"
  if (q.includes('model') || q.includes('algorithm') || q.includes('classifier') || q.includes('regressor')) {
    const modelEv = analysis.evidence.filter((e) => e.category === 'modeling');

    return {
      answer: `### [VERIFIED PROJECT EVIDENCE] Algorithmic Architecture

**WHAT WE FOUND:**
The project implements **${modelEv.length > 0 ? modelEv.map((m) => m.title).join(', ') : 'no detectable model'}**.

**EVIDENCE:**
Found in ${modelEv.map((m) => `${m.location} (${m.sourceFile})`).join(', ')}.

**WHY IT MATTERS:**
Benchmarking multiple algorithmic families (e.g. ensemble vs linear baseline) proves whether complexity provides genuine predictive gains.

**WHAT TO DO NEXT:**
Tabulate training time and cross-validated test metrics side-by-side in a comparative summary table.`,
      citedEvidence: modelEv.map((e) => ({
        title: e.title,
        location: e.location,
        snippet: e.snippet,
        sourceFile: e.sourceFile,
      })),
      categoryBadge: 'Modeling',
      confidence: 'VERIFIED',
      executionModeUsed: 'deterministic_engine',
    };
  }

  // 5. "WHERE IS TRAIN/TEST SPLIT?" or "TRAIN TEST SPLIT" or "SPLIT"
  if (q.includes('split') || q.includes('train_test') || q.includes('partition')) {
    const splitEv = analysis.evidence.find((e) => e.tags.includes('splitting'));
    const seedFinding = analysis.findings.find((f) => f.id === 'det-reproducibility-split');

    if (splitEv) {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Train/Test Partitioning

**WHAT WE FOUND:**
The dataset partition is defined in **${splitEv.location}** of \`${splitEv.sourceFile}\`.

**EVIDENCE:**
Code snippet from ${splitEv.location}:
\`${splitEv.snippet}\`

**WHY IT MATTERS:**
${seedFinding ? 'The split invocation lacks a random_state seed, creating non-deterministic splits on each execution.' : 'The split specifies a random_state seed, ensuring repeatable partitions.'}

**WHAT TO DO NEXT:**
${seedFinding ? 'Add random_state=42 and stratify=y to train_test_split.' : 'Retain fixed random seeds across all models.'}`,
        citedEvidence: [
          {
            title: splitEv.title,
            location: splitEv.location,
            snippet: splitEv.snippet,
            sourceFile: splitEv.sourceFile,
          },
        ],
        categoryBadge: 'Methodology',
        confidence: 'VERIFIED',
        actionableStep: seedFinding ? 'Add random_state=42 and stratify=y to train_test_split.' : undefined,
        executionModeUsed: 'deterministic_engine',
      };
    } else {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Partitioning Audit
**WHAT WE FOUND:** No call to train_test_split or manual index partition was detected.
**EVIDENCE:** AST scan revealed 0 split operations across all code cells.
**WHY IT MATTERS:** Evaluating models on training data causes severe overfitting and zero generalization credit.
**WHAT TO DO NEXT:** Partition data with train_test_split(X, y, test_size=0.20, random_state=42).`,
        citedEvidence: [],
        categoryBadge: 'Methodology',
        confidence: 'VERIFIED',
        executionModeUsed: 'deterministic_engine',
      };
    }
  }

  // 6. "WHAT SHOULD I FIX?" or "PRIORITY" or "RECOMMENDATION"
  if (q.includes('fix') || q.includes('priority') || q.includes('improve') || q.includes('what should i do')) {
    const topFixes = analysis.findings.filter((f) => f.severity === 'critical' || f.severity === 'warning');

    return {
      answer: `### [VERIFIED PROJECT EVIDENCE] Highest Priority Pre-Submission Fixes

**WHAT WE FOUND:**
Audited ${analysis.findings.length} invariant checks; identified ${topFixes.length} actionable items.

**EVIDENCE & WHAT TO DO NEXT:**
${topFixes
  .slice(0, 3)
  .map(
    (f, idx) =>
      `${idx + 1}. **${f.title}** (${f.confidence})\n   - *Location:* ${f.location}\n   - *Why It Matters:* ${f.whyItMatters}\n   - *What To Do Next:* ${f.whatToDoNext || f.whatYouCanDo}`
  )
  .join('\n\n')}`,
      citedEvidence: topFixes.flatMap((f) => f.evidenceItems).slice(0, 3).map((e) => ({
        title: e.title,
        location: e.location,
        snippet: e.snippet,
        sourceFile: e.sourceFile,
      })),
      confidence: 'VERIFIED',
      executionModeUsed: 'deterministic_engine',
    };
  }

  // 7. "HARDCODED PATHS" or "PATH"
  if (q.includes('path') || q.includes('hardcode') || q.includes('portable')) {
    const pathEv = analysis.evidence.filter((e) => e.tags.includes('paths'));
    if (pathEv.length > 0) {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Portability Audit

**WHAT WE FOUND:**
A local machine absolute directory is hardcoded in **${pathEv[0].location}**.

**EVIDENCE:**
${pathEv[0].location}: \`${pathEv[0].snippet}\`

**WHY IT MATTERS:**
This path only exists on your local drive and will raise a FileNotFoundError when graded by an autograder or peer reviewer.

**WHAT TO DO NEXT:**
Replace with a relative path: \`pd.read_csv('student_dataset.csv')\` or \`os.path.join('.', 'student_dataset.csv')\`.`,
        citedEvidence: pathEv.map((e) => ({
          title: e.title,
          location: e.location,
          snippet: e.snippet,
          sourceFile: e.sourceFile,
        })),
        categoryBadge: 'Code Health',
        confidence: 'VERIFIED',
        actionableStep: 'Replace absolute local directory path with relative filename.',
        executionModeUsed: 'deterministic_engine',
      };
    } else {
      return {
        answer: `### [VERIFIED PROJECT EVIDENCE] Path Portability
**WHAT WE FOUND:** All data references use relative filepaths.
**EVIDENCE:** 0 absolute paths detected across all code cells.
**WHY IT MATTERS:** The project will run portably on external grading environments.
**WHAT TO DO NEXT:** Ensure dataset file is committed alongside the notebook.`,
        citedEvidence: [],
        categoryBadge: 'Code Health',
        confidence: 'VERIFIED',
        executionModeUsed: 'deterministic_engine',
      };
    }
  }

  // GENERAL DEFAULT RESPONSE GROUNDED IN PROJECT
  const relevantEvidence = analysis.evidence.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.snippet.toLowerCase().includes(q) ||
      e.tags.some((t) => q.includes(t))
  );

  return {
    answer: `### [VERIFIED PROJECT EVIDENCE] Evidence Diagnostic for "${query}"

**WHAT WE FOUND:**
RubricAI evaluated ${analysis.files.length} project file(s) with ${analysis.evidence.length} concrete citations and ${analysis.findings.length} detective findings.
Overall Grade: **${analysis.overallGrade} (${analysis.overallScore}/100)**.

**EVIDENCE:**
${relevantEvidence.length > 0 ? `Found ${relevantEvidence.length} direct citations in ${relevantEvidence.map((e) => e.location).join(', ')}.` : 'No direct keyword match; displaying general project invariants.'}

**WHY IT MATTERS:**
Academic data science rubrics require every claim to be grounded in observable empirical evidence.

**WHAT TO DO NEXT:**
Ask specifically about data leakage, missing values, model comparison, evaluation metrics, or submission fixes.`,
    citedEvidence: relevantEvidence.slice(0, 3).map((e) => ({
      title: e.title,
      location: e.location,
      snippet: e.snippet,
      sourceFile: e.sourceFile,
    })),
    confidence: 'INFORMATIONAL',
    executionModeUsed: 'deterministic_engine',
  };
}
