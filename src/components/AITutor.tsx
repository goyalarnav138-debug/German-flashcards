import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, Loader2, BookOpen, MessageSquareText } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "tutor";
  text: string;
  time: string;
}

export const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Guten Tag";
    if (hour < 12) timeGreeting = "Guten Morgen";
    else if (hour > 18) timeGreeting = "Guten Abend";

    return [
      {
        id: "m_1",
        sender: "tutor",
        text: `${timeGreeting}! I am **Herr Weber**, your AI German Language Coach. Whether you are in **Class 9th** preparing for your 54 fixed verbs or **Class 10th** mastering B1 grammar, ask me anything about prepositions, Dativ vs. Akkusativ, or memory tricks!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text: promptToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      }));

      const res = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const tutorMsg: Message = {
        id: "t_" + Date.now(),
        sender: "tutor",
        text: data.reply || "Entschuldigung, I could not generate a response right now.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error("AI Tutor Chat Error:", err);
      const errorMsg: Message = {
        id: "err_" + Date.now(),
        sender: "tutor",
        text: "Entschuldigung! I ran into an error communicating with the server. Please check your Gemini API key in Settings > Secrets.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortcut = (promptText: string) => {
    handleSend(promptText);
  };

  return (
    <div className="max-w-3xl mx-auto h-[680px] backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-lg overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              Herr Weber
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                German AI Tutor
              </span>
            </h2>
            <p className="text-xs text-slate-400">Class 9th & 10th Grammar & Preposition Assistant</p>
          </div>
        </div>

        <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          <Sparkles className="w-3 h-3" /> Online
        </span>
      </div>

      {/* Shortcut Prompts */}
      <div className="bg-white/5 border-b border-white/10 p-3 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MessageSquareText className="w-3 h-3" /> Ask:
        </span>

        <button
          onClick={() => handleShortcut("Explain when to use Dativ vs Akkusativ with German verbs")}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-full text-xs font-medium transition-all shrink-0 shadow-2xs"
        >
          💡 Dativ vs Akkusativ Rules
        </button>

        <button
          onClick={() => handleShortcut("How can I remember 'warten auf' and 'gehören zu' for Class 9th?")}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-full text-xs font-medium transition-all shrink-0 shadow-2xs"
        >
          🧠 Class 9th Memory Tricks
        </button>

        <button
          onClick={() => handleShortcut("Give me 3 fill-in-the-blank practice sentences for Class 10 German verbs")}
          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-full text-xs font-medium transition-all shrink-0 shadow-2xs"
        >
          📝 Practice Quiz Sentences
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-indigo-400 border border-white/10"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 shadow-2xs ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                  : "bg-white/10 text-white border border-white/10 rounded-tl-none font-sans"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div
                className={`text-[10px] text-right font-medium mt-1 ${
                  m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-indigo-400 border border-white/10 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              Herr Weber is typing a explanation...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask Herr Weber anything about German verbs, prepositions or grammar..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 rounded-xl text-xs sm:text-sm text-white outline-none transition-all placeholder:text-slate-500 font-medium"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 disabled:border-white/10 border border-transparent text-white font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Send</span>
          </button>
        </form>
      </div>

    </div>
  );
};
