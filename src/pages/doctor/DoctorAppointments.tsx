import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle, XCircle, Plus } from 'lucide-react';

export default function DoctorAppointments() {
  const { appointments, students, updateAppointment } = useData();
  const { user } = useAuth();

  const doctorAppointments = appointments.filter(a => a.doctorId === user?.id);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = doctorAppointments.filter(a => a.appointmentDate.startsWith(today));
  const upcomingAppointments = doctorAppointments.filter(a => 
    new Date(a.appointmentDate) > new Date() && a.status === 'Scheduled'
  );

  const handleComplete = (id: string) => {
    updateAppointment(id, { status: 'Completed' });
  };

  const handleCancel = (id: string) => {
    updateAppointment(id, { status: 'Cancelled' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Appointments
          </h1>
          <p className="text-muted-foreground">Manage your appointment schedule</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Appointments ({todayAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map(apt => {
                const student = students.find(s => s.id === apt.studentId);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{student?.firstName} {student?.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.appointmentType} • {new Date(apt.appointmentDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        apt.status === 'Completed' ? 'default' :
                        apt.status === 'Cancelled' ? 'destructive' : 'secondary'
                      }>
                        {apt.status}
                      </Badge>
                      {apt.status === 'Scheduled' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleComplete(apt.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleCancel(apt.id)}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled for today</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => {
                const student = students.find(s => s.id === apt.studentId);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{student?.firstName} {student?.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.appointmentType} • {new Date(apt.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{apt.status}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
