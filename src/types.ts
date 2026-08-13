export type CaseType = "Dativ" | "Akkusativ" | "Nominativ" | "Genitiv";

export type GradeLevel = "class_9" | "class_10" | "all" | "custom";

export type Role = "student" | "teacher";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  section?: string;
}

export interface VerbCard {
  id: number;
  verb: string;
  prep: string;
  case: CaseType;
  meaning: string;
  exampleGerman?: string;
  exampleEnglish?: string;
  classLevel: "class_9" | "class_10";
  notes?: string;
}

export type AppView = 
  | "flashcards" 
  | "leitner" 
  | "test" 
  | "ai_tutor" 
  | "student_dashboard" 
  | "teacher_dashboard"
  | "worksheet_generator"
  | "custom_decks";

export interface AnswerResult {
  card: VerbCard;
  userPrep: string;
  userCase: CaseType | "";
  isCorrect: boolean;
  errorType?: "preposition" | "case" | "both";
}

export interface TestReport {
  id: string;
  date: string;
  score: number;
  total: number;
  gradeLevel: GradeLevel;
  answers: AnswerResult[];
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: "Class 9th" | "Class 10th";
  section: string;
  avatar: string;
  verbsReviewed: number;
  testsTaken: number;
  accuracy: number;
  streak: number;
  lastActive: string;
  frequentErrors: { verb: string; count: number }[];
}

export interface ClassAssignment {
  id: string;
  title: string;
  grade: "Class 9th" | "Class 10th";
  verbCount: number;
  dueDate: string;
  completedCount: number;
  totalStudents: number;
  status: "Active" | "Upcoming" | "Completed";
}

export interface DailyActivity {
  reviewed: number;
  cardsTested: number;
  testsCompleted: number;
}

export interface UserStats {
  bestScoreClass9: number;
  bestScoreClass10: number;
  bestScoreAll?: number;
  verbsReviewed: number;
  verbsMastered?: number;
  streak?: number;
  testsTaken: number;
  testHistory: TestReport[];
  errorHistory: Record<string, { total: number; preposition: number; case: number; both: number }>;
  dailyActivity: Record<string, DailyActivity>;
  starredVerbs: number[]; // Verb Card IDs
  masteredVerbs: number[]; // Verb Card IDs
}
