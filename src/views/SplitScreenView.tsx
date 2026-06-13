import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  FileText,
  Video,
  Sparkles,
  Award,
  Layers,
  RefreshCw,
  BookOpen,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const SplitScreenView: React.FC = () => {
  const { selectedFile, setView } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);


  // If no file is selected, fallback to dashboard
  if (!selectedFile) {
    return (
      <div className="p-8 text-center bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">No file selected for viewing.</p>
        <button
          onClick={() => setView('dashboard')}
          className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl text-sm transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPdf = selectedFile.type === 'pdf';

  const triggerAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisDone(false);
    setSelectedAnswer(null);
    setQuizSubmitted(false);

    // Simulate AI computing
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisDone(true);
    }, 2000);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswer !== null) {
      setQuizSubmitted(true);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      
      {/* HEADER CONTROL BAR */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 px-3 py-1.5 border border-slate-800 rounded-lg transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
          </button>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-4 h-4 text-rose-400" />
            ) : (
              <Video className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-xs font-semibold text-slate-200 max-w-xs truncate">
              {selectedFile.name}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          OmniBrief AI // Split Viewer
        </div>
      </header>

      {/* 50/50 GRID CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT SIDE: FILE CONTAINER (50% WIDTH) */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-1/2 lg:h-full bg-slate-900/30">
          
          {/* File Header Details */}
          <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>Original Media Stream</span>
            {isPdf && (
              <div className="flex items-center gap-2 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                <span>Multi-Page Scroll Enabled</span>
              </div>
            )}
            {!isPdf && <span className="text-[10px] font-mono uppercase bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 text-brand-400">MP4 H.264</span>}
          </div>

          {/* Core File Display Area */}
          <div className="flex-1 w-full overflow-hidden relative flex items-center justify-center bg-slate-950">
            {isPdf ? (
              /* NATIVE BROWSER PDF VIEWER */
              selectedFile.blobUrl ? (
                <iframe
                  src={selectedFile.blobUrl}
                  className="w-full h-full border-none bg-slate-950"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="p-8 text-center max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl animate-fade-in m-8">
                  <FileText className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-slate-200">No Document Link Available</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Please upload a real local PDF file in the Dashboard to test native browser PDF preview.
                  </p>
                </div>
              )
            ) : (
              /* VIDEO HTML5 TAG */
              <div className="w-full h-full max-w-4xl p-4 md:p-8 flex items-center justify-center">
                <video
                  src={selectedFile.blobUrl || selectedFile.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
                  controls
                  className="w-full max-h-full rounded-2xl border border-slate-800 shadow-2xl bg-black focus:outline-none object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: AI ACTION PANEL (50% WIDTH) */}
        <div className="w-full lg:w-1/2 flex flex-col h-1/2 lg:h-full bg-slate-950">
          
          {/* Action Header */}
          <div className="px-6 py-3 bg-slate-900/20 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">Artificial Intelligence Briefing</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Online Agent</span>
            </div>
          </div>

          {/* AI content viewport */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            
            {/* Generate Action CTA */}
            <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-400 mb-3 shadow-lg shadow-brand-500/5">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              
              <h3 className="text-sm font-semibold text-slate-200">
                AI Knowledge Extraction
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Parse the full file content to construct smart indexes, study highlights, and testing questions.
              </p>

              <button
                onClick={triggerAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-brand-600/10 active:scale-[0.98] transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{analysisDone ? 'Re-generate AI Analysis' : 'Generate AI Analysis'}</span>
                  </>
                )}
              </button>
            </div>

            {/* SKELETON LOADER STATE */}
            {isAnalyzing && (
              <div className="space-y-6 animate-pulse">
                {/* Skeleton Section 1 */}
                <div className="space-y-3">
                  <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="h-2.5 bg-slate-800 rounded w-full"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-11/12"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-4/5"></div>
                  </div>
                </div>

                {/* Skeleton Section 2 */}
                <div className="space-y-3">
                  <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                      <div className="h-2.5 bg-slate-800 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                      <div className="h-2.5 bg-slate-800 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                      <div className="h-2.5 bg-slate-800 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RENDER ANALYZED CONTENT */}
            {analysisDone && !isAnalyzing && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. BRIEF SUMMARY */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2 my-0">
                    <BookOpen className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </h4>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-slate-300 text-xs leading-relaxed">
                    This file outlines technical operations and product milestones for the OmniBrief AI suite. 
                    It presents the underlying architecture using vector embeddings to run real-time semantic analysis on files, 
                    creating local caches for interactive quizzes. The key objectives center around optimizing the parsing speed for large PDF books 
                    and caching audio tracks in videos to extract sub-second speech transcriptions.
                  </div>
                </section>

                {/* 2. KEY HIGHLIGHTS */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2 my-0">
                    <Layers className="w-4 h-4" />
                    <span>Key Highlights</span>
                  </h4>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <p className="text-xs text-slate-300 leading-relaxed my-0">
                        <strong className="text-slate-200 block font-medium">Vector-Based Semantic Parsing</strong>
                        Ingestion pipeline compiles documents into multi-dimensional coordinates to build search indexation mappings.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <p className="text-xs text-slate-300 leading-relaxed my-0">
                        <strong className="text-slate-200 block font-medium">Synchronized Audio Extraction</strong>
                        Videos leverage HTML5 audio extractors to run background diarization, identifying distinct speakers on the timeline.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <p className="text-xs text-slate-300 leading-relaxed my-0">
                        <strong className="text-slate-200 block font-medium">Client-Side State Integrity</strong>
                        Encapsulated application states allow seamless local operations before synchronizing parameters to the remote server database.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. INTERACTIVE QUIZ */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2 my-0">
                    <Award className="w-4 h-4" />
                    <span>Knowledge Check</span>
                  </h4>
                  
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block mb-2">Question 1 of 1</span>
                    <p className="text-xs font-medium text-slate-200 mb-4 my-0">
                      What is the primary method OmniBrief AI uses to enable real-time semantic search and questions inside documents?
                    </p>

                    <form onSubmit={handleQuizSubmit} className="space-y-2.5">
                      {[
                        'Creating a full server-side copy of the file database',
                        'Utilizing multi-dimensional vector embeddings and indexation mapping',
                        'Extracting screenshots of text using optical characters',
                      ].map((option, idx) => (
                        <label
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedAnswer === idx
                              ? 'bg-brand-500/10 border-brand-500 text-slate-200'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="quiz-q1"
                            checked={selectedAnswer === idx}
                            onChange={() => !quizSubmitted && setSelectedAnswer(idx)}
                            disabled={quizSubmitted}
                            className="mt-0.5 text-brand-500 focus:ring-brand-500 border-slate-800 bg-slate-950"
                          />
                          <span className="leading-tight">{option}</span>
                        </label>
                      ))}

                      {/* Submit controls */}
                      {!quizSubmitted ? (
                        <button
                          type="submit"
                          disabled={selectedAnswer === null}
                          className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-all mt-4"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <div className="mt-4 animate-fade-in">
                          {selectedAnswer === 1 ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-start gap-2">
                              <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block">Correct!</span>
                                Semantic parsing maps the document layout into vector databases for rapid index query lookups.
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2">
                              <XCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block">Incorrect.</span>
                                The correct answer is: <em>Utilizing multi-dimensional vector embeddings and indexation mapping</em>. Click "Re-generate" above to try again.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </form>
                  </div>
                </section>

              </div>
            )}

            {/* INITIAL BLANK VIEW BEFORE GENERATING ANALYSIS */}
            {!analysisDone && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center p-12 border border-slate-900 rounded-2xl text-slate-500 text-xs select-none">
                <Sparkles className="w-8 h-8 text-slate-800 mb-3" />
                <span>AI results will compile below. Click "Generate" above to begin.</span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
