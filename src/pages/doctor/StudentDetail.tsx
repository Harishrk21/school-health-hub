import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Droplets, Calendar, FileText, ClipboardList,
  Syringe, Eye, AlertTriangle, Phone, Mail, MapPin, Heart,
  Pill, Activity, Scale, Ruler, Thermometer, TrendingUp,
  Clock, Bell, MessageSquare, History, Settings, Download,
  Printer, Plus, CheckCircle, XCircle, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GrowthChart } from '@/components/shared/GrowthChart';
import { bloodBankAPI } from '@/services/bloodBankAPI';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Vaccination, HealthRecord, MedicalCondition, Allergy, EmergencyContact, VisionTest } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const COMMON_VACCINES = ['BCG', 'DPT', 'OPV', 'MMR', 'Hepatitis B', 'Typhoid', 'Chickenpox', 'COVID-19', 'Flu', 'Other'];

function getBMICategory(bmi: number): 'Underweight' | 'Normal' | 'Overweight' | 'Obese' {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

const emptyVaxForm = {
  vaccineName: '',
  vaccineType: '',
  doseNumber: '1',
  status: 'Pending' as 'Completed' | 'Pending' | 'Overdue',
  administeredDate: '',
  nextDoseDate: '',
  administeredBy: '',
  batchNumber: '',
};

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    students, healthRecords, medicalConditions, allergies, 
    emergencyContacts, vaccinations, visionTests, appointments,
    alerts, messages, addVaccination, updateVaccination,
    addHealthRecord, updateHealthRecord, addMedicalCondition, updateMedicalCondition, deleteMedicalCondition,
    addAllergy, updateAllergy, deleteAllergy, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact,
    addVisionTest, updateVisionTest
  } = useData();
  const [vaxDialogOpen, setVaxDialogOpen] = useState(false);
  const [editingVax, setEditingVax] = useState<Vaccination | null>(null);
  const [vaxForm, setVaxForm] = useState(emptyVaxForm);

  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [editingHealth, setEditingHealth] = useState<HealthRecord | null>(null);
  const [healthForm, setHealthForm] = useState({ checkupDate: '', height: '', weight: '', bloodPressure: '', temperature: '', pulseRate: '', notes: '', nextCheckupDate: '' });

  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<MedicalCondition | null>(null);
  const [conditionForm, setConditionForm] = useState({ conditionName: '', diagnosisDate: '', severity: 'Mild' as 'Mild' | 'Moderate' | 'Severe', notes: '', isActive: true });
  const [deleteConditionId, setDeleteConditionId] = useState<string | null>(null);

  const [allergyDialogOpen, setAllergyDialogOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [allergyForm, setAllergyForm] = useState({ allergyType: 'Food' as 'Food' | 'Drug' | 'Environmental', allergen: '', reaction: '', severity: 'Mild' as 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening' });
  const [deleteAllergyId, setDeleteAllergyId] = useState<string | null>(null);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({ contactName: '', relationship: '', phonePrimary: '', phoneSecondary: '', email: '', address: '', isPrimary: false });
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const [visionDialogOpen, setVisionDialogOpen] = useState(false);
  const [editingVision, setEditingVision] = useState<VisionTest | null>(null);
  const [visionForm, setVisionForm] = useState({ testDate: '', leftEyeVision: '', rightEyeVision: '', result: 'Passed' as 'Passed' | 'Failed', requiresGlasses: false, notes: '' });

  const student = students.find(s => s.id === id);
  const studentRecords = healthRecords.filter(r => r.studentId === id).sort((a, b) => 
    new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime()
  );
  const latestRecord = studentRecords[0];
  const studentConditions = medicalConditions.filter(c => c.studentId === id);
  const studentAllergies = allergies.filter(a => a.studentId === id);
  const studentContacts = emergencyContacts.filter(c => c.studentId === id);
  const studentVaccinations = vaccinations.filter(v => v.studentId === id);
  const studentVisionTests = visionTests.filter(v => v.studentId === id);
  const studentAppointments = appointments.filter(a => a.studentId === id);
  const studentAlerts = alerts.filter(a => a.studentId === id);
  const studentMessages = messages.filter(m => 
    m.recipientId === id || m.senderId === id
  );

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Student not found</h2>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  // Calculate age
  const age = useMemo(() => {
    const birthDate = new Date(student.dateOfBirth);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }, [student.dateOfBirth]);

  // Calculate health score
  const healthScore = useMemo(() => {
    let score = 100;
    if (studentRecords.length === 0) score -= 20;
    if (studentAllergies.some(a => a.severity === 'Life-threatening')) score -= 15;
    if (studentConditions.some(c => c.severity === 'Severe')) score -= 10;
    const overdueVax = studentVaccinations.filter(v => v.status === 'Overdue').length;
    score -= overdueVax * 5;
    return Math.max(0, Math.min(100, score));
  }, [studentRecords, studentAllergies, studentConditions, studentVaccinations]);

  // Calculate vaccination compliance
  const vaccinationCompliance = useMemo(() => {
    const completed = studentVaccinations.filter(v => v.status === 'Completed').length;
    return studentVaccinations.length > 0 
      ? Math.round((completed / studentVaccinations.length) * 100) 
      : 0;
  }, [studentVaccinations]);

  // Check blood donation eligibility
  const isEligibleForDonation = useMemo(() => {
    return age >= 18; // Assuming weight check would be in health records
  }, [age]);

  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-500', 'A-': 'bg-red-600',
    'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    'O+': 'bg-emerald-500', 'O-': 'bg-emerald-600',
  };

  const openAddVax = () => {
    setEditingVax(null);
    setVaxForm(emptyVaxForm);
    setVaxDialogOpen(true);
  };

  const openEditVax = (vax: Vaccination) => {
    setEditingVax(vax);
    setVaxForm({
      vaccineName: vax.vaccineName,
      vaccineType: vax.vaccineType,
      doseNumber: String(vax.doseNumber),
      status: vax.status,
      administeredDate: vax.administeredDate || '',
      nextDoseDate: vax.nextDoseDate || '',
      administeredBy: vax.administeredBy || '',
      batchNumber: vax.batchNumber || '',
    });
    setVaxDialogOpen(true);
  };

  const closeVaxDialog = () => {
    setVaxDialogOpen(false);
    setEditingVax(null);
    setVaxForm(emptyVaxForm);
  };

  const handleVaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !student) return;
    const vaccineName = (vaxForm.vaccineName === 'Other' ? vaxForm.vaccineType : vaxForm.vaccineName)?.trim() || 'Other';
    const doseNumber = parseInt(vaxForm.doseNumber, 10) || 1;
    const today = new Date().toISOString().split('T')[0];

    if (editingVax) {
      updateVaccination(editingVax.id, {
        vaccineName,
        vaccineType: vaxForm.vaccineType || vaccineName,
        doseNumber,
        status: vaxForm.status,
        administeredDate: vaxForm.status === 'Completed' ? (vaxForm.administeredDate || today) : undefined,
        nextDoseDate: vaxForm.nextDoseDate || undefined,
        administeredBy: vaxForm.administeredBy || user?.fullName,
        batchNumber: vaxForm.batchNumber || undefined,
      });
      toast.success('Vaccination record updated');
    } else {
      const newVax: Vaccination = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        vaccineName,
        vaccineType: vaxForm.vaccineType || vaccineName,
        doseNumber,
        status: vaxForm.status,
        administeredDate: vaxForm.status === 'Completed' ? (vaxForm.administeredDate || today) : undefined,
        nextDoseDate: vaxForm.nextDoseDate || undefined,
        administeredBy: vaxForm.administeredBy || user?.fullName,
        batchNumber: vaxForm.batchNumber || undefined,
        createdAt: new Date().toISOString(),
      };
      addVaccination(newVax);
      toast.success('Vaccination record added');
    }
    setVaxDialogOpen(false);
    setEditingVax(null);
    setVaxForm(emptyVaxForm);
  };

  const handleMarkVaxComplete = (vaxId: string) => {
    updateVaccination(vaxId, {
      status: 'Completed',
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: user?.fullName || 'Doctor',
    });
    toast.success('Vaccination marked as completed');
  };

  const openAddHealth = () => {
    setEditingHealth(null);
    setHealthForm({ checkupDate: new Date().toISOString().split('T')[0], height: '', weight: '', bloodPressure: '', temperature: '', pulseRate: '', notes: '', nextCheckupDate: '' });
    setHealthDialogOpen(true);
  };
  const openEditHealth = (record: HealthRecord) => {
    setEditingHealth(record);
    setHealthForm({
      checkupDate: record.checkupDate,
      height: String(record.height),
      weight: String(record.weight),
      bloodPressure: record.bloodPressure,
      temperature: String(record.temperature),
      pulseRate: record.pulseRate ? String(record.pulseRate) : '',
      notes: record.notes,
      nextCheckupDate: record.nextCheckupDate || '',
    });
    setHealthDialogOpen(true);
  };
  const handleHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    const height = parseFloat(healthForm.height);
    const weight = parseFloat(healthForm.weight);
    if (!height || !weight) { toast.error('Height and weight required'); return; }
    const bmi = weight / ((height / 100) ** 2);
    const bmiCategory = getBMICategory(bmi);
    if (editingHealth) {
      updateHealthRecord(editingHealth.id, {
        checkupDate: healthForm.checkupDate,
        height,
        weight,
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
        bloodPressure: healthForm.bloodPressure,
        temperature: parseFloat(healthForm.temperature) || 0,
        pulseRate: healthForm.pulseRate ? parseInt(healthForm.pulseRate, 10) : undefined,
        notes: healthForm.notes,
        nextCheckupDate: healthForm.nextCheckupDate || undefined,
      });
      toast.success('Health record updated');
    } else {
      const newRecord: HealthRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        doctorId: user.id,
        checkupDate: healthForm.checkupDate,
        height,
        weight,
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
        bloodPressure: healthForm.bloodPressure,
        temperature: parseFloat(healthForm.temperature) || 0,
        pulseRate: healthForm.pulseRate ? parseInt(healthForm.pulseRate, 10) : undefined,
        notes: healthForm.notes,
        nextCheckupDate: healthForm.nextCheckupDate || undefined,
        createdAt: new Date().toISOString(),
      };
      addHealthRecord(newRecord);
      toast.success('Health checkup recorded');
    }
    setHealthDialogOpen(false);
    setEditingHealth(null);
  };

  const openAddCondition = () => {
    setEditingCondition(null);
    setConditionForm({ conditionName: '', diagnosisDate: new Date().toISOString().split('T')[0], severity: 'Mild', notes: '', isActive: true });
    setConditionDialogOpen(true);
  };
  const openEditCondition = (c: MedicalCondition) => {
    setEditingCondition(c);
    setConditionForm({ conditionName: c.conditionName, diagnosisDate: c.diagnosisDate, severity: c.severity, notes: c.notes || '', isActive: c.isActive });
    setConditionDialogOpen(true);
  };
  const handleConditionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (editingCondition) {
      updateMedicalCondition(editingCondition.id, { ...conditionForm });
      toast.success('Medical condition updated');
    } else {
      addMedicalCondition({
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        ...conditionForm,
        createdAt: new Date().toISOString(),
      });
      toast.success('Medical condition added');
    }
    setConditionDialogOpen(false);
    setEditingCondition(null);
  };
  const handleDeleteCondition = (conditionId: string) => {
    deleteMedicalCondition(conditionId);
    setDeleteConditionId(null);
    toast.success('Medical condition removed');
  };

  const openAddAllergy = () => {
    setEditingAllergy(null);
    setAllergyForm({ allergyType: 'Food', allergen: '', reaction: '', severity: 'Mild' });
    setAllergyDialogOpen(true);
  };
  const openEditAllergy = (a: Allergy) => {
    setEditingAllergy(a);
    setAllergyForm({ allergyType: a.allergyType, allergen: a.allergen, reaction: a.reaction, severity: a.severity });
    setAllergyDialogOpen(true);
  };
  const handleAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (editingAllergy) {
      updateAllergy(editingAllergy.id, { ...allergyForm });
      toast.success('Allergy updated');
    } else {
      addAllergy({
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        ...allergyForm,
        createdAt: new Date().toISOString(),
      });
      toast.success('Allergy added');
    }
    setAllergyDialogOpen(false);
    setEditingAllergy(null);
  };
  const handleDeleteAllergy = (allergyId: string) => {
    deleteAllergy(allergyId);
    setDeleteAllergyId(null);
    toast.success('Allergy removed');
  };

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ contactName: '', relationship: '', phonePrimary: '', phoneSecondary: '', email: '', address: '', isPrimary: false });
    setContactDialogOpen(true);
  };
  const openEditContact = (c: EmergencyContact) => {
    setEditingContact(c);
    setContactForm({ contactName: c.contactName, relationship: c.relationship, phonePrimary: c.phonePrimary, phoneSecondary: c.phoneSecondary || '', email: c.email || '', address: c.address || '', isPrimary: c.isPrimary });
    setContactDialogOpen(true);
  };
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (editingContact) {
      updateEmergencyContact(editingContact.id, { ...contactForm, phoneSecondary: contactForm.phoneSecondary || undefined, email: contactForm.email || undefined, address: contactForm.address || undefined });
      toast.success('Emergency contact updated');
    } else {
      addEmergencyContact({
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        ...contactForm,
        phoneSecondary: contactForm.phoneSecondary || undefined,
        email: contactForm.email || undefined,
        address: contactForm.address || undefined,
        createdAt: new Date().toISOString(),
      });
      toast.success('Emergency contact added');
    }
    setContactDialogOpen(false);
    setEditingContact(null);
  };
  const handleDeleteContact = (contactId: string) => {
    deleteEmergencyContact(contactId);
    setDeleteContactId(null);
    toast.success('Emergency contact removed');
  };

  const openAddVision = () => {
    setEditingVision(null);
    setVisionForm({ testDate: new Date().toISOString().split('T')[0], leftEyeVision: '', rightEyeVision: '', result: 'Passed', requiresGlasses: false, notes: '' });
    setVisionDialogOpen(true);
  };
  const openEditVision = (t: VisionTest) => {
    setEditingVision(t);
    setVisionForm({ testDate: t.testDate, leftEyeVision: t.leftEyeVision, rightEyeVision: t.rightEyeVision, result: t.result, requiresGlasses: t.requiresGlasses, notes: t.notes || '' });
    setVisionDialogOpen(true);
  };
  const handleVisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (editingVision) {
      updateVisionTest(editingVision.id, { ...visionForm });
      toast.success('Vision test updated');
    } else {
      addVisionTest({
        id: Math.random().toString(36).substr(2, 9),
        studentId: id,
        ...visionForm,
        createdAt: new Date().toISOString(),
      });
      toast.success('Vision test added');
    }
    setVisionDialogOpen(false);
    setEditingVision(null);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Students
      </Button>

      {/* Student Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-28 w-28 mx-auto md:mx-0">
              <AvatarImage src={student.profileImage} alt={student.firstName} />
              <AvatarFallback className="text-3xl">
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge className={cn("w-fit mx-auto md:mx-0 text-white", bloodGroupColors[student.bloodGroup])}>
                  <Droplets className="h-3 w-3 mr-1" />
                  {student.bloodGroup}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student ID</p>
                  <p className="font-medium">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{student.rollNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">{student.class}{student.section}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{age} years</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => {
                const url = `/doctor/checkups?student=${encodeURIComponent(student.id)}`;
                navigate(url);
              }}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Record Checkup
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {latestRecord && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Ruler className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{latestRecord.height}</p>
              <p className="text-xs text-muted-foreground">Height (cm)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Scale className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{latestRecord.weight}</p>
              <p className="text-xs text-muted-foreground">Weight (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{latestRecord.bmi}</p>
              <p className="text-xs text-muted-foreground">BMI ({latestRecord.bmiCategory})</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Activity className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{latestRecord.bloodPressure}</p>
              <p className="text-xs text-muted-foreground">Blood Pressure</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Thermometer className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{latestRecord.temperature}°C</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 w-full gap-1 overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
          <TabsTrigger value="vaccinations" className="text-xs">Vaccines</TabsTrigger>
          <TabsTrigger value="vision" className="text-xs">Vision</TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs">Appointments</TabsTrigger>
          <TabsTrigger value="blood" className="text-xs">Blood</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs">Emergency</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
          <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{healthScore}%</p>
                <p className="text-xs text-muted-foreground">Health Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Syringe className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold">{vaccinationCompliance}%</p>
                <p className="text-xs text-muted-foreground">Vaccination Status</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Calendar className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <p className="text-2xl font-bold">
                  {studentAppointments.filter(a => a.status === 'Scheduled').length}
                </p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Droplets className="h-5 w-5 mx-auto text-red-600 mb-1" />
                <p className="text-2xl font-bold">{student.bloodGroup}</p>
                <p className="text-xs text-muted-foreground">Blood Group</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Conditions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Medical Conditions
                </CardTitle>
                <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>
                  <Button size="sm" onClick={openAddCondition}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCondition ? 'Edit condition' : 'Add medical condition'}</DialogTitle>
                      <DialogDescription>Record or update a disease/condition for this student.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConditionSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Condition name</Label>
                        <Input value={conditionForm.conditionName} onChange={(e) => setConditionForm(f => ({ ...f, conditionName: e.target.value }))} placeholder="e.g. Asthma, Diabetes" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Diagnosis date</Label>
                          <Input type="date" value={conditionForm.diagnosisDate} onChange={(e) => setConditionForm(f => ({ ...f, diagnosisDate: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select value={conditionForm.severity} onValueChange={(v: 'Mild' | 'Moderate' | 'Severe') => setConditionForm(f => ({ ...f, severity: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mild">Mild</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea rows={2} value={conditionForm.notes} onChange={(e) => setConditionForm(f => ({ ...f, notes: e.target.value }))} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="cond-active" checked={conditionForm.isActive} onChange={(e) => setConditionForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                        <Label htmlFor="cond-active">Active (currently ongoing)</Label>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setConditionDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingCondition ? 'Update' : 'Add'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {studentConditions.length > 0 ? (
                  <div className="space-y-3">
                    {studentConditions.map(condition => (
                      <div key={condition.id} className="p-3 rounded-lg border flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{condition.conditionName}</span>
                            <Badge variant={condition.isActive ? 'default' : 'secondary'}>
                              {condition.isActive ? 'Active' : 'Resolved'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Severity: {condition.severity}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEditCondition(condition)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConditionId(condition.id)}><XCircle className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No medical conditions recorded. Add one to update.</p>
                )}
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Allergies
                </CardTitle>
                <Dialog open={allergyDialogOpen} onOpenChange={setAllergyDialogOpen}>
                  <Button size="sm" onClick={openAddAllergy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingAllergy ? 'Edit allergy' : 'Add allergy'}</DialogTitle>
                      <DialogDescription>Record or update an allergy for this student.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAllergySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Allergen</Label>
                        <Input value={allergyForm.allergen} onChange={(e) => setAllergyForm(f => ({ ...f, allergen: e.target.value }))} placeholder="e.g. Peanuts, Penicillin" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={allergyForm.allergyType} onValueChange={(v: 'Food' | 'Drug' | 'Environmental') => setAllergyForm(f => ({ ...f, allergyType: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Food">Food</SelectItem>
                              <SelectItem value="Drug">Drug</SelectItem>
                              <SelectItem value="Environmental">Environmental</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select value={allergyForm.severity} onValueChange={(v: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening') => setAllergyForm(f => ({ ...f, severity: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mild">Mild</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Severe">Severe</SelectItem>
                              <SelectItem value="Life-threatening">Life-threatening</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Reaction</Label>
                        <Input value={allergyForm.reaction} onChange={(e) => setAllergyForm(f => ({ ...f, reaction: e.target.value }))} placeholder="e.g. Rash, Anaphylaxis" />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAllergyDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingAllergy ? 'Update' : 'Add'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {studentAllergies.length > 0 ? (
                  <div className="space-y-3">
                    {studentAllergies.map(allergy => (
                      <div key={allergy.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{allergy.allergen}</span>
                            <Badge variant={allergy.severity === 'Life-threatening' ? 'destructive' : 'outline'}>
                              {allergy.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{allergy.allergyType} • {allergy.reaction}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEditAllergy(allergy)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteAllergyId(allergy.id)}><XCircle className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No allergies recorded. Add one to update.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Delete confirm dialogs */}
          <AlertDialog open={!!deleteConditionId} onOpenChange={() => setDeleteConditionId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove medical condition?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove this condition from the student record.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteConditionId && handleDeleteCondition(deleteConditionId)}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog open={!!deleteAllergyId} onOpenChange={() => setDeleteAllergyId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove allergy?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove this allergy from the student record.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteAllergyId && handleDeleteAllergy(deleteAllergyId)}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {/* Growth Charts */}
          {studentRecords.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GrowthChart records={studentRecords} type="height" title="Height Progression" />
              <GrowthChart records={studentRecords} type="weight" title="Weight Progression" />
              <GrowthChart records={studentRecords} type="bmi" title="BMI Trend" />
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Health Checkup History</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/checkups?student=${student.id}`)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Record Checkup
                </Button>
                <Dialog open={healthDialogOpen} onOpenChange={setHealthDialogOpen}>
                  <Button size="sm" onClick={openAddHealth}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add record
                  </Button>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingHealth ? 'Edit health record' : 'Add health record'}</DialogTitle>
                      <DialogDescription>Update height, weight, vitals, and notes for this student.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleHealthSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Checkup date</Label>
                        <Input type="date" value={healthForm.checkupDate} onChange={(e) => setHealthForm(f => ({ ...f, checkupDate: e.target.value }))} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Height (cm)</Label>
                          <Input type="number" min={1} step={0.1} value={healthForm.height} onChange={(e) => setHealthForm(f => ({ ...f, height: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Weight (kg)</Label>
                          <Input type="number" min={1} step={0.1} value={healthForm.weight} onChange={(e) => setHealthForm(f => ({ ...f, weight: e.target.value }))} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Blood pressure</Label>
                          <Input placeholder="e.g. 120/80" value={healthForm.bloodPressure} onChange={(e) => setHealthForm(f => ({ ...f, bloodPressure: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Temperature (°C)</Label>
                          <Input type="number" step={0.1} value={healthForm.temperature} onChange={(e) => setHealthForm(f => ({ ...f, temperature: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Pulse rate (optional)</Label>
                        <Input type="number" value={healthForm.pulseRate} onChange={(e) => setHealthForm(f => ({ ...f, pulseRate: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Next checkup date (optional)</Label>
                        <Input type="date" value={healthForm.nextCheckupDate} onChange={(e) => setHealthForm(f => ({ ...f, nextCheckupDate: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea rows={3} value={healthForm.notes} onChange={(e) => setHealthForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observations, recommendations..." />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setHealthDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingHealth ? 'Update' : 'Add record'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {studentRecords.length > 0 ? (
                <div className="space-y-4">
                  {studentRecords.map(record => (
                    <div key={record.id} className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(record.checkupDate).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge>{record.bmiCategory}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Height</p>
                            <p className="font-medium">{record.height} cm</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Weight</p>
                            <p className="font-medium">{record.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">BMI</p>
                            <p className="font-medium">{record.bmi}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">BP</p>
                            <p className="font-medium">{record.bloodPressure}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Temp</p>
                            <p className="font-medium">{record.temperature}°C</p>
                          </div>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditHealth(record)} className="shrink-0">
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No health records available. Add a record or record a checkup.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Vaccination Records</CardTitle>
              <Dialog open={vaxDialogOpen} onOpenChange={(open) => { setVaxDialogOpen(open); if (!open) closeVaxDialog(); }}>
                <Button onClick={openAddVax} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add vaccination
                </Button>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingVax ? 'Edit vaccination' : 'Add vaccination'}</DialogTitle>
                    <DialogDescription>
                      {editingVax ? 'Update vaccine details, status, and dates.' : 'Record a vaccine given or schedule one due for this student.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleVaxSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Vaccine name</Label>
                      <Select value={vaxForm.vaccineName} onValueChange={(v) => setVaxForm(f => ({ ...f, vaccineName: v }))} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vaccine" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_VACCINES.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {vaxForm.vaccineName === 'Other' && (
                        <Input
                          placeholder="Enter vaccine name"
                          value={vaxForm.vaccineType}
                          onChange={(e) => setVaxForm(f => ({ ...f, vaccineType: e.target.value }))}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dose number</Label>
                        <Input
                          type="number"
                          min={1}
                          value={vaxForm.doseNumber}
                          onChange={(e) => setVaxForm(f => ({ ...f, doseNumber: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={vaxForm.status} onValueChange={(v: 'Completed' | 'Pending' | 'Overdue') => setVaxForm(f => ({ ...f, status: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending (to take)</SelectItem>
                            <SelectItem value="Completed">Completed (taken)</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Administered date (if taken)</Label>
                        <Input
                          type="date"
                          value={vaxForm.administeredDate}
                          onChange={(e) => setVaxForm(f => ({ ...f, administeredDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Next dose due date</Label>
                        <Input
                          type="date"
                          value={vaxForm.nextDoseDate}
                          onChange={(e) => setVaxForm(f => ({ ...f, nextDoseDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Administered by (optional)</Label>
                      <Input
                        placeholder="Doctor or nurse name"
                        value={vaxForm.administeredBy}
                        onChange={(e) => setVaxForm(f => ({ ...f, administeredBy: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch number (optional)</Label>
                      <Input
                        placeholder="Batch #"
                        value={vaxForm.batchNumber}
                        onChange={(e) => setVaxForm(f => ({ ...f, batchNumber: e.target.value }))}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={closeVaxDialog}>Cancel</Button>
                      <Button type="submit">{editingVax ? 'Update' : 'Add record'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentVaccinations.length === 0 && (
                  <p className="text-muted-foreground text-sm">No vaccinations recorded. Add one to track vaccines taken or due.</p>
                )}
                {studentVaccinations.map(vax => (
                  <div key={vax.id} className="flex items-center justify-between p-3 rounded-lg border gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Syringe className={cn(
                        "h-5 w-5 shrink-0",
                        vax.status === 'Completed' ? 'text-emerald-500' :
                        vax.status === 'Overdue' ? 'text-red-500' : 'text-amber-500'
                      )} />
                      <div className="min-w-0">
                        <p className="font-medium">{vax.vaccineName}</p>
                        <p className="text-sm text-muted-foreground">
                          Dose {vax.doseNumber} • {vax.vaccineType}
                          {vax.nextDoseDate && vax.status !== 'Completed' && (
                            <span className="ml-1"> — Due: {new Date(vax.nextDoseDate).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={
                        vax.status === 'Completed' ? 'default' :
                        vax.status === 'Overdue' ? 'destructive' : 'secondary'
                      }>
                        {vax.status}
                      </Badge>
                      {vax.administeredDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(vax.administeredDate).toLocaleDateString()}
                        </span>
                      )}
                      {vax.status !== 'Completed' && (
                        <Button size="sm" variant="default" onClick={() => handleMarkVaxComplete(vax.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEditVax(vax)}>
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Vision Test History</CardTitle>
              <Dialog open={visionDialogOpen} onOpenChange={setVisionDialogOpen}>
                <Button size="sm" onClick={openAddVision}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add vision test
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingVision ? 'Edit vision test' : 'Add vision test'}</DialogTitle>
                    <DialogDescription>Record or update vision screening results.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleVisionSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Test date</Label>
                      <Input type="date" value={visionForm.testDate} onChange={(e) => setVisionForm(f => ({ ...f, testDate: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Left eye vision</Label>
                        <Input value={visionForm.leftEyeVision} onChange={(e) => setVisionForm(f => ({ ...f, leftEyeVision: e.target.value }))} placeholder="e.g. 6/6" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Right eye vision</Label>
                        <Input value={visionForm.rightEyeVision} onChange={(e) => setVisionForm(f => ({ ...f, rightEyeVision: e.target.value }))} placeholder="e.g. 6/6" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Result</Label>
                        <Select value={visionForm.result} onValueChange={(v: 'Passed' | 'Failed') => setVisionForm(f => ({ ...f, result: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Passed">Passed</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <input type="checkbox" id="vision-glasses" checked={visionForm.requiresGlasses} onChange={(e) => setVisionForm(f => ({ ...f, requiresGlasses: e.target.checked }))} className="rounded" />
                        <Label htmlFor="vision-glasses">Glasses recommended</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea rows={2} value={visionForm.notes} onChange={(e) => setVisionForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setVisionDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingVision ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {studentVisionTests.length > 0 ? (
                <div className="space-y-4">
                  {studentVisionTests.map(test => (
                    <div key={test.id} className="p-4 rounded-lg border flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(test.testDate).toLocaleDateString()}</span>
                          </div>
                          <Badge variant={test.result === 'Passed' ? 'default' : 'destructive'}>
                            {test.result}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Left Eye</p>
                            <p className="font-medium">{test.leftEyeVision}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Right Eye</p>
                            <p className="font-medium">{test.rightEyeVision}</p>
                          </div>
                        </div>
                        {test.requiresGlasses && (
                          <p className="text-sm text-amber-600 mt-2">👓 Glasses recommended</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditVision(test)} className="shrink-0">
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No vision tests recorded. Add one to update.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Appointments</CardTitle>
            <Button onClick={() => navigate(`/admin/appointments?student=${student.id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {studentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {studentAppointments
                    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                    .map(appointment => (
                      <div key={appointment.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{appointment.appointmentType}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.appointmentDate), 'PPp')}
                            </p>
                          </div>
                          <Badge variant={
                            appointment.status === 'Completed' ? 'default' :
                            appointment.status === 'Cancelled' ? 'secondary' :
                            appointment.status === 'No-show' ? 'destructive' : 'outline'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No appointments scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-red-500" />
                Blood Donation Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50 dark:bg-red-950">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600 mb-2">{student.bloodGroup}</p>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Eligibility Status</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Age (18+)</span>
                        {age >= 18 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Weight (50kg+)</span>
                        {latestRecord && latestRecord.weight >= 50 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <Badge className={`mt-3 w-full justify-center ${
                      isEligibleForDonation ? 'bg-green-600' : 'bg-gray-500'
                    }`}>
                      {isEligibleForDonation ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate(`/admin/blood-bank?search=${student.bloodGroup}`)}>
                  <Droplets className="h-4 w-4 mr-2" />
                  Find Blood Banks
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/blood-bank?request=${student.bloodGroup}`)}>
                  Request Blood (Emergency)
                </Button>
                {isEligibleForDonation && (
                  <Button variant="outline" className="w-full">
                    Register as Donor
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Complete Health Report
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Vaccination Certificate
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Vision Test Report
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Emergency Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Emergency Contacts</CardTitle>
              <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <Button size="sm" onClick={openAddContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add contact
                </Button>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingContact ? 'Edit emergency contact' : 'Add emergency contact'}</DialogTitle>
                    <DialogDescription>Update contact name, relationship, phone, email, and address.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={contactForm.contactName} onChange={(e) => setContactForm(f => ({ ...f, contactName: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input value={contactForm.relationship} onChange={(e) => setContactForm(f => ({ ...f, relationship: e.target.value }))} placeholder="e.g. Parent, Guardian" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary phone</Label>
                      <Input type="tel" value={contactForm.phonePrimary} onChange={(e) => setContactForm(f => ({ ...f, phonePrimary: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary phone (optional)</Label>
                      <Input type="tel" value={contactForm.phoneSecondary} onChange={(e) => setContactForm(f => ({ ...f, phoneSecondary: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email (optional)</Label>
                      <Input type="email" value={contactForm.email} onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address (optional)</Label>
                      <Input value={contactForm.address} onChange={(e) => setContactForm(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="contact-primary" checked={contactForm.isPrimary} onChange={(e) => setContactForm(f => ({ ...f, isPrimary: e.target.checked }))} className="rounded" />
                      <Label htmlFor="contact-primary">Primary contact</Label>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingContact ? 'Update' : 'Add'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentContacts.length > 0 ? (
                  studentContacts.map(contact => (
                    <div key={contact.id} className={cn(
                      "p-4 rounded-lg border flex items-start justify-between gap-3",
                      contact.isPrimary && "border-primary bg-primary/5"
                    )}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">{contact.contactName}</p>
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          </div>
                          {contact.isPrimary && <Badge>Primary</Badge>}
                        </div>
                        <div className="space-y-2 text-sm">
                          <a href={`tel:${contact.phonePrimary}`} className="flex items-center gap-2 text-primary hover:underline">
                            <Phone className="h-4 w-4" />
                            {contact.phonePrimary}
                          </a>
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:underline">
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </a>
                          )}
                          {contact.address && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {contact.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => openEditContact(contact)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteContactId(contact.id)}><XCircle className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No emergency contacts. Add one to update.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <AlertDialog open={!!deleteContactId} onOpenChange={() => setDeleteContactId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove emergency contact?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove this contact from the student record.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteContactId && handleDeleteContact(deleteContactId)}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {studentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {studentAlerts.map(alert => (
                    <div key={alert.id} className={cn(
                      "p-4 rounded-lg border",
                      !alert.isRead && "border-primary bg-primary/5"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          alert.severity === 'Critical' ? 'destructive' :
                          alert.severity === 'High' ? 'default' :
                          alert.severity === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="outline">New</Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{alert.alertType}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(alert.createdAt), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No alerts</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {studentMessages.length > 0 ? (
                <div className="space-y-3">
                  {studentMessages.map(message => (
                    <div key={message.id} className="p-4 rounded-lg border">
                      <p className="font-medium mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(message.createdAt), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No messages</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentRecords.length > 0 && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm font-medium">Health Checkup Recorded</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(studentRecords[0].checkupDate), 'PPp')}
                    </p>
                  </div>
                )}
                {studentVaccinations.filter(v => v.status === 'Completed').length > 0 && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-sm font-medium">Vaccination Administered</p>
                    <p className="text-xs text-muted-foreground">
                      {studentVaccinations.filter(v => v.status === 'Completed').length} vaccines completed
                    </p>
                  </div>
                )}
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Complete activity log coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Edit Student Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Health Card
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Archive Student
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
