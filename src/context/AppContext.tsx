import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import axios from 'axios';

export type ViewType = 'auth' | 'dashboard' | 'split-screen-viewer';
export type FileType = 'pdf' | 'video';
export type FileStatus = 'Pending' | 'Processing' | 'Ready' | 'Failed';

export interface FileItem {
  id: string;
  name: string;
  uploadDate: string;
  type: FileType;
  status: FileStatus;
  videoUrl?: string;
  rawFile?: File;
  blobUrl?: string;
  summary?: string;
  transcription?: string;
}

interface AppContextType {
  currentView: ViewType;
  user: FirebaseUser | null;
  files: FileItem[];
  selectedFile: FileItem | null;
  authLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  setView: (view: ViewType) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  selectFile: (file: FileItem) => Promise<void>;
  fetchFiles: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const config = window.APP_CONFIG || {};

// Create Axios HTTP client for API server requests
const api = axios.create({
  baseURL: `${config.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`,
});

// Configure Axios interceptors to automatically inject the Bearer ID token for authorization
api.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<ViewType>('auth');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync user state with Firebase Authentication status and initialize history hash
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        const hash = window.location.hash.replace('#', '');
        const targetView: ViewType = (hash === 'split-screen-viewer' || hash === 'dashboard') ? (hash as ViewType) : 'dashboard';
        setView(targetView);
        window.history.replaceState({ view: targetView }, '', `#${targetView}`);
        fetchFiles();
      } else {
        setView('auth');
        window.history.replaceState({ view: 'auth' }, '', '#auth');
        setFiles([]);
        setSelectedFile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Intercept browser back/forward popstate events to synchronize React view state
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'auth' || hash === 'dashboard' || hash === 'split-screen-viewer') {
          setView(hash as ViewType);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Set up Server-Sent Events (SSE) listener for real-time notifications
  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let reconnectDelay = 1000;
    const maxReconnectDelay = 30000;

    const connectSSE = async () => {
      try {
        if (!auth.currentUser) return;

        // Fetch a fresh identity token from Firebase
        const token = await auth.currentUser.getIdToken(true);
        const backendUrl = config.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const sseUrl = `${backendUrl}/api/notifications/sse?token=${encodeURIComponent(token)}`;

        console.log('[SSE Client] Connecting to:', `${backendUrl}/api/notifications/sse`);
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
          console.log('[SSE Client] Connection successfully opened.');
          reconnectDelay = 1000; // Reset delay on successful connection
        };

        eventSource.addEventListener('connected', (e: any) => {
          console.log('[SSE Client] Connection handshake response:', e.data);
        });

        eventSource.addEventListener('file-created', (e: any) => {
          try {
            const fileDoc = JSON.parse(e.data);
            console.log('[SSE Client] Received file-created event payload:', fileDoc);

            setFiles((prev) => {
              const exists = prev.some((f) => f.id === fileDoc.id);
              const uploadDate = fileDoc.createdAt
                ? new Date(fileDoc.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                : 'Unknown Date';
              const type = fileDoc.fileName?.endsWith('.pdf') ? 'pdf' : 'video';
              const status: FileStatus =
                fileDoc.status === 'ready' ? 'Ready' :
                fileDoc.status === 'processing' ? 'Processing' :
                fileDoc.status === 'failed' ? 'Failed' : 'Pending';

              const mappedFile: FileItem = {
                id: fileDoc.id,
                name: fileDoc.fileName || 'Unnamed File',
                uploadDate,
                type,
                status,
                videoUrl: fileDoc.url,
                blobUrl: fileDoc.url,
                summary: fileDoc.summary,
                transcription: fileDoc.transcription,
              };

              if (exists) {
                return prev.map((f) => (f.id === fileDoc.id ? mappedFile : f));
              } else {
                return [mappedFile, ...prev];
              }
            });

            // Update selectedFile if the active viewer file matches the completed file
            setSelectedFile((prev) => {
              if (prev && prev.id === fileDoc.id) {
                const status: FileStatus =
                  fileDoc.status === 'ready' ? 'Ready' :
                  fileDoc.status === 'processing' ? 'Processing' :
                  fileDoc.status === 'failed' ? 'Failed' : 'Pending';

                return {
                  ...prev,
                  status,
                  videoUrl: fileDoc.url,
                  blobUrl: fileDoc.url,
                  summary: fileDoc.summary,
                  transcription: fileDoc.transcription,
                };
              }
              return prev;
            });
          } catch (err) {
            console.error('[SSE Client] Error parsing event message payload:', err);
          }
        });

        eventSource.onerror = (err) => {
          console.error('[SSE Client] Stream connection encountered an error:', err);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Trigger exponential backoff reconnection
          reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
          console.log(`[SSE Client] Reconnecting in ${reconnectDelay}ms...`);
          reconnectTimeout = setTimeout(connectSSE, reconnectDelay);
        };
      } catch (err) {
        console.error('[SSE Client] Initial connection flow failed:', err);
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
        reconnectTimeout = setTimeout(connectSSE, reconnectDelay);
      }
    };

    connectSSE();

    return () => {
      console.log('[SSE Client] Closing event stream listener.');
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [user]);

  // Custom setView wrapper that updates react state and pushes browser history
  const handleSetView = (view: ViewType) => {
    setView(view);
    window.history.pushState({ view }, '', `#${view}`);
  };

  // Fetch the current user's file tracking metadata records from backend Firestore DB
  const fetchFiles = async () => {
    try {
      const response = await api.get('/files');
      const backendFiles = response.data || [];
      const mappedFiles: FileItem[] = backendFiles.map((file: any) => {
        const uploadDate = file.createdAt
          ? new Date(file.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : 'Unknown Date';
        const type = file.fileName?.endsWith('.pdf') ? 'pdf' : 'video';
        // Map database status string to display statuses
        const status: FileStatus =
          file.status === 'ready' ? 'Ready' :
          file.status === 'processing' ? 'Processing' :
          file.status === 'failed' ? 'Failed' : 'Pending';

        return {
          id: file.id,
          name: file.fileName || 'Unnamed File',
          uploadDate,
          type,
          status,
          videoUrl: file.url,
          blobUrl: file.url,
          summary: file.summary,
          transcription: file.transcription,
        };
      });
      setFiles(mappedFiles);
    } catch (error) {
      console.error('Error fetching files from backend:', error);
    }
  };

  // Sign in using standard Email and Password
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up using standard Email and Password
  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google provider popup
  const googleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  // Terminate current user session
  const logout = async () => {
    await signOut(auth);
  };

  // Direct File Upload workflow:
  // 1. Fetch short-lived signed URL for custom bucket "omnibriefai-file-uploads-dev"
  // 2. Perform direct PUT upload of raw binary bypassing Express API server
  // 3. Confirm status update with backend API and trigger list refresh
  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');
      const fileType: FileType = isPdf ? 'pdf' : 'video';
      const determinedContentType = file.type || (fileType === 'pdf' ? 'application/pdf' : 'video/mp4');

      // 1. Request Signed URL from Express backend
      const response = await api.post('/files/signed-url', {
        fileName: file.name,
        fileType,
        contentType: determinedContentType,
      });

      const { uploadUrl, fileId } = response.data;
      console.log('[Upload Flow] Received signed upload URL from backend for file:', fileId);

      // Wrap file in a typed Blob to prevent browser from overriding Content-Type to application/octet-stream
      const blobToUpload = new Blob([file], { type: determinedContentType });

      // 2. PUT raw file directly to custom Google Cloud Storage bucket
      // Note: Use raw axios here to avoid triggering the Authorization token interceptor header on GCS
      await axios.put(uploadUrl, blobToUpload, {
        headers: {
          'Content-Type': determinedContentType,
          'Cache-Control': 'public, max-age=31536000',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Direct GCS upload completed. Fetch latest files list from backend to show the new pending file in the UI.
      console.log('[Upload Flow] Direct GCS upload completed. Fetching file list...');
      await fetchFiles();
    } catch (error) {
      console.error('Error during direct GCS file upload flow:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Select file and fetch full details (including GCS GET signed URL)
  const selectFile = async (file: FileItem) => {
    try {
      const response = await api.get(`/files/${file.id}`);
      const fullFileData = response.data;
      
      let blobUrl = fullFileData.url;
      if (file.type === 'pdf' && fullFileData.url) {
        try {
          // Fetch the PDF binary and construct a local browser blob URL to force inline rendering
          const fileResponse = await axios.get(fullFileData.url, { responseType: 'blob' });
          const pdfBlob = new Blob([fileResponse.data], { type: 'application/pdf' });
          blobUrl = URL.createObjectURL(pdfBlob);
        } catch (blobErr) {
          console.error('[Select File] Failed to fetch PDF as blob, falling back to direct URL:', blobErr);
        }
      }
      
      const updatedFile = {
        ...file,
        videoUrl: fullFileData.url,
        blobUrl: blobUrl,
      };

      setSelectedFile(updatedFile);
      handleSetView('split-screen-viewer');
    } catch (error) {
      console.error('Error fetching file details for viewer:', error);
      // Fallback
      setSelectedFile(file);
      handleSetView('split-screen-viewer');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        user,
        files,
        selectedFile,
        authLoading,
        isUploading,
        uploadProgress,
        setView: handleSetView,
        login,
        signup,
        googleLogin,
        logout,
        uploadFile,
        selectFile,
        fetchFiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
