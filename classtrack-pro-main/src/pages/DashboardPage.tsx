import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BarChart3, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { getSubjects, getRecords, getPercentage, getStatus } from "@/lib/attendance";
import StatCard from "@/components/StatCard";
import AttendanceForm from "@/components/AttendanceForm";
import AttendanceResults from "@/components/AttendanceResults";
import AttendanceHistory from "@/components/AttendanceHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const subjects = getSubjects();
  const records = getRecords();
  const totalAttended = subjects.reduce((s, sub) => s + sub.attendedClasses, 0);
  const totalClasses = subjects.reduce((s, sub) => s + sub.totalClasses, 0);
  const overallPct = getPercentage(totalAttended, totalClasses);
  const status = getStatus(overallPct);
  const lowSubjects = subjects.filter(
    (s) => s.name.trim() && getPercentage(s.attendedClasses, s.totalClasses) < 75
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        <StatCard title="Total Classes" value={totalClasses} icon={BookOpen} />
        <StatCard title="Attended" value={totalAttended} icon={BarChart3} variant="success" />
        <StatCard
          title="Attendance"
          value={totalClasses > 0 ? `${overallPct}%` : "—"}
          icon={TrendingUp}
          variant={totalClasses > 0 ? (status.color as "success" | "warning" | "destructive") : "default"}
        />
        <StatCard
          title="Low Subjects"
          value={lowSubjects.length}
          icon={AlertTriangle}
          variant={lowSubjects.length > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Quick Alert */}
      {lowSubjects.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 animate-fade-up">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-destructive text-sm">Attention Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lowSubjects.map((s) => s.name).join(", ")} — below 75%. Take action to improve.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="tracker" className="animate-fade-up stagger-2">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="tracker" className="mt-4">
          <AttendanceForm subjects={subjects} onUpdate={refresh} />
        </TabsContent>
        <TabsContent value="results" className="mt-4">
          <AttendanceResults subjects={subjects} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <AttendanceHistory records={records} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
