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
  default: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  destructive: "bg-red-100 text-red-700",
};

const StatCard = ({ title, value, icon: Icon, variant = "default", className = "" }: StatCardProps) => (
  <Card className={`shadow-md border-blue-200 hover:border-blue-300 transition-all hover:scale-[1.02] hover:shadow-lg ${className}`}>
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${variantStyles[variant]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-blue-600">{title}</p>
        <p className="text-2xl font-bold font-heading text-blue-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
