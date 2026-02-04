import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Ruler, Scale, Activity, Thermometer, Heart, Save, ClipboardList } from 'lucide-react';
import type { HealthRecord } from '@/types';

function getBMICategory(bmi: number): 'Underweight' | 'Normal' | 'Overweight' | 'Obese' {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

interface RecordCheckupFormProps {
  studentId: string | null;
  doctorId: string;
  onSubmit: (record: HealthRecord) => void;
  onSuccess?: () => void;
}

export function RecordCheckupForm({ studentId, doctorId, onSubmit, onSuccess }: RecordCheckupFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    checkupDate: today,
    height: '',
    weight: '',
    bloodPressure: '',
    temperature: '',
    pulseRate: '',
    notes: '',
  });

  const height = parseFloat(formData.height);
  const weight = parseFloat(formData.weight);
  const bmi = height && weight ? weight / ((height / 100) ** 2) : 0;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !height || !weight) return;

    const record: HealthRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      doctorId,
      checkupDate: formData.checkupDate,
      height,
      weight,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory: getBMICategory(bmi),
      bloodPressure: formData.bloodPressure,
      temperature: parseFloat(formData.temperature) || 0,
      pulseRate: formData.pulseRate ? parseInt(formData.pulseRate, 10) : undefined,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    onSubmit(record);
    setFormData({
      checkupDate: today,
      height: '',
      weight: '',
      bloodPressure: '',
      temperature: '',
      pulseRate: '',
      notes: '',
    });
    onSuccess?.();
  };

  if (!studentId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Select a student to record health checkup</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Checkup date</Label>
        <Input
          type="date"
          value={formData.checkupDate}
          onChange={(e) => setFormData((f) => ({ ...f, checkupDate: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Ruler className="h-4 w-4" /> Height (cm)
          </Label>
          <Input
            type="number"
            step={0.1}
            required
            value={formData.height}
            onChange={(e) => setFormData((f) => ({ ...f, height: e.target.value }))}
            placeholder="e.g. 150"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Scale className="h-4 w-4" /> Weight (kg)
          </Label>
          <Input
            type="number"
            step={0.1}
            required
            value={formData.weight}
            onChange={(e) => setFormData((f) => ({ ...f, weight: e.target.value }))}
            placeholder="e.g. 45"
          />
        </div>
        <div className="space-y-2">
          <Label>BMI (auto)</Label>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center justify-between">
            <span className="font-medium">{bmi ? bmi.toFixed(1) : '-'}</span>
            {bmiCategory && (
              <span className="text-xs text-muted-foreground">{bmiCategory}</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Blood pressure
          </Label>
          <Input
            value={formData.bloodPressure}
            onChange={(e) => setFormData((f) => ({ ...f, bloodPressure: e.target.value }))}
            placeholder="e.g. 120/80"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" /> Temperature (°C)
          </Label>
          <Input
            type="number"
            step={0.1}
            value={formData.temperature}
            onChange={(e) => setFormData((f) => ({ ...f, temperature: e.target.value }))}
            placeholder="e.g. 36.5"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> Pulse (bpm)
          </Label>
          <Input
            type="number"
            value={formData.pulseRate}
            onChange={(e) => setFormData((f) => ({ ...f, pulseRate: e.target.value }))}
            placeholder="e.g. 72"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Observations, recommendations..."
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormData({
              checkupDate: today,
              height: '',
              weight: '',
              bloodPressure: '',
              temperature: '',
              pulseRate: '',
              notes: '',
            })
          }
        >
          Clear
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save checkup
        </Button>
      </div>
    </form>
  );
}
