import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, BarChart3, TrendingUp, AlertTriangle, Users, User } from "lucide-react";
import {
  getEnrolledStudents,
  getEnrolledSubjects,
  getPercentage,
  getStaffForSubject,
  getSubjects,
  getUser,
  getUsers,
  type Subject,
  type User as AttendanceUser,
} from "@/lib/attendance";
import StatCard from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttendanceCodeGenerator } from "@/components/AttendanceCodeGenerator";

const getSafeName = (name?: string | null) => {
  const value = name?.trim();
  return value && value.length > 0 ? value : "Unknown";
};

const getSafeSubjects = (user: AttendanceUser | null, isStaff: boolean): Subject[] => {
  try {
    const source = isStaff ? getSubjects() : user ? getEnrolledSubjects(user) : [];
    return Array.isArray(source) ? source : [];
  } catch {
    return [];
  }
};

const getSafeUsers = (): AttendanceUser[] => {
  try {
    const users = getUsers();
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const DashboardPage = () => {
  const user = getUser();
  const isStaff = user?.role === "staff";
  const subjects = getSafeSubjects(user, isStaff);
  const allSubjects = (() => {
    try {
      const data = getSubjects();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  })();
  const allUsers = getSafeUsers();

  const totalStudents = allUsers.filter((entry) => entry?.role === "student").length;
  const enrolledStudents = allUsers.filter(
    (entry) => entry?.role === "student" && Array.isArray(entry.enrolledSubjects) && entry.enrolledSubjects.length > 0
  ).length;
  const totalStaff = allUsers.filter((entry) => entry?.role === "staff").length;

  const totalClasses = subjects.reduce((sum, subject) => sum + (subject.totalClasses || 0), 0);
  const totalAttended = subjects.reduce((sum, subject) => sum + (subject.attendedClasses || 0), 0);
  const attendancePct = getPercentage(totalAttended, totalClasses);
  const lowSubjectCount = subjects.filter(
    (subject) => getPercentage(subject.attendedClasses || 0, subject.totalClasses || 0) < 75
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          {isStaff ? "Staff Dashboard" : "Student Dashboard"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isStaff
            ? "Monitor students, subject allocations, and attendance activity."
            : "See your subjects, attendance percentage, and class progress in one place."}
        </p>
      </div>

      {isStaff ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
          <StatCard title="Total Students" value={totalStudents} icon={Users} />
          <StatCard title="Enrolled Students" value={enrolledStudents} icon={User} variant="success" />
          <StatCard title="Total Staff" value={totalStaff} icon={BookOpen} />
          <StatCard title="Total Subjects" value={allSubjects.length} icon={BarChart3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
          <StatCard title="My Subjects" value={subjects.length} icon={BookOpen} />
          <StatCard title="Present" value={totalAttended} icon={BarChart3} variant="success" />
          <StatCard title="Attendance" value={`${attendancePct}%`} icon={TrendingUp} />
          <StatCard title="Low Subjects" value={lowSubjectCount} icon={AlertTriangle} />
        </div>
      )}

      <Tabs defaultValue={isStaff ? "students" : "subjects"} className="animate-fade-up stagger-2">
        <TabsList className={`w-full grid ${isStaff ? "grid-cols-4" : "grid-cols-2"}`}>
          {isStaff ? (
            <>
              <TabsTrigger value="students">Student Details</TabsTrigger>
              <TabsTrigger value="subjects">Subject Overview</TabsTrigger>
              <TabsTrigger value="codes">Attendance Codes</TabsTrigger>
              <TabsTrigger value="staff">Staff Management</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="subjects">My Subjects</TabsTrigger>
              <TabsTrigger value="staff">Staff & Subjects</TabsTrigger>
            </>
          )}
        </TabsList>

        {isStaff ? (
          <>
            <TabsContent value="students" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Student Details
                  </CardTitle>
                  <CardDescription>View all students and their enrollment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Enrolled Subjects</TableHead>
                          <TableHead>Total Classes</TableHead>
                          <TableHead>Attended</TableHead>
                          <TableHead>Attendance %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers
                          .filter((entry) => entry?.role === "student")
                          .map((student) => {
                            const enrolledSubs = Array.isArray(student.enrolledSubjects) ? student.enrolledSubjects : [];
                            const studentSubjects = allSubjects.filter((subject) => enrolledSubs.includes(subject.id));
                            const studentTotalClasses = studentSubjects.reduce((sum, subject) => sum + (subject.totalClasses || 0), 0);
                            const studentAttended = studentSubjects.reduce((sum, subject) => sum + (subject.attendedClasses || 0), 0);
                            const studentPct = getPercentage(studentAttended, studentTotalClasses);

                            return (
                              <TableRow key={student.email}>
                                <TableCell className="font-medium">{getSafeName(student.name)}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{enrolledSubs.length}</TableCell>
                                <TableCell>{studentTotalClasses}</TableCell>
                                <TableCell>{studentAttended}</TableCell>
                                <TableCell>
                                  <Badge variant={studentPct >= 75 ? "default" : studentPct >= 60 ? "secondary" : "destructive"}>
                                    {studentPct}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Subject Overview
                  </CardTitle>
                  <CardDescription>View all subjects and their allocation details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Staff</TableHead>
                          <TableHead>Enrolled Students</TableHead>
                          <TableHead>Total Classes</TableHead>
                          <TableHead>Attendance Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSubjects.map((subject) => {
                          const staff = getStaffForSubject(subject.id);
                          const subjectStudents = getEnrolledStudents(subject.id);
                          const subjectPct = getPercentage(subject.attendedClasses || 0, subject.totalClasses || 0);

                          return (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.name || "Untitled Subject"}</TableCell>
                              <TableCell>{subject.period || "TBD"}</TableCell>
                              <TableCell>{staff ? getSafeName(staff.name) : "Not Assigned"}</TableCell>
                              <TableCell>{subjectStudents.length}</TableCell>
                              <TableCell>{subject.totalClasses || 0}</TableCell>
                              <TableCell>
                                <Badge variant={subjectPct >= 75 ? "default" : subjectPct >= 60 ? "secondary" : "destructive"}>
                                  {subjectPct}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="codes" className="mt-4">
              <AttendanceCodeGenerator />
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Staff Management
                  </CardTitle>
                  <CardDescription>View all staff members and their subject allocations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Allocated Subjects</TableHead>
                          <TableHead>Total Students</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers
                          .filter((entry) => entry?.role === "staff")
                          .map((staff) => {
                            const allocatedSubjects = allSubjects.filter((subject) => subject.staffId === staff.email);
                            const staffStudents = allocatedSubjects.reduce(
                              (sum, subject) => sum + getEnrolledStudents(subject.id).length,
                              0
                            );

                            return (
                              <TableRow key={staff.email}>
                                <TableCell className="font-medium">{getSafeName(staff.name)}</TableCell>
                                <TableCell>{staff.email}</TableCell>
                                <TableCell>{allocatedSubjects.length}</TableCell>
                                <TableCell>{staffStudents}</TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="subjects" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    My Subjects
                  </CardTitle>
                  <CardDescription>Your enrolled subjects and attendance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjects.length > 0 ? (
                      subjects.map((subject) => {
                        const percentage = getPercentage(subject.attendedClasses || 0, subject.totalClasses || 0);

                        return (
                          <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{subject.name || "Untitled Subject"}</div>
                              <div className="text-sm text-muted-foreground">
                                {subject.attendedClasses || 0}/{subject.totalClasses || 0} present
                              </div>
                            </div>
                            <Badge variant={percentage >= 75 ? "default" : "secondary"}>{percentage}%</Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No enrolled subjects yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Staff & Subjects
                  </CardTitle>
                  <CardDescription>View your enrolled subjects and assigned staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">My Enrolled Subjects</h4>
                      <div className="space-y-2">
                        {subjects.length ? (
                          subjects.map((subject) => {
                            const staff = getStaffForSubject(subject.id);
                            return (
                              <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{subject.name || "Untitled Subject"}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Period: {subject.period || "TBD"} | Staff: {staff ? getSafeName(staff.name) : "Not Assigned"}
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {getPercentage(subject.attendedClasses || 0, subject.totalClasses || 0)}%
                                </Badge>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No subjects enrolled yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">My Staff Members</h4>
                      <div className="space-y-2">
                        {subjects.length ? (
                          [...new Set(subjects.map((subject) => getStaffForSubject(subject.id)?.email).filter(Boolean))].map((staffEmail) => {
                            const staff = allUsers.find((entry) => entry.email === staffEmail);
                            return staff ? (
                              <div key={staff.email} className="flex items-center gap-3 p-3 border rounded-lg">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{getSafeName(staff.name).charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{getSafeName(staff.name)}</div>
                                  <div className="text-sm text-muted-foreground">{staff.email}</div>
                                </div>
                              </div>
                            ) : null;
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No staff assigned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardPage;
