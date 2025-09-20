import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Phone, 
  Slack, 
  Clock,
  CheckCircle,
  Play,
  Pause,
  Loader2
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
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('analyze-patient', {
          body: { patient }
        });

        if (error) {
          throw new Error(error.message);
        }

        // Transform Gemini actions to include UI properties
        const transformedActions = (data.actions || []).map((action: any, index: number) => ({
          id: `${action.type}_${index}`,
          type: action.type,
          method: action.method,
          message: action.message,
          priority: action.priority || "medium",
          estimated_time: action.estimated_time || "2-3 min",
          icon: getIconForActionType(action.type)
        }));

        setActions(transformedActions);
      } catch (err) {
        console.error('Failed to fetch actions:', err);
        toast({
          title: "Error",
          description: "Failed to load AI-generated actions",
          variant: "destructive"
        });
        // Fallback actions
        setActions([
          {
            id: "manual_review",
            type: "manual_review",
            method: "manual",
            message: "Manual review recommended",
            icon: CheckCircle,
            priority: "medium",
            estimated_time: "5-10 min"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [patient, toast]);

  const getIconForActionType = (type: string) => {
    const iconMap: { [key: string]: any } = {
      notify_doctor: Slack,
      schedule_followup: Calendar,
      notify_patient: MessageSquare,
      email_summary: Mail,
      call_patient: Phone,
      manual_review: CheckCircle,
      review_needed: CheckCircle
    };
    return iconMap[type] || CheckCircle;
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <span>Automated Actions</span>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading AI-generated actions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <span>Gemini AI Actions</span>
          </CardTitle>
          <Button 
            onClick={executeAllActions}
            disabled={actions.length === completedActions.length || actions.length === 0}
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
            <strong>Note:</strong> Actions are generated by Gemini AI based on patient analysis. 
            Simulated execution for demonstration purposes. Real implementation would integrate with healthcare APIs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};