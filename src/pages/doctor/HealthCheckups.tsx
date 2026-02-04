import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { RecordCheckupForm } from '@/components/shared/RecordCheckupForm';

export default function HealthCheckups() {
  const { students, addHealthRecord } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const filteredStudents = students
    .filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10);

  const student = students.find((s) => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Health Checkups
        </h1>
        <p className="text-muted-foreground">Record new health checkups for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchTerm && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStudent === s.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setSelectedStudent(s.id);
                      setSearchTerm('');
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={s.profileImage} alt={s.firstName} />
                      <AvatarFallback>{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.rollNumber} • Class {s.class}{s.section}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {student && !searchTerm && (
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.profileImage} alt={student.firstName} />
                    <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    <p className="text-sm text-muted-foreground">Class {student.class}{student.section}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => setSelectedStudent(null)}
                >
                  Change student
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Record vitals</CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? null : (
              <RecordCheckupForm
                studentId={selectedStudent}
                doctorId={user.id}
                onSubmit={(record) => {
                  addHealthRecord(record);
                  toast.success('Health checkup recorded');
                }}
                onSuccess={() => {
                  setSelectedStudent(null);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
