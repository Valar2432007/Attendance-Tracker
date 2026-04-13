import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getEnrolledSubjects,
  getPercentage,
  getStatus,
  getSubjects,
  getUser,
  markAbsent,
  markPresent,
  type Subject,
} from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Slash, BookOpen, RefreshCcw } from "lucide-react";
import { AttendanceCodeEntry } from "@/components/AttendanceCodeEntry";

const badgeVariantMap = {
  success: "default" as const,
  warning: "secondary" as const,
  destructive: "destructive" as const,
};

const AttendancePage = () => {
  const user = getUser();
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    user?.role === "student" ? getEnrolledSubjects(user) : getSubjects()
  );
  const { toast } = useToast();

  const attendanceSummary = useMemo(() => {
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
    const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
    const percentage = getPercentage(totalAttended, totalClasses);

    return {
      totalAttended,
      totalClasses,
      percentage,
      status: getStatus(percentage),
    };
  }, [subjects]);

  const refresh = () => {
    const currentUser = getUser();
    setSubjects(currentUser?.role === "student" ? getEnrolledSubjects(currentUser) : getSubjects());
  };

  const handlePresent = (subjectId: string) => {
    const updated = markPresent(subjectId);
    setSubjects(updated);
    toast({ title: "Marked present", description: "Attendance has been updated." });
  };

  const handleAbsent = (subjectId: string) => {
    const updated = markAbsent(subjectId);
    setSubjects(updated);
    toast({ title: "Marked absent", description: "Attendance has been updated." });
  };

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-blue-700">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === "student"
              ? "Mark attendance with your class code and track your percentage."
              : "Monitor attendance across your subjects."}
          </p>
        </div>
        <Card className="shadow-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">
              {user?.role === "student"
                ? "No subjects enrolled yet. Ask your staff to enroll you first."
                : "No subjects available yet."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-blue-700">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.role === "student"
            ? "Students can only mark attendance with the code shared by staff."
            : "Staff can update attendance and review subject totals."}
        </p>
      </div>

      {user?.role === "student" && <AttendanceCodeEntry onAttendanceMarked={refresh} />}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-3xl border border-border/80 p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-semibold">{attendanceSummary.totalAttended}</p>
              </div>
              <div className="rounded-3xl border border-border/80 p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-semibold">{attendanceSummary.totalClasses}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/80 p-4 bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Percentage</p>
                  <p className="text-3xl font-semibold">{attendanceSummary.percentage}%</p>
                </div>
                <Badge variant={badgeVariantMap[attendanceSummary.status.color]}>
                  {attendanceSummary.status.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              {user?.role === "student"
                ? "Use the attendance code from your staff member to mark yourself present."
                : "Refresh or update subject attendance from here."}
            </CardDescription>
            <Button variant="outline" className="w-full h-11" onClick={refresh}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => {
          const pct = getPercentage(subject.attendedClasses, subject.totalClasses);
          const status = getStatus(pct);

          return (
            <Card key={subject.id} className="shadow-sm border-border/50" style={{ animationDelay: `${index * 40}ms` }}>
              <CardContent className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4 items-center p-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold">{subject.name || "Unnamed Subject"}</span>
                    {subject.period && <Badge variant="secondary">Period {subject.period}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subject.attendedClasses}/{subject.totalClasses} classes present • {pct}%
                  </p>
                  <Badge variant={badgeVariantMap[status.color]} className="mt-2">
                    {status.label}
                  </Badge>
                </div>

                {user?.role === "staff" && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button size="sm" className="h-11" onClick={() => handlePresent(subject.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Present
                    </Button>
                    <Button size="sm" variant="outline" className="h-11" onClick={() => handleAbsent(subject.id)}>
                      <Slash className="w-4 h-4 mr-2" /> Mark Absent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AttendancePage;
