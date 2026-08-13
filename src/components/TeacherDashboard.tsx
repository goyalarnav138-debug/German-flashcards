import React, { useState, useMemo } from "react";
import { StudentProfile, ClassAssignment, VerbCard, GradeLevel } from "../types";
import { mockStudents, mockAssignments } from "../data/verbs";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Search, 
  Calendar, 
  AlertTriangle,
  FilePlus2,
  Trash2,
  X
} from "lucide-react";

interface TeacherDashboardProps {
  cards: VerbCard[];
  onAddCustomVerb: (newCard: VerbCard) => void;
  authToken: string | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  cards,
  onAddCustomVerb,
  authToken
}) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<"All" | "Class 9th" | "Class 10th">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  }, []);

  // Fetch real-time data from database
  React.useEffect(() => {
    const fetchStudents = async () => {
      if (!authToken) return;
      try {
        const response = await fetch("/api/students", {
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
        setAssignments(mockAssignments); // Assignments can remain mocked for now
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [authToken]);

  // Modal states
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddVerbModal, setShowAddVerbModal] = useState(false);

  // New assignment form state
  const [newTitle, setNewTitle] = useState("");
  const [newGrade, setNewGrade] = useState<"Class 9th" | "Class 10th">("Class 9th");
  const [newVerbCount, setNewVerbCount] = useState(25);
  const [newDueDate, setNewDueDate] = useState("2026-08-30");

  // New verb form state
  const [verbInput, setVerbInput] = useState("");
  const [prepInput, setPrepInput] = useState("");
  const [caseInput, setCaseInput] = useState<"Dativ" | "Akkusativ" | "Nominativ">("Dativ");
  const [meaningInput, setMeaningInput] = useState("");
  const [exampleGermanInput, setExampleGermanInput] = useState("");
  const [exampleEnglishInput, setExampleEnglishInput] = useState("");
  const [classLevelInput, setClassLevelInput] = useState<"class_9" | "class_10">("class_9");

  const filteredStudents = students.filter((st) => {
    const matchesGrade = selectedGradeFilter === "All" || st.grade === selectedGradeFilter;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: ClassAssignment = {
      id: "as_" + Date.now(),
      title: newTitle.trim(),
      grade: newGrade,
      verbCount: Number(newVerbCount),
      dueDate: newDueDate,
      completedCount: 0,
      totalStudents: newGrade === "Class 9th" ? 24 : 20,
      status: "Active"
    };

    setAssignments((prev) => [created, ...prev]);
    setShowAddAssignmentModal(false);
    setNewTitle("");
  };

  const handleCreateVerb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verbInput.trim() || !prepInput.trim() || !meaningInput.trim()) return;

    const newVerbCard: VerbCard = {
      id: Date.now(),
      verb: verbInput.trim(),
      prep: prepInput.trim(),
      case: caseInput,
      meaning: meaningInput.trim(),
      exampleGerman: exampleGermanInput.trim() || undefined,
      exampleEnglish: exampleEnglishInput.trim() || undefined,
      classLevel: classLevelInput
    };

    onAddCustomVerb(newVerbCard);
    setShowAddVerbModal(false);
    
    // Reset form
    setVerbInput("");
    setPrepInput("");
    setMeaningInput("");
    setExampleGermanInput("");
    setExampleEnglishInput("");
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter(a => a.id !== id));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter(s => s.id !== id));
  };

  const avgAccuracy = students.length > 0
    ? Math.round(students.reduce((acc, curr) => acc + curr.accuracy, 0) / students.length)
    : 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Fetching real-time dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Teacher Dashboard Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👩‍🏫</span>
            <h2 className="text-xl font-extrabold tracking-tight">{greeting}, Frau Weber!</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage Class 9th (54 Verbs) & Class 10th German Curriculum, track student performance & assign quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="flex-1 md:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </button>

          <button
            onClick={() => setShowAddVerbModal(true)}
            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <FilePlus2 className="w-4 h-4" />
            Add Custom Verb
          </button>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{students.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Class 9-A, 9-B & 10-A</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Class Avg Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{avgAccuracy}%</div>
          <p className="text-[11px] text-slate-500 font-medium">Across all quiz runs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Active Assignments</span>
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {assignments.filter((a) => a.status === "Active").length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Class 9th & 10th</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Curated Verbs</span>
            <GraduationCap className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{cards.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">54 (Class 9) + 41 (Class 10)</p>
        </div>
      </div>

      {/* Class Student Roster Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Student Performance Roster</h3>
            <p className="text-xs text-slate-500">View individual student accuracy, verbs reviewed & frequent mistakes.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600"
              />
            </div>

            {/* Grade Filter Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {(["All", "Class 9th", "Class 10th"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedGradeFilter === g
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Cards Reviewed</th>
                <th className="py-3 px-4">Tests</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Top Struggle Verb</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-2.5 font-bold text-slate-900">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center justify-center">
                      {st.avatar}
                    </span>
                    {st.name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {st.grade} ({st.section})
                  </td>
                  <td className="py-3 px-4 font-medium">{st.verbsReviewed} cards</td>
                  <td className="py-3 px-4 font-medium">{st.testsTaken} quizzes</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                      st.accuracy >= 90
                        ? "bg-emerald-100 text-emerald-800"
                        : st.accuracy >= 80
                        ? "bg-teal-100 text-teal-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {st.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-600">🔥 {st.streak}d</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {st.frequentErrors[0] ? (
                      <span className="text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]">
                        {st.frequentErrors[0].verb} ({st.frequentErrors[0].count}x)
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteStudent(st.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Class Assignments Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Class Assignments & Quizzes</h3>
            <p className="text-xs text-slate-500">Assigned German preposition quizzes for Class 9th & Class 10th.</p>
          </div>

          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Quiz Assignment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignments.map((as) => (
            <div key={as.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
              
              {/* Delete Button (appears on hover) */}
              <button 
                onClick={() => handleDeleteAssignment(as.id)}
                className="absolute top-3 right-3 p-1.5 bg-white text-slate-400 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Assignment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between pr-8">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {as.grade}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {as.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{as.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{as.verbCount} Verbs • Due {as.dueDate}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Submissions</span>
                  <span>{as.completedCount} / {as.totalStudents}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(as.completedCount / as.totalStudents) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Create New Class Assignment</h3>
              <button onClick={() => setShowAddAssignmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Class 9th Verbs Practice Quiz #2"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Level</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  >
                    <option value="Class 9th">Class 9th (54 Verbs)</option>
                    <option value="Class 10th">Class 10th (95 Verbs)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Verb Count</label>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={newVerbCount}
                    onChange={(e) => setNewVerbCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Assign to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM VERB MODAL */}
      {showAddVerbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Custom Verb to Curriculum</h3>
              <button onClick={() => setShowAddVerbModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVerb} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">German Verb</label>
                  <input
                    type="text"
                    required
                    value={verbInput}
                    onChange={(e) => setVerbInput(e.target.value)}
                    placeholder="e.g. hoffen"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preposition</label>
                  <input
                    type="text"
                    required
                    value={prepInput}
                    onChange={(e) => setPrepInput(e.target.value)}
                    placeholder="e.g. auf"
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Case</label>
                  <select
                    value={caseInput}
                    onChange={(e) => setCaseInput(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  >
                    <option value="Dativ">Dativ</option>
                    <option value="Akkusativ">Akkusativ</option>
                    <option value="Nominativ">Nominativ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">English Meaning</label>
                <input
                  type="text"
                  required
                  value={meaningInput}
                  onChange={(e) => setMeaningInput(e.target.value)}
                  placeholder="e.g. to hope for"
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Example German Sentence</label>
                  <input
                    type="text"
                    value={exampleGermanInput}
                    onChange={(e) => setExampleGermanInput(e.target.value)}
                    placeholder="Ich hoffe auf gutes Wetter."
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Example English Translation</label>
                  <input
                    type="text"
                    value={exampleEnglishInput}
                    onChange={(e) => setExampleEnglishInput(e.target.value)}
                    placeholder="I hope for good weather."
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Curriculum Level</label>
                <select
                  value={classLevelInput}
                  onChange={(e) => setClassLevelInput(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-medium text-xs"
                >
                  <option value="class_9">Class 9th (54 Verbs list)</option>
                  <option value="class_10">Class 10th / B1 Level</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVerbModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  Add Verb to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
