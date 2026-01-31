import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, Plus, Clock, User, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { toast } from 'sonner';

export default function AppointmentsCalendar() {
  const navigate = useNavigate();
  const { appointments, students, addAppointment, updateAppointment } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [newAppointment, setNewAppointment] = useState({
    studentId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'Regular Checkup' as Appointment['appointmentType'],
    notes: '',
  });

  // Get appointments for selected date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.appointmentDate.startsWith(dateStr));
  };

  // Calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group appointments by date
  const appointmentsByDate = React.useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const date = apt.appointmentDate.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return grouped;
  }, [appointments]);

  const handleBookAppointment = () => {
    if (!newAppointment.studentId || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const appointmentDateTime = `${newAppointment.appointmentDate}T${newAppointment.appointmentTime}:00`;
    
    const appointment: Appointment = {
      id: `APT-${Date.now()}`,
      studentId: newAppointment.studentId,
      doctorId: 'doc-001', // Current doctor/admin
      appointmentDate: appointmentDateTime,
      appointmentType: newAppointment.appointmentType,
      status: 'Scheduled',
      notes: newAppointment.notes,
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);
    
    toast.success('Appointment has been scheduled successfully');

    setNewAppointment({
      studentId: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: 'Regular Checkup',
      notes: '',
    });
  };

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
    toast.success(`Appointment marked as ${status}`);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage student appointments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student *</Label>
                <Select
                  value={newAppointment.studentId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, studentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
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
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select
                  value={newAppointment.appointmentType}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, appointmentType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Checkup">Regular Checkup</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button onClick={handleBookAppointment} className="w-full">
                Book Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center gap-4">
        <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
            <SelectItem value="day">Day View</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayAppointments = appointmentsByDate[dayStr] || [];
                const isCurrentDay = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={dayStr}
                    className={cn(
                      "min-h-[100px] border rounded-lg p-2 cursor-pointer hover:bg-muted transition-colors",
                      isCurrentDay && "border-primary bg-primary/5",
                      isSelected && "border-primary border-2"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isCurrentDay && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map(apt => {
                        const student = students.find(s => s.id === apt.studentId);
                        return (
                          <div
                            key={apt.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              apt.appointmentType === 'Emergency' && "bg-red-100 text-red-700 dark:bg-red-950",
                              apt.appointmentType === 'Vaccination' && "bg-blue-100 text-blue-700 dark:bg-blue-950",
                              apt.status === 'Completed' && "opacity-50",
                              !apt.status.includes('Emergency') && !apt.status.includes('Vaccination') && "bg-primary/10 text-primary"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                            }}
                          >
                            {format(new Date(apt.appointmentDate), 'h:mm a')} - {student?.firstName}
                          </div>
                        );
                      })}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date Appointments */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAppointmentsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate)
                  .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .map(apt => {
                    const student = students.find(s => s.id === apt.studentId);
                    return (
                      <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointmentDate), 'h:mm a')} • {apt.appointmentType}
                            </p>
                            {apt.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{apt.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            apt.status === 'Completed' ? 'default' :
                            apt.status === 'Cancelled' ? 'destructive' :
                            apt.status === 'No-show' ? 'secondary' : 'outline'
                          }>
                            {apt.status}
                          </Badge>
                          {apt.status === 'Scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(apt.id, 'Completed')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/students/${apt.studentId}`)}
                          >
                            View Student
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No appointments scheduled for this date
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Appointment Detail Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (() => {
              const student = students.find(s => s.id === selectedAppointment.studentId);
              return (
                <div className="space-y-4">
                  <div>
                    <Label>Student</Label>
                    <p className="font-medium">
                      {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">{student?.rollNumber}</p>
                  </div>
                  <div>
                    <Label>Date & Time</Label>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.appointmentDate), 'PPp')}
                    </p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Badge>{selectedAppointment.appointmentType}</Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={
                      selectedAppointment.status === 'Completed' ? 'default' :
                      selectedAppointment.status === 'Cancelled' ? 'destructive' : 'outline'
                    }>
                      {selectedAppointment.status}
                    </Badge>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin/students/${selectedAppointment.studentId}`)}
                      className="flex-1"
                    >
                      View Student Profile
                    </Button>
                    {selectedAppointment.status === 'Scheduled' && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'Completed')}
                        className="flex-1"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

