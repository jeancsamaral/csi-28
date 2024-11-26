import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';

interface PerformanceCardProps {
  icon: LucideIcon;
  badgeText: string;
  mainText: string;
  subText: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ icon: Icon, badgeText, mainText, subText }) => {
  return (
    <Card className="flex flex-col items-center justify-center p-4 space-y-2">
      <div className="flex items-center justify-between w-full">
        <Icon className="w-6 h-6 text-blue-900" />
        <Badge variant="secondary">{badgeText}</Badge>
      </div>
      <div className="text-3xl font-bold">{mainText}</div>
      <div className="text-sm text-muted-foreground">{subText}</div>
    </Card>
  );
};

export default PerformanceCard;
