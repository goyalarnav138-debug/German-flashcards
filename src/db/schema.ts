import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Firebase Auth UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'student' | 'teacher'
  section: text("section"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  userId: text("user_id").primaryKey().references(() => users.id),
  verbsReviewed: integer("verbs_reviewed").default(0).notNull(),
  verbsMastered: integer("verbs_mastered").default(0).notNull(),
  bestScoreClass9: integer("best_score_class9").default(0).notNull(),
  bestScoreClass10: integer("best_score_class10").default(0).notNull(),
  bestScoreAll: integer("best_score_all").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastStudyDate: text("last_study_date"),
  testHistory: jsonb("test_history").default('[]').notNull(),
  studyDates: jsonb("study_dates").default('[]').notNull(),
  flashcardProgress: jsonb("flashcard_progress").default('{}').notNull(),
});
