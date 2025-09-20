import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  MessageSquare,
  Mail,
  Slack,
  FileText
} from "lucide-react";

interface WorkflowLogProps {
  patientId: string;
}

export const WorkflowLog = ({ patientId }: WorkflowLogProps) => {
  // Mock workflow log data
  const logEntries = [
    {
      id: "log_001",
      timestamp: "2024-09-20T14:32:15Z",
      action: "data_ingestion",
      status: "completed",
      message: "FHIR patient data retrieved successfully",
      icon: FileText,
      details: "Retrieved lab results, medication history, and visit records"
    },
    {
      id: "log_002", 
      timestamp: "2024-09-20T14:32:18Z",
      action: "analysis_complete",
      status: "completed", 
      message: "AI analysis detected critical glucose levels",
      icon: AlertTriangle,
      details: "Glucose: 180 mg/dL (Critical), Confidence: 95%"
    },
    {
      id: "log_003",
      timestamp: "2024-09-20T14:32:25Z",
      action: "doctor_notification",
      status: "completed",
      message: "Critical alert sent via Slack API",
      icon: Slack,
      details: "Dr. Sarah Johnson notified immediately"
    },
    {
      id: "log_004",
      timestamp: "2024-09-20T14:32:45Z", 
      action: "appointment_scheduling",
      status: "completed",
      message: "Urgent follow-up scheduled via Google Calendar",
      icon: Calendar,
      details: "Sept 22, 2024 at 10:00 AM - Dr. Johnson's office"
    },
    {
      id: "log_005",
      timestamp: "2024-09-20T14:33:02Z",
      action: "patient_notification",
      status: "in_progress",
      message: "SMS notification being sent via Twilio",
      icon: MessageSquare,
      details: "Message: 'Please see your doctor urgently. Appointment booked.'"
    },
    {
      id: "log_006",
      timestamp: "2024-09-20T14:33:15Z",
      action: "email_summary", 
      status: "pending",
      message: "Lab summary email queued for SendGrid",
      icon: Mail,
      details: "Comprehensive lab results and recommendations"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "in_progress": return "text-primary";
      case "pending": return "text-warning";
      case "failed": return "text-critical";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "failed": return "bg-critical text-critical-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Workflow Audit Log</span>
          <Badge variant="outline" className="ml-auto">
            Patient {patientId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {logEntries.map((entry) => {
              const IconComponent = entry.icon;
              
              return (
                <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    <IconComponent className={`h-4 w-4 ${getStatusColor(entry.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {entry.message}
                      </h4>
                      <Badge className={getStatusBadge(entry.status)} variant="secondary">
                        {entry.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatTimestamp(entry.timestamp)} • {entry.action.replace('_', ' ')}
                    </p>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {entry.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>All times in local timezone</span>
          <span>Last updated: {formatTimestamp(new Date().toISOString())}</span>
        </div>
      </CardContent>
    </Card>
  );
};