import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  lastVisit: string;
  labResults: any;
}

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

export const PatientCard = ({ patient, isSelected, onClick }: PatientCardProps) => {
  // Determine overall patient status based on lab results
  const getPatientStatus = () => {
    const results = Object.values(patient.labResults);
    if (results.some((result: any) => result.status === "critical")) return "critical";
    if (results.some((result: any) => result.status === "warning")) return "warning";
    return "routine";
  };

  const status = getPatientStatus();
  const statusColors = {
    critical: "bg-critical text-critical-foreground",
    warning: "bg-warning text-warning-foreground", 
    routine: "bg-success text-success-foreground"
  };

  const statusIcons = {
    critical: AlertCircle,
    warning: Clock,
    routine: CheckCircle
  };

  const StatusIcon = statusIcons[status];

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground truncate">{patient.name}</h3>
              <Badge className={statusColors[status]} variant="secondary">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">Age {patient.age}</p>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                Last visit: {patient.lastVisit}
              </div>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.conditions.slice(0, 2).map((condition) => (
                  <Badge key={condition} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
                {patient.conditions.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{patient.conditions.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};