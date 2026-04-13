import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "@/lib/attendance";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "./DashboardPage";
import SubjectsPage from "./SubjectsPage";
import AnalyticsPage from "./AnalyticsPage";
import ProfilePage from "./ProfilePage";

const Index = () => {
  const [user, setUser] = useState(getUser());

  if (!user) {
    return <LoginPage onLogin={() => setUser(getUser())} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout onLogout={() => setUser(null)} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default Index;
