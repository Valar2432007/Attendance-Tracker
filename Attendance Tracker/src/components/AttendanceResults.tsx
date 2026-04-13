import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Subject, getPercentage, getStatus } from "@/lib/attendance";

interface AttendanceResultsProps {
  subjects: Subject[];
}

const badgeVariantMap = {
  success: "default" as const,
  warning: "secondary" as const,
  destructive: "destructive" as const,
};

const AttendanceResults = ({ subjects }: AttendanceResultsProps) => {
  if (subjects.length === 0 || subjects.every((s) => !s.name.trim())) return null;

  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallPct = getPercentage(totalAttended, totalClasses);
  const overallStatus = getStatus(overallPct);
  const lowSubjects = subjects.filter((s) => s.name.trim() && getPercentage(s.attendedClasses, s.totalClasses) < 75);

  return (
    <div className="space-y-4 animate-fade-up">
      {lowSubjects.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-md">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm">Low Attendance Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lowSubjects.map((s) => s.name).join(", ")} — below 75%. Improve attendance to avoid shortage.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-md border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">Results</CardTitle>
            <Badge variant={badgeVariantMap[overallStatus.color]} className="text-xs">
              Overall: {overallPct}% — {overallStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjects.filter((s) => s.name.trim()).map((subject, i) => {
              const pct = getPercentage(subject.attendedClasses, subject.totalClasses);
              const status = getStatus(pct);
              return (
                <div key={subject.id} className="animate-slide-in-left" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {subject.attendedClasses}/{subject.totalClasses} — <span className={`font-semibold ${status.color === "success" ? "text-success" : status.color === "warning" ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${status.color === "success" ? "bg-success" : status.color === "warning" ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceResults;
