import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Thermometer, Droplet, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  glucose_level: number;
  notes: string;
  status: string;
  created_at: string;
}

export const PatientDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'stable': return 'secondary';
      case 'improving': return 'default';
      case 'monitoring': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'stable': return <CheckCircle className="h-4 w-4" />;
      case 'improving': return <Activity className="h-4 w-4" />;
      case 'monitoring': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    total: patients.length,
    critical: patients.filter(p => p.status === 'critical').length,
    stable: patients.filter(p => p.status === 'stable').length,
    monitoring: patients.filter(p => p.status === 'monitoring').length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stable</p>
                <p className="text-2xl font-bold text-green-600">{stats.stable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monitoring</p>
                <p className="text-2xl font-bold text-orange-600">{stats.monitoring}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Patient Records</h2>
        {patients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No patients yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first patient record using the "Add Patient" button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>
                        {patient.age && `Age: ${patient.age}`} {patient.gender && `• ${patient.gender}`}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(patient.status)} className="flex items-center gap-1">
                      {getStatusIcon(patient.status)}
                      {patient.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patient.condition && (
                      <div>
                        <span className="text-sm font-medium">Condition: </span>
                        <span className="text-sm text-muted-foreground">{patient.condition}</span>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {patient.heart_rate && (
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{patient.heart_rate} BPM</span>
                        </div>
                      )}
                      
                      {patient.temperature && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span>{patient.temperature}°F</span>
                        </div>
                      )}
                      
                      {patient.blood_pressure && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span>{patient.blood_pressure}</span>
                        </div>
                      )}
                      
                      {patient.glucose_level && (
                        <div className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-purple-500" />
                          <span>{patient.glucose_level} mg/dL</span>
                        </div>
                      )}
                    </div>
                    
                    {patient.notes && (
                      <div>
                        <span className="text-sm font-medium">Notes: </span>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {patient.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(patient.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};