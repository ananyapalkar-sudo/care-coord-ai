import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Phone, 
  Slack, 
  Clock,
  CheckCircle,
  Play,
  Pause
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  lastVisit: string;
  labResults: any;
}

interface ActionPanelProps {
  patient: Patient;
}

export const ActionPanel = ({ patient }: ActionPanelProps) => {
  const [executingActions, setExecutingActions] = useState<string[]>([]);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const { toast } = useToast();

  const actions = [
    {
      id: "notify_doctor",
      type: "notify_doctor",
      method: "slack_api",
      message: `Critical glucose alert for ${patient.name}`,
      icon: Slack,
      priority: "high",
      estimated_time: "< 1 min"
    },
    {
      id: "schedule_followup", 
      type: "schedule_followup",
      method: "google_calendar",
      date: "2025-09-22T10:00:00",
      icon: Calendar,
      priority: "high",
      estimated_time: "2-3 min"
    },
    {
      id: "notify_patient",
      type: "notify_patient", 
      method: "twilio_sms",
      message: "Please see your doctor urgently. Appointment booked.",
      icon: MessageSquare,
      priority: "medium",
      estimated_time: "< 1 min"
    },
    {
      id: "email_summary",
      type: "email_summary",
      method: "sendgrid_api", 
      message: "Lab results summary and next steps",
      icon: Mail,
      priority: "low",
      estimated_time: "1-2 min"
    }
  ];

  const executeAction = async (actionId: string) => {
    setExecutingActions(prev => [...prev, actionId]);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    setExecutingActions(prev => prev.filter(id => id !== actionId));
    setCompletedActions(prev => [...prev, actionId]);
    
    const action = actions.find(a => a.id === actionId);
    toast({
      title: "Action Executed",
      description: `${action?.type.replace('_', ' ')} completed successfully`,
    });
  };

  const executeAllActions = async () => {
    const pendingActions = actions.filter(a => 
      !executingActions.includes(a.id) && !completedActions.includes(a.id)
    );
    
    // Execute high priority actions first, then others
    const highPriority = pendingActions.filter(a => a.priority === "high");
    const otherPriority = pendingActions.filter(a => a.priority !== "high");
    
    for (const action of highPriority) {
      await executeAction(action.id);
    }
    
    // Execute remaining actions in parallel
    await Promise.all(otherPriority.map(action => executeAction(action.id)));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-critical text-critical-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <span>Automated Actions</span>
          </CardTitle>
          <Button 
            onClick={executeAllActions}
            disabled={actions.length === completedActions.length}
            className="text-sm"
          >
            Execute All Actions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const isExecuting = executingActions.includes(action.id);
            const isCompleted = completedActions.includes(action.id);
            const IconComponent = action.icon;
            
            return (
              <div 
                key={action.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <IconComponent className={`h-5 w-5 ${isExecuting ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground capitalize">
                        {action.type.replace('_', ' ')}
                      </h4>
                      <Badge className={getPriorityColor(action.priority)} variant="secondary">
                        {action.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {action.method} • {action.estimated_time}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {"message" in action ? action.message : "date" in action ? `Scheduled for ${action.date}` : "Processing..."}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <Badge variant="outline" className="text-success border-success">
                      Completed
                    </Badge>
                  ) : isExecuting ? (
                    <Badge variant="outline" className="text-primary border-primary">
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Executing
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => executeAction(action.id)}
                    >
                      Execute
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Actions are executed via secure API integrations with FHIR-compliant systems. 
            All patient data remains encrypted and follows HIPAA guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};