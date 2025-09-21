import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PatientFormProps {
  onPatientAdded: () => void;
}

export const PatientForm = ({ onPatientAdded }: PatientFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    condition: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    glucose_level: '',
    notes: '',
    status: 'stable'
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add patients.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('patients')
        .insert([{
          ...formData,
          user_id: user.id,
          age: formData.age ? parseInt(formData.age) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          glucose_level: formData.glucose_level ? parseInt(formData.glucose_level) : null,
        }]);

      if (error) throw error;

      toast({
        title: "Patient Added",
        description: "Patient record has been successfully created.",
      });

      setFormData({
        name: '',
        age: '',
        gender: '',
        condition: '',
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        glucose_level: '',
        notes: '',
        status: 'stable'
      });
      
      setOpen(false);
      onPatientAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's information and medical data.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="e.g., Hypertension, Diabetes"
              />
            </div>
            
            <div>
              <Label htmlFor="blood_pressure">Blood Pressure</Label>
              <Input
                id="blood_pressure"
                value={formData.blood_pressure}
                onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                placeholder="e.g., 120/80"
              />
            </div>
            
            <div>
              <Label htmlFor="heart_rate">Heart Rate (BPM)</Label>
              <Input
                id="heart_rate"
                type="number"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="glucose_level">Glucose Level (mg/dL)</Label>
              <Input
                id="glucose_level"
                type="number"
                value={formData.glucose_level}
                onChange={(e) => setFormData({ ...formData, glucose_level: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="improving">Improving</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes about the patient..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};