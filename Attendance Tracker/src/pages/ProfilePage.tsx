import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User as UserIcon, Camera, Save, Target } from "lucide-react";
import { getUser, getSubjects, saveProfile, type AttendanceGoal } from "@/lib/attendance";
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

  const isStaff = user?.role === "staff";
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [college, setCollege] = useState(user?.college || "");
  const [semester, setSemester] = useState(user?.semester || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [officeHours, setOfficeHours] = useState(user?.officeHours || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [staffFeatures, setStaffFeatures] = useState<string[]>(user?.staffFeatures || []);
  const [goals, setGoals] = useState<AttendanceGoal[]>(() => {
    const existing = getGoals();
    return subjects.map((s) => {
      const found = existing.find((g) => g.subjectId === s.id);
      return { subjectId: s.id, targetPercentage: found?.targetPercentage || 75 };
    });
  });
  const availableStaffFeatures = [
    "Subject allocation",
    "Attendance monitoring",
    "Student roster access",
  ];

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
    const updated = {
      email: email.trim(),
      name: name.trim(),
      college: college.trim(),
      semester: semester.trim(),
      avatar,
      role: user?.role ?? "student",
      department: isStaff ? department.trim() : undefined,
      officeHours: isStaff ? officeHours.trim() : undefined,
      bio: isStaff ? bio.trim() : undefined,
      staffFeatures: isStaff ? staffFeatures : undefined,
    };
    saveProfile(updated);
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
        <h1 className="text-2xl font-bold font-heading text-blue-700">Profile & Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and attendance goals in one place.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value={isStaff ? "staff-settings" : "goals"}>{isStaff ? "Staff Settings" : "Goals"}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-md border-border/50 animate-fade-up">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Personal Information</CardTitle>
              <CardDescription>Update your details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {initials || <UserIcon className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-background" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground">{email || "your@email.com"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Role: {user?.role ?? "student"}</p>
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
                {isStaff && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="profile-department">Department</Label>
                      <Input id="profile-department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-office-hours">Office Hours</Label>
                      <Input id="profile-office-hours" placeholder="e.g. Mon-Wed 10am-12pm" value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="profile-bio">Bio</Label>
                      <Textarea id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[120px]" />
                    </div>
                  </>
                )}
              </div>

              <Button onClick={handleSaveProfile} className="transition-transform active:scale-95">
                <Save className="w-4 h-4 mr-2" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          {subjects.length > 0 ? (
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
          ) : (
            <Card className="shadow-md border-border/50 animate-fade-up">
              <CardContent className="py-12 text-center text-muted-foreground">
                No subjects available yet. Add a subject from the Subjects page first.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isStaff && (
          <TabsContent value="staff-settings">
            <Card className="shadow-md border-border/50 animate-fade-up stagger-2">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Staff Features</CardTitle>
                <CardDescription>Choose the profile tools you want to show on your staff dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {availableStaffFeatures.map((feature) => (
                    <label key={feature} className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer transition hover:border-slate-300">
                      <div>
                        <p className="font-medium">{feature}</p>
                        <p className="text-sm text-muted-foreground">Help customize your staff experience.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={staffFeatures.includes(feature)}
                        onChange={() => {
                          setStaffFeatures((current) =>
                            current.includes(feature)
                              ? current.filter((value) => value !== feature)
                              : [...current, feature]
                          );
                        }}
                        className="h-4 w-4 rounded border"
                      />
                    </label>
                  ))}
                </div>
                <Button onClick={handleSaveProfile} variant="outline" className="transition-transform active:scale-95">
                  <Save className="w-4 h-4 mr-2" /> Save Staff Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProfilePage;
