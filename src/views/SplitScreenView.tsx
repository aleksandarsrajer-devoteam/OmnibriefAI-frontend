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

const renderMarkdown = (text: string) => {
  if (!text) return null;
  // Convert newlines to paragraphs or list items
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para, idx) => {
    const htmlContent = para.trim();
    if (!htmlContent) return null;
    
    // Check if it is a heading: e.g. ### Title or ## Title
    if (htmlContent.startsWith('### ')) {
      return <h5 key={idx} className="text-xs font-bold text-slate-200 mt-4 mb-2">{htmlContent.replace('### ', '')}</h5>;
    }
    if (htmlContent.startsWith('## ')) {
      return <h4 key={idx} className="text-sm font-bold text-slate-100 mt-4 mb-2">{htmlContent.replace('## ', '')}</h4>;
    }
    if (htmlContent.startsWith('# ')) {
      return <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2">{htmlContent.replace('# ', '')}</h3>;
    }
    
    // Check if it is a bullet point: e.g. * point or - point
    if (htmlContent.startsWith('* ') || htmlContent.startsWith('- ')) {
      const items = htmlContent.split('\n').map(item => item.replace(/^[*-\s]+/, ''));
      return (
        <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs text-slate-300 mb-3">
          {items.map((item, itemIdx) => {
            // Basic bold conversion
            const boldText = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <li key={itemIdx} dangerouslySetInnerHTML={{ __html: boldText }} />;
          })}
        </ul>
      );
    }
    
    // Basic bold conversion inside normal paragraph
    const boldText = htmlContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: boldText }} />;
  });
};

export const SplitScreenView: React.FC = () => {
  const { selectedFile, setView } = useApp();

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
          <div className="px-6 py-3 bg-slate-900/20 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">Artificial Intelligence Briefing</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                selectedFile.status === 'Ready'
                  ? 'bg-emerald-500'
                  : selectedFile.status === 'Failed'
                    ? 'bg-rose-500'
                    : 'bg-brand-500 animate-pulse'
              }`}></span>
              <span className={`text-[10px] font-semibold tracking-wider uppercase ${
                selectedFile.status === 'Ready'
                  ? 'text-emerald-400'
                  : selectedFile.status === 'Failed'
                    ? 'text-rose-400'
                    : 'text-brand-400'
              }`}>
                {selectedFile.status === 'Ready'
                  ? 'Analysis Ready'
                  : selectedFile.status === 'Failed'
                    ? 'Analysis Failed'
                    : 'Processing...'}
              </span>
            </div>
          </div>

          {/* AI content viewport */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            
            {/* 1. LOADING & FAILED STATES */}
            {selectedFile.status !== 'Ready' ? (
              selectedFile.status === 'Failed' ? (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border border-rose-950/20 rounded-2xl min-h-[300px]">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <XCircle className="w-8 h-8 text-rose-500" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    AI Briefing Generation Failed
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 mb-0 leading-relaxed">
                    The processing worker encountered an error while analyzing this file. Please check if the file is valid and try uploading it again.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 border border-slate-800/60 rounded-2xl min-h-[300px]">
                  <div className="relative mb-6">
                    {/* Glowing spinning progress circle */}
                    <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-brand-500 animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 bg-brand-500/10 rounded-full blur-xl animate-pulse"></div>
                    <Sparkles className="w-6 h-6 text-brand-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-slate-200">
                    Extracting Knowledge Brief
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 mb-0 leading-relaxed">
                    Our AI agent is currently reading your GCS file content and generating study summaries, transcripts, and quizzes. This usually takes 10-20 seconds.
                  </p>
                  <div className="mt-6 flex items-center gap-2 bg-slate-900/50 border border-slate-800/80 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Waiting for Cloud Tasks callback...</span>
                  </div>
                </div>
              )
            ) : (
              /* 2. READY STATE */
              <div className="space-y-6">
                
                {/* BRIEF SUMMARY */}
                <section className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2 my-0">
                    <BookOpen className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </h4>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                    {renderMarkdown(selectedFile.summary || 'No summary text returned by the AI.')}
                  </div>
                </section>

                {/* TRANSCRIPTION SECTION (Only for videos) */}
                {selectedFile.type === 'video' && selectedFile.transcription && selectedFile.transcription !== 'N/A' && (
                  <section className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2 my-0">
                      <Layers className="w-4 h-4" />
                      <span>Speech Transcription</span>
                    </h4>
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                      {renderMarkdown(selectedFile.transcription)}
                    </div>
                  </section>
                )}

                {/* INTERACTIVE KNOWLEDGE CHECK */}
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
                        <div className="mt-4">
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
                                The correct answer is: <em>Utilizing multi-dimensional vector embeddings and indexation mapping</em>.
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

          </div>
        </div>

      </div>
    </div>
  );
};
