import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjects, getRecords, getPercentage, getStatus } from "@/lib/attendance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";

const COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(145, 60%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
  "hsl(165, 60%, 40%)",
  "hsl(280, 60%, 55%)",
  "hsl(200, 80%, 50%)",
];

const AnalyticsPage = () => {
  const subjects = getSubjects().filter((s) => s.name.trim());
  const records = getRecords();

  // Bar chart data
  const barData = subjects.map((s) => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
    attendance: getPercentage(s.attendedClasses, s.totalClasses),
    total: s.totalClasses,
    attended: s.attendedClasses,
  }));

  // Pie chart data
  const totalAttended = subjects.reduce((s, sub) => s + sub.attendedClasses, 0);
  const totalMissed = subjects.reduce((s, sub) => s + (sub.totalClasses - sub.attendedClasses), 0);
  const pieData = [
    { name: "Attended", value: totalAttended },
    { name: "Missed", value: totalMissed },
  ];

  // Trend data from records
  const trendData = records
    .slice(0, 15)
    .reverse()
    .map((r) => {
      const a = r.subjects.reduce((s, sub) => s + sub.attendedClasses, 0);
      const t = r.subjects.reduce((s, sub) => s + sub.totalClasses, 0);
      return {
        date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        percentage: getPercentage(a, t),
      };
    });

  const overallPct = getPercentage(totalAttended, totalAttended + totalMissed);
  const status = getStatus(overallPct);

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Visualize your attendance data</p>
        </div>
        <Card className="shadow-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No data yet. Add subjects and track attendance first!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualize your attendance trends and statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
        {/* Bar Chart */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Subject-wise Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                  {barData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" /> Overall Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill="hsl(145, 60%, 42%)" />
                  <Cell fill="hsl(0, 72%, 55%)" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {trendData.length > 1 && (
        <Card className="shadow-md border-border/50 animate-fade-up stagger-2">
          <CardHeader>
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line type="monotone" dataKey="percentage" stroke="hsl(220, 70%, 50%)" strokeWidth={2} dot={{ fill: "hsl(220, 70%, 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Subject Summary Table */}
      <Card className="shadow-md border-border/50 animate-fade-up stagger-3">
        <CardHeader>
          <CardTitle className="font-heading text-base">Detailed Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Subject</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Total</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Attended</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Missed</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">%</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => {
                  const pct = getPercentage(s.attendedClasses, s.totalClasses);
                  const st = getStatus(pct);
                  return (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-2 px-3 font-medium text-foreground">{s.name}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{s.totalClasses}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{s.attendedClasses}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{s.totalClasses - s.attendedClasses}</td>
                      <td className="py-2 px-3 text-center font-semibold">{pct}%</td>
                      <td className={`py-2 px-3 text-center font-medium ${st.color === "success" ? "text-success" : st.color === "warning" ? "text-warning" : "text-destructive"}`}>
                        {st.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
