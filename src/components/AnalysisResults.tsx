import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Activity, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePatient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: functionError } = await supabase.functions.invoke('analyze-patient', {
          body: { patient }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        setAnalysis(data);
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
        // Fallback analysis
        setAnalysis({
          severity: "routine",
          analysis: "Unable to connect to AI analysis service. Using basic assessment.",
          confidence: 50,
          actions: []
        });
      } finally {
        setLoading(false);
      }
    };

    analyzePatient();
  }, [patient]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Analysis Results</span>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing patient data with Gemini AI...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
          <h4 className="font-medium text-foreground mb-2">Gemini AI Response</h4>
          <pre className="text-xs text-muted-foreground overflow-x-auto">
{JSON.stringify({
  analysis: analysis.analysis,
  severity: analysis.severity,
  confidence: analysis.confidence,
  actions: analysis.actions
}, null, 2)}
          </pre>
          {error && (
            <div className="mt-2 text-xs text-warning">
              Note: {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};