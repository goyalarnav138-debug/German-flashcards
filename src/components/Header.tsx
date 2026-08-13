import React, { useState } from "react";
import { AppView, AuthUser } from "../types";
import { 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Bot, 
  BarChart3, 
  GraduationCap, 
  Sparkles,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  authUser: AuthUser;
  totalVerbsCount: number;
  class9Count: number;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  authUser,
  totalVerbsCount,
  class9Count,
  onLogout
}) => {
  const isTeacher = authUser.role === "teacher";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="w-full backdrop-blur-xl bg-slate-950/80 border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none drop-shadow-md" role="img" aria-label="German Flag">🇩🇪</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Deutsch VerbMaster
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 hidden md:inline-flex shadow-inner">
                  Class 9th
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">German Verbs with Fixed Prepositions</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-8">
            <nav className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              {!isTeacher ? (
                <>
                  <button
                    onClick={() => setCurrentView("flashcards")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "flashcards"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Flashcards
                  </button>

                  <button
                    onClick={() => setCurrentView("leitner")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "leitner"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Spaced Repetition
                  </button>

                  <button
                    onClick={() => setCurrentView("test")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "test"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Test Mode
                  </button>

                  <button
                    onClick={() => setCurrentView("ai_tutor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "ai_tutor"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-indigo-300 hover:bg-white/10"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    AI Tutor
                  </button>

                  <button
                    onClick={() => setCurrentView("student_dashboard")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "student_dashboard"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    My Stats
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentView("teacher_dashboard")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "teacher_dashboard"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Teacher Dashboard
                  </button>

                  <button
                    onClick={() => setCurrentView("worksheet_generator")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      currentView === "worksheet_generator"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-indigo-300 hover:bg-white/10"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Worksheet Creator
                  </button>
                </>
              )}
            </nav>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 pl-2 ml-auto">
              <div className="text-right">
                <p className="text-xs font-bold text-white">{authUser.name}</p>
                <p className="text-[10px] text-slate-400 capitalize font-medium">{authUser.role} {authUser.section ? `• ${authUser.section}` : ""}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300 shadow-sm"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-lg border border-white/10"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 pb-2 space-y-4">
            <nav className="flex flex-col gap-2">
              {!isTeacher ? (
                <>
                  <button
                    onClick={() => { setCurrentView("flashcards"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "flashcards"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white bg-white/5"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Flashcards
                  </button>

                  <button
                    onClick={() => { setCurrentView("leitner"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "leitner"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white bg-white/5"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Spaced Repetition
                  </button>

                  <button
                    onClick={() => { setCurrentView("test"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "test"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white bg-white/5"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Test Mode
                  </button>

                  <button
                    onClick={() => { setCurrentView("ai_tutor"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "ai_tutor"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-indigo-300 bg-white/5"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    AI Tutor
                  </button>

                  <button
                    onClick={() => { setCurrentView("student_dashboard"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "student_dashboard"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white bg-white/5"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    My Stats
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setCurrentView("teacher_dashboard"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "teacher_dashboard"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white bg-white/5"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Teacher Dashboard
                  </button>

                  <button
                    onClick={() => { setCurrentView("worksheet_generator"); setIsMobileMenuOpen(false); }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-3 w-full ${
                      currentView === "worksheet_generator"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-indigo-300 bg-white/5"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Worksheet Creator
                  </button>
                </>
              )}
            </nav>

            {/* Mobile User Profile & Logout */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-sm font-bold text-white">{authUser.name}</p>
                <p className="text-xs text-slate-400 capitalize font-medium">{authUser.role} {authUser.section ? `• ${authUser.section}` : ""}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
