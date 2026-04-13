import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <Card className="w-full max-w-2xl shadow-md border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Something went wrong</CardTitle>
              <CardDescription>
                The app hit a runtime error. The message below will help us fix it quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap break-words rounded-md bg-red-50 p-4 text-sm text-red-900">
                {this.state.error.message}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
