import React, { useState } from "react";
import { Sparkles, Loader2, Printer, CheckCircle2, RefreshCw } from "lucide-react";

interface Question {
  id: number;
  sentence: string;
  verb: string;
  correctPrep: string;
  correctCase: string;
  options: string[];
  explanation: string;
}

export const WorksheetGenerator: React.FC = () => {
  const [grade, setGrade] = useState<"class_9" | "class_10">("class_9");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [userSelections, setUserSelections] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setShowResults(false);
    setUserSelections({});
    try {
      const res = await fetch("/api/gemini/generate-worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, count })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Generate Worksheet Error:", err);
      alert("Failed to generate AI worksheet. Please ensure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelect = (questionId: number, option: string) => {
    setUserSelections((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (userSelections[q.id] === q.correctPrep) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h2 className="text-xl font-extrabold">AI German Worksheet & Quiz Generator</h2>
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Instantly generate custom fill-in-the-blank worksheets for Class 9th or Class 10th with answer keys.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-white hover:bg-amber-50 text-slate-900 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                Generating Worksheet...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-amber-600" />
                Generate AI Worksheet
              </>
            )}
          </button>

          {questions.length > 0 && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Generator Configuration Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Curriculum</label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setGrade("class_9")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  grade === "class_9" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-600"
                }`}
              >
                Class 9th (54 Verbs)
              </button>
              <button
                onClick={() => setGrade("class_10")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  grade === "class_10" ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-600"
                }`}
              >
                Class 10th / B1
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Questions</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
            >
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              {showResults ? "Hide Answers" : "Check My Worksheet Answers"}
            </button>
          </div>
        )}
      </div>

      {/* Generated Questions List */}
      {questions.length > 0 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 printable-area">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                German Verbs with Prepositions Worksheet
              </h3>
              <p className="text-xs text-slate-500">
                Level: {grade === "class_9" ? "Class 9th Syllabus" : "Class 10th / B1 Syllabus"} • Total Questions: {questions.length}
              </p>
            </div>

            {showResults && (
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  Score: {calculateScore()} / {questions.length} ({Math.round((calculateScore() / questions.length) * 100)}%)
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isSelected = userSelections[q.id];
              const isCorrect = isSelected === q.correctPrep;

              return (
                <div key={q.id || idx} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {idx + 1}. {q.sentence}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                      Tested Verb: <b>{q.verb}</b>
                    </span>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const selected = userSelections[q.id] === opt;
                      let btnStyle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-100";

                      if (showResults) {
                        if (opt === q.correctPrep) {
                          btnStyle = "bg-emerald-600 text-white font-bold border-emerald-700";
                        } else if (selected && !isCorrect) {
                          btnStyle = "bg-red-500 text-white font-bold border-red-600";
                        }
                      } else if (selected) {
                        btnStyle = "bg-slate-900 text-white font-bold border-slate-900";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelect(q.id, opt)}
                          className={`py-2 px-3 rounded-xl text-xs border font-medium transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Show Answer Explanation if checked */}
                  {showResults && (
                    <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 space-y-0.5">
                      <p className="font-bold text-emerald-700">
                        Correct Answer: {q.correctPrep} (+ {q.correctCase})
                      </p>
                      <p className="text-slate-500">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {questions.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm space-y-3">
          <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">Generate Your First German Worksheet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Generate AI Worksheet" above to create tailored Class 9th or Class 10th fill-in-the-blank practice tests using Gemini AI!
          </p>
        </div>
      )}

    </div>
  );
};
