import React, { useState, useEffect } from "react";
import { AuthUser, Role } from "../types";
import { BookOpen, LogIn, Users } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: (user: AuthUser, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<Role>("student");
  const [section, setSection] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;
  const popupCheckInterval = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (popupCheckInterval.current) {
        clearInterval(popupCheckInterval.current);
      }
    };
  }, []);

  const isProcessingSession = React.useRef(false);

  useEffect(() => {
    if (isPopup) {
      const sendSession = async (session: any) => {
        if (session) {
          window.opener.postMessage({
            type: 'SUPABASE_SESSION',
            access_token: session.access_token,
            refresh_token: session.refresh_token
          }, '*');
          setTimeout(() => window.close(), 100);
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        sendSession(session);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        sendSession(session);
      });
      const fallbackTimer = setTimeout(() => window.close(), 5000);
      return () => {
        subscription?.unsubscribe();
        clearTimeout(fallbackTimer);
      };
    }

    // Main window listener
    let mounted = true;

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        await handleSession(session);
      }
    };
    checkInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && mounted) {
        await handleSession(session);
      }
    });

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_SESSION') {
        const { access_token, refresh_token } = event.data;
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          // setSession will trigger onAuthStateChange
        }
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [role, section, isPopup]);

  const handleSession = async (session: any) => {
    if (isProcessingSession.current) return;
    isProcessingSession.current = true;
    
    try {
      const user = session.user;
      const email = user.email || "";
      
      // We get role and section from localStorage since OAuth redirects
      const storedRole = localStorage.getItem("verbmaster_role") as Role || role;
      const storedSection = localStorage.getItem("verbmaster_section") || section;

      const ALLOWED_TEACHERS = ["goyalarnav138@gmail.com", "teacher@verbmaster.com"];
      if (storedRole === "teacher" && !ALLOWED_TEACHERS.includes(email.trim().toLowerCase())) {
        setError("This email is not authorized for a teacher account.");
        setIsLoading(false);
        await supabase.auth.signOut();
        isProcessingSession.current = false;
        return;
      }

      const token = session.access_token;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role: storedRole,
          section: storedRole === "student" ? storedSection : undefined,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to register on the server.");
      }

      const registeredUser = await response.json();
      
      onLogin({
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role as Role,
        section: registeredUser.section || undefined,
      }, token);
    } catch (err: any) {
      console.error("Session handling error:", err);
      setError("Failed to sign in. Please try again.");
      await supabase.auth.signOut();
      setIsLoading(false);
    } finally {
      isProcessingSession.current = false;
    }
  };

  const handleGoogleSignIn = async () => {
    if (role === "student" && !section.trim()) {
      setError("Students must provide a class section.");
      return;
    }
    setError("");
    setIsLoading(true);
    
    localStorage.setItem("verbmaster_role", role);
    if (role === "student") {
      localStorage.setItem("verbmaster_section", section);
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Open the OAuth provider's URL directly in a popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.url, 
          'oauth_popup', 
          `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
        );
        
        if (!popup) {
          setError("Popup was blocked by your browser. Please allow popups for this site to sign in.");
          setIsLoading(false);
        } else {
          // Fallback polling just in case postMessage fails
          popupCheckInterval.current = setInterval(async () => {
            if (popup.closed) {
              if (popupCheckInterval.current) clearInterval(popupCheckInterval.current);
              
              // Double check if the session was successfully captured
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                setIsLoading(false);
              }
            }
          }, 1000);
        }
        
        // Supabase's auth state listener will handle the success callback when the popup redirects back and updates localStorage
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize Google Sign In.");
      setIsLoading(false);
    }
  };

  if (isPopup) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg font-medium">Completing sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative p-4">
      {/* Background Orbs */}
      <div className="fixed -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 -right-20 w-[24rem] h-[24rem] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="z-10 w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 mx-auto rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Deutsch VerbMaster
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in with Google to save your progress
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                role === "student" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                role === "teacher" 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Teacher
            </button>
          </div>

          <div className="space-y-4">
            {role === "student" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Class & Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Select your class...</option>
                  <optgroup label="Class 9th" className="bg-slate-900 text-white">
                    <option value="9A">9A</option>
                    <option value="9B">9B</option>
                    <option value="9C">9C</option>
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>

          <button
            onClick={() => {
              if (role === "student" && !section.trim()) {
                setError("Students must provide a class section.");
                return;
              }
              onLogin({
                id: "demo-" + role,
                name: "Demo " + (role === "student" ? "Student" : "Teacher"),
                email: role === "student" ? "student@demo.com" : "goyalarnav138@gmail.com",
                role: role,
                section: role === "student" ? section : undefined,
              }, "demo-token");
            }}
            disabled={isLoading}
            className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            Demo Login
          </button>
        </div>
      </div>
    </div>
  );
};
