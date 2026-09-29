import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  FileText,
  PlayCircle,
  UploadCloud,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Bot,
  Activity,
  Search,
  ChevronDown,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Folder,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  onOpenReport: () => void;
  onOpenLearningGuide: () => void;
  hasProject: boolean;
  projectName?: string;
  currentUser?: User | null;
  onOpenGoogleDrive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onLoadDemo,
  onOpenReport,
  onOpenLearningGuide,
  hasProject,
  projectName,
  currentUser,
  onOpenGoogleDrive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [insightsDropdownOpen, setInsightsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInsightsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isInsightsActive =
    currentTab === 'insights' ||
    currentTab === 'detective' ||
    currentTab === 'autopsy' ||
    currentTab === 'code_health' ||
    currentTab === 'readiness';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Distinctive RubricAI Logo & Typographic Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            {/* Signature Gradient Icon Mark */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
                <path d="m8 11 2 2 4-4" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-extrabold tracking-tight text-neutral-900 group-hover:opacity-90">
                  RUBRIC<span className="brand-gradient-text">AI</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#FFF0F5] text-[#E1306C] border border-[#E1306C]/20">
                  v2.0
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] font-medium text-neutral-400 tracking-wide leading-none">
                Evidence-grounded project intelligence
              </span>
            </div>
          </button>

          {projectName && (
            <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-neutral-500 font-mono ml-3 pl-3 border-l border-neutral-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-neutral-700 truncate max-w-[180px]">
                {projectName}
              </span>
            </span>
          )}
        </div>

        {/* Center: Clean Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-neutral-600">
          <button
            onClick={() => onSelectTab('overview')}
            className={`relative py-1 transition-colors hover:text-neutral-900 cursor-pointer ${
              currentTab === 'overview'
                ? 'text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-[#833AB4] after:to-[#E1306C]'
                : ''
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onSelectTab('rubric')}
            className={`relative py-1 transition-colors hover:text-neutral-900 cursor-pointer ${
              currentTab === 'rubric'
                ? 'text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-[#833AB4] after:to-[#E1306C]'
                : ''
            }`}
          >
            Review
          </button>

          <button
            onClick={() => onSelectTab('evidence')}
            className={`relative py-1 transition-colors hover:text-neutral-900 cursor-pointer ${
              currentTab === 'evidence'
                ? 'text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-[#833AB4] after:to-[#E1306C]'
                : ''
            }`}
          >
            Evidence
          </button>

          {/* Insights Dropdown & Direct Link */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => onSelectTab('insights')}
                className={`relative py-1 pr-1 transition-colors hover:text-neutral-900 cursor-pointer ${
                  isInsightsActive
                    ? 'text-neutral-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-[#833AB4] after:to-[#E1306C]'
                    : ''
                }`}
              >
                <span>Insights</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInsightsDropdownOpen((prev) => !prev);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer rounded-md hover:bg-neutral-100"
                aria-label="Toggle Insights Menu"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-150 ${
                    insightsDropdownOpen ? 'rotate-180 text-[#E1306C]' : ''
                  }`}
                />
              </button>
            </div>

            {insightsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-neutral-100 bg-white p-2.5 shadow-xl space-y-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    onSelectTab('insights');
                    setInsightsDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-neutral-50 transition flex items-center justify-between group border-b border-neutral-100 pb-2 mb-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#833AB4]" />
                    <span className="font-bold text-neutral-900">All Insights Suite</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-900" />
                </button>

                <button
                  onClick={() => {
                    onSelectTab('detective');
                    setInsightsDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-[#FAF8FF] transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#FAF8FF] text-[#833AB4] flex items-center justify-center shrink-0 group-hover:bg-[#833AB4] group-hover:text-white transition">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Project Detective</div>
                    <div className="text-[11px] text-neutral-500">Find hidden issues & warnings</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('autopsy');
                    setInsightsDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-[#FFF5F8] transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#FFF5F8] text-[#E1306C] flex items-center justify-center shrink-0 group-hover:bg-[#E1306C] group-hover:text-white transition">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Project Autopsy</div>
                    <div className="text-[11px] text-neutral-500">Visual diagnosis of 5 pillars</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('readiness');
                    setInsightsDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-[#F2FBF6] transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#F2FBF6] text-[#20A464] flex items-center justify-center shrink-0 group-hover:bg-[#20A464] group-hover:text-white transition">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Before You Submit</div>
                    <div className="text-[11px] text-neutral-500">Pre-flight checklist & fixes</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('code_health');
                    setInsightsDropdownOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-[#F4F8FF] transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#F4F8FF] text-[#405DE6] flex items-center justify-center shrink-0 group-hover:bg-[#405DE6] group-hover:text-white transition">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">Code Health</div>
                    <div className="text-[11px] text-neutral-500">Execution order & static audit</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Zone */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => onSelectTab('ask')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
              currentTab === 'ask'
                ? 'bg-[#833AB4] text-white shadow-xs'
                : 'text-neutral-700 bg-neutral-50 hover:bg-[#FAF8FF] hover:text-[#833AB4]'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-[#E1306C]" />
            <span>Ask RubricAI</span>
          </button>

          {/* Google Drive Integration Action */}
          <button
            onClick={onOpenGoogleDrive}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition shadow-2xs cursor-pointer ${
              currentUser
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-neutral-200/90 bg-white text-neutral-700 hover:border-[#4285F4]/40 hover:bg-[#F4F8FF] hover:text-[#4285F4]'
            }`}
            title="Manage Google Drive files"
          >
            <Folder className={`h-3.5 w-3.5 ${currentUser ? 'text-emerald-600' : 'text-[#4285F4]'}`} />
            <span>{currentUser ? 'Drive Synced' : 'Google Drive'}</span>
          </button>

          <button
            onClick={onOpenLearningGuide}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition shadow-2xs cursor-pointer"
            title="Beginner guide & concepts"
          >
            <HelpCircle className="h-3.5 w-3.5 text-neutral-500" />
            <span>Guide</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition shadow-2xs cursor-pointer"
          >
            <PlayCircle className="h-3.5 w-3.5 text-[#F77737]" />
            <span>Demo</span>
          </button>

          {/* Primary Gradient Action Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-98 transition transform cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Start a Review</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-neutral-700 hover:bg-neutral-100 transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2 duration-150 text-xs">
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectTab('overview');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 font-semibold cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => {
                onSelectTab('rubric');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 font-semibold cursor-pointer"
            >
              Review (Rubric & Health)
            </button>
            <button
              onClick={() => {
                onSelectTab('evidence');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 font-semibold cursor-pointer"
            >
              Evidence Explorer
            </button>

            <button
              onClick={() => {
                onSelectTab('insights');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-neutral-50 font-bold text-neutral-900 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#833AB4]" />
                <span>Insights Suite</span>
              </div>
              <span className="text-[10px] font-mono text-[#833AB4] bg-white border border-[#833AB4]/20 px-2 py-0.5 rounded-full">
                4 Tools
              </span>
            </button>

            <div className="pl-3 space-y-1 border-l-2 border-neutral-200 ml-2">
              <button
                onClick={() => {
                  onSelectTab('detective');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#FAF8FF] font-semibold text-[#833AB4] flex items-center gap-2 cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Project Detective</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('autopsy');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#FFF5F8] font-semibold text-[#E1306C] flex items-center gap-2 cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Project Autopsy</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('readiness');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#F2FBF6] font-semibold text-[#20A464] flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Before You Submit</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('code_health');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#F4F8FF] font-semibold text-[#405DE6] flex items-center gap-2 cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Code Health</span>
              </button>
            </div>

            <button
              onClick={() => {
                onSelectTab('ask');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 font-semibold cursor-pointer"
            >
              Ask RubricAI
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={() => {
                if (onOpenGoogleDrive) onOpenGoogleDrive();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 p-2.5 font-semibold text-neutral-700 bg-neutral-50 cursor-pointer"
            >
              <Folder className="h-4 w-4 text-[#4285F4]" />
              <span>{currentUser ? 'Google Drive (Connected)' : 'Connect Google Drive'}</span>
            </button>
            <button
              onClick={() => {
                onOpenLearningGuide();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 p-2.5 font-semibold text-neutral-700 bg-neutral-50 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Student Learning Guide</span>
            </button>
            <button
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] p-2.5 font-bold text-white shadow-md cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Start a Review</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
