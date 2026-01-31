import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Search, AlertTriangle, Droplets, Phone, User, Heart,
  FileWarning, Pill, Printer, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmergencyLookup() {
  const navigate = useNavigate();
  const { students, medicalConditions, allergies, emergencyContacts } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const handleSearch = () => {
    const found = students.find(s => 
      s.rollNumber.toLowerCase() === searchTerm.toLowerCase() ||
      s.studentId.toLowerCase() === searchTerm.toLowerCase()
    );
    if (found) {
      setSelectedStudent(found.id);
    } else {
      setSelectedStudent(null);
    }
  };

  const student = students.find(s => s.id === selectedStudent);
  const studentConditions = student ? medicalConditions.filter(c => c.studentId === student.id && c.isActive) : [];
  const studentAllergies = student ? allergies.filter(a => a.studentId === student.id) : [];
  const studentContacts = student ? emergencyContacts.filter(c => c.studentId === student.id) : [];
  const primaryContact = studentContacts.find(c => c.isPrimary);

  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-500', 'A-': 'bg-red-600',
    'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    'O+': 'bg-green-500', 'O-': 'bg-green-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Emergency Student Lookup
        </h1>
        <p className="text-muted-foreground">Quick access to critical student health information</p>
      </div>

      {/* Search */}
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter Roll Number or Student ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 text-lg h-12"
              />
            </div>
            <Button size="lg" onClick={handleSearch} className="px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && !student && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Student Not Found</AlertTitle>
          <AlertDescription>
            No student found with the provided Roll Number or Student ID.
          </AlertDescription>
        </Alert>
      )}

      {student && (
        <div className="space-y-6">
          {/* Student Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24 mx-auto md:mx-0">
                  <AvatarImage src={student.profileImage} alt={student.firstName} />
                  <AvatarFallback className="text-2xl">
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-muted-foreground">
                    {student.studentId} • Roll No: {student.rollNumber}
                  </p>
                  <p className="text-muted-foreground">
                    Class {student.class}{student.section} • {student.gender}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-24 h-24 rounded-xl flex flex-col items-center justify-center text-white",
                    bloodGroupColors[student.bloodGroup]
                  )}>
                    <Droplets className="h-8 w-8" />
                    <span className="text-2xl font-bold">{student.bloodGroup}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Blood Group</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <Card className={studentAllergies.some(a => a.severity === 'Life-threatening' || a.severity === 'Severe') ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <FileWarning className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentAllergies.length > 0 ? (
                  <div className="space-y-3">
                    {studentAllergies.map(allergy => (
                      <div key={allergy.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{allergy.allergen}</span>
                          <Badge variant={allergy.severity === 'Life-threatening' ? 'destructive' : 'outline'}>
                            {allergy.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Type: {allergy.allergyType} • Reaction: {allergy.reaction}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            {/* Medical Conditions */}
            <Card className={studentConditions.some(c => c.severity === 'Severe') ? 'border-amber-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Heart className="h-5 w-5" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentConditions.length > 0 ? (
                  <div className="space-y-3">
                    {studentConditions.map(condition => (
                      <div key={condition.id} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{condition.conditionName}</span>
                          <Badge variant="outline">{condition.severity}</Badge>
                        </div>
                        {condition.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{condition.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active medical conditions</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryContact ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-10 w-10 text-muted-foreground p-2 bg-muted rounded-full" />
                      <div>
                        <p className="font-semibold">{primaryContact.contactName}</p>
                        <p className="text-sm text-muted-foreground">{primaryContact.relationship}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <a 
                        href={`tel:${primaryContact.phonePrimary}`}
                        className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-medium">{primaryContact.phonePrimary}</span>
                      </a>
                      {primaryContact.phoneSecondary && (
                        <a 
                          href={`tel:${primaryContact.phoneSecondary}`}
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          <span>{primaryContact.phoneSecondary}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No emergency contact on file</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="destructive">
                  <Bell className="h-4 w-4 mr-2" />
                  Alert Doctor
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate(`/doctor/students/${student.id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
                <Button className="w-full" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Emergency Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
