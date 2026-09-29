import React, { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { ProjectFile } from '../types/project';
import { SAMPLE_PROJECTS, SampleProjectConfig } from '../data/sampleProjects';
import {
  UploadCloud,
  FileCode,
  Database,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Folder,
  ExternalLink,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { uploadProjectFilesToDrive, DriveFolder } from '../services/googleDriveService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeFiles: (projectName: string, files: ProjectFile[]) => void;
  currentUser: User | null;
  onSignInGoogle: () => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeFiles,
  currentUser,
  onSignInGoogle,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'samples'>('upload');
  const [projectName, setProjectName] = useState('My Data Science Project');
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncToDrive, setSyncToDrive] = useState(true);
  const [driveUploadStatus, setDriveUploadStatus] = useState<string | null>(null);
  const [uploadedFolder, setUploadedFolder] = useState<DriveFolder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    const newFiles: ProjectFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();

      try {
        const text = await file.text();
        if (text.trim().length === 0) {
          newFiles.push({
            name: file.name,
            size: file.size,
            type: 'text',
            content: '# Empty file provided',
          });
          continue;
        }

        let fileType: ProjectFile['type'] = 'other';
        if (ext === 'ipynb') fileType = 'notebook';
        else if (ext === 'py') fileType = 'python';
        else if (ext === 'csv') fileType = 'dataset';
        else if (ext === 'md') fileType = 'markdown';
        else if (ext === 'txt') fileType = 'text';

        newFiles.push({
          name: file.name,
          size: file.size,
          type: fileType,
          content: text,
        });
      } catch (err) {
        setUploadError(`We couldn't read ${file.name}. Try uploading the original .ipynb or .csv file again.`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      if (projectName === 'My Data Science Project' && newFiles[0]) {
        setProjectName(newFiles[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeUploaded = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please choose at least one notebook (.ipynb), code (.py), or dataset (.csv) to review.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    // If Google Drive sync is enabled and user is logged in, upload files to Drive
    if (syncToDrive && currentUser) {
      try {
        setDriveUploadStatus(`Uploading ${uploadedFiles.length} file(s) to Google Drive...`);
        const result = await uploadProjectFilesToDrive(
          projectName,
          uploadedFiles.map((f) => ({ name: f.name, content: f.content })),
          (current, total, fileName) => {
            setDriveUploadStatus(`Uploading to Google Drive: ${fileName} (${current}/${total})...`);
          }
        );
        setUploadedFolder(result.folder);
        setDriveUploadStatus(`Uploaded to Google Drive folder "${result.folder.name}"!`);
      } catch (err: any) {
        console.error('Google Drive auto-upload warning:', err);
        // We still let analysis continue even if drive upload encounters a network issue
      }
    }

    setTimeout(() => {
      onAnalyzeFiles(projectName, uploadedFiles);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  const handleSelectSample = (sample: SampleProjectConfig) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAnalyzeFiles(sample.name, sample.files);
      setIsProcessing(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-xs">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
                Inspect Project
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Upload your files and automatically save them to Google Drive.
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

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#833AB4] text-[#833AB4]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Upload Files to Review & Drive
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'samples'
                ? 'border-[#833AB4] text-[#833AB4]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Curated Demo Scenarios
          </button>
        </div>

        {/* Tab 1: Custom Upload & Google Drive Sync */}
        {activeTab === 'upload' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Student Exam Score Predictor"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#833AB4] focus:outline-none focus:ring-2 focus:ring-[#833AB4]/20 transition"
              />
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center transition hover:border-[#833AB4] hover:bg-[#FAF8FF]/40"
            >
              <UploadCloud className="mx-auto h-8 w-8 text-[#833AB4] mb-2" />
              <p className="text-xs font-bold text-neutral-900">
                Click to browse or drop project files here
              </p>
              <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                Supports .ipynb (Jupyter), .py (Python), .csv (Datasets), .md (Documentation)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ipynb,.py,.csv,.xlsx,.md,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Google Drive Sync Option Card */}
            <div className="rounded-2xl border border-[#4285F4]/20 bg-[#F4F8FF]/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4285F4] text-white">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-neutral-900 block">
                      Google Drive Folder Storage
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Files will be stored in: <code className="text-[#4285F4] font-semibold">RubricAI Student Projects / {projectName}</code>
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToDrive}
                    onChange={(e) => setSyncToDrive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4285F4]"></div>
                </label>
              </div>

              {!currentUser ? (
                <div className="pt-2 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <span className="text-[11px] text-neutral-600">
                    Sign in to automatically save these files to your Google Drive.
                  </span>
                  <GoogleSignInButton onClick={onSignInGoogle} label="Connect Drive" />
                </div>
              ) : (
                <div className="pt-2 border-t border-[#4285F4]/20 flex items-center justify-between text-[11px] text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Connected as <strong className="text-neutral-800">{currentUser.email}</strong></span>
                  </div>
                  <span className="text-emerald-700 font-medium">Ready to sync</span>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Uploaded Files Queue */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-neutral-400 font-mono block">
                  Staged Files ({uploadedFiles.length})
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-neutral-100 border border-neutral-100 rounded-xl p-2 bg-[#FAF9FC]">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {file.type === 'notebook' ? (
                          <FileCode className="h-4 w-4 text-[#833AB4] shrink-0" />
                        ) : file.type === 'dataset' ? (
                          <Database className="h-4 w-4 text-[#405DE6] shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-neutral-500 shrink-0" />
                        )}
                        <span className="font-semibold text-neutral-800 truncate">{file.name}</span>
                        <span className="font-mono text-[10px] text-neutral-400 shrink-0">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {driveUploadStatus && (
                  <div className="text-xs text-[#4285F4] font-medium p-2 bg-[#F4F8FF] rounded-xl flex items-center gap-2">
                    <Folder className="h-4 w-4 shrink-0" />
                    <span>{driveUploadStatus}</span>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    onClick={handleAnalyzeUploaded}
                    disabled={isProcessing}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] py-3.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing
                      ? 'Processing & Saving to Drive...'
                      : syncToDrive && currentUser
                      ? 'Upload to Google Drive & Review →'
                      : 'Start a Review →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Curated Samples */}
        {activeTab === 'samples' && (
          <div className="space-y-3">
            {SAMPLE_PROJECTS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="group cursor-pointer rounded-2xl border border-neutral-200/90 p-4.5 transition brand-card-hover hover:border-[#833AB4]/40 hover:bg-[#FAF8FF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-extrabold text-neutral-900">
                      {sample.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-[#FAF8FF] text-[#833AB4] border border-[#833AB4]/20 px-2 py-0.5 rounded-full">
                      {sample.badge}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 max-w-lg leading-relaxed font-medium">
                    {sample.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                    <span>{sample.files.length} files:</span>
                    <span>{sample.files.map((f) => f.name).join(', ')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#833AB4] to-[#E1306C] px-4 py-2 text-xs font-bold text-white shadow-xs group-hover:opacity-95 transition shrink-0 self-start sm:self-center cursor-pointer"
                >
                  <span>Load</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
