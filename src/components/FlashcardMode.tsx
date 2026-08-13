import React, { useState, useEffect } from "react";
import { VerbCard, UserStats } from "../types";
import { 
  Shuffle, 
  Volume2, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles,
  CheckCircle2,
  Bookmark
} from "lucide-react";

interface FlashcardModeProps {
  cards: VerbCard[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  onOpenAIExplain: (card: VerbCard) => void;
  gradeTitle: string;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  cards,
  stats,
  setStats,
  onOpenAIExplain,
  gradeTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Filter cards if user enabled starred filter
  const activeCards = showStarredOnly
    ? cards.filter((c) => stats.starredVerbs.includes(c.id))
    : cards;

  // Reset index if deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards.length, showStarredOnly]);

  const validIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[validIndex];

  const handleNext = () => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
    recordReview();
  };

  const handlePrev = () => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
    recordReview();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * (activeCards.length || 1)));
  };

  const recordReview = () => {
    setStats((prev) => ({
      ...prev,
      verbsReviewed: prev.verbsReviewed + 1
    }));
  };

  const toggleStar = (e: React.MouseEvent, cardId: number) => {
    e.stopPropagation();
    setStats((prev) => {
      const exists = prev.starredVerbs.includes(cardId);
      const updated = exists
        ? prev.starredVerbs.filter((id) => id !== cardId)
        : [...prev.starredVerbs, cardId];
      return { ...prev, starredVerbs: updated };
    });
  };

  const toggleMastered = (e: React.MouseEvent, cardId: number) => {
    e.stopPropagation();
    setStats((prev) => {
      const exists = prev.masteredVerbs.includes(cardId);
      const updated = exists
        ? prev.masteredVerbs.filter((id) => id !== cardId)
        : [...prev.masteredVerbs, cardId];
      return { ...prev, masteredVerbs: updated };
    });
  };

  const speakGerman = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentCard || activeCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl text-center shadow-md space-y-4">
        <Bookmark className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Starred Verbs Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          You haven't starred any German verbs yet. Uncheck "Starred Only" to practice the full {gradeTitle} deck!
        </p>
        <button
          onClick={() => setShowStarredOnly(false)}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors text-sm"
        >
          View All Verbs
        </button>
      </div>
    );
  }

  const isStarred = stats.starredVerbs.includes(currentCard.id);
  const isMastered = stats.masteredVerbs.includes(currentCard.id);

  // Case background badge colors
  const caseBadgeColor = 
    currentCard.case === "Dativ" 
      ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
      : currentCard.case === "Akkusativ"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
      : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Top Deck Controls & Filter */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            {gradeTitle}
          </span>
          <span className="text-xs text-slate-400 font-semibold ml-2">
            Card {currentIndex + 1} of {activeCards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              showStarredOnly
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showStarredOnly ? "fill-slate-950" : "text-amber-500"}`} />
            Starred Only ({stats.starredVerbs.length})
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 transition-colors shadow-sm"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive 3D Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-80 w-full cursor-pointer group select-none perspective-[1000px]"
      >
        <div
          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* CARD FRONT */}
          <div className="absolute inset-0 w-full h-full backdrop-blur-xl bg-white/5 text-white rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col justify-between [backface-visibility:hidden]">
            
            {/* Top Row on Front */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                {currentCard.classLevel === "class_9" ? "Class 9th Verb" : "Class 10th / B1 Verb"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => speakGerman(e, currentCard.verb)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors"
                  title="Listen to German Pronunciation"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  onClick={(e) => toggleStar(e, currentCard.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    isStarred ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-white/10"
                  }`}
                  title={isStarred ? "Unstar verb" : "Star verb"}
                >
                  <Star className={`w-4 h-4 ${isStarred ? "fill-amber-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Center German Verb Name */}
            <div className="text-center py-6">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-50 drop-shadow-sm">
                {currentCard.verb}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Tap card to reveal preposition & case
              </p>
            </div>

            {/* Bottom Row on Front */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
              <span className="flex items-center gap-1 text-indigo-400 font-medium">
                <RotateCw className="w-3.5 h-3.5" /> Tap to flip
              </span>

              {isMastered && (
                <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>
          </div>

          {/* CARD BACK */}
          <div className="absolute inset-0 w-full h-full backdrop-blur-xl bg-white/10 text-white rounded-2xl p-8 border border-white/20 shadow-xl flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            
            {/* Top Row on Back */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${caseBadgeColor}`}>
                {currentCard.prep} + {currentCard.case}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAIExplain(currentCard);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md"
                  title="Ask AI for detailed explanation & examples"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Explain
                </button>

                <button
                  onClick={(e) => toggleMastered(e, currentCard.id)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                    isMastered
                      ? "bg-indigo-500 text-white border-indigo-400 font-bold"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                  }`}
                  title="Mark as Mastered"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isMastered ? "Mastered" : "Mark Mastered"}
                </button>
              </div>
            </div>

            {/* Center Content on Back */}
            <div className="text-center space-y-2 py-3">
              <div className="text-3xl font-black text-indigo-300">
                {currentCard.prep} <span className="text-xl font-bold text-white/90">(+ {currentCard.case})</span>
              </div>
              <div className="text-lg font-medium text-slate-200">
                "{currentCard.meaning}"
              </div>

              {currentCard.exampleGerman && (
                <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/10 text-left max-w-md mx-auto space-y-0.5">
                  <p className="text-xs font-semibold text-indigo-200 flex items-center justify-between">
                    <span>{currentCard.exampleGerman}</span>
                    <button
                      onClick={(e) => speakGerman(e, currentCard.exampleGerman || "")}
                      className="text-slate-400 hover:text-indigo-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </p>
                  <p className="text-[11px] text-slate-400 italic">{currentCard.exampleEnglish}</p>
                </div>
              )}
            </div>

            {/* Bottom Row on Back */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
              <span>{currentCard.verb}</span>
              <span className="text-indigo-300/80 font-medium">Click to flip back</span>
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow-md active:scale-98"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="py-3 px-6 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow-md"
        >
          <RotateCw className="w-4 h-4 text-indigo-400" />
          Flip Card
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-98"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Overall Deck Progress</span>
          <span>{Math.round(((currentIndex + 1) / activeCards.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeCards.length) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
};
