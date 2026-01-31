import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, ClipboardList, Plus, Search, Filter,
  Clock, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

export default function HealthManagement() {
  const navigate = useNavigate();
  const { students, healthRecords, appointments, addHealthRecord, addAppointment } = useData();
  const [selectedTab, setSelectedTab] = useState('schedule');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Filter students by class
  const filteredStudents = classFilter === 'all' 
    ? students 
    : students.filter(s => s.class === classFilter);

  // Get pending checkups (students without checkup in last 6 months)
  const pendingCheckups = React.useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentCheckups = new Set(
      healthRecords
        .filter(r => new Date(r.checkupDate) >= sixMonthsAgo)
        .map(r => r.studentId)
    );

    return filteredStudents.filter(s => !recentCheckups.has(s.id));
  }, [filteredStudents, healthRecords]);

  // Get today's appointments
  const todayAppointments = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => 
      a.appointmentDate.startsWith(today) && a.status === 'Scheduled'
    );
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Health Management</h1>
        <p className="text-muted-foreground">Schedule and manage student health checkups</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule Checkups</TabsTrigger>
          <TabsTrigger value="record">Record Checkup</TabsTrigger>
          <TabsTrigger value="overview">Health Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Checkups</TabsTrigger>
        </TabsList>

        {/* Schedule Checkups Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Health Checkups</CardTitle>
              <CardDescription>Schedule checkups for individual students or entire classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Checkup Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Checkups for Selected Class
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Scheduled Checkups</CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAppointments.map(appointment => {
                      const student = students.find(s => s.id === appointment.studentId);
                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {student ? `${student.class}${student.section}` : '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(appointment.appointmentDate), 'h:mm a')}
                          </TableCell>
                          <TableCell>{appointment.appointmentType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{appointment.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/students/${appointment.studentId}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No appointments scheduled for today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Record Checkup Tab */}
        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Health Checkup</CardTitle>
              <CardDescription>Enter health checkup details for a student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.rollNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Checkup Date</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Checkup Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Checkup</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="165.5" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="58.2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input placeholder="120/80" />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input type="number" placeholder="36.5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Examination notes, observations, recommendations..." />
              </div>

              <Button className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Checkup Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{healthRecords.length}</p>
                  <p className="text-sm text-muted-foreground">Total Checkups</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{pendingCheckups.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Checkups</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Health Checkups</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthRecords
                    .sort((a, b) => new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime())
                    .slice(0, 10)
                    .map(record => {
                      const student = students.find(s => s.id === record.studentId);
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.checkupDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              record.bmiCategory === 'Normal' ? 'default' :
                              record.bmiCategory === 'Overweight' ? 'secondary' :
                              'destructive'
                            }>
                              {record.bmi} ({record.bmiCategory})
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Completed</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/students/${record.studentId}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Checkups Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Checkups</CardTitle>
              <CardDescription>Students who haven't had a checkup in the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCheckups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Last Checkup</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCheckups.map(student => {
                      const lastCheckup = healthRecords
                        .filter(r => r.studentId === student.id)
                        .sort((a, b) => new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime())[0];
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{student.class}{student.section}</TableCell>
                          <TableCell>
                            {lastCheckup 
                              ? format(new Date(lastCheckup.checkupDate), 'MMM d, yyyy')
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/admin/students/${student.id}`)}
                            >
                              Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  All students are up to date with their checkups!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

