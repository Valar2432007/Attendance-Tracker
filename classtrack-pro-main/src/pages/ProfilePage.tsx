import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, Target } from "lucide-react";
import { getUser, getSubjects, type AttendanceGoal } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

const GOALS_KEY = "attendance_goals";

function getGoals(): AttendanceGoal[] {
  const data = localStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveGoals(goals: AttendanceGoal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

const ProfilePage = () => {
  const user = getUser();
  const subjects = getSubjects();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [college, setCollege] = useState(user?.college || "");
  const [semester, setSemester] = useState(user?.semester || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [goals, setGoals] = useState<AttendanceGoal[]>(() => {
    const existing = getGoals();
    return subjects.map((s) => {
      const found = existing.find((g) => g.subjectId === s.id);
      return { subjectId: s.id, targetPercentage: found?.targetPercentage || 75 };
    });
  });

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    const updated = { email: email.trim(), name: name.trim(), college: college.trim(), semester: semester.trim(), avatar };
    localStorage.setItem("attendance_user", JSON.stringify(updated));
    toast({ title: "Profile Updated", description: "Your profile has been saved." });
  };

  const handleSaveGoals = () => {
    saveGoals(goals);
    toast({ title: "Goals Saved", description: "Your attendance goals have been updated." });
  };

  const updateGoal = (subjectId: string, value: number) => {
    setGoals(goals.map((g) => (g.subjectId === subjectId ? { ...g, targetPercentage: value } : g)));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and attendance goals</p>
      </div>

      {/* Profile Info */}
      <Card className="shadow-md border-border/50 animate-fade-up">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Personal Information</CardTitle>
          <CardDescription>Update your details and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials || <User className="w-8 h-8" />}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-background" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-foreground">{name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{email || "your@email.com"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-college">College</Label>
              <Input id="profile-college" placeholder="e.g. MIT" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-semester">Semester</Label>
              <Input id="profile-semester" placeholder="e.g. 4th Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="transition-transform active:scale-95">
            <Save className="w-4 h-4 mr-2" /> Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Attendance Goals */}
      {subjects.length > 0 && (
        <Card className="shadow-md border-border/50 animate-fade-up stagger-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Attendance Goals
            </CardTitle>
            <CardDescription>Set your target attendance percentage per subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjects.filter((s) => s.name.trim()).map((subject) => {
              const goal = goals.find((g) => g.subjectId === subject.id);
              return (
                <div key={subject.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground flex-1">{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20 text-center"
                      value={goal?.targetPercentage || 75}
                      onChange={(e) => updateGoal(subject.id, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              );
            })}
            <Button onClick={handleSaveGoals} variant="outline" className="transition-transform active:scale-95">
              <Save className="w-4 h-4 mr-2" /> Save Goals
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
