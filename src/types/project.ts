export type FindingConfidence = 'VERIFIED' | 'POTENTIAL' | 'INFORMATIONAL';

export type RubricCategoryKey =
  | 'data_handling'
  | 'methodology'
  | 'modeling'
  | 'evaluation'
  | 'documentation';

export interface ProjectFile {
  name: string;
  size: number;
  type: 'notebook' | 'python' | 'dataset' | 'markdown' | 'text' | 'other';
  content: string;
  parsedData?: any;
}

export interface NotebookCell {
  cellIndex: number;
  cellType: 'code' | 'markdown' | 'raw';
  source: string;
  executionCount: number | null;
  outputs?: Array<{
    outputType: string;
    text?: string;
    data?: Record<string, any>;
    imageSrc?: string;
  }>;
  hasErrors?: boolean;
}

export interface DatasetColumnSummary {
  name: string;
  dtype: 'numeric' | 'categorical' | 'boolean' | 'datetime' | 'unknown';
  count: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number)[];
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  skewness?: number;
  topCategories?: { value: string; count: number; percentage: number }[];
}

export interface DatasetProfile {
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns: DatasetColumnSummary[];
  duplicateRows: number;
  totalMissingCells: number;
  overallMissingPercentage: number;
  potentialTargetColumn?: string;
  targetImbalanceRatio?: number;
  targetDistribution?: { label: string; count: number; percentage: number }[];
  suspiciousColumns: { column: string; reason: string }[];
}

export interface EvidenceItem {
  id: string;
  category: RubricCategoryKey;
  title: string;
  sourceFile: string;
  location: string; // e.g. "Cell 7", "Line 42", "Column 'study_hours'"
  snippet: string;
  type: 'code' | 'output' | 'data' | 'markdown' | 'static_flag';
  explanation: string;
  relevanceScore: number; // 0 to 1
  tags: string[];
}

export interface DetectiveFinding {
  id: string;
  category: RubricCategoryKey;
  title: string;
  confidence: FindingConfidence;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  whatWeFound: string;
  evidence: string;
  whyItMatters: string;
  whatToDoNext: string;
  whatYouCanDo?: string;
  recommendedCode?: string;
  evidenceItems: EvidenceItem[];
  codeSnippet?: string;
  sourceFile: string;
  location: string;
  isHiddenIssue?: boolean;
  scoreImpactPoints?: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  earnedPoints: number;
  status: 'passed' | 'partial' | 'failed';
  summary: string;
  evidenceFound: string[];
  evidenceGaps: string[];
}

export interface RubricCategoryScore {
  key: RubricCategoryKey;
  name: string;
  weight: number; // e.g. 0.20
  score: number; // 0 to 100
  weightedScore: number; // score * weight
  letterGrade: string;
  criteria: RubricCriterion[];
  strengths: string[];
  gaps: string[];
}

export interface CodeHealthIssue {
  id: string;
  type: 'hardcoded_path' | 'out_of_order_cell' | 'data_leakage' | 'unused_import' | 'unhandled_missing' | 'missing_random_state' | 'syntax_issue' | 'empty_cell';
  severity: 'high' | 'medium' | 'low';
  message: string;
  file: string;
  cellIndex?: number;
  line?: number;
  codeSnippet: string;
  fixRecommendation: string;
}

export interface SubmissionChecklistItem {
  id: string;
  category: RubricCategoryKey | 'hygiene';
  label: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  findingRef?: string;
  priority: 'must_fix' | 'recommended' | 'optional';
}

export interface ProjectAnalysis {
  id: string;
  projectName: string;
  analyzedAt: string;
  files: ProjectFile[];
  datasetProfiles: DatasetProfile[];
  notebookCells: NotebookCell[];
  evidence: EvidenceItem[];
  findings: DetectiveFinding[];
  rubricScores: Record<RubricCategoryKey, RubricCategoryScore>;
  overallScore: number;
  overallGrade: string;
  codeHealthIssues: CodeHealthIssue[];
  checklist: SubmissionChecklistItem[];
  executionMode: 'deterministic_engine' | 'ai_augmented';
  summarySentence: string;
  timelineSteps: {
    step: string;
    durationMs: number;
    status: 'completed' | 'skipped' | 'warning';
    details: string;
  }[];
}
