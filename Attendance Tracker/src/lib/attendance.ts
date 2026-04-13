export type UserRole = "student" | "staff";

export interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  period?: string;
  staffId?: string; // ID of the staff member allocated to this subject
  materials?: string[]; // Array of uploaded material file names/URLs
}

export interface AttendanceCode {
  id: string;
  code: string; // 5-digit code
  subjectId: string;
  sessionId: string; // Unique session identifier
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (5-10 minutes later)
  staffId: string; // Who generated the code
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subjects: Subject[];
  codeId?: string; // Reference to the attendance code used
  sessionId?: string; // Session this record belongs to
}

export interface Enrollment {
  id: string;
  studentId: string; // Student email
  subjectId: string;
  enrolledAt: string; // ISO timestamp
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location?: string;
  subjectId?: string; // Optional - if event is for a specific subject
  staffId: string; // Who created the event
  createdAt: string; // ISO timestamp
  type: 'class' | 'exam' | 'meeting' | 'holiday' | 'other';
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  college?: string;
  semester?: string;
  enrolledSubjects?: string[]; // Array of subject IDs
  department?: string;
  officeHours?: string;
  bio?: string;
  staffFeatures?: string[];
}

export interface AttendanceGoal {
  subjectId: string;
  targetPercentage: number;
}

const STORAGE_KEYS = {
  user: "attendance_user",
  users: "attendance_users",
  records: "attendance_records",
  subjects: "attendance_subjects",
  goals: "attendance_goals",
  attendanceCodes: "attendance_codes",
  enrollments: "attendance_enrollments",
  events: "attendance_events",
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.user);
  if (!data) return null;
  const user = JSON.parse(data) as User;
  return { ...user, role: user.role ?? "student" };
}

export function saveCurrentUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.users);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function registerUser(email: string, name: string, role: UserRole): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail);
  if (exists) return null;

  const newUser: User = {
    email: normalizedEmail,
    name: name.trim(),
    role,
    avatar: "",
    college: "",
    semester: "",
  };

  users.unshift(newUser);
  saveUsers(users);
  saveCurrentUser(newUser);
  return newUser;
}

export function loginUser(email: string, name: string): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const existing = users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (!existing) return null;

  const updatedUser = { ...existing, name: name.trim(), role: existing.role ?? "student" };
  saveCurrentUser(updatedUser);

  const updatedUsers = users.map((user) =>
    user.email.toLowerCase() === normalizedEmail ? updatedUser : user
  );
  saveUsers(updatedUsers);

  return updatedUser;
}

export function saveProfile(profile: User) {
  const users = getUsers();
  const normalizedEmail = profile.email.trim().toLowerCase();
  const updatedUsers = users.some((user) => user.email.toLowerCase() === normalizedEmail)
    ? users.map((user) => (user.email.toLowerCase() === normalizedEmail ? profile : user))
    : [profile, ...users];

  saveUsers(updatedUsers);
  saveCurrentUser(profile);
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

export function markPresent(subjectId: string) {
  const subjects = getSubjects();
  const updated = subjects.map((subject) =>
    subject.id === subjectId
      ? {
          ...subject,
          totalClasses: subject.totalClasses + 1,
          attendedClasses: subject.attendedClasses + 1,
        }
      : subject
  );
  saveSubjects(updated);
  addRecord({ id: generateId(), date: new Date().toISOString(), subjects: updated });
  return updated;
}

export function markAbsent(subjectId: string) {
  const subjects = getSubjects();
  const updated = subjects.map((subject) =>
    subject.id === subjectId
      ? {
          ...subject,
          totalClasses: subject.totalClasses + 1,
        }
      : subject
  );
  saveSubjects(updated);
  addRecord({ id: generateId(), date: new Date().toISOString(), subjects: updated });
  return updated;
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

export function getEnrolledSubjects(user: User): Subject[] {
  const allSubjects = getSubjects();
  const enrolledIds = user.enrolledSubjects || [];
  return allSubjects.filter(subject => enrolledIds.includes(subject.id));
}

export function enrollInSubject(user: User, subjectId: string): User {
  const success = enrollStudentInSubject(user.email, subjectId);
  if (success) {
    const enrolledSubjects = user.enrolledSubjects || [];
    return { ...user, enrolledSubjects: [...enrolledSubjects, subjectId] };
  }
  return user;
}

export function unenrollFromSubject(user: User, subjectId: string): User {
  const success = unenrollStudentFromSubject(user.email, subjectId);
  if (success) {
    const enrolledSubjects = user.enrolledSubjects || [];
    return { ...user, enrolledSubjects: enrolledSubjects.filter(id => id !== subjectId) };
  }
  return user;
}

export function getAvailableSubjects(user: User): Subject[] {
  const allSubjects = getSubjects();
  const enrolledIds = user.enrolledSubjects || [];
  return allSubjects.filter(subject => !enrolledIds.includes(subject.id));
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(user => user.email === id) || null;
}

export function getStaffForSubject(subjectId: string): User | null {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject?.staffId) return null;
  return getUserById(subject.staffId);
}

// Attendance Code Management
export function generateAttendanceCode(subjectId: string, staffId: string): AttendanceCode {
  // Generate a unique 5-digit code
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  // Create session ID
  const sessionId = generateId();

  // Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const attendanceCode: AttendanceCode = {
    id: generateId(),
    code,
    subjectId,
    sessionId,
    createdAt: new Date().toISOString(),
    expiresAt,
    staffId,
  };

  const codes = getAttendanceCodes();
  codes.push(attendanceCode);
  saveAttendanceCodes(codes);

  return attendanceCode;
}

export function getAttendanceCodes(): AttendanceCode[] {
  const data = localStorage.getItem(STORAGE_KEYS.attendanceCodes);
  return data ? JSON.parse(data) : [];
}

export function saveAttendanceCodes(codes: AttendanceCode[]) {
  localStorage.setItem(STORAGE_KEYS.attendanceCodes, JSON.stringify(codes));
}

export function getActiveCodes(): AttendanceCode[] {
  const codes = getAttendanceCodes();
  const now = new Date();
  return codes.filter(code => new Date(code.expiresAt) > now);
}

export function validateAttendanceCode(code: string, studentId: string): { valid: boolean; subjectId?: string; sessionId?: string; error?: string } {
  const codes = getActiveCodes();
  const attendanceCode = codes.find(c => c.code === code);

  if (!attendanceCode) {
    return { valid: false, error: "Invalid code" };
  }

  // Check if student is enrolled in the subject
  const enrollments = getEnrollments();
  const isEnrolled = enrollments.some(e => e.studentId === studentId && e.subjectId === attendanceCode.subjectId);

  if (!isEnrolled) {
    return { valid: false, error: "Not enrolled in this subject" };
  }

  // Check if student already marked attendance for this session
  const records = getRecords();
  const alreadyMarked = records.some(r =>
    r.sessionId === attendanceCode.sessionId &&
    r.subjects.some(s => s.id === attendanceCode.subjectId)
  );

  if (alreadyMarked) {
    return { valid: false, error: "Already marked attendance for this session" };
  }

  return {
    valid: true,
    subjectId: attendanceCode.subjectId,
    sessionId: attendanceCode.sessionId
  };
}

export function markAttendanceWithCode(code: string, studentId: string): { success: boolean; error?: string; subject?: Subject } {
  const validation = validateAttendanceCode(code, studentId);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const subjectId = validation.subjectId!;
  const sessionId = validation.sessionId!;

  // Mark attendance
  const subjects = getSubjects();
  const updatedSubjects = subjects.map(subject =>
    subject.id === subjectId
      ? {
          ...subject,
          totalClasses: subject.totalClasses + 1,
          attendedClasses: subject.attendedClasses + 1,
        }
      : subject
  );

  saveSubjects(updatedSubjects);
  const updatedSubject = updatedSubjects.find(s => s.id === subjectId)!;

  // Create attendance record with session info
  const record: AttendanceRecord = {
    id: generateId(),
    date: new Date().toISOString(),
    subjects: [updatedSubject],
    codeId: code,
    sessionId: sessionId,
  };

  addRecord(record);

  return { success: true, subject: updatedSubject };
}

// Enrollment Management
export function getEnrollments(): Enrollment[] {
  const data = localStorage.getItem(STORAGE_KEYS.enrollments);
  return data ? JSON.parse(data) : [];
}

export function saveEnrollments(enrollments: Enrollment[]) {
  localStorage.setItem(STORAGE_KEYS.enrollments, JSON.stringify(enrollments));
}

export function enrollStudentInSubject(studentId: string, subjectId: string): boolean {
  const enrollments = getEnrollments();

  // Check if already enrolled
  const existing = enrollments.find(e => e.studentId === studentId && e.subjectId === subjectId);
  if (existing) {
    return false; // Already enrolled
  }

  const enrollment: Enrollment = {
    id: generateId(),
    studentId,
    subjectId,
    enrolledAt: new Date().toISOString(),
  };

  enrollments.push(enrollment);
  saveEnrollments(enrollments);

  // Also update user's enrolledSubjects array for backward compatibility
  const user = getUserById(studentId);
  if (user) {
    const enrolledSubjects = user.enrolledSubjects || [];
    if (!enrolledSubjects.includes(subjectId)) {
      const updatedUser = { ...user, enrolledSubjects: [...enrolledSubjects, subjectId] };
      saveProfile(updatedUser);
    }
  }

  return true;
}

export function unenrollStudentFromSubject(studentId: string, subjectId: string): boolean {
  const enrollments = getEnrollments();
  const filtered = enrollments.filter(e => !(e.studentId === studentId && e.subjectId === subjectId));

  if (filtered.length === enrollments.length) {
    return false; // Wasn't enrolled
  }

  saveEnrollments(filtered);

  // Also update user's enrolledSubjects array for backward compatibility
  const user = getUserById(studentId);
  if (user) {
    const enrolledSubjects = user.enrolledSubjects || [];
    const updatedUser = { ...user, enrolledSubjects: enrolledSubjects.filter(id => id !== subjectId) };
    saveProfile(updatedUser);
  }

  return true;
}

export function getEnrolledStudents(subjectId: string): User[] {
  const enrollments = getEnrollments();
  const enrolledStudentIds = enrollments
    .filter(e => e.subjectId === subjectId)
    .map(e => e.studentId);

  const allUsers = getUsers();
  return allUsers.filter(user => enrolledStudentIds.includes(user.email));
}

// Subject Management for Staff
export function createSubject(name: string, staffId: string, period?: string): Subject {
  const subject: Subject = {
    id: generateId(),
    name,
    totalClasses: 0,
    attendedClasses: 0,
    period,
    staffId,
    materials: [],
  };

  const subjects = getSubjects();
  subjects.push(subject);
  saveSubjects(subjects);

  return subject;
}

export function deleteSubject(subjectId: string): boolean {
  const subjects = getSubjects();
  const filtered = subjects.filter(s => s.id !== subjectId);

  if (filtered.length === subjects.length) {
    return false; // Subject not found
  }

  saveSubjects(filtered);

  // Remove related enrollments
  const enrollments = getEnrollments();
  const filteredEnrollments = enrollments.filter(e => e.subjectId !== subjectId);
  saveEnrollments(filteredEnrollments);

  // Remove related attendance codes
  const codes = getAttendanceCodes();
  const filteredCodes = codes.filter(c => c.subjectId !== subjectId);
  saveAttendanceCodes(filteredCodes);

  // Remove from users' enrolled subjects
  const users = getUsers();
  const updatedUsers = users.map(user => ({
    ...user,
    enrolledSubjects: (user.enrolledSubjects || []).filter(id => id !== subjectId)
  }));
  saveUsers(updatedUsers);

  return true;
}

export function addSubjectMaterial(subjectId: string, material: string): boolean {
  const subjects = getSubjects();
  const updated = subjects.map(subject =>
    subject.id === subjectId
      ? { ...subject, materials: [...(subject.materials || []), material] }
      : subject
  );

  if (updated.some(s => s.id === subjectId && s.materials?.includes(material))) {
    saveSubjects(updated);
    return true;
  }

  return false;
}

export function removeSubjectMaterial(subjectId: string, material: string): boolean {
  const subjects = getSubjects();
  const updated = subjects.map(subject =>
    subject.id === subjectId
      ? { ...subject, materials: (subject.materials || []).filter(m => m !== material) }
      : subject
  );

  saveSubjects(updated);
  return true;
}

// Cleanup expired codes (call this periodically)
export function cleanupExpiredCodes(): number {
  const codes = getAttendanceCodes();
  const now = new Date();
  const activeCodes = codes.filter(code => new Date(code.expiresAt) > now);

  const expiredCount = codes.length - activeCodes.length;
  if (expiredCount > 0) {
    saveAttendanceCodes(activeCodes);
  }

  return expiredCount;
}

// Event Management
export function getEvents(): Event[] {
  const data = localStorage.getItem(STORAGE_KEYS.events);
  return data ? JSON.parse(data) : [];
}

export function saveEvents(events: Event[]) {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

export function createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Event {
  const event: Event = {
    ...eventData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const events = getEvents();
  events.push(event);
  saveEvents(events);

  return event;
}

export function updateEvent(eventId: string, updates: Partial<Event>): Event | null {
  const events = getEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);

  if (eventIndex === -1) return null;

  events[eventIndex] = { ...events[eventIndex], ...updates };
  saveEvents(events);

  return events[eventIndex];
}

export function deleteEvent(eventId: string): boolean {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== eventId);

  if (filtered.length === events.length) return false;

  saveEvents(filtered);
  return true;
}

export function getEventsForDate(date: string): Event[] {
  const events = getEvents();
  return events.filter(event => event.date === date);
}

export function getEventsForUser(user: User): Event[] {
  const allEvents = getEvents();

  if (user.role === 'staff') {
    // Staff can see all events they created
    return allEvents.filter(event => event.staffId === user.email);
  } else {
    // Students can see events for subjects they're enrolled in, plus general events
    const enrolledSubjectIds = user.enrolledSubjects || [];
    return allEvents.filter(event =>
      !event.subjectId || // General events (no subject specified)
      enrolledSubjectIds.includes(event.subjectId) // Events for enrolled subjects
    );
  }
}

export function getUpcomingEvents(user: User, limit: number = 10): Event[] {
  const userEvents = getEventsForUser(user);
  const now = new Date();

  return userEvents
    .filter(event => {
      const eventDateTime = new Date(`${event.date}T${event.startTime}`);
      return eventDateTime >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, limit);
}
