import React, { useState, useMemo } from "react";
import { UserStats, VerbCard } from "../types";
import { 
  Flame, 
  Award, 
  BookOpen, 
  CheckSquare, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  RotateCcw
} from "lucide-react";

interface StudentDashboardProps {
  stats: UserStats;
  cards: VerbCard[];
  onPracticeErrors: (errorVerbs: VerbCard[]) => void;
  onOpenAIExplain: (card: VerbCard) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  cards,
  onPracticeErrors,
  onOpenAIExplain
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dynamic Greeting based on time
  const greeting = useMemo(() => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentDate]);

  // Refresh time every minute to keep greeting/date fresh
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate current streak
  const streak = useMemo(() => {
    const dates = Object.keys(stats.dailyActivity);
    if (dates.length === 0) return 0;

    let count = 0;
    let checkDate = new Date();

    const todayStr = checkDate.toISOString().split("T")[0];
    if (!stats.dailyActivity[todayStr]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = checkDate.toISOString().split("T")[0];
      if (stats.dailyActivity[key]) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [stats.dailyActivity]);

  // Top Frequent Errors
  const sortedErrors = useMemo(() => {
    return (Object.entries(stats.errorHistory) as [string, { total: number; preposition: number; case: number; both: number }][])
      .map(([verb, data]) => ({ verb, total: data.total, preposition: data.preposition, case: data.case, both: data.both }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [stats.errorHistory]);

  const handlePracticeStruggleVerbs = () => {
    const struggleVerbNames = sortedErrors.map((e) => e.verb);
    const matched = cards.filter((c) => struggleVerbNames.includes(c.verb));
    if (matched.length > 0) {
      onPracticeErrors(matched);
    }
  };

  // Calendar Heatmap computations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getActivityLevel = (count: number) => {
    if (!count) return "bg-white/5 border-white/10 text-slate-500";
    if (count >= 15) return "bg-indigo-600 text-white font-bold border-indigo-700";
    if (count >= 6) return "bg-indigo-500 text-white font-semibold border-indigo-600";
    return "bg-indigo-500/40 text-indigo-200 font-medium border-indigo-500/50";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome / Greeting Section */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            {greeting}, Student! 👋
          </h2>
          <p className="text-sm text-indigo-200 mt-1 font-medium">
            Ready to master some German verbs today? It's {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}.
          </p>
        </div>
        <button
          onClick={handlePracticeStruggleVerbs}
          disabled={sortedErrors.length === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Review Mistakes
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Card */}
        <div className="backdrop-blur-md bg-indigo-500/20 text-white p-5 rounded-2xl shadow-md space-y-1 border border-indigo-500/30">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-300">
            <span>Study Streak</span>
            <Flame className="w-5 h-5 text-indigo-400 animate-bounce" />
          </div>
          <div className="text-3xl font-black">{streak} Days</div>
          <p className="text-[11px] text-indigo-200 font-medium">Keep practicing daily!</p>
        </div>

        {/* Verbs Reviewed */}
        <div className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Flashcards Reviewed</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.verbsReviewed}</div>
          <p className="text-[11px] text-slate-500 font-medium">Total card turns</p>
        </div>

        {/* Class 9th Best Score */}
        <div className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Class 9th Best</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats.bestScoreClass9} <span className="text-xs font-normal text-slate-500">/ 54</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Class 9th Curriculum</p>
        </div>

        {/* Class 10th Best Score */}
        <div className="backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Class 10th / B1 Best</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats.bestScoreClass10} <span className="text-xs font-normal text-slate-500">/ 95</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Full B1 Curriculum</p>
        </div>

      </div>

      {/* Badges System */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-500/30 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Achievements & Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${stats.verbsReviewed >= 100 ? "bg-white/10 border-indigo-500/50 shadow-md shadow-indigo-500/10" : "bg-white/5 border-white/10 opacity-50 grayscale"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.verbsReviewed >= 100 ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-slate-400"}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Century Reader</div>
              <div className="text-[10px] text-slate-400 mt-1">Review 100 verbs</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${streak >= 7 ? "bg-white/10 border-amber-500/50 shadow-md shadow-amber-500/10" : "bg-white/5 border-white/10 opacity-50 grayscale"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${streak >= 7 ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-slate-400"}`}>
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Weekly Warrior</div>
              <div className="text-[10px] text-slate-400 mt-1">7-day study streak</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${stats.bestScoreClass9 === 54 ? "bg-white/10 border-emerald-500/50 shadow-md shadow-emerald-500/10" : "bg-white/5 border-white/10 opacity-50 grayscale"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.bestScoreClass9 === 54 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-400"}`}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Class 9th Perfect</div>
              <div className="text-[10px] text-slate-400 mt-1">Perfect score (54/54)</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${stats.testHistory.filter(t => t.score === t.total).length >= 10 ? "bg-white/10 border-purple-500/50 shadow-md shadow-purple-500/10" : "bg-white/5 border-white/10 opacity-50 grayscale"}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.testHistory.filter(t => t.score === t.total).length >= 10 ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-slate-400"}`}>
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Test Master</div>
              <div className="text-[10px] text-slate-400 mt-1">10 perfect test scores</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Calendar Heatmap */}
        <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              Activity Heatmap
            </h3>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{monthNames[month]} {year}</span>
              <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-[10px] font-bold text-slate-400 py-1">
                {d}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const act = stats.dailyActivity[dateStr];
              const totalAct = act ? act.reviewed + act.cardsTested : 0;
              const bg = getActivityLevel(totalAct);

              return (
                <div
                  key={dayNum}
                  title={`${dateStr}: ${totalAct} activities`}
                  className={`aspect-square rounded-lg border flex items-center justify-center text-xs transition-transform hover:scale-110 cursor-default ${bg}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 font-medium pt-2">
            <span>Less</span>
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
            <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" />
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700" />
            <span>More</span>
          </div>
        </div>

        {/* Frequent Struggle Verbs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Frequent Struggle Verbs
              </h3>

              {sortedErrors.length > 0 && (
                <button
                  onClick={handlePracticeStruggleVerbs}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Practice These Verbs
                </button>
              )}
            </div>

            <div className="space-y-2 mt-4">
              {sortedErrors.length > 0 ? (
                sortedErrors.map((err, idx) => {
                  const cardObj = cards.find((c) => c.verb === err.verb);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{err.verb}</span>
                        {cardObj && (
                          <span className="text-xs text-slate-500 ml-2 font-medium">
                            ({cardObj.prep} + {cardObj.case})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          {err.total} errors
                        </span>

                        {cardObj && (
                          <button
                            onClick={() => onOpenAIExplain(cardObj)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                            title="AI Explain"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No mistake history recorded yet. Take tests to automatically track your struggle verbs!
                </p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl text-xs text-amber-900 font-medium">
            💡 <strong>Pro-Tip:</strong> Class 9 German students often mix up <i>"warten auf (+ Akk)"</i> with <i>"gehören zu (+ Dat)"</i>. Focus on small 5-verb chunks!
          </div>
        </div>

      </div>

      {/* Test History Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          Recent Quiz History
        </h3>

        <div className="space-y-2.5">
          {stats.testHistory.length > 0 ? (
            stats.testHistory
              .slice()
              .reverse()
              .map((test, idx) => (
                <div
                  key={test.id || idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {test.gradeLevel === "class_9" ? "Class 9th Test" : "Class 10th / B1 Test"}
                    </span>
                    <span className="text-slate-400 ml-2 font-medium">
                      {new Date(test.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {test.score} / {test.total}
                    </span>

                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        test.score / test.total >= 0.8
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {Math.round((test.score / test.total) * 100)}%
                    </span>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              No completed tests yet. Select "Test Mode" from the top navigation to test your memory!
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
