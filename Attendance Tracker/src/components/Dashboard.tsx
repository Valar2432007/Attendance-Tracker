import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogOut, BookOpen, BarChart3, Clock } from "lucide-react";
import { getSubjects, getRecords, getPercentage, getStatus, logoutUser, type Subject } from "@/lib/attendance";
import StatCard from "./StatCard";
import AttendanceForm from "./AttendanceForm";
import AttendanceResults from "./AttendanceResults";
import AttendanceHistory from "./AttendanceHistory";

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

const Dashboard = ({ userName, onLogout }: DashboardProps) => {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const subjects = getSubjects();
  const records = getRecords();
  const totalAttended = subjects.reduce((s, sub) => s + sub.attendedClasses, 0);
  const totalClasses = subjects.reduce((s, sub) => s + sub.totalClasses, 0);
  const overallPct = getPercentage(totalAttended, totalClasses);
  const status = getStatus(overallPct);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-heading font-bold text-lg text-blue-800">AttendTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-blue-700 hidden sm:inline">Hi, {userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-blue-600 hover:bg-blue-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-6 max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
          <StatCard title="Total Classes" value={totalClasses} icon={BookOpen} />
          <StatCard title="Attended" value={totalAttended} icon={BarChart3} variant="success" />
          <StatCard title="Attendance" value={totalClasses > 0 ? `${overallPct}%` : "—"} icon={Clock} variant={totalClasses > 0 ? status.color as "success" | "warning" | "destructive" : "default"} />
        </div>

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
      </main>
    </div>
  );
};

export default Dashboard;
