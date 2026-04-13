export interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subjects: Subject[];
}

export interface User {
  email: string;
  name: string;
  avatar?: string;
  college?: string;
  semester?: string;
}

export interface AttendanceGoal {
  subjectId: string;
  targetPercentage: number;
}

const STORAGE_KEYS = {
  user: "attendance_user",
  records: "attendance_records",
  subjects: "attendance_subjects",
  goals: "attendance_goals",
};

export function getUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.user);
  return data ? JSON.parse(data) : null;
}

export function loginUser(email: string, name: string): User {
  const user = { email, name };
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function getSubjects(): Subject[] {
  const data = localStorage.getItem(STORAGE_KEYS.subjects);
  return data ? JSON.parse(data) : [];
}

export function saveSubjects(subjects: Subject[]) {
  localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
}

export function getRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.records);
  return data ? JSON.parse(data) : [];
}

export function addRecord(record: AttendanceRecord) {
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

export function getPercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

export function getStatus(percentage: number): { label: string; color: "success" | "warning" | "destructive" } {
  if (percentage >= 85) return { label: "Excellent", color: "success" };
  if (percentage >= 75) return { label: "Good", color: "warning" };
  return { label: "Low", color: "destructive" };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
