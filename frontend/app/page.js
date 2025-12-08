'use client';
import { useState } from 'react';

export default function Home() {
  const [inputType, setInputType] = useState('text'); // 'text' sau 'url'
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeContent = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    // Pregătim corpul cererii (JSON)
    const payload = inputType === 'text' 
      ? { text: inputValue } 
      : { url: inputValue };

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `Server Error: ${res.status}`);
      }
      
      const data = await res.json();
      setResults(data.data); 
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to retrieve data from the abyss...");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-dark-void p-8 flex flex-col items-center justify-start">
      <div className="max-w-4xl w-full relative z-10">
        
        <header className="mb-8 text-center mt-10">
          <h1 className="text-6xl font-bold text-blood-red tracking-widest uppercase drop-shadow-[0_0_15px_rgba(138,11,11,0.8)]">
            CreepyParser v2
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">
            Web Scraper & Regex Engine
          </p>
        </header>

        {/* Meniul de comutare (Tabs) */}
        <div className="flex mb-4 border-b border-gray-800">
          <button
            onClick={() => { setInputType('text'); setInputValue(''); setResults(null); }}
            className={`flex-1 py-3 uppercase tracking-widest font-bold text-sm transition-all ${inputType === 'text' ? 'text-blood-red border-b-2 border-blood-red bg-red-900/10' : 'text-gray-600 hover:text-gray-400'}`}
          >
            Paste Text
          </button>
          <button
            onClick={() => { setInputType('url'); setInputValue(''); setResults(null); }}
            className={`flex-1 py-3 uppercase tracking-widest font-bold text-sm transition-all ${inputType === 'url' ? 'text-blood-red border-b-2 border-blood-red bg-red-900/10' : 'text-gray-600 hover:text-gray-400'}`}
          >
            Scan URL (Web)
          </button>
        </div>

        {/* Zona de Input */}
        <section className="mb-12 relative">
          <label className="block text-gray-500 mb-2 text-xs uppercase">
            {inputType === 'text' ? 'Paste evidence below:' : 'Enter Target URL:'}
          </label>
          
          {inputType === 'text' ? (
            <textarea
              className="w-full h-64 bg-gray-crypt border border-gray-800 text-gray-300 rounded p-6 font-mono text-sm focus:border-blood-red focus:ring-1 focus:ring-red-900 focus:outline-none placeholder-gray-700 shadow-inner"
              placeholder="// Paste story content here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          ) : (
            <input
              type="url"
              className="w-full h-16 bg-gray-crypt border border-gray-800 text-blood-red rounded p-6 font-mono text-lg focus:border-blood-red focus:ring-1 focus:ring-red-900 focus:outline-none placeholder-gray-700 shadow-inner"
              placeholder="https://creepypasta.fandom.com/wiki/..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          )}

          {error && (
            <div className="mt-4 p-3 bg-black border border-red-600 text-red-500 rounded text-center font-mono text-sm">
              [ERROR] {error}
            </div>
          )}

          <button
            onClick={analyzeContent}
            disabled={loading || !inputValue}
            className="w-full mt-6 bg-blood-red hover:bg-red-900 text-black hover:text-white font-bold py-4 px-6 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(138,11,11,0.4)]"
          >
            {loading ? 'EXTRACTING DATA...' : (inputType === 'text' ? 'ANALYZE TEXT' : 'SCRAPE & ANALYZE')}
          </button>
        </section>

        {/* Rezultate */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in pb-20">
             {/* ... Aici refolosești aceleași componente ResultCard ca în exemplul anterior ... */}
             <ResultCard title="Entities" icon="👤" data={results.authors} />
             <ResultCard title="Warnings" icon="⚠️" data={results.trigger_warnings} highlight />
             <ResultCard title="Emails" icon="📧" data={results.emails} />
             <ResultCard title="Dates" icon="🕒" data={results.dates} />
             
             {/* Stats & Edge Cases Cards rămân la fel */}
             <div className="bg-gray-crypt p-6 rounded border border-gray-800">
                <h3 className="text-xl text-blood-red mb-4">💬 Stats</h3>
                <p className="text-gray-400">Dialogue: {results.dialogue_stats.percentage}%</p>
             </div>
             
             <div className="bg-gray-crypt p-6 rounded border border-gray-800">
                <h3 className="text-xl text-blood-red mb-4">👻 Anomalies</h3>
                <p className="text-gray-400">Zalgo: {results.zalgo_glitch ? 'YES' : 'NO'}</p>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Asigură-te că funcția ResultCard este definită jos (la fel ca în codul anterior)
function ResultCard({ title, data, icon, highlight = false }) {
  return (
    <div className={`bg-gray-crypt p-6 rounded border transition-all hover:scale-[1.02] ${highlight && data?.length > 0 ? 'border-red-800' : 'border-gray-800'}`}>
      <h3 className="text-lg text-blood-red mb-4 font-bold uppercase flex items-center gap-3">
        <span className="opacity-50">{icon}</span> {title}
      </h3>
      {data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((item, idx) => (
            <li key={idx} className="font-mono text-xs text-gray-400 border-l-2 border-gray-800 pl-3">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-gray-800 text-xs">// EMPTY</span>
      )}
    </div>
  );
}