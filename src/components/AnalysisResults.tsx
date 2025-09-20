import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Activity, Brain } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  lastVisit: string;
  labResults: any;
}

interface AnalysisResultsProps {
  patient: Patient;
}

export const AnalysisResults = ({ patient }: AnalysisResultsProps) => {
  const generateAnalysis = () => {
    const criticalResults = Object.entries(patient.labResults).filter(
      ([_, result]: [string, any]) => result.status === "critical"
    );
    
    const warningResults = Object.entries(patient.labResults).filter(
      ([_, result]: [string, any]) => result.status === "warning"
    );

    if (criticalResults.length > 0) {
      return {
        severity: "critical",
        analysis: "Patient glucose is critically high at 180 mg/dL (normal: 70-100). Immediate intervention required.",
        confidence: 95,
        actions: [
          { type: "notify_doctor", method: "slack_api", message: "Critical glucose alert for " + patient.name },
          { type: "schedule_followup", method: "google_calendar", date: "2025-09-22T10:00:00" },
          { type: "notify_patient", method: "twilio_sms", message: "Please see your doctor urgently. Appointment booked." }
        ]
      };
    } else if (warningResults.length > 0) {
      return {
        severity: "warning",
        analysis: "Elevated cholesterol (240 mg/dL) and blood pressure (150/95) require monitoring and follow-up.",
        confidence: 87,
        actions: [
          { type: "schedule_followup", method: "google_calendar", date: "2025-09-30T14:00:00" },
          { type: "notify_patient", method: "email", message: "Please schedule a follow-up for your recent lab results." }
        ]
      };
    }
    
    return {
      severity: "routine",
      analysis: "All lab results within normal parameters. Continue current treatment plan.",
      confidence: 92,
      actions: [
        { type: "schedule_routine_checkup", method: "google_calendar", date: "2025-12-15T10:00:00" }
      ]
    };
  };

  const analysis = generateAnalysis();
  
  const severityColors = {
    critical: "bg-critical text-critical-foreground",
    warning: "bg-warning text-warning-foreground",
    routine: "bg-success text-success-foreground"
  };

  const severityIcons = {
    critical: AlertTriangle,
    warning: TrendingUp,
    routine: Activity
  };

  const SeverityIcon = severityIcons[analysis.severity];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Analysis Results</span>
          <Badge className={severityColors[analysis.severity]} variant="secondary">
            <SeverityIcon className="w-3 h-3 mr-1" />
            {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-foreground mb-2">Clinical Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.analysis}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">Confidence Score</h4>
          <div className="flex items-center space-x-3">
            <Progress value={analysis.confidence} className="flex-1" />
            <span className="text-sm font-medium text-foreground">{analysis.confidence}%</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-3">Lab Results Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(patient.labResults).map(([test, result]: [string, any]) => (
              <div key={test} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xs text-muted-foreground">Normal: {result.normal}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{result.value}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      result.status === 'critical' ? 'border-critical text-critical' :
                      result.status === 'warning' ? 'border-warning text-warning' :
                      'border-success text-success'
                    }`}
                  >
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Generated JSON Response</h4>
          <pre className="text-xs text-muted-foreground overflow-x-auto">
{JSON.stringify({
  analysis: analysis.analysis,
  actions: analysis.actions
}, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};