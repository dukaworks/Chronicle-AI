import React, { useState, useCallback, useEffect } from 'react';
import { VideoProcessor } from './components/VideoProcessor';
import { MarkdownViewer } from './components/MarkdownViewer';
import { generateDocumentFromVideoContent } from './services/geminiService';
import type { ExtractedFrame, VideoSource, VideoMetadata } from './types';

// --- UTILS INCLUDED IN APP.TSX TO REDUCE FILE COUNT ---

const FRAME_CAPTURE_COUNT = 10; // Capture 10 frames from the video.

const awaitEvent = <T extends Event,>(element: EventTarget, eventName: string): Promise<T> => {
  return new Promise(resolve => {
    const handler = (event: Event) => {
      element.removeEventListener(eventName, handler);
      resolve(event as T);
    };
    element.addEventListener(eventName, handler);
  });
};

const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export const extractFramesFromVideo = (videoFile: File): Promise<{ frames: ExtractedFrame[], metadata: VideoMetadata }> => {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return reject(new Error('Could not get canvas context.'));
    }

    video.src = videoUrl;

    video.onloadedmetadata = async () => {
      try {
        const frames: ExtractedFrame[] = [];
        const duration = video.duration;
        const interval = duration > 0 ? duration / (FRAME_CAPTURE_COUNT + 1) : 0;

        video.width = video.videoWidth;
        video.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const metadata: VideoMetadata = {
          duration: formatDuration(duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`
        };

        for (let i = 1; i <= FRAME_CAPTURE_COUNT; i++) {
          const time = interval * i;
          if (time > duration) break;
          video.currentTime = time;
          await awaitEvent(video, 'seeked');

          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          if(base64) {
            frames.push({ id: `frame-${i}`, base64 });
          }
        }
        
        URL.revokeObjectURL(videoUrl);
        resolve({ frames, metadata });
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Error loading video file. It might be corrupt or in an unsupported format.'));
    };
  });
};


// --- UI SUB-COMPONENTS ---

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-colors duration-300">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500 dark:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
    <p className="text-slate-800 dark:text-slate-100 text-lg mt-4 font-medium tracking-wide">{message}</p>
  </div>
);

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; onToggle: () => void; }> = ({ theme, onToggle }) => (
    <button
      onClick={onToggle}
      className="absolute top-4 right-4 p-2 rounded-full text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-all duration-300"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
        {theme === 'dark' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
    </button>
);

const Logo: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-slate-800 dark:text-slate-200"
  >
    <path
      d="M17 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 4C19.2091 4 21 5.79086 21 8V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 15V16C21 18.2091 19.2091 20 17 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12.5"
      cy="12"
      r="2.5"
      className="fill-cyan-500/20 stroke-cyan-500 dark:fill-cyan-400/20 dark:stroke-cyan-400"
      strokeWidth="1.5"
    />
  </svg>
);


const Header: React.FC<{ onToggleTheme: () => void; theme: 'light' | 'dark' }> = ({ onToggleTheme, theme }) => (
  <header className="relative text-center p-4 mb-8">
    <div className="flex items-center justify-center space-x-3">
        <Logo />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight sm:text-5xl">Chronicle AI</h1>
    </div>
    <p className="text-lg text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">Transform video content into formal markdown summaries with linked visuals, powered by Gemini.</p>
    <ThemeToggle onToggle={onToggleTheme} theme={theme} />
  </header>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full max-w-7xl mx-auto flex items-start space-x-3 p-4 mb-6 bg-red-100/50 dark:bg-red-900/20 border border-red-400/50 dark:border-red-500/50 text-red-800 dark:text-red-300 rounded-lg">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div>
        <span className="font-bold">Error:</span> {message}
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const handleGenerate = useCallback(async (source: VideoSource, transcript: string, language: string) => {
    setIsLoading(true);
    setError(null);
    setMarkdownContent('');
    setExtractedFrames([]);
    setVideoMetadata(null);

    try {
      let videoFile: File;

      if (source.type === 'file') {
        videoFile = source.file;
      } else {
        setLoadingMessage('Fetching video from URL...');
        try {
          const response = await fetch(source.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
          }
          const videoBlob = await response.blob();
           if (!videoBlob.type.startsWith('video/')) {
            throw new Error(`The fetched file is not a video. MIME type: ${videoBlob.type}`);
          }
          const fileName = source.url.substring(source.url.lastIndexOf('/') + 1) || 'video_from_url';
          videoFile = new File([videoBlob], fileName, { type: videoBlob.type });
        } catch (fetchError: any) {
          throw new Error(`Could not load video from URL. This may be due to a network issue or browser security restrictions (CORS). Please try another URL or upload the file directly. Details: ${fetchError.message}`);
        }
      }

      setLoadingMessage('Extracting key frames & metadata...');
      const { frames, metadata } = await extractFramesFromVideo(videoFile);
      
      if (frames.length === 0) {
        throw new Error("Could not extract any frames from the video. Please try a different video file.");
      }
      
      setExtractedFrames(frames);
      setVideoMetadata(metadata);

      setLoadingMessage('Generating document...');
      const document = await generateDocumentFromVideoContent(transcript, frames, language);
      
      if (document.startsWith('Error from AI:')) {
          throw new Error(document);
      }

      setMarkdownContent(document);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate document: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen font-sans p-4 sm:p-8 transition-colors duration-300">
      {isLoading && <Loader message={loadingMessage} />}
      <div className="max-w-screen-2xl mx-auto">
        <Header onToggleTheme={toggleTheme} theme={theme} />
        {error && <ErrorDisplay message={error} />}
        <main className="flex flex-col lg:flex-row gap-8">
          <VideoProcessor onGenerate={handleGenerate} isLoading={isLoading} />
          <MarkdownViewer markdown={markdownContent} frames={extractedFrames} metadata={videoMetadata} />
        </main>
      </div>
    </div>
  );
};

export default App;
