import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Folder,
  FileCode,
  Database,
  FileText,
  Trash2,
  RefreshCw,
  LogOut,
  FolderOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { googleSignIn, logout, getAccessToken } from '../services/googleDriveAuth';
import {
  getOrCreateProjectFolder,
  uploadProjectFilesToDrive,
  uploadFileToDrive,
  listFolderFiles,
  deleteDriveFile,
  DriveItem,
  DriveFolder,
} from '../services/googleDriveService';
import { ProjectAnalysis, ProjectFile } from '../types/project';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  analysis: ProjectAnalysis;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  analysis,
}) => {
  const [folder, setFolder] = useState<DriveFolder | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Confirmation state for deleting a file (MANDATORY per destructive operation rules)
  const [fileToDelete, setFileToDelete] = useState<DriveItem | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadProjectDriveFolder();
    }
  }, [isOpen, currentUser, analysis.projectName]);

  const loadProjectDriveFolder = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const projFolder = await getOrCreateProjectFolder(analysis.projectName);
      setFolder(projFolder);
      const files = await listFolderFiles(projFolder.id);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error loading Google Drive folder:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not access Google Drive. Please reconnect your account.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setStatusMessage(null);
      setIsLoading(true);
      const result = await googleSignIn();
      if (result) {
        onUserChange(result.user);
        const projFolder = await getOrCreateProjectFolder(analysis.projectName);
        setFolder(projFolder);
        const files = await listFolderFiles(projFolder.id);
        setDriveFiles(files);
        setStatusMessage({
          type: 'success',
          text: `Signed in as ${result.user.email}. Google Drive connected!`,
        });
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Google sign-in was interrupted. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onUserChange(null);
      setFolder(null);
      setDriveFiles([]);
      setStatusMessage({
        type: 'info',
        text: 'Signed out from Google Drive.',
      });
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleUploadCurrentProject = async () => {
    if (!currentUser) return;

    try {
      setIsUploading(true);
      setStatusMessage(null);
      setUploadProgress({ current: 0, total: analysis.files.length, fileName: 'Starting...' });

      const filesToUpload = analysis.files.map((f) => ({
        name: f.name,
        content: f.content,
      }));

      const result = await uploadProjectFilesToDrive(
        analysis.projectName,
        filesToUpload,
        (current, total, fileName) => {
          setUploadProgress({ current, total, fileName });
        }
      );

      setFolder(result.folder);
      const updatedFiles = await listFolderFiles(result.folder.id);
      setDriveFiles(updatedFiles);

      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${result.uploadedFiles.length} project file(s) to "${result.folder.name}" on Google Drive!`,
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload files to Google Drive.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleUploadAuditReport = async () => {
    if (!currentUser || !folder) return;

    try {
      setIsLoading(true);
      const markdownReport = `# RubricAI Formal Evaluation Report
**Project Name:** ${analysis.projectName}
**Date of Audit:** ${new Date(analysis.analyzedAt).toLocaleDateString()}
**Overall Grade:** ${analysis.overallGrade} (${analysis.overallScore}/100)
**Core Engine:** ${analysis.executionMode === 'deterministic_engine' ? 'Deterministic Local AST Invariants' : 'AI-Augmented'}

---

## Executive Summary
${analysis.summarySentence}

## Rubric Breakdown
- Data Handling: ${analysis.rubricScores.data_handling.score}/100 (${analysis.rubricScores.data_handling.letterGrade})
- Methodology: ${analysis.rubricScores.methodology.score}/100 (${analysis.rubricScores.methodology.letterGrade})
- Modeling: ${analysis.rubricScores.modeling.score}/100 (${analysis.rubricScores.modeling.letterGrade})
- Evaluation: ${analysis.rubricScores.evaluation.score}/100 (${analysis.rubricScores.evaluation.letterGrade})
- Documentation: ${analysis.rubricScores.documentation.score}/100 (${analysis.rubricScores.documentation.letterGrade})

## Verified Findings (${analysis.findings.length})
${analysis.findings.map((f, i) => `${i + 1}. [${f.confidence}] ${f.title}: ${f.whatWeFound}`).join('\n')}
`;

      const fileName = `RubricAI_Report_${analysis.projectName.replace(/\s+/g, '_')}.md`;
      await uploadFileToDrive(fileName, markdownReport, folder.id, 'text/markdown');

      const updatedFiles = await listFolderFiles(folder.id);
      setDriveFiles(updatedFiles);

      setStatusMessage({
        type: 'success',
        text: `Saved formal audit report "${fileName}" to Google Drive folder!`,
      });
    } catch (err: any) {
      console.error('Error saving report to Google Drive:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save audit report to Google Drive.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit confirmation for destructive operation
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !folder) return;

    try {
      setIsLoading(true);
      await deleteDriveFile(fileToDelete.id);
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `File "${fileToDelete.name}" was removed from Google Drive.`,
      });
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete file from Google Drive:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not delete file from Google Drive.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4285F4] via-[#34A853] to-[#FBBC05] text-white shadow-xs">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
                Google Drive Storage
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Upload and organize all your notebooks, datasets, and rubric reports in Google Drive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Auth Section */}
        {!currentUser ? (
          <div className="rounded-2xl border border-neutral-200/90 bg-[#FAF9FC] p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs border border-neutral-200">
              <Folder className="h-6 w-6 text-[#4285F4]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-display text-base font-bold text-neutral-900">
                Connect your Google Account
              </h4>
              <p className="text-xs text-neutral-500">
                Grant permission to automatically store and manage your data science project files in a dedicated Google Drive folder.
              </p>
            </div>
            <div className="pt-2">
              <GoogleSignInButton onClick={handleSignIn} disabled={isLoading} label="Sign in with Google to Connect Drive" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Account Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="h-9 w-9 rounded-full border border-neutral-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4285F4] text-white font-bold text-xs">
                    {(currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadProjectDriveFolder}
                  disabled={isLoading}
                  className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
                  title="Refresh Drive files"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>

            {/* Folder Information Card */}
            <div className="rounded-2xl border border-[#4285F4]/20 bg-[#F4F8FF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4] font-mono">
                  Google Drive Target Folder
                </span>
                <div className="flex items-center gap-2 font-display text-sm font-bold text-neutral-900">
                  <Folder className="h-4 w-4 text-[#4285F4]" />
                  <span>RubricAI Student Projects / {folder?.name || analysis.projectName}</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  All files from this project are grouped inside this dedicated folder on your Drive.
                </p>
              </div>

              {folder?.webViewLink && (
                <a
                  href={folder.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#4285F4]/30 px-3.5 py-2 text-xs font-bold text-[#4285F4] shadow-2xs hover:bg-[#FAF8FF] transition shrink-0"
                >
                  <span>Open Folder in Drive</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Action Buttons: Upload files & Upload Report */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleUploadCurrentProject}
                disabled={isUploading || isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] p-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>
                  {isUploading
                    ? `Uploading (${uploadProgress?.current || 0}/${uploadProgress?.total || analysis.files.length})...`
                    : `Upload All ${analysis.files.length} Files to Drive`}
                </span>
              </button>

              <button
                onClick={handleUploadAuditReport}
                disabled={isUploading || isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3 text-xs font-bold text-neutral-700 shadow-2xs hover:border-[#833AB4] hover:bg-[#FAF8FF] hover:text-[#833AB4] transition disabled:opacity-50 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-[#833AB4]" />
                <span>Save Rubric Audit Report (.md)</span>
              </button>
            </div>

            {/* Live Upload Progress */}
            {isUploading && uploadProgress && (
              <div className="rounded-2xl border border-neutral-100 bg-[#FAF9FC] p-3.5 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-neutral-700">
                  <span>Uploading to Google Drive...</span>
                  <span className="font-mono">
                    {uploadProgress.current} of {uploadProgress.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853] transition-all duration-300"
                    style={{
                      width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 font-mono truncate">
                  Current file: {uploadProgress.fileName}
                </p>
              </div>
            )}

            {/* Uploaded Files Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                  Files on Google Drive ({driveFiles.length})
                </h4>
                {driveFiles.length > 0 && (
                  <span className="text-[11px] text-neutral-400">
                    Auto-synced with project folder
                  </span>
                )}
              </div>

              {driveFiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500 space-y-2">
                  <FolderOpen className="h-8 w-8 mx-auto text-neutral-300" />
                  <p className="font-medium text-neutral-600">No files uploaded to this Drive folder yet.</p>
                  <p className="text-[11px] text-neutral-400">
                    Click "Upload All {analysis.files.length} Files to Drive" above to store your project.
                  </p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-neutral-100 divide-y divide-neutral-100 bg-[#FAF9FC]">
                  {driveFiles.map((file) => {
                    const isNotebook = file.name.endsWith('.ipynb');
                    const isDataset = file.name.endsWith('.csv');
                    const isDoc = file.name.endsWith('.md') || file.name.endsWith('.txt');

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 text-xs hover:bg-white transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isNotebook ? (
                            <FileCode className="h-4 w-4 text-[#833AB4] shrink-0" />
                          ) : isDataset ? (
                            <Database className="h-4 w-4 text-[#405DE6] shrink-0" />
                          ) : isDoc ? (
                            <FileText className="h-4 w-4 text-[#20A464] shrink-0" />
                          ) : (
                            <Folder className="h-4 w-4 text-neutral-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-neutral-800 truncate block">
                              {file.name}
                            </span>
                            {file.createdTime && (
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Added {new Date(file.createdTime).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:text-[#4285F4] hover:border-[#4285F4]/30 transition"
                            >
                              <span>Open</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="rounded-lg p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Destructive Operation Confirmation Dialog (MANDATORY per SKILL guidelines) */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-neutral-900">
                    Delete File from Google Drive?
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Confirm removal of this file from your cloud storage.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-3 text-xs font-mono text-neutral-700">
                {fileToDelete.name}
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to permanently delete this file from your Google Drive folder? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  disabled={isLoading}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Deleting...' : 'Delete File'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
