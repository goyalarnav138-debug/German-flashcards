import React, { useState, useEffect } from "react";
import { VerbCard } from "../types";
import { Sparkles, X, Volume2, Lightbulb, BookOpen, AlertCircle, Loader2 } from "lucide-react";

interface AIExplanationModalProps {
  card: VerbCard | null;
  onClose: () => void;
}

interface AIResponseData {
  verb: string;
  prep: string;
  caseName: string;
  explanation: string;
  examples: { german: string; english: string }[];
  mnemonic: string;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({ card, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiData, setAiData] = useState<AIResponseData | null>(null);

  useEffect(() => {
    if (!card) return;

    let isMounted = true;
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      setAiData(null);

      try {
        const res = await fetch("/api/gemini/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verb: card.verb,
            prep: card.prep,
            caseName: card.case,
            meaning: card.meaning
          })
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();
        if (isMounted) {
          setAiData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("AI Explanation Error:", err);
          setError("Failed to fetch AI explanation. Please check your connection or secret keys.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExplanation();

    return () => {
      isMounted = false;
    };
  }, [card]);

  if (!card) return null;

  const speakGerman = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">AI Grammar Insights</h3>
              <p className="text-xs text-emerald-100/90">Deep explanation & memory tricks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Main Target Verb Header */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{card.verb}</span>
                <button
                  onClick={() => speakGerman(card.verb)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Listen to German pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">{card.meaning}</p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm border border-emerald-200">
                <span>{card.prep}</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 bg-emerald-200/80 rounded text-emerald-900">
                  + {card.case}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                {card.classLevel === "class_9" ? "Class 9th Syllabus" : "Class 10th / B1 Level"}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Consulting German AI Tutor...</p>
              <p className="text-xs text-slate-400">Analyzing preposition rules, grammar context & examples</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="mt-1 text-red-600">You can still review the standard example: <i className="font-serif">"{card.exampleGerman}"</i></p>
              </div>
            </div>
          )}

          {/* AI Content */}
          {aiData && !loading && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Grammar Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Grammar Rule & Usage
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 font-sans">
                  {aiData.explanation}
                </p>
              </div>

              {/* Mnemonic Memory Trick */}
              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Memory Trick (Mnemonic)
                </h4>
                <p className="text-xs text-amber-900 leading-normal font-medium">
                  {aiData.mnemonic}
                </p>
              </div>

              {/* Real World Example Sentences */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Practice Example Sentences
                </h4>
                <div className="space-y-2">
                  {aiData.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200 rounded-xl transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900">
                          {ex.german}
                        </p>
                        <p className="text-xs text-slate-500">{ex.english}</p>
                      </div>
                      <button
                        onClick={() => speakGerman(ex.german)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100/60 rounded-lg shrink-0 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Target Syllabus: {card.classLevel === "class_9" ? "Class 9th (54 Verbs)" : "Class 10th / B1"}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
