import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { AttendanceRecord, getPercentage, getStatus } from "@/lib/attendance";

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
}

const badgeVariantMap = {
  success: "default" as const,
  warning: "secondary" as const,
  destructive: "destructive" as const,
};

const AttendanceHistory = ({ records }: AttendanceHistoryProps) => {
  if (records.length === 0) {
    return (
      <Card className="shadow-md border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <History className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No history yet. Save your first attendance record!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-border/50 animate-fade-up">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <History className="w-5 h-5" /> Attendance History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.slice(0, 10).map((record, i) => {
          const totalA = record.subjects.reduce((s, sub) => s + sub.attendedClasses, 0);
          const totalC = record.subjects.reduce((s, sub) => s + sub.totalClasses, 0);
          const pct = getPercentage(totalA, totalC);
          const status = getStatus(pct);
          return (
            <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-scale-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-xs text-muted-foreground">{record.subjects.length} subjects</p>
              </div>
              <Badge variant={badgeVariantMap[status.color]}>{pct}% — {status.label}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;
