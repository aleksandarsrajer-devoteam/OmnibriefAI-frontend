import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  UploadCloud,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  FolderOpen,
  ChevronRight,
  TrendingUp,
  User,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    files, 
    logout, 
    uploadFile, 
    selectFile, 
    isUploading, 
    uploadProgress,
    fetchFiles 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refresh files list when dashboard is mounted
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        await uploadFile(file);
      } catch (err: any) {
        console.error('File upload failed:', err);
        alert(err.message || 'File upload failed. Please try again.');
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        await uploadFile(file);
      } catch (err: any) {
        console.error('File upload failed:', err);
        alert(err.message || 'File upload failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand area */}
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              OB
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight block">OmniBrief AI</span>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise Suite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                activeTab === 'settings'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-slate-200 truncate">
                Active Session
              </span>
              <span className="block text-[10px] text-slate-400 truncate">
                {user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30 border border-slate-800 rounded-xl text-xs text-slate-400 font-medium transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/60 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-300">
              {activeTab === 'dashboard' ? 'Personal Briefs' : 'Application Settings'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats indicator */}
            <div className="hidden sm:flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 border border-slate-800 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <FolderOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>Files: {files.length}</span>
              </div>
              <div className="w-px h-3 bg-slate-800"></div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready: {files.filter(f => f.status === 'Ready').length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {activeTab === 'dashboard' ? (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              {/* Header banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100 tracking-tight my-0">
                    Welcome to OmniBrief AI
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload documents or video recordings to automatically summarize, extract key findings, and generate interactive quizzes.
                  </p>
                </div>
              </div>

              {/* UPLOAD DRAG-AND-DROP BANNER */}
              {isUploading ? (
                <div className="border-2 border-dashed border-brand-500/60 bg-brand-500/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[180px] transition-all">
                  <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-300 font-semibold">
                      <span>Uploading directly to Google Cloud Storage...</span>
                      <span className="text-brand-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">
                      Your file is streamed directly to custom GCS bucket <code className="text-brand-400/80 font-mono">omnibriefai-file-uploads-dev</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,video/*"
                    className="hidden"
                  />
                  <div className="p-4 bg-brand-500/10 rounded-full border border-brand-500/20 text-brand-400 mb-4 shadow-lg shadow-brand-500/5">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Upload a PDF or Video file
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
                    Drag and drop your file here, or click to browse local storage. Supports PDFs up to 50MB and MP4/WebM videos.
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400 bg-slate-900/80 px-4 py-1.5 border border-slate-800 rounded-full pointer-events-none">
                    <span>PDF, MP4, WebM</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>Max 50MB</span>
                  </div>
                </div>
              )}

              {/* SECTION HEADER */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 my-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Recent Uploads</span>
                </h2>
                <span className="text-xs text-slate-400">{files.length} items</span>
              </div>

              {/* GRID OF CARDS */}
              {files.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/10 border border-slate-850 rounded-2xl">
                  <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No files found. Upload one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {files.map((file) => {
                    const isPdf = file.type === 'pdf';
                    const isReady = file.status === 'Ready';

                    return (
                      <div
                        key={file.id}
                        onClick={() => selectFile(file)}
                        className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-950/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between animate-fade-in"
                      >
                        <div>
                          {/* Card Header: Icon & Badge */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className={`p-2.5 rounded-xl border ${
                              isPdf
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                            }`}>
                              {isPdf ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </div>
                            
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${
                              isReady
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {!isReady && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                              {file.status}
                            </span>
                          </div>

                          {/* Title and Date */}
                          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-brand-400 transition-colors line-clamp-1">
                            {file.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Uploaded on {file.uploadDate}
                          </p>
                        </div>

                        {/* Card Footer Interaction */}
                        <div className="mt-5 pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">
                            {isPdf ? 'Document Analysis' : 'Video Brief'}
                          </span>
                          <span className="text-brand-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Open View</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* SETTINGS TAB */
            <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 animate-fade-in shadow-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-100 my-0">Account Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your workspace keys, models, and UI preferences.</p>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Workspace Owner
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Default AI Model
                  </label>
                  <select
                    disabled
                    className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed"
                  >
                    <option>Gemini 1.5 Pro (Workspace Default)</option>
                    <option>Gemini 1.5 Flash</option>
                  </select>
                </div>

                <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl text-xs text-slate-400">
                  <div className="flex gap-2.5">
                    <TrendingUp className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200 block mb-0.5">Account Connected</span>
                      You are authenticated via Firebase Auth securely. Files are stored under Firestore database <code className="text-brand-400/80 font-mono">omnibrief-db</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
