import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ProjectAnalysis, ProjectFile, EvidenceItem, DetectiveFinding } from './types/project';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { analyzeProject } from './engine/projectAnalyzer';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectHeader } from './components/ProjectHeader';
import { RubricOverview } from './components/RubricOverview';
import { ProjectDetective } from './components/ProjectDetective';
import { ProjectAutopsy } from './components/ProjectAutopsy';
import { CodeHealthView } from './components/CodeHealthView';
import { EvidenceExplorer } from './components/EvidenceExplorer';
import { AskRubricAI } from './components/AskRubricAI';
import { BeforeYouSubmit } from './components/BeforeYouSubmit';
import { InvestigationTimeline } from './components/InvestigationTimeline';
import { DatasetViewer } from './components/DatasetViewer';
import { NotebookCellViewer } from './components/NotebookCellViewer';
import { UploadModal } from './components/UploadModal';
import { ReportModal } from './components/ReportModal';
import { StudentLearningGuideModal } from './components/StudentLearningGuideModal';
import { InsightsView } from './components/InsightsView';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { initAuth, googleSignIn } from './services/googleDriveAuth';
import {
  FileText,
  Search,
  Activity,
  Terminal,
  ShieldCheck,
  Bot,
  Database,
  FileCode,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLearningGuideOpen, setIsLearningGuideOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inspectedEvidence, setInspectedEvidence] = useState<EvidenceItem | null>(null);
  const [overviewSubTab, setOverviewSubTab] = useState<'rubric' | 'timeline' | 'dataset' | 'cells'>('rubric');

  // Initialize with the Student Performance Prediction demo & Google Auth
  useEffect(() => {
    const defaultSample = SAMPLE_PROJECTS[0];
    const initialAnalysis = analyzeProject(defaultSample.name, defaultSample.files);
    setAnalysis(initialAnalysis);

    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignInGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleAnalyzeFiles = (projectName: string, files: ProjectFile[]) => {
    const result = analyzeProject(projectName, files);
    setAnalysis(result);
    setCurrentTab('rubric');
  };

  const handleLoadDemo = () => {
    const defaultSample = SAMPLE_PROJECTS[0];
    const result = analyzeProject(defaultSample.name, defaultSample.files);
    setAnalysis(result);
    setCurrentTab('overview');
  };

  if (!analysis) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F5]">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent mx-auto" />
          <p className="font-mono text-xs text-neutral-500">Looking through your project...</p>
        </div>
      </div>
    );
  }

  const primaryDataset = analysis.datasetProfiles[0];
  const primaryDatasetFile = analysis.files.find((f) => f.name.endsWith('.csv'));
  const primaryNotebookFile = analysis.files.find((f) => f.name.endsWith('.ipynb'));

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col antialiased selection:bg-[#E1306C]/15 selection:text-[#833AB4]">
      {/* Global Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadDemo={handleLoadDemo}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
        hasProject={Boolean(analysis)}
        projectName={analysis.projectName}
        currentUser={currentUser}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {/* TAB 1: OVERVIEW (Homepage with Hero, How It Works, Features, and Preview) */}
        {currentTab === 'overview' && (
          <>
            <HeroSection
              onAnalyzeProject={() => setIsUploadOpen(true)}
              onExploreDemo={handleLoadDemo}
              onNavigateToTab={setCurrentTab}
              analysisPreview={analysis}
              onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
            />

            <ProjectHeader
              analysis={analysis}
              onOpenReport={() => setIsReportOpen(true)}
              onOpenEvidence={() => setCurrentTab('evidence')}
              onReanalyze={() => handleAnalyzeFiles(analysis.projectName, analysis.files)}
              onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
              onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
              {/* Quick Subtab Segmented Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                  <button
                    onClick={() => setOverviewSubTab('rubric')}
                    className={`pb-2.5 px-3.5 border-b-2 transition ${
                      overviewSubTab === 'rubric'
                        ? 'border-[#833AB4] text-[#833AB4]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Five Rubric Areas
                  </button>
                  <button
                    onClick={() => setOverviewSubTab('timeline')}
                    className={`pb-2.5 px-3.5 border-b-2 transition ${
                      overviewSubTab === 'timeline'
                        ? 'border-[#833AB4] text-[#833AB4]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Investigation Timeline
                  </button>
                  {primaryDataset && (
                    <button
                      onClick={() => setOverviewSubTab('dataset')}
                      className={`pb-2.5 px-3.5 border-b-2 transition ${
                        overviewSubTab === 'dataset'
                          ? 'border-[#833AB4] text-[#833AB4]'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Dataset Diagnostics ({primaryDataset.rowCount} rows)
                    </button>
                  )}
                  {analysis.notebookCells.length > 0 && (
                    <button
                      onClick={() => setOverviewSubTab('cells')}
                      className={`pb-2.5 px-3.5 border-b-2 transition ${
                        overviewSubTab === 'cells'
                          ? 'border-[#833AB4] text-[#833AB4]'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Notebook Cells ({analysis.notebookCells.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setCurrentTab('detective')}
                    className="flex items-center gap-1.5 font-bold text-[#833AB4] hover:text-[#E1306C] transition"
                  >
                    <span>Inspect {analysis.findings.length} findings in Detective</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtab Content */}
              {overviewSubTab === 'rubric' && (
                <RubricOverview
                  rubricScores={analysis.rubricScores}
                  overallScore={analysis.overallScore}
                  overallGrade={analysis.overallGrade}
                  evidence={analysis.evidence}
                  onSelectEvidenceSnippet={setInspectedEvidence}
                  onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
                  onNavigateToTab={setCurrentTab}
                />
              )}

              {overviewSubTab === 'timeline' && (
                <InvestigationTimeline
                  timeline={analysis.timelineSteps}
                  analyzedAt={analysis.analyzedAt}
                />
              )}

              {overviewSubTab === 'dataset' && primaryDataset && primaryDatasetFile && (
                <DatasetViewer
                  datasetProfile={primaryDataset}
                  rawCSV={primaryDatasetFile.content}
                />
              )}

              {overviewSubTab === 'cells' && (
                <NotebookCellViewer
                  cells={analysis.notebookCells}
                  fileName={primaryNotebookFile?.name || 'student_project.ipynb'}
                />
              )}
            </div>
          </>
        )}

        {/* TAB 2: REVIEW (Dedicated Rubric & Project Health) */}
        {currentTab === 'rubric' && (
          <>
            <ProjectHeader
              analysis={analysis}
              onOpenReport={() => setIsReportOpen(true)}
              onOpenEvidence={() => setCurrentTab('evidence')}
              onReanalyze={() => handleAnalyzeFiles(analysis.projectName, analysis.files)}
              onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              <RubricOverview
                rubricScores={analysis.rubricScores}
                overallScore={analysis.overallScore}
                overallGrade={analysis.overallGrade}
                evidence={analysis.evidence}
                onSelectEvidenceSnippet={setInspectedEvidence}
                onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
                onNavigateToTab={setCurrentTab}
              />
            </div>
          </>
        )}

        {/* TAB 3: EVIDENCE (Evidence Explorer) */}
        {currentTab === 'evidence' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-500">
                <button
                  onClick={() => setCurrentTab('overview')}
                  className="text-neutral-700 hover:underline font-semibold"
                >
                  {analysis.projectName}
                </button>
                <span>/</span>
                <span className="text-neutral-900 font-bold">Evidence Explorer</span>
              </div>
              <button
                onClick={() => setIsLearningGuideOpen(true)}
                className="text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Beginner Learning Guide</span>
              </button>
            </div>
            <EvidenceExplorer
              evidence={analysis.evidence}
              onSelectEvidenceSnippet={setInspectedEvidence}
              onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: ALL INSIGHTS SUITE & SUB-TOOLS */}
        {currentTab === 'insights' && (
          <InsightsView
            analysis={analysis}
            initialSubTab="overview"
            onNavigateToTab={setCurrentTab}
            onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
          />
        )}

        {currentTab === 'detective' && (
          <InsightsView
            analysis={analysis}
            initialSubTab="detective"
            onNavigateToTab={setCurrentTab}
            onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
          />
        )}

        {currentTab === 'autopsy' && (
          <InsightsView
            analysis={analysis}
            initialSubTab="autopsy"
            onNavigateToTab={setCurrentTab}
            onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
          />
        )}

        {currentTab === 'readiness' && (
          <InsightsView
            analysis={analysis}
            initialSubTab="readiness"
            onNavigateToTab={setCurrentTab}
            onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
          />
        )}

        {currentTab === 'code_health' && (
          <InsightsView
            analysis={analysis}
            initialSubTab="code_health"
            onNavigateToTab={setCurrentTab}
            onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
          />
        )}

        {/* TAB 8: ASK RUBRICAI */}
        {currentTab === 'ask' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-500">
                <button
                  onClick={() => setCurrentTab('overview')}
                  className="text-neutral-700 hover:underline font-semibold"
                >
                  {analysis.projectName}
                </button>
                <span>/</span>
                <span className="text-neutral-900 font-bold">Ask RubricAI</span>
              </div>
              <button
                onClick={() => setIsLearningGuideOpen(true)}
                className="text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Beginner Learning Guide</span>
              </button>
            </div>
            <AskRubricAI
              analysis={analysis}
              onOpenLearningGuide={() => setIsLearningGuideOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-neutral-100 bg-[#FAF9FC] py-14 mt-20 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white text-[11px] font-extrabold shadow-2xs">
                R
              </div>
              <span className="font-display text-base font-extrabold text-neutral-900">
                RUBRIC<span className="brand-gradient-text">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              Evidence-grounded project intelligence for student data-science projects.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] text-neutral-500 font-semibold">
            <button
              onClick={() => setIsLearningGuideOpen(true)}
              className="hover:text-[#833AB4] transition underline"
            >
              Student Learning Guide
            </button>
            <button
              onClick={() => setCurrentTab('detective')}
              className="hover:text-[#833AB4] transition"
            >
              Project Detective
            </button>
            <button
              onClick={() => setCurrentTab('autopsy')}
              className="hover:text-[#E1306C] transition"
            >
              Project Autopsy
            </button>
            <button
              onClick={() => setCurrentTab('readiness')}
              className="hover:text-[#20A464] transition"
            >
              Before You Submit
            </button>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-400">Core Principle: "No evidence → no verified claim."</span>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalyzeFiles={handleAnalyzeFiles}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
      />

      {/* Google Drive Storage Manager Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        analysis={analysis}
      />

      {/* Professional Formal Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
      />

      {/* Student Learning Guide & Glossary Modal */}
      <StudentLearningGuideModal
        isOpen={isLearningGuideOpen}
        onClose={() => setIsLearningGuideOpen(false)}
      />

      {/* Inspected Evidence Snippet Modal */}
      {inspectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl border border-neutral-100 bg-white p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4F8FF] text-[#405DE6]">
                  <FileCode className="h-4 w-4" />
                </div>
                <h4 className="font-display font-extrabold text-sm text-neutral-900">
                  {inspectedEvidence.title}
                </h4>
              </div>
              <button
                onClick={() => setInspectedEvidence(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono text-neutral-500">
              <div>Source File: {inspectedEvidence.sourceFile}</div>
              <div>Location: {inspectedEvidence.location}</div>
              <div>Relevance: {Math.round(inspectedEvidence.relevanceScore * 100)}% Match</div>
            </div>

            <pre className="rounded-2xl bg-neutral-900 p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{inspectedEvidence.snippet}</code>
            </pre>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {inspectedEvidence.explanation}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedEvidence(null)}
                className="rounded-xl bg-gradient-to-r from-[#833AB4] to-[#E1306C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
