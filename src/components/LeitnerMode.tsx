import React, { useState } from "react";
import { VerbCard, UserStats } from "../types";
import { Layers, CheckCircle2, AlertCircle, RotateCcw, Volume2, Sparkles } from "lucide-react";

interface LeitnerModeProps {
  cards: VerbCard[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onOpenAIExplain: (card: VerbCard) => void;
}

export const LeitnerMode: React.FC<LeitnerModeProps> = ({
  cards,
  stats,
  setStats,
  onOpenAIExplain
}) => {
  // Local Leitner box distribution
  const [boxState, setBoxState] = useState<Record<number, 1 | 2 | 3>>(() => {
    const initial: Record<number, 1 | 2 | 3> = {};
    cards.forEach((c) => {
      if (stats.masteredVerbs.includes(c.id)) {
        initial[c.id] = 3;
      } else {
        initial[c.id] = 1;
      }
    });
    return initial;
  });

  const [activeBoxFilter, setActiveBoxFilter] = useState<1 | 2 | 3>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Cards in active filter
  const activeCards = cards.filter((c) => (boxState[c.id] || 1) === activeBoxFilter);
  const currentCard = activeCards[currentIndex] || activeCards[0];

  const handleGrade = (gotIt: boolean) => {
    if (!currentCard) return;

    const currentBox = boxState[currentCard.id] || 1;
    let nextBox: 1 | 2 | 3 = currentBox;

    if (gotIt) {
      if (currentBox === 1) nextBox = 2;
      else if (currentBox === 2) nextBox = 3;
    } else {
      nextBox = 1; // Drop back to Box 1 on mistake
    }

    setBoxState((prev) => ({ ...prev, [currentCard.id]: nextBox }));

    // Sync mastered verbs in global stats if box 3
    if (nextBox === 3) {
      setStats((prev) => ({
        ...prev,
        masteredVerbs: Array.from(new Set([...prev.masteredVerbs, currentCard.id]))
      }));
    } else if (currentBox === 3) {
      setStats((prev) => ({
        ...prev,
        masteredVerbs: prev.masteredVerbs.filter((id) => id !== currentCard.id)
      }));
    }

    setIsFlipped(false);
    if (currentIndex >= activeCards.length - 1) {
      setCurrentIndex(0);
    }
  };

  const speakGerman = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const box1Count = cards.filter((c) => (boxState[c.id] || 1) === 1).length;
  const box2Count = cards.filter((c) => boxState[c.id] === 2).length;
  const box3Count = cards.filter((c) => boxState[c.id] === 3).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Overview Banner */}
      <div className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Spaced Repetition Mastery (Leitner System)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cards move to higher boxes as you remember them. Mistakes reset cards back to Box 1.
          </p>
        </div>

        {/* Leitner Box Selectors */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setActiveBoxFilter(1); setCurrentIndex(0); setIsFlipped(false); }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeBoxFilter === 1
                ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-sm"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            Box 1 (Needs Work)
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-xs">{box1Count}</span>
          </button>

          <button
            onClick={() => { setActiveBoxFilter(2); setCurrentIndex(0); setIsFlipped(false); }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeBoxFilter === 2
                ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            Box 2 (Learning)
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-xs">{box2Count}</span>
          </button>

          <button
            onClick={() => { setActiveBoxFilter(3); setCurrentIndex(0); setIsFlipped(false); }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeBoxFilter === 3
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            Box 3 (Mastered)
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-xs">{box3Count}</span>
          </button>
        </div>
      </div>

      {/* Card Practice Area */}
      {!currentCard || activeCards.length === 0 ? (
        <div className="backdrop-blur-md bg-white/5 p-12 rounded-2xl border border-white/10 text-center shadow-sm space-y-3">
          <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Box {activeBoxFilter} is Empty!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Great job! You have cleared all verbs in Box {activeBoxFilter}. Try practicing another box above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Practicing Box {activeBoxFilter} ({activeCards.length} cards remaining)</span>
            <span>Card {currentIndex + 1} of {activeCards.length}</span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-md hover:bg-white/10 transition-all cursor-pointer min-h-[260px] flex flex-col justify-between select-none relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10">
                {currentCard.classLevel === "class_9" ? "Class 9th" : "Class 10th / B1"}
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); speakGerman(currentCard.verb); }}
                className="p-2 hover:bg-white/10 text-slate-400 hover:text-indigo-400 rounded-xl transition-colors"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-6">
              {!isFlipped ? (
                <div>
                  <h3 className="text-4xl font-extrabold text-white">{currentCard.verb}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Click card to reveal answer</p>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="text-3xl font-black text-indigo-400">
                    {currentCard.prep} <span className="text-xl font-bold text-slate-300">(+ {currentCard.case})</span>
                  </div>
                  <p className="text-base text-slate-300 font-medium font-serif">"{currentCard.meaning}"</p>
                  
                  {currentCard.exampleGerman && (
                    <p className="text-xs text-slate-400 pt-2 border-t border-white/10 italic">
                      "{currentCard.exampleGerman}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCcw className="w-3.5 h-3.5" /> Tap card to flip
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); onOpenAIExplain(currentCard); }}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Explain
              </button>
            </div>
          </div>

          {/* Self Grading Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => handleGrade(false)}
              className="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Needs Practice (Reset to Box 1)
            </button>

            <button
              onClick={() => handleGrade(true)}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Got It Right! (Promote Box)
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
