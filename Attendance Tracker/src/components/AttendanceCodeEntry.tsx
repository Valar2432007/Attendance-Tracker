import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { markAttendanceWithCode, getUser } from "@/lib/attendance";

interface AttendanceCodeEntryProps {
  onAttendanceMarked?: () => void;
}

export function AttendanceCodeEntry({ onAttendanceMarked }: AttendanceCodeEntryProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 5) {
      setResult({ success: false, message: "Please enter a valid 5-digit code" });
      return;
    }

    setLoading(true);
    setResult(null);

    const user = getUser();
    if (!user) {
      setResult({ success: false, message: "User not found. Please log in again." });
      setLoading(false);
      return;
    }

    const attendanceResult = markAttendanceWithCode(code.trim(), user.email);

    setLoading(false);

    if (attendanceResult.success) {
      setResult({
        success: true,
        message: `Attendance marked successfully for ${attendanceResult.subject?.name}!`
      });
      setCode("");
      onAttendanceMarked?.();
    } else {
      setResult({
        success: false,
        message: attendanceResult.error || "Failed to mark attendance"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Mark Attendance
        </CardTitle>
        <CardDescription>
          Enter the 5-digit attendance code provided by your instructor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Attendance Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 5-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              maxLength={5}
              className="text-center text-lg font-mono tracking-wider"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || code.length !== 5}
          >
            {loading ? "Marking Attendance..." : "Mark Attendance"}
          </Button>
        </form>

        {result && (
          <Alert className={`mt-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}