'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const analyzeReddit = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setIsStoryOpen(false);
    
    if (!url.includes("reddit.com")) {
      setError("INVALID TARGET: ONLY REDDIT LINKS ACCEPTED");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url }), 
      });

      if (!res.ok) throw new Error(`HTTP ERROR ${res.status}`);
      const data = await res.json();
      setResults(data); 
    } catch (err) {
      console.error(err);
      setError("CONNECTION FAILED: BACKEND OFFLINE OR BLOCKED");
    }
    setLoading(false);
  };

  const getDossierText = () => {
    const timestamp = new Date().toISOString();
    return `
========================================================================
          DEPARTMENT OF REDDIT FORENSICS - CASE DOSSIER
========================================================================
REPORT_ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
TIMESTAMP: ${timestamp}
STATUS: DECLASSIFIED / TOP_SECRET
------------------------------------------------------------------------

[SUBJECT_DATA]
AUTHOR: u/${results.data.authors[0] || 'UNKNOWN'}
ORIGIN: ${results.data.subreddit}
SOURCE_URL: ${url}

[FORENSIC_ANALYSIS]
CREEPINESS_INDEX: ${results.data.creepiness_score}/100
DIALOGUE_RATIO: ${results.data.dialogue_stats.percentage}%
ZALGO_DETECTED: ${results.data.zalgo_glitch ? 'YES' : 'NO'}
SPOILERS_FOUND: ${results.data.spoilers.length}

[DETECTED_ENTITIES]
${(results.data.entities || []).join(', ') || 'NONE'}

[TEMPORAL_MARKERS]
${(results.data.dates || []).join('\n')}

[TW_WARNINGS]
${(results.data.trigger_warnings || []).join(', ') || 'CLEAN'}

------------------------------------------------------------------------
[DECRYPTED_LOG_START]
${results.full_story}
[DECRYPTED_LOG_END]
------------------------------------------------------------------------
END OF REPORT
========================================================================
    `;
  };

  const exportFile = (format) => {
    if (!results) return;
    
    let content = '';
    let mimeType = 'text/plain';
    let extension = format;

    const fileName = `CASE_${results.data.authors[0] || 'UNKNOWN'}.${format}`;

    switch(format) {
      case 'txt':
        content = getDossierText();
        break;
      case 'json':
        content = JSON.stringify({
            report_info: {
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                timestamp: new Date().toISOString(),
                source: url
            },
            analysis: results.data,
            content: results.full_story
        }, null, 2);
        mimeType = 'application/json';
        break;
      case 'md':
        content = `# CASE DOSSIER: ${results.data.authors[0] || 'UNKNOWN'}\n\n` +
                  `**Source:** ${url}\n` +
                  `**Creepiness:** ${results.data.creepiness_score}/100\n\n` +
                  `## Content\n\n${results.full_story}`;
        break;
      case 'html':
        content = `
          <html>
            <head>
              <title>Case Report: ${results.data.authors[0]}</title>
              <style>
                body { background: #050505; color: #ff3333; font-family: monospace; padding: 40px; }
                .border { border: 1px solid #ff3333; padding: 20px; }
                h1 { border-bottom: 2px solid #ff3333; padding-bottom: 10px; }
                pre { white-space: pre-wrap; color: #ccc; }
              </style>
            </head>
            <body>
              <div class="border">
                <h1>FORENSIC REPORT: ${results.data.authors[0]}</h1>
                <p><strong>URL:</strong> ${url}</p>
                <p><strong>SCORE:</strong> ${results.data.creepiness_score}/100</p>
                <hr/>
                <pre>${results.full_story}</pre>
              </div>
            </body>
          </html>
        `;
        mimeType = 'text/html';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(fileUrl);
    setIsDownloadModalOpen(false);
  };

  const calculateSurvivalTime = () => {
    if (!results || !results.full_story) return 0;
    const words = results.full_story.trim().split(/\s+/).length;
    return Math.ceil(words / 200); // 200 words per minute average
  };

  return (
    <main className="min-h-screen p-6 md:p-12 flex flex-col items-center relative z-10 selection:bg-blood-red selection:text-black">
      
      <header className="w-full max-w-5xl mb-12 text-center border-b border-blood-red/30 pb-8">
        <h1 className="text-6xl md:text-8xl font-bold tracking-widest text-blood-red animate-flicker uppercase drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
          CREEPYPARSER
        </h1>
        <div className="flex justify-between items-center mt-4 text-xs md:text-sm font-mono text-red-500 opacity-70">
          <span>TOOL: REDDIT_FORENSICS_UNIT</span>
          <span className="animate-pulse">● STATUS: LISTENING</span>
          <span>V.4.2.0</span>
        </div>
      </header>

      <section className="w-full max-w-4xl mb-16">
        <div className="relative group">
          <div className="absolute -inset-1 bg-blood-red/20 blur-md opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-white dark:bg-black border-2 border-blood-red p-1 flex flex-col md:flex-row shadow-neon">
            <div className="bg-blood-red/10 px-4 py-4 flex items-center border-r border-blood-red/50">
              <span className="font-bold tracking-widest text-sm text-black dark:text-gray-300">TARGET_URL://</span>
            </div>
            <input
              type="url"
              className="flex-1 bg-white dark:bg-black text-blood-red px-6 py-4 outline-none font-mono text-lg placeholder-red-900"
              placeholder="Paste r/nosleep or r/creepypasta link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeReddit()}
            />
            <button
              onClick={analyzeReddit}
              disabled={loading || !url}
              className="bg-blood-red text-black font-bold px-8 py-4 hover:bg-gray-200 dark:hover:bg-white hover:text-red-900 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SCANNING...' : 'EXECUTE'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-6 border border-red-500 bg-red-950/20 p-4 text-center animate-pulse font-mono text-red-500">
            [CRITICAL ERROR] {error}
          </div>
        )}
      </section>

      {results && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse-fast">
          
          <div className="lg:col-span-4 space-y-6">
            <ResultBox title="SUBJECT (AUTHOR)">
               <div className="text-2xl font-bold text-black dark:text-white break-all">
                 {results.data.authors[0] ? results.data.authors[0] : "UNKNOWN_ENTITY"}
               </div>
            </ResultBox>

            <ResultBox title="EST. SURVIVAL TIME">
               <div className="text-3xl font-bold text-red-500">
                 {calculateSurvivalTime()} MIN
               </div>
               <div className="text-[10px] text-red-900 mt-1 uppercase font-mono tracking-tighter">Recommended exposure duration</div>
            </ResultBox>

            <ResultBox title="ORIGIN (SUBREDDIT)">
               <div className="text-xl font-mono text-red-400">
                 {results.data.subreddit}
               </div>
            </ResultBox>

            <div className="border border-blood-red/50 bg-white dark:bg-black p-4 text-center">
                <h3 className="text-xs uppercase tracking-widest text-red-500 mb-2">CREEPINESS INDEX</h3>
                <div className="text-4xl font-bold text-black dark:text-white mb-2">{results.data.creepiness_score || 0}</div>
                <div className="w-full bg-deep-blood h-2">
                   <div className="bg-blood-red h-full shadow-[0_0_10px_red]" style={{width: `${Math.min(results.data.creepiness_score || 0, 100)}%`}}></div>
                </div>
             </div>

            <ResultBox title="TEMPORAL MARKERS">
              {results.data.dates.length > 0 ? (
                <ul className="space-y-2">
                  {results.data.dates.map((date, i) => (
                    <li key={i} className="text-sm border-l-2 border-blood-red pl-2 text-black dark:text-gray-300">{date}</li>
                  ))}
                </ul>
              ) : <span className="opacity-30 text-sm">// NO TIMESTAMPS</span>}
            </ResultBox>
            
             <div className="border border-blood-red/50 bg-white dark:bg-black p-4 text-center">
                <h3 className="text-xs uppercase tracking-widest text-red-500 mb-2">DIALOGUE RATIO</h3>
                <div className="text-4xl font-bold text-black dark:text-white mb-2">{results.data.dialogue_stats.percentage}%</div>
                <div className="w-full bg-deep-blood h-2">
                   <div className="bg-blood-red h-full shadow-[0_0_10px_red]" style={{width: `${results.data.dialogue_stats.percentage}%`}}></div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            
            <div className={`border-2 p-6 relative ${results.data.trigger_warnings.length > 0 ? 'border-red-500 bg-red-950/10 shadow-neon' : 'border-blood-red/30 bg-white dark:bg-black'}`}>
               <h3 className="absolute -top-3 left-4 bg-white dark:bg-black px-2 text-sm font-bold tracking-widest text-blood-red">
                 THREAT ASSESSMENT (TW)
               </h3>
               {results.data.trigger_warnings.length > 0 ? (
                 <div className="flex flex-wrap gap-2 mt-2">
                   {results.data.trigger_warnings.map((tw, i) => (
                     <span key={i} className="bg-red-600 text-black font-bold px-3 py-1 text-sm uppercase">
                       ⚠️ {tw}
                     </span>
                   ))}
                 </div>
               ) : (
                 <div className="text-green-600 font-mono">[SAFE] NO TRIGGER WARNINGS DETECTED</div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultBox title="HIDDEN CONTACTS">
                 {results.data.emails.length > 0 ? results.data.emails.map((email, i) => (
                      <div key={i} className="font-mono text-sm text-black dark:text-white bg-red-900/30 p-2 border-l-2 border-red-500">{email}</div>
                 )) : <span className="opacity-30">// NONE</span>}
              </ResultBox>

              <ResultBox title="DETECTED ENTITIES">
                 {results.data.entities && results.data.entities.length > 0 ? results.data.entities.map((entity, i) => (
                      <div key={i} className="font-mono text-sm text-red-300 border-b border-red-900/30 pb-1 mb-1 last:border-0">
                        • {entity}
                      </div>
                 )) : <span className="opacity-30">// NONE</span>}
              </ResultBox>

              <ResultBox title="ANOMALIES" highlight={results.data.zalgo_glitch}>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-black dark:text-gray-300">ZALGO:</span>
                    <span className={results.data.zalgo_glitch ? "text-red-500 font-bold animate-pulse" : "text-green-600"}>{results.data.zalgo_glitch ? "DETECTED" : "NEGATIVE"}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-black dark:text-gray-300">SPOILERS:</span>
                    <span className="text-black dark:text-white">{results.data.spoilers.length} Found</span>
                 </div>
              </ResultBox>

              <div 
                className="border border-blood-red/40 bg-blood-red/5 p-6 flex flex-col justify-center items-center group cursor-pointer hover:bg-blood-red/20 transition-all" 
                onClick={() => setIsDownloadModalOpen(true)}
              >
                 <div className="text-3xl mb-2 text-blood-red group-hover:scale-110 transition-transform">📁</div>
                 <div className="font-bold text-blood-red uppercase tracking-widest text-sm text-center">DOWNLOAD DOSSIER</div>
                 <div className="text-[10px] text-red-900 mt-1">SELECT FORMAT: TXT, JSON, MD, HTML</div>
              </div>
            </div>

            {results.full_story && (
              <div className="border border-blood-red/40 bg-white/80 dark:bg-black/80 p-6 shadow-neon relative mt-6">
                 <div className="flex justify-between items-center mb-4 border-b border-blood-red/20 pb-2">
                    <h3 className="text-xs uppercase tracking-widest text-blood-red">
                      FULL_DECRYPTED_STORY_LOG
                    </h3>
                    <button 
                      onClick={() => setIsStoryOpen(!isStoryOpen)}
                      className="text-xs bg-blood-red/20 hover:bg-blood-red/40 text-blood-red px-2 py-1 uppercase transition-colors"
                    >
                      {isStoryOpen ? '[-_] COLLAPSE' : '[+] EXPAND'}
                    </button>
                 </div>
                 
                 {isStoryOpen ? (
                   <div className="h-96 overflow-y-auto pr-4 font-mono text-sm text-black dark:text-gray-300 leading-relaxed whitespace-pre-wrap scrollbar-thin scrollbar-thumb-blood-red scrollbar-track-gray-900 animate-slide-down">
                     {results.full_story}
                   </div>
                 ) : (
                   <div className="text-center py-4 opacity-50 font-mono text-xs">
                     // DATA ENCRYPTED. CLICK EXPAND TO VIEW CONTENT //
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-black border-2 border-blood-red p-8 max-w-md w-full shadow-neon animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-blood-red mb-6 uppercase tracking-tighter border-b border-blood-red/30 pb-2">
              Select Export Format
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FormatButton label="Plain Text" ext="txt" onClick={() => exportFile('txt')} />
              <FormatButton label="JSON Data" ext="json" onClick={() => exportFile('json')} />
              <FormatButton label="Markdown" ext="md" onClick={() => exportFile('md')} />
              <FormatButton label="HTML Report" ext="html" onClick={() => exportFile('html')} />
            </div>
            <button 
              onClick={() => setIsDownloadModalOpen(false)}
              className="mt-8 w-full py-2 border border-red-900 dark:border-red-900 text-red-900 dark:text-red-900 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600 dark:hover:border-red-500 transition-colors uppercase text-sm font-mono"
            >
              [X] CANCEL_REQUEST
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FormatButton({ label, ext, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center p-4 border border-blood-red/30 bg-gray-50 dark:bg-blood-red/5 hover:bg-gray-100 dark:hover:bg-blood-red/20 hover:border-blood-red transition-all group"
    >
      <span className="text-xs text-red-700 dark:text-red-500 mb-1 opacity-60 dark:opacity-50 uppercase">{ext}</span>
      <span className="font-bold text-blood-red group-hover:scale-105 transition-transform">{label}</span>
    </button>
  );
}

function ResultBox({ title, children, highlight = false }) {
  return (
    <div className={`border bg-white/50 dark:bg-black/50 p-6 relative transition-all hover:border-blood-red ${highlight ? 'border-red-500 shadow-neon' : 'border-blood-red/40'}`}>
      <h3 className="text-xs uppercase tracking-[0.2em] text-blood-red mb-4 border-b border-blood-red/20 pb-2">{title}</h3>
      <div>{children}</div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blood-red"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blood-red"></div>
    </div>
  );
}