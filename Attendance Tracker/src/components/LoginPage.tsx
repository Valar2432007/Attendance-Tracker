import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, UserPlus, LogIn } from "lucide-react";
import { loginUser, registerUser, type UserRole } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: () => void;
  mode?: "login" | "register";
}

const LoginPage = ({ onLogin, mode = "login" }: LoginPageProps) => {
  const [currentMode, setCurrentMode] = useState<typeof mode>(mode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !name.trim()) {
      toast({ title: "Missing information", description: "Enter both name and email.", variant: "destructive" });
      return;
    }

    if (currentMode === "register") {
      const user = registerUser(email, name, role);
      if (!user) {
        toast({ title: "Account exists", description: "Email is already registered. Try logging in.", variant: "destructive" });
        return;
      }

      toast({ title: "Registered", description: "Your account has been created." });
      onLogin();
      return;
    }

    const user = loginUser(email, name);
    if (!user) {
      toast({ title: "Login failed", description: "No account found. Please register first.", variant: "destructive" });
      return;
    }

    toast({ title: "Welcome back", description: `Logged in as ${user.role}.` });
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">AttendTrack</h1>
          <p className="text-muted-foreground mt-2">Login or register to manage attendance, profiles, and subject allocation.</p>
        </div>

        <div className="flex overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg mb-6">
          <button
            type="button"
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${currentMode === "login" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"}`}
            onClick={() => setCurrentMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${currentMode === "register" ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"}`}
            onClick={() => setCurrentMode("register")}
          >
            Register
          </button>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="font-heading">{currentMode === "login" ? "Sign in to your account" : "Create a new account"}</CardTitle>
            <CardDescription>
              {currentMode === "login"
                ? "Use your registered email and name to continue."
                : "Choose your role and register as a student or staff member."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {currentMode === "register" && (
                <div className="space-y-2">
                  <Label>Account type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${role === "student" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-border/70 bg-transparent text-foreground hover:border-blue-500"}`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("staff")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${role === "staff" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-border/70 bg-transparent text-foreground hover:border-blue-500"}`}
                    >
                      Staff
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base transition-transform active:scale-95">
                {currentMode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
