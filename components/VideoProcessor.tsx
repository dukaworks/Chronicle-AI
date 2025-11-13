import React, { useState, useRef } from 'react';
import type { VideoSource } from '../types';

interface VideoProcessorProps {
  onGenerate: (source: VideoSource, transcript: string, language: string) => void;
  isLoading: boolean;
}

export const VideoProcessor: React.FC<VideoProcessorProps> = ({ onGenerate, isLoading }) => {
  const [inputType, setInputType] = useState<'file' | 'url'>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setVideoFileName(file.name);
        setError('');
      } else {
        setError('Please upload a valid video file.');
        setVideoFile(null);
        setVideoFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  const handleGenerateClick = () => {
    if (!transcript.trim()) {
      setError('Please provide a transcript.');
      return;
    }
    
    if (inputType === 'file') {
        if (!videoFile) {
            setError('Please upload a video file.');
            return;
        }
        setError('');
        onGenerate({ type: 'file', file: videoFile }, transcript, language);
    } else { // url
        if (!videoUrl.trim()) {
            setError('Please enter a video URL.');
            return;
        }
        try {
            new URL(videoUrl);
        } catch (_) {
            setError('Please enter a valid URL.');
            return;
        }
        setError('');
        onGenerate({ type: 'url', url: videoUrl }, transcript, language);
    }
  };
  
  const triggerFileSelect = () => {
      fileInputRef.current?.click();
  };

  const isGenerateDisabled = isLoading || !transcript.trim() || (inputType === 'file' && !videoFile) || (inputType === 'url' && !videoUrl.trim());

  return (
    <div className="w-full lg:w-1/2 p-6 flex flex-col space-y-6 bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors duration-300">
      <div className="flex flex-col">
        <div className="flex items-center text-slate-900 dark:text-slate-100 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3">Provide Video</h2>
        </div>
        
        <div className="border-b border-slate-300 dark:border-slate-700 mb-4">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                 <button
                    onClick={() => setInputType('file')}
                    className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:text-cyan-500 dark:focus:text-cyan-400 ${
                        inputType === 'file'
                        ? 'border-cyan-500 text-cyan-500 dark:text-cyan-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>File Upload</span>
                </button>
                <button
                    onClick={() => setInputType('url')}
                    className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:text-cyan-500 dark:focus:text-cyan-400 ${
                        inputType === 'url'
                        ? 'border-cyan-500 text-cyan-500 dark:text-cyan-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>From URL</span>
                </button>
            </nav>
        </div>

        <div className="min-h-[140px]">
            {inputType === 'file' ? (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="video/*"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <div 
                        onClick={triggerFileSelect}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files) {
                                fileInputRef.current.files = e.dataTransfer.files;
                                handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                            }
                        }}
                        className="group flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-50/80 dark:bg-slate-900/80 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg appearance-none cursor-pointer hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                        role="button"
                        aria-label="Upload video file"
                    >
                        <span className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9m0-9l-3 3m3-3l3 3" /></svg>
                            <span className="font-medium text-center">
                                {videoFileName ? <span className="text-slate-700 dark:text-slate-300">{videoFileName}</span> : 'Click or drag & drop a file'}
                            </span>
                        </span>
                    </div>
                </>
            ) : (
                <div>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                        aria-label="Video URL"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        Provide a direct link to a video file. Links from platforms like YouTube are not supported.
                    </p>
                </div>
            )}
        </div>
      </div>
      <div>
        <div className="flex items-center text-slate-900 dark:text-slate-100 mb-2">
          <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </div>
          <h2 className="text-xl font-semibold">Paste Transcript</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Please paste the video's transcript below. Automatic transcription is not supported.
        </p>
        <textarea
          id="transcript-input"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste the full transcript of the video here..."
          className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none transition"
          aria-required="true"
        />
      </div>
       <div>
          <div className="flex items-center text-slate-900 dark:text-slate-100 mb-2">
            <div className="flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m9 9a9 9 0 009-9" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Output Language</h2>
          </div>
          <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              aria-label="Select output language"
          >
              <option value="English">English</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
          </select>
        </div>
      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
      <button
        onClick={handleGenerateClick}
        disabled={isGenerateDisabled}
        className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 hover:shadow-lg hover:shadow-cyan-500/40"
      >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
            </>
        ) : 'Generate Document'}
      </button>
    </div>
  );
};