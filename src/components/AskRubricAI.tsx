import React, { useState } from 'react';
import { ProjectAnalysis } from '../types/project';
import { AssistantResponse, answerProjectQuestionDeterministic } from '../engine/rubricAssistant';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  FileCode,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface AskRubricAIProps {
  analysis: ProjectAnalysis;
  onOpenLearningGuide?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AssistantResponse;
  timestamp: string;
}

export const AskRubricAI: React.FC<AskRubricAIProps> = ({ analysis, onOpenLearningGuide }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: `Hello! I am your RubricAI assistant. I answer questions using the actual evidence from "${analysis.projectName}".\n\nAsk me anything about your project's data handling, methodology, model evaluation, or what you should fix first.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeEngineMode, setActiveEngineMode] = useState<'deterministic' | 'ai_augmented'>('deterministic');

  const suggestedPrompts = [
    'Why was this flagged?',
    'Show me the evidence',
    'What should I fix first?',
    'Am I ready to submit?',
    'Explain data leakage simply',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      let backendSucceeded = false;
      let assistantData: AssistantResponse | null = null;

      try {
        const response = await fetch('/api/ask-rubric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: textToSend,
            projectSummary: analysis.summarySentence,
            evidenceSnippets: analysis.evidence.slice(0, 8),
            findings: analysis.findings.slice(0, 6),
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.augmented && json.answer) {
            backendSucceeded = true;
            setActiveEngineMode('ai_augmented');
            const localFallback = answerProjectQuestionDeterministic(textToSend, analysis);
            assistantData = {
              answer: json.answer,
              citedEvidence: localFallback.citedEvidence,
              confidence: 'VERIFIED',
              categoryBadge: 'AI Augmented Analysis',
              actionableStep: localFallback.actionableStep,
              executionModeUsed: 'ai_augmented',
            };
          }
        }
      } catch (e) {
        // Fall back gracefully
      }

      if (!backendSucceeded || !assistantData) {
        setActiveEngineMode('deterministic');
        assistantData = answerProjectQuestionDeterministic(textToSend, analysis);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: assistantData.answer,
        response: assistantData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#833AB4] font-bold block">
              Evidence-Grounded Assistant
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
                Ask RubricAI
              </h2>
            </div>
            <p className="text-sm text-neutral-600 font-medium">
              "Have a conversation with your project — ask questions and get explanations based on its actual evidence."
            </p>
          </div>

          {/* Engine Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#833AB4] bg-[#FAF8FF] border border-[#833AB4]/25">
              <Sparkles className="h-3.5 w-3.5 text-[#E1306C]" />
              <span>
                {activeEngineMode === 'ai_augmented'
                  ? 'Gemini Augmented'
                  : 'Deterministic Engine (Active)'}
              </span>
            </span>
          </div>
        </div>

        {/* Colorful Suggested Question Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold block">
            Suggested conversation starters:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isProcessing}
                className="rounded-2xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#833AB4] hover:bg-[#FAF8FF] hover:text-[#833AB4] transition active:scale-98 shadow-2xs disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Conversational Message Stream */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs min-h-[460px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[560px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-2xs shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-5 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#833AB4] to-[#E1306C] text-white shadow-md rounded-tr-xs'
                    : 'bg-[#FAF9FC] border border-neutral-100 text-neutral-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-medium leading-relaxed">
                  {msg.text}
                </div>

                {/* Grounded Evidence Citation Cards */}
                {msg.response && msg.response.citedEvidence.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#833AB4] font-bold block">
                      CITED PROJECT EVIDENCE
                    </span>
                    <div className="space-y-2">
                      {msg.response.citedEvidence.map((ev, i) => (
                        <div
                          key={i}
                          className="rounded-2xl bg-white border border-neutral-200/90 p-3 space-y-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-bold text-neutral-900">
                            <span>{ev.title}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              {ev.location}
                            </span>
                          </div>
                          <pre className="font-mono text-[10px] text-emerald-800 bg-[#F2FBF6] p-2 rounded-xl overflow-x-auto">
                            <code>{ev.snippet}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Step Pill */}
                {msg.response && msg.response.actionableStep && (
                  <div className="rounded-2xl border border-emerald-100 bg-[#F2FBF6] p-3 text-xs text-[#20A464] font-semibold flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Recommended action: {msg.response.actionableStep}</span>
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono ${
                    msg.sender === 'user' ? 'text-white/70 text-right' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-2xs shrink-0 mt-0.5 font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-2xs animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-[#FAF9FC] border border-neutral-100 px-4 py-2.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E1306C] animate-ping" />
                <span className="font-medium text-neutral-700">Checking project files and evidence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-neutral-100"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about your project..."
            disabled={isProcessing}
            className="flex-1 rounded-2xl border border-neutral-200 bg-[#FAF9FC] px-4 py-3.5 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-[#833AB4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#833AB4]/20 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition disabled:opacity-40 flex items-center gap-2"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
