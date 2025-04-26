
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

type StatusCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
};

export function StatusCard({ title, value, description, icon, change }: StatusCardProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↑';
      case 'decrease':
        return '↓';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {change && (
            <span className={`text-xs font-medium mr-1 ${getChangeColor(change.type)}`}>
              {getChangeIcon(change.type)} {Math.abs(change.value)}%
            </span>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusCard;
