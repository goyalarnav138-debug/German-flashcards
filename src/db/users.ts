import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read DB", e);
  }
  return { users: [], userStats: [] };
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to write DB", e);
  }
}

export async function getOrCreateUser(uid: string, email: string, name: string, role: string, section?: string) {
  const db = readDB();
  let user = db.users.find((u: any) => u.id === uid);
  
  if (user) {
    user.name = name;
    user.role = role;
    user.section = section || null;
  } else {
    user = { 
      id: uid, 
      email, 
      name, 
      role, 
      section: section || null, 
      createdAt: new Date().toISOString() 
    };
    db.users.push(user);
  }
  writeDB(db);
  return user;
}

export async function getUserStats(uid: string, email: string = "", name: string = "") {
  const db = readDB();
  
  let user = db.users.find((u: any) => u.id === uid);
  if (!user) {
    user = { 
      id: uid, 
      email: email, 
      name: name || "Student", 
      role: "student", 
      createdAt: new Date().toISOString() 
    };
    db.users.push(user);
  }

  let stats = db.userStats.find((s: any) => s.userId === uid);
  if (!stats) {
    stats = {
      userId: uid,
      verbsReviewed: 0,
      verbsMastered: 0,
      bestScoreClass9: 0,
      bestScoreClass10: 0,
      bestScoreAll: 0,
      streak: 0,
      testHistory: [],
      studyDates: [],
      flashcardProgress: {}
    };
    db.userStats.push(stats);
  }
  writeDB(db);
  return stats;
}

export async function updateUserStats(uid: string, statsData: any) {
  const db = readDB();
  let stats = db.userStats.find((s: any) => s.userId === uid);
  
  if (stats) {
    Object.assign(stats, statsData);
  } else {
    stats = { userId: uid, ...statsData };
    db.userStats.push(stats);
  }
  
  writeDB(db);
  return stats;
}

export async function getAllStudents() {
  const db = readDB();
  const studentsList = db.users.filter((u: any) => u.role === 'student');
  
  return studentsList.map((s: any) => {
    const stats = db.userStats.find((st: any) => st.userId === s.id);
    const tests = stats?.testHistory || [];
    const testsTaken = tests.length;
    let totalScore = 0;
    let totalQuestions = 0;
    
    tests.forEach((t: any) => {
      totalScore += t.score || 0;
      totalQuestions += t.total || 0;
    });
    
    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const grade = (s.section && s.section.includes("10")) ? "Class 10th" : "Class 9th";

    const nameParts = (s.name || "Student").split(" ");
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (s.name || "ST").substring(0, 2).toUpperCase();

    return {
      id: s.id,
      name: s.name,
      grade,
      section: s.section || "N/A",
      avatar: initials,
      verbsReviewed: stats?.verbsReviewed || 0,
      testsTaken,
      accuracy,
      streak: stats?.streak || 0,
      lastActive: stats?.lastStudyDate || "Never",
      frequentErrors: []
    };
  });
}

