import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { FlashcardMode } from "./components/FlashcardMode";
import { LeitnerMode } from "./components/LeitnerMode";
import { TestMode } from "./components/TestMode";
import { AITutor } from "./components/AITutor";
import { StudentDashboard } from "./components/StudentDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { WorksheetGenerator } from "./components/WorksheetGenerator";
import { AIExplanationModal } from "./components/AIExplanationModal";

import { Login } from "./components/Login";
import { germanVerbsData } from "./data/verbs";
import { GradeLevel, AppView, VerbCard, UserStats, AuthUser } from "./types";
import { supabase } from "./lib/supabase";

const LOCAL_STORAGE_KEY = "deutsch_verbmaster_stats_v2";

const defaultUserStats: UserStats = {
  bestScoreClass9: 0,
  bestScoreClass10: 0,
  verbsReviewed: 0,
  testsTaken: 0,
  testHistory: [],
  errorHistory: {},
  dailyActivity: {},
  starredVerbs: [],
  masteredVerbs: []
};

export default function App() {
  const [allCards, setAllCards] = useState<VerbCard[]>(() => {
    try {
      const storedCustomVerbs = localStorage.getItem("deutsch_custom_verbs");
      if (storedCustomVerbs) {
        const parsed = JSON.parse(storedCustomVerbs);
        return [...germanVerbsData, ...parsed];
      }
    } catch (e) {
      console.error("Failed to load custom verbs", e);
    }
    return germanVerbsData;
  });

  const [currentView, setCurrentView] = useState<AppView>("flashcards");
  const [explainCardModal, setExplainCardModal] = useState<VerbCard | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Initialize view based on user role when authUser changes
  useEffect(() => {
    if (authUser) {
      // If this app is running in an OAuth popup, close it
      if (window.opener && window.opener !== window) {
        window.close();
        return;
      }

      if (authUser.role === "teacher") {
        setCurrentView("teacher_dashboard");
      } else {
        setCurrentView("flashcards");
      }
    }
  }, [authUser]);

  const handleLogin = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
  };

  // Load User Stats
  const [stats, setStats] = useState<UserStats>(defaultUserStats);

  useEffect(() => {
    if (authUser && authToken && authUser.role === "student") {
      fetch("/api/stats", {
        headers: { "Authorization": `Bearer ${authToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error && Object.keys(data).length > 1) {
          // Merge with default stats
          const loadedStats = { ...defaultUserStats };
          if (data.verbsReviewed) loadedStats.verbsReviewed = data.verbsReviewed;
          if (data.verbsMastered) loadedStats.verbsMastered = data.verbsMastered;
          if (data.bestScoreClass9) loadedStats.bestScoreClass9 = data.bestScoreClass9;
          if (data.bestScoreClass10) loadedStats.bestScoreClass10 = data.bestScoreClass10;
          if (data.bestScoreAll) loadedStats.bestScoreAll = data.bestScoreAll;
          if (data.streak) loadedStats.streak = data.streak;
          if (data.testHistory) loadedStats.testHistory = data.testHistory;
          if (data.starredVerbs) loadedStats.starredVerbs = data.starredVerbs;
          if (data.masteredVerbs) loadedStats.masteredVerbs = data.masteredVerbs;
          // You could sync studyDates and other fields here too
          setStats(loadedStats);
        }
      })
      .catch(console.error);
    }
  }, [authUser, authToken]);

  // Persist stats to backend
  useEffect(() => {
    if (authUser && authToken && authUser.role === "student") {
      // Debounce saving
      const timer = setTimeout(() => {
        fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            verbsReviewed: stats.verbsReviewed,
            verbsMastered: stats.verbsMastered,
            bestScoreClass9: stats.bestScoreClass9,
            bestScoreClass10: stats.bestScoreClass10,
            bestScoreAll: stats.bestScoreAll,
            streak: stats.streak,
            testHistory: stats.testHistory,
            starredVerbs: stats.starredVerbs,
            masteredVerbs: stats.masteredVerbs
          })
        }).catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [stats, authUser, authToken]);

  // Handle grade curriculum filtering
  const activeCards = useMemo(() => {
    return allCards.filter((c) => c.classLevel === "class_9");
  }, [allCards]);

  const class9Count = useMemo(() => allCards.filter((c) => c.classLevel === "class_9").length, [allCards]);

  const handleAddCustomVerb = (newVerbCard: VerbCard) => {
    setAllCards((prev) => {
      const updated = [...prev, newVerbCard];
      try {
        const customOnly = updated.filter((c) => c.id > 1000);
        localStorage.setItem("deutsch_custom_verbs", JSON.stringify(customOnly));
      } catch (e) {
        console.error("Failed to save custom verb", e);
      }
      return updated;
    });
  };

  const handlePracticeStruggleVerbs = (struggleCards: VerbCard[]) => {
    setCurrentView("flashcards");
  };

  const gradeTitle = "Class 9th Syllabus (54 Verbs)";

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col relative antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Background Orbs */}
      <div className="fixed -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -right-20 w-[24rem] h-[24rem] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed -bottom-20 left-1/3 w-[20rem] h-[20rem] bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
      {/* Header Bar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        authUser={authUser}
        totalVerbsCount={allCards.length}
        class9Count={class9Count}
        onLogout={async () => {
          setAuthUser(null);
          setAuthToken(null);
          await supabase.auth.signOut();
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {currentView === "flashcards" && authUser.role === "student" && (
          <FlashcardMode
            cards={activeCards}
            stats={stats}
            setStats={setStats}
            onOpenAIExplain={(card) => setExplainCardModal(card)}
            gradeTitle={gradeTitle}
          />
        )}

        {currentView === "leitner" && authUser.role === "student" && (
          <LeitnerMode
            cards={activeCards}
            stats={stats}
            setStats={setStats}
            onOpenAIExplain={(card) => setExplainCardModal(card)}
          />
        )}

        {currentView === "test" && authUser.role === "student" && (
          <TestMode
            cards={activeCards}
            stats={stats}
            setStats={setStats}
            gradeTitle={gradeTitle}
            onOpenAIExplain={(card) => setExplainCardModal(card)}
          />
        )}

        {currentView === "ai_tutor" && authUser.role === "student" && <AITutor />}

        {currentView === "student_dashboard" && authUser.role === "student" && (
          <StudentDashboard
            stats={stats}
            cards={allCards}
            onPracticeErrors={handlePracticeStruggleVerbs}
            onOpenAIExplain={(card) => setExplainCardModal(card)}
          />
        )}

        {currentView === "teacher_dashboard" && authUser.role === "teacher" && (
          <TeacherDashboard
            cards={allCards}
            onAddCustomVerb={handleAddCustomVerb}
            authToken={authToken}
          />
        )}

        {currentView === "worksheet_generator" && authUser.role === "teacher" && <WorksheetGenerator />}

      </main>

      {/* AI Explanation Modal */}
      <AIExplanationModal
        card={explainCardModal}
        onClose={() => setExplainCardModal(null)}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 backdrop-blur-md bg-white/5 text-center text-xs text-slate-500 mt-auto">
        <p>🇩🇪 <b className="text-slate-400">Deutsch VerbMaster</b> — Tailored for Class 9th (54 Verbs) German syllabus.</p>
        <p className="mt-1 text-[11px] text-slate-500">Powered by Gemini AI • React 19 • Express Server</p>
      </footer>
      </div>
    </div>
  );
}
