import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const StatCard = ({ title, value, icon: Icon, variant = "default", className = "" }: StatCardProps) => (
  <Card className={`shadow-md border-border/50 transition-transform hover:scale-[1.02] ${className}`}>
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${variantStyles[variant]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
