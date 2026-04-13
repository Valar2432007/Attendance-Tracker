import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BookOpen, Edit2, Check, X, Users } from "lucide-react";
import {
  createSubject,
  getEnrolledStudents,
  getEnrolledSubjects,
  getPercentage,
  getStaffForSubject,
  getStatus,
  getSubjects,
  getUser,
  saveSubjects,
  type Subject,
} from "@/lib/attendance";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceCodeGenerator } from "@/components/AttendanceCodeGenerator";

const badgeVariantMap = {
  success: "default" as const,
  warning: "secondary" as const,
  destructive: "destructive" as const,
};

const SubjectsPage = () => {
  const user = getUser();
  const isStaff = user?.role === "staff";
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newPeriod, setNewPeriod] = useState("");

  const refreshSubjects = () => setSubjects(getSubjects());
  const mySubjects = user ? getEnrolledSubjects(user) : [];

  const addSubject = () => {
    if (!user) return;
    const subject = createSubject("New Subject", user.email, "");
    setSubjects(getSubjects());
    setEditingId(subject.id);
    setNewName(subject.name);
    setNewPeriod(subject.period || "");
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setNewName(subject.name);
    setNewPeriod(subject.period || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewName("");
    setNewPeriod("");
  };

  const confirmEdit = (id: string) => {
    if (!user) return;

    const updated = subjects.map((subject) =>
      subject.id === id
        ? {
            ...subject,
            name: newName.trim() || subject.name,
            period: newPeriod.trim(),
            staffId: user.email,
          }
        : subject
    );

    saveSubjects(updated);
    setSubjects(updated);
    cancelEdit();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-blue-700">My Subjects</h1>
          <p className="text-blue-600 text-sm mt-1">
            {isStaff
              ? "Manage your assigned subjects and monitor enrolled students."
              : "See all of your enrolled subjects and your attendance percentage for each one."}
          </p>
        </div>
        {isStaff && (
          <Button onClick={addSubject} className="transition-transform active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        )}
      </div>

      {isStaff ? (
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subjects">My Subjects</TabsTrigger>
            <TabsTrigger value="codes">Generate Codes</TabsTrigger>
            <TabsTrigger value="attendance">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            {subjects.filter((subject) => subject.staffId === user.email).length === 0 ? (
              <Card className="shadow-md border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No subjects assigned yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {subjects
                  .filter((subject) => subject.staffId === user.email)
                  .map((subject, index) => {
                    const enrolledStudents = getEnrolledStudents(subject.id);
                    const isEditing = editingId === subject.id;

                    return (
                      <Card
                        key={subject.id}
                        className="shadow-sm border-border/50 animate-scale-in"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 flex flex-col gap-3">
                              {isEditing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Subject name" />
                                  <Input value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} placeholder="Period" />
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div>
                                    <span className="font-medium text-base">{subject.name || "Untitled Subject"}</span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Period {subject.period || "TBD"} • {enrolledStudents.length} enrolled students
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{enrolledStudents.length} students</Badge>
                                    <Badge variant="outline">{subject.totalClasses} classes</Badge>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-end justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => confirmEdit(subject.id)}>
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={cancelEdit}>
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => startEdit(subject)}>
                                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <AttendanceCodeGenerator onCodeGenerated={refreshSubjects} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            {subjects.filter((subject) => subject.staffId === user.email).length === 0 ? (
              <Card className="shadow-md border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">Create or assign a subject first to see enrolled students.</p>
                </CardContent>
              </Card>
            ) : (
              subjects
                .filter((subject) => subject.staffId === user.email)
                .map((subject) => {
                  const enrolledStudents = getEnrolledStudents(subject.id);
                  const pct = getPercentage(subject.attendedClasses, subject.totalClasses);
                  const status = getStatus(pct);

                  return (
                    <Card key={subject.id} className="shadow-sm border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            <CardDescription>Period {subject.period || "TBD"}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badgeVariantMap[status.color]}>{pct}% attendance</Badge>
                            <Badge variant="outline">{enrolledStudents.length} students</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {enrolledStudents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No students enrolled in this subject yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {enrolledStudents.map((student) => (
                              <div key={student.email} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <div>
                                  <div className="font-medium text-sm">{student.name}</div>
                                  <div className="text-xs text-muted-foreground">{student.email}</div>
                                </div>
                                <Badge variant="secondary">Enrolled</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </TabsContent>
        </Tabs>
      ) : mySubjects.length === 0 ? (
        <Card className="shadow-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No subjects enrolled yet. Ask your staff to enroll you.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{mySubjects.length}</div>
                <div className="text-sm text-muted-foreground">Enrolled Subjects</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    mySubjects.reduce((sum, subject) => sum + getPercentage(subject.attendedClasses, subject.totalClasses), 0) /
                      mySubjects.length
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Average Attendance</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {mySubjects.reduce((sum, subject) => sum + subject.totalClasses, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Classes</div>
              </CardContent>
            </Card>
          </div>

          {mySubjects.map((subject, index) => {
            const pct = getPercentage(subject.attendedClasses, subject.totalClasses);
            const status = getStatus(pct);
            const staff = getStaffForSubject(subject.id);

            return (
              <Card
                key={subject.id}
                className="shadow-sm border-border/50 animate-scale-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h2 className="font-semibold text-lg">{subject.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            Period {subject.period || "TBD"}
                            {staff ? ` • Staff: ${staff.name}` : ""}
                          </p>
                        </div>
                        <Badge variant={badgeVariantMap[status.color]}>{status.label}</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{subject.attendedClasses}</div>
                          <div className="text-xs text-muted-foreground">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-600">{subject.totalClasses}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{pct}%</div>
                          <div className="text-xs text-muted-foreground">Percentage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">{subject.totalClasses - subject.attendedClasses}</div>
                          <div className="text-xs text-muted-foreground">Absent</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
