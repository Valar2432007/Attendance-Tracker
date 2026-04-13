import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "@/lib/attendance";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "./DashboardPage";
import SubjectsPage from "./SubjectsPage";
import AnalyticsPage from "./AnalyticsPage";
import ProfilePage from "./ProfilePage";
import AttendancePage from "./AttendancePage";
import EventsPage from "./EventsPage";

const Index = () => {
  const [user, setUser] = useState(getUser());

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<LoginPage mode="register" onLogin={() => setUser(getUser())} />} />
        <Route path="/login" element={<LoginPage mode="login" onLogin={() => setUser(getUser())} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout onLogout={() => setUser(null)} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default Index;
