import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Droplets, Calendar, FileText, ClipboardList,
  Syringe, Eye, AlertTriangle, Phone, Mail, MapPin, Heart,
  Pill, Activity, Scale, Ruler, Thermometer, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    students, healthRecords, medicalConditions, allergies, 
    emergencyContacts, vaccinations, visionTests 
  } = useData();

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

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Student not found</h2>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();

  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-500', 'A-': 'bg-red-600',
    'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    'O+': 'bg-emerald-500', 'O-': 'bg-emerald-600',
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
              <Button onClick={() => navigate(`/doctor/checkups?student=${student.id}`)}>
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
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health History</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentConditions.length > 0 ? (
                  <div className="space-y-3">
                    {studentConditions.map(condition => (
                      <div key={condition.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{condition.conditionName}</span>
                          <Badge variant={condition.isActive ? 'default' : 'secondary'}>
                            {condition.isActive ? 'Active' : 'Resolved'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Severity: {condition.severity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No medical conditions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentAllergies.length > 0 ? (
                  <div className="space-y-3">
                    {studentAllergies.map(allergy => (
                      <div key={allergy.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{allergy.allergen}</span>
                          <Badge variant={allergy.severity === 'Life-threatening' ? 'destructive' : 'outline'}>
                            {allergy.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {allergy.allergyType} • {allergy.reaction}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No allergies recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Checkup History</CardTitle>
            </CardHeader>
            <CardContent>
              {studentRecords.length > 0 ? (
                <div className="space-y-4">
                  {studentRecords.map(record => (
                    <div key={record.id} className="p-4 rounded-lg border">
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
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No health records available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vaccination Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentVaccinations.map(vax => (
                  <div key={vax.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Syringe className={cn(
                        "h-5 w-5",
                        vax.status === 'Completed' ? 'text-emerald-500' :
                        vax.status === 'Overdue' ? 'text-red-500' : 'text-amber-500'
                      )} />
                      <div>
                        <p className="font-medium">{vax.vaccineName}</p>
                        <p className="text-sm text-muted-foreground">
                          Dose {vax.doseNumber} • {vax.vaccineType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        vax.status === 'Completed' ? 'default' :
                        vax.status === 'Overdue' ? 'destructive' : 'secondary'
                      }>
                        {vax.status}
                      </Badge>
                      {vax.administeredDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(vax.administeredDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vision Test History</CardTitle>
            </CardHeader>
            <CardContent>
              {studentVisionTests.length > 0 ? (
                <div className="space-y-4">
                  {studentVisionTests.map(test => (
                    <div key={test.id} className="p-4 rounded-lg border">
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
                        <p className="text-sm text-amber-600 mt-2">
                          👓 Glasses recommended
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No vision tests recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentContacts.map(contact => (
                  <div key={contact.id} className={cn(
                    "p-4 rounded-lg border",
                    contact.isPrimary && "border-primary bg-primary/5"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{contact.contactName}</p>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      </div>
                      {contact.isPrimary && (
                        <Badge>Primary</Badge>
                      )}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
