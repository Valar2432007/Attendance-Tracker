import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { Subject, generateId, saveSubjects, addRecord } from "@/lib/attendance";
import { useToast } from "@/hooks/use-toast";

interface AttendanceFormProps {
  subjects: Subject[];
  onUpdate: () => void;
}

const AttendanceForm = ({ subjects: initialSubjects, onUpdate }: AttendanceFormProps) => {
  const [subjects, setSubjects] = useState<Subject[]>(
    initialSubjects.length > 0
      ? initialSubjects
      : [{ id: generateId(), name: "", totalClasses: 0, attendedClasses: 0 }]
  );
  const { toast } = useToast();

  const addSubject = () => {
    setSubjects([...subjects, { id: generateId(), name: "", totalClasses: 0, attendedClasses: 0 }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    const valid = subjects.every((s) => s.name.trim() && s.totalClasses >= 0 && s.attendedClasses >= 0 && s.attendedClasses <= s.totalClasses);
    if (!valid) {
      toast({ title: "Invalid data", description: "Please check all fields. Attended cannot exceed total.", variant: "destructive" });
      return;
    }
    saveSubjects(subjects);
    addRecord({ id: generateId(), date: new Date().toISOString(), subjects: [...subjects] });
    onUpdate();
    toast({ title: "Saved!", description: "Attendance data has been saved successfully." });
  };

  return (
    <Card className="shadow-md border-border/50 animate-fade-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg">Subjects & Attendance</CardTitle>
        <Button variant="outline" size="sm" onClick={addSubject} className="transition-transform active:scale-95">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-muted/50 animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                placeholder="e.g. Mathematics"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
              />
            </div>
            <div className="w-full sm:w-28 space-y-1">
              <Label className="text-xs text-muted-foreground">Total</Label>
              <Input
                type="number"
                min={0}
                value={subject.totalClasses || ""}
                onChange={(e) => updateSubject(subject.id, "totalClasses", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="w-full sm:w-28 space-y-1">
              <Label className="text-xs text-muted-foreground">Attended</Label>
              <Input
                type="number"
                min={0}
                value={subject.attendedClasses || ""}
                onChange={(e) => updateSubject(subject.id, "attendedClasses", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={handleSave} className="w-full h-11 transition-transform active:scale-95">
          <Save className="w-4 h-4 mr-2" /> Save Attendance
        </Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
