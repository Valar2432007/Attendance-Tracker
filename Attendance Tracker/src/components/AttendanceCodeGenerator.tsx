import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Clock, CheckCircle } from "lucide-react";
import { generateAttendanceCode, getSubjects, getUser, getActiveCodes, AttendanceCode } from "@/lib/attendance";

interface AttendanceCodeGeneratorProps {
  onCodeGenerated?: () => void;
}

export function AttendanceCodeGenerator({ onCodeGenerated }: AttendanceCodeGeneratorProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [currentCode, setCurrentCode] = useState<AttendanceCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = getUser();
  const subjects = getSubjects().filter(subject => subject.staffId === user?.email);
  const activeCodes = getActiveCodes().filter(code => code.staffId === user?.email);

  const handleGenerateCode = () => {
    if (!selectedSubjectId || !user) return;

    setLoading(true);
    const code = generateAttendanceCode(selectedSubjectId, user.email);
    setCurrentCode(code);
    setLoading(false);
    onCodeGenerated?.();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCode(prev => prev ? { ...prev } : null); // Trigger re-render for timer
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Generate Attendance Code
          </CardTitle>
          <CardDescription>
            Create a unique 5-digit code for students to mark attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Subject</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} {subject.period && `(${subject.period})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateCode}
            disabled={!selectedSubjectId || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Code"
            )}
          </Button>
        </CardContent>
      </Card>

      {currentCode && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Current Active Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-green-600 mb-2">
                  {currentCode.code}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentCode.code)}
                  className="mb-4"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subject:</span>
                  <span className="font-medium">
                    {subjects.find(s => s.id === currentCode.subjectId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires in:</span>
                  <Badge variant={getTimeRemaining(currentCode.expiresAt) === "Expired" ? "destructive" : "secondary"}>
                    {getTimeRemaining(currentCode.expiresAt)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Session ID:</span>
                  <span className="font-mono text-xs">{currentCode.sessionId.slice(-8)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Codes</CardTitle>
            <CardDescription>
              Currently active attendance codes for your subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-mono font-bold">{code.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {subjects.find(s => s.id === code.subjectId)?.name}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {getTimeRemaining(code.expiresAt)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}