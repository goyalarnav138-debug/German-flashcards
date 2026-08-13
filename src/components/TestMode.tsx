import React, { useState, useEffect, useMemo } from "react";
import { VerbCard, UserStats, CaseType, AnswerResult, TestReport } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Award,
  ArrowRight
} from "lucide-react";

interface TestModeProps {
  cards: VerbCard[];
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  gradeTitle: string;
  onOpenAIExplain: (card: VerbCard) => void;
}

export const TestMode: React.FC<TestModeProps> = ({
  cards,
  stats,
  setStats,
  gradeTitle,
  onOpenAIExplain
}) => {
  const [shuffledCards, setShuffledCards] = useState<VerbCard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [userPrep, setUserPrep] = useState("");
  const [userCase, setUserCase] = useState<CaseType | "">("");
  const [resultStatus, setResultStatus] = useState<"correct" | "incorrect" | "">("");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [testStage, setTestStage] = useState<"running" | "results">("running");

  // Initialize shuffled cards
  useEffect(() => {
    resetTest();
  }, [cards]);

  const currentCard = shuffledCards[cardIndex];

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const resetTest = () => {
    const shuffled = shuffle(cards);
    setShuffledCards(shuffled);
    setCardIndex(0);
    setScore(0);
    setAnswers([]);
    setUserPrep("");
    setUserCase("");
    setResultStatus("");
    setTestStage("running");
  };

  const handleCheckAnswer = () => {
    if (!currentCard || resultStatus !== "") return;

    const sanitizedPrep = userPrep.toLowerCase().trim();
    const validPreps = currentCard.prep.toLowerCase().trim().split("/").map((p) => p.trim());

    const isPrepCorrect = validPreps.includes(sanitizedPrep);
    const isCaseCorrect = userCase === currentCard.case;
    const isCorrect = isPrepCorrect && isCaseCorrect;

    let errorType: "preposition" | "case" | "both" | undefined;
    if (!isCorrect) {
      if (!isPrepCorrect && !isCaseCorrect) errorType = "both";
      else if (!isPrepCorrect) errorType = "preposition";
      else errorType = "case";
    }

    const answerRecord: AnswerResult = {
      card: currentCard,
      userPrep,
      userCase,
      isCorrect,
      errorType
    };

    const updatedAnswers = [...answers, answerRecord];
    setAnswers(updatedAnswers);

    // Record error in global stats if mistaken
    if (!isCorrect && errorType) {
      setStats((prev) => {
        const errorHist = { ...prev.errorHistory };
        const verbKey = currentCard.verb;
        const existing = errorHist[verbKey] || { total: 0, preposition: 0, case: 0, both: 0 };
        
        errorHist[verbKey] = {
          total: existing.total + 1,
          preposition: existing.preposition + (errorType === "preposition" ? 1 : 0),
          case: existing.case + (errorType === "case" ? 1 : 0),
          both: existing.both + (errorType === "both" ? 1 : 0)
        };
        return { ...prev, errorHistory: errorHist };
      });
    }

    // Record daily activity
    const today = new Date().toISOString().split("T")[0];
    setStats((prev) => {
      const daily = { ...prev.dailyActivity };
      const current = daily[today] || { reviewed: 0, cardsTested: 0, testsCompleted: 0 };
      daily[today] = {
        ...current,
        cardsTested: current.cardsTested + 1
      };
      return { ...prev, dailyActivity: daily };
    });

    if (isCorrect) {
      setResultStatus("correct");
      setScore((s) => s + 1);
      setTimeout(() => advanceTest(score + 1, updatedAnswers), 900);
    } else {
      setResultStatus("incorrect");
      setTimeout(() => advanceTest(score, updatedAnswers), 1800);
    }
  };

  const advanceTest = (currentScore: number, currentAnswers: AnswerResult[]) => {
    setUserPrep("");
    setUserCase("");
    setResultStatus("");

    if (cardIndex >= shuffledCards.length - 1) {
      finishTest(currentScore, currentAnswers);
    } else {
      setCardIndex((prev) => prev + 1);
    }
  };

  const finishTest = (finalScore: number, finalAnswers: AnswerResult[]) => {
    const report: TestReport = {
      id: "tr_" + Date.now(),
      date: new Date().toISOString(),
      score: finalScore,
      total: shuffledCards.length,
      gradeLevel: gradeTitle.includes("Class 9") ? "class_9" : "class_10",
      answers: finalAnswers
    };

    const today = new Date().toISOString().split("T")[0];

    setStats((prev) => {
      const isClass9 = gradeTitle.includes("Class 9");
      const best9 = isClass9 ? Math.max(prev.bestScoreClass9, finalScore) : prev.bestScoreClass9;
      const best10 = !isClass9 ? Math.max(prev.bestScoreClass10, finalScore) : prev.bestScoreClass10;

      const daily = { ...prev.dailyActivity };
      const currentDaily = daily[today] || { reviewed: 0, cardsTested: 0, testsCompleted: 0 };
      daily[today] = { ...currentDaily, testsCompleted: currentDaily.testsCompleted + 1 };

      return {
        ...prev,
        bestScoreClass9: best9,
        bestScoreClass10: best10,
        testsTaken: prev.testsTaken + 1,
        testHistory: [...prev.testHistory, report],
        dailyActivity: daily
      };
    });

    setTestStage("results");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && resultStatus === "" && userPrep.trim() !== "" && userCase !== "") {
      handleCheckAnswer();
    }
  };

  const incorrectAnswers = useMemo(() => {
    return answers.filter((a) => !a.isCorrect);
  }, [answers]);

  // Handle case button choices
  const cases: CaseType[] = ["Dativ", "Akkusativ", "Nominativ"];

  if (testStage === "results") {
    const accuracy = Math.round((score / shuffledCards.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Results Banner */}
        <div className="backdrop-blur-md bg-white/5 text-white rounded-2xl p-8 border border-white/10 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Test Completed
            </span>
            <h2 className="text-3xl font-extrabold mt-3 text-white">
              Your Score: <span className="text-indigo-400">{score}</span> / {shuffledCards.length}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Accuracy: <span className="font-bold text-white">{accuracy}%</span> on {gradeTitle}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={resetTest}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Test
            </button>
          </div>
        </div>

        {/* Incorrect Answer Review List */}
        {incorrectAnswers.length > 0 ? (
          <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              Review Incorrect Answers ({incorrectAnswers.length})
            </h3>

            <div className="space-y-3">
              {incorrectAnswers.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{ans.card.verb}</span>
                      <span className="text-xs text-slate-400 font-medium">({ans.card.meaning})</span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="text-red-400 font-medium">
                        Your input: <span className="font-bold">{ans.userPrep || "—"}</span> (+ {ans.userCase || "—"})
                      </p>
                      <p className="text-indigo-400 font-bold">
                        Correct: {ans.card.prep} (+ {ans.card.case})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAIExplain(ans.card)}
                    className="self-start sm:self-center px-3 py-1.5 bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Explain
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center text-emerald-300 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-base">Flawless Performance!</h3>
            <p className="text-xs text-emerald-400">You got every single question right in {gradeTitle}!</p>
          </div>
        )}

      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Test Progress Banner */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
            {gradeTitle} Test
          </span>
          <span className="text-xs text-slate-400 font-semibold ml-2">
            Question {cardIndex + 1} of {shuffledCards.length}
          </span>
        </div>

        <div className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Score: {score}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-md space-y-6 text-center">
        
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fill in the preposition & case</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            {currentCard.verb}
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            "{currentCard.meaning}"
          </p>
        </div>

        {/* Example hint sentence with blank */}
        {currentCard.exampleGerman && (
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl max-w-md mx-auto text-xs text-slate-300 font-serif italic">
            "{currentCard.exampleGerman.replace(currentCard.prep, "_______")}"
          </div>
        )}

        {/* Input Fields */}
        <div className="max-w-md mx-auto space-y-4 pt-2">
          
          {/* Preposition Input */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-300">Preposition (e.g., mit, auf, für, an)</label>
            <input
              type="text"
              value={userPrep}
              onChange={(e) => setUserPrep(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={resultStatus !== ""}
              placeholder="Type German preposition..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 rounded-xl font-semibold text-white outline-none transition-all placeholder:text-slate-500 placeholder:font-normal"
            />
          </div>

          {/* Case Button Options */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-300">Select Grammatical Case</label>
            <div className="grid grid-cols-3 gap-2">
              {cases.map((c) => (
                <button
                  key={c}
                  disabled={resultStatus !== ""}
                  onClick={() => setUserCase(c)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    userCase === c
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCheckAnswer}
            disabled={resultStatus !== "" || userPrep.trim() === "" || userCase === ""}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/10 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg text-sm mt-2 border border-transparent"
          >
            Submit Answer
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {/* Answer Feedback Banner */}
        {resultStatus === "correct" && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Correct! Outstanding German recall!
          </div>
        )}

        {resultStatus === "incorrect" && (
          <div className="p-3.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-bold text-sm space-y-1 animate-in shake duration-200">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Incorrect
            </div>
            <p className="text-xs font-semibold text-red-200">
              The correct answer is: <span className="font-bold underline text-white">{currentCard.prep}</span> (+ {currentCard.case})
            </p>
          </div>
        )}

      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${(cardIndex / shuffledCards.length) * 100}%` }}
        />
      </div>

    </div>
  );
};
