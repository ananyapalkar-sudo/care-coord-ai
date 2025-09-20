import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientCard } from "./PatientCard";
import { AnalysisResults } from "./AnalysisResults";
import { ActionPanel } from "./ActionPanel";
import { WorkflowLog } from "./WorkflowLog";
import { Activity, Users, AlertTriangle, CheckCircle } from "lucide-react";

// Mock patient data
const mockPatients = [
  {
    id: "P001",
    name: "John Anderson",
    age: 67,
    conditions: ["Type 2 Diabetes", "Hypertension"],
    lastVisit: "2024-09-15",
    labResults: {
      glucose: { value: 180, normal: "70-100", status: "critical" },
      cholesterol: { value: 240, normal: "<200", status: "warning" },
      bloodPressure: { value: "150/95", normal: "<140/90", status: "warning" }
    }
  },
  {
    id: "P002", 
    name: "Sarah Chen",
    age: 45,
    conditions: ["Asthma"],
    lastVisit: "2024-09-18",
    labResults: {
      peakFlow: { value: 85, normal: ">80%", status: "routine" },
      inflammation: { value: 2.1, normal: "<3.0", status: "routine" }
    }
  }
];

export const WorkflowDashboard = () => {
  const [activeWorkflows, setActiveWorkflows] = useState(3);
  const [criticalAlerts, setCriticalAlerts] = useState(1);
  const [completedToday, setCompletedToday] = useState(12);
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">Processing patient data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Monitored</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{mockPatients.length}</div>
            <p className="text-xs text-muted-foreground">Under AI supervision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Automated actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workflow Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Patient Queue</h2>
          {mockPatients.map((patient) => (
            <PatientCard 
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient.id === patient.id}
              onClick={() => setSelectedPatient(patient)}
            />
          ))}
        </div>

        {/* Analysis & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <AnalysisResults patient={selectedPatient} />
          <ActionPanel patient={selectedPatient} />
          <WorkflowLog patientId={selectedPatient.id} />
        </div>
      </div>
    </div>
  );
};