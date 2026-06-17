import React, { useEffect, useState } from 'react';
import { getParticipant, getResult, clearSession } from '../../utils/sessionState';
import { generateCertificateBlob, downloadBlob } from '../../utils/certificate';
import { shareResult } from '../../utils/share';

export default function ResultsScreen() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [participant, setParticipant] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const [certBlob, setCertBlob] = useState<Blob | null>(null);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  useEffect(() => {
    const p = getParticipant();
    const r = getResult();

    if (!p || !r) {
      window.location.replace('/');
      return;
    }

    setParticipant(p);
    setResult(r);
    setIsInitializing(false);

    // Generate certificate in background
    setIsGeneratingCert(true);
    generateCertificateBlob(p.name).then(blob => {
      if (blob) {
        setCertBlob(blob);
        setCertUrl(URL.createObjectURL(blob));
      }
      setIsGeneratingCert(false);
    });

    return () => {
      if (certUrl) URL.revokeObjectURL(certUrl);
    };
  }, []);

  if (isInitializing || !participant || !result) return null;

  const percentage = Math.round((result.score / result.maxScore) * 100);

  const handlePlayAgain = () => {
    // Clear the result to start fresh, but keep participant info so they don't have to re-register
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem("quiz_result");
      sessionStorage.removeItem("quiz_active");
    }
    window.location.href = '/quiz';
  };

  const handleShare = async () => {
    // Share the current page URL, or just the main event URL.
    const urlToShare = window.location.origin;
    await shareResult(certBlob, urlToShare);
  };

  const handleDownloadCert = () => {
    if (certBlob) {
      downloadBlob(certBlob, `${participant.name.replace(/\s+/g, '_')}_Certificate.png`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white py-4 px-6 flex items-center justify-center gap-3 border-b border-brand-primary/10 shadow-sm relative z-20">
        <img src="/images/title-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
        <h1 className="font-heading font-black text-brand-primary text-xl tracking-wider uppercase">
          STUDENTS INDIA
        </h1>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12 max-w-lg mx-auto w-full">
        <div className="bg-white w-full rounded-[2rem] shadow-sm border border-brand-surface-container p-8 flex flex-col items-center text-center relative overflow-hidden">

          {/* Trophy Icon */}
          <div className="w-32 h-32 bg-[#ffe9e6] rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white relative z-10 p-2 overflow-hidden">
            <img src="/images/trophy.png" alt="Trophy" className="w-full h-full object-contain drop-shadow-md" />
          </div>

          <h2 className="text-2xl font-black text-brand-primary uppercase tracking-wide mb-6">
            You Scored
          </h2>

          <div className="bg-[#2a1b1a] rounded-2xl py-4 px-8 mb-3 w-full max-w-[240px]">
            <div className="text-white font-black text-5xl tracking-tighter flex items-baseline justify-center gap-1">
              {result.score}<span className="text-3xl text-white/50">/{result.maxScore}</span>
            </div>
          </div>

          <div className="text-brand-primary font-bold text-lg mb-6">
            Score: {percentage}%
          </div>

          <p className="text-brand-on-surface/80 text-sm font-medium mb-8 px-2">
            Thanks for participating in the STUDENTS INDIA 2026 WORLD CUP QUIZ Challenge!
          </p>

          <div className="w-full space-y-3">
            <div className="flex flex-col items-center w-full">
              <button
                onClick={handlePlayAgain}
                className="w-full bg-brand-primary hover:bg-[#8e221f] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                PLAY AGAIN
              </button>
              <span className="text-[11px] text-brand-on-surface/50 mt-1.5 uppercase font-bold tracking-wider">Try some other questions!</span>
            </div>
            <button
              onClick={() => window.location.href = '/analysis'}
              className="w-full bg-white hover:bg-gray-50 text-brand-primary border-2 border-brand-primary font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5" /></svg>
              DETAILED ANALYSIS
            </button>
            <button
              onClick={handleShare}
              className="w-full bg-white hover:bg-gray-50 text-brand-on-surface border border-brand-surface-container font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
              SHARE RESULT
            </button>
          </div>
        </div>

        {/* Certificate Section */}
        <div className="w-full mt-8">
          <h3 className="text-center font-bold text-brand-primary uppercase tracking-widest text-xs mb-4">Your Certificate</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-surface-container">
            {isGeneratingCert ? (
              <div className="w-full aspect-[1.414] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">Generating...</span>
              </div>
            ) : certUrl ? (
              <div className="relative group rounded-lg overflow-hidden border border-gray-100">
                <img src={certUrl} alt="Certificate Preview" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={handleDownloadCert}
                    className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full shadow-lg text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download High-Res
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-red-500 py-8">
                Failed to generate certificate preview.
              </div>
            )}

            <button
              onClick={handleDownloadCert}
              disabled={!certBlob}
              className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-xs disabled:opacity-50"
            >
              DOWNLOAD CERTIFICATE
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
