import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, BookOpen, Edit2, Check, X } from "lucide-react";
import { getSubjects, saveSubjects, generateId, getPercentage, getStatus, type Subject } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const badgeVariantMap = {
  success: "default" as const,
  warning: "secondary" as const,
  destructive: "destructive" as const,
};

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const addSubject = () => {
    const sub: Subject = { id: generateId(), name: "", totalClasses: 0, attendedClasses: 0 };
    const updated = [...subjects, sub];
    setSubjects(updated);
    setEditingId(sub.id);
  };

  const removeSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveSubjects(updated);
    toast({ title: "Subject Removed" });
  };

  const startEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setNewName(sub.name);
  };

  const confirmEdit = (id: string) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, name: newName.trim() } : s));
    setSubjects(updated);
    saveSubjects(updated);
    setEditingId(null);
    setNewName("");
  };

  const updateField = (id: string, field: keyof Subject, value: number) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setSubjects(updated);
  };

  const handleSaveAll = () => {
    const valid = subjects.every(
      (s) => s.name.trim() && s.totalClasses >= 0 && s.attendedClasses >= 0 && s.attendedClasses <= s.totalClasses
    );
    if (!valid) {
      toast({ title: "Invalid data", description: "Check all fields.", variant: "destructive" });
      return;
    }
    saveSubjects(subjects);
    toast({ title: "Saved!", description: "All subjects saved." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Subjects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your subjects and class counts</p>
        </div>
        <Button onClick={addSubject} className="transition-transform active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card className="shadow-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No subjects yet. Add your first subject!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 animate-fade-up">
          {subjects.map((subject, i) => {
            const pct = getPercentage(subject.attendedClasses, subject.totalClasses);
            const status = subject.totalClasses > 0 ? getStatus(pct) : null;
            const isEditing = editingId === subject.id;

            return (
              <Card key={subject.id} className="shadow-sm border-border/50 animate-scale-in" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Name */}
                    <div className="flex-1 flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            autoFocus
                            placeholder="Subject name"
                            value={newName || subject.name}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && confirmEdit(subject.id)}
                          />
                          <Button size="icon" variant="ghost" onClick={() => confirmEdit(subject.id)}>
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-foreground">{subject.name || "Untitled"}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(subject)}>
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Counts */}
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Total</Label>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={subject.totalClasses || ""}
                          onChange={(e) => updateField(subject.id, "totalClasses", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Attended</Label>
                        <Input
                          type="number"
                          min={0}
                          className="w-20"
                          value={subject.attendedClasses || ""}
                          onChange={(e) => updateField(subject.id, "attendedClasses", parseInt(e.target.value) || 0)}
                        />
                      </div>
                      {status && (
                        <Badge variant={badgeVariantMap[status.color]} className="self-end mb-1">
                          {pct}%
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="self-end text-muted-foreground hover:text-destructive"
                        onClick={() => removeSubject(subject.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button onClick={handleSaveAll} className="w-full h-11 transition-transform active:scale-95">
            <Save className="w-4 h-4 mr-2" /> Save All Subjects
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
