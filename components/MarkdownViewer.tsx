import React, { useState, useEffect } from 'react';
import type { ExtractedFrame, VideoMetadata } from '../types';

const SimpleMarkdownParser: React.FC<{ content: string }> = ({ content }) => {
    const createMarkup = () => {
        const lines = content.split('\n');
        let html = '';
        let inList = false;

        for (const line of lines) {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${line.replace(/^\s*[-*]\s*/, '')}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }

                if (line.startsWith('## ')) {
                    html += `<h2>${line.substring(3)}</h2>`;
                } else if (line.startsWith('# ')) {
                    html += `<h1>${line.substring(2)}</h1>`;
                } else {
                    html += `<p>${line}</p>`;
                }
            }
        }

        if (inList) {
            html += '</ul>';
        }
        
        // Post-process for inline elements
        html = html
            .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-cyan-700 dark:text-cyan-300">$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        return { __html: html };
    };

    return <div dangerouslySetInnerHTML={createMarkup()} className="prose prose-sm sm:prose-base max-w-none prose-a:text-blue-600 dark:prose-a:text-cyan-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-headings:text-slate-900 dark:prose-headings:text-slate-100" />;
};


export const MarkdownViewer: React.FC<{ markdown: string; frames: ExtractedFrame[]; metadata: VideoMetadata | null }> = ({ markdown, frames, metadata }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy');
    const [isGalleryVisible, setIsGalleryVisible] = useState(false);

    useEffect(() => {
        if (copyButtonText === 'Copied!') {
            const timer = setTimeout(() => setCopyButtonText('Copy'), 2000);
            return () => clearTimeout(timer);
        }
    }, [copyButtonText]);

    useEffect(() => {
        if (frames.length > 0) {
            const timer = setTimeout(() => setIsGalleryVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [frames]);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown)
            .then(() => setCopyButtonText('Copied!'))
            .catch(err => console.error('Failed to copy text: ', err));
    };
    
    const handleFrameClick = (e: React.MouseEvent<HTMLAnchorElement>, frameId: string) => {
        e.preventDefault();
        const element = document.getElementById(frameId);
        element?.scrollIntoView({ behavior: 'smooth' });
    };


  if (!markdown) {
    return (
      <div className="w-full lg:w-1/2 p-6 flex items-center justify-center bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm transition-colors duration-300">
        <div className="text-center text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h-5a2 2 0 00-2 2v5a2 2 0 002 2h5a2 2 0 002-2v-5a2 2 0 00-2-2z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-400">Your generated document will appear here.</p>
          <p className="text-sm">Provide a video and transcript to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 bg-white/80 dark:bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col transition-colors duration-300" style={{maxHeight: '85vh'}}>
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
             {metadata && (
                <div className="flex items-center space-x-6 mb-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-2" title="Video Duration">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{metadata.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2" title="Video Resolution">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                        </svg>
                        <span>{metadata.resolution}</span>
                    </div>
                </div>
            )}
             <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-inner ring-1 ring-slate-200/50 dark:ring-slate-700/50 p-6 sm:p-8 transition-colors duration-300">
                 <div className="relative">
                    <button 
                        onClick={handleCopy}
                        className="absolute top-0 right-0 -mt-2 -mr-2 flex items-center space-x-2 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-all"
                    >
                        {copyButtonText === 'Copied!' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                        <span>{copyButtonText}</span>
                    </button>
                    <SimpleMarkdownParser content={markdown} />
                 </div>
             </div>
        </div>

      <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 transition-colors duration-300">
        <h2 id="key-visuals" className="flex items-center text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 scroll-mt-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Key Visuals Gallery
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {frames.map((frame, index) => (
            <div 
                key={frame.id} 
                id={frame.id} 
                className={`group scroll-mt-20 transition-opacity ease-in-out duration-500 ${isGalleryVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${index * 75}ms` }}
            >
              <a 
                href={`#${frame.id}`} 
                onClick={(e) => handleFrameClick(e, frame.id)}
                className="block rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 hover:shadow-lg hover:shadow-cyan-500/30">
                <img
                  src={`data:image/jpeg;base64,${frame.base64}`}
                  alt={`Key frame ${frame.id}`}
                  className="object-cover w-full h-full aspect-video"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};