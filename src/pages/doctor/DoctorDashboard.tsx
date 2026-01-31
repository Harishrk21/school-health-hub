import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/shared/StatCard';
import { BMIChart } from '@/components/shared/BMIChart';
import { VaccinationChart } from '@/components/shared/VaccinationChart';
import { StudentCard } from '@/components/shared/StudentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, FileText, Bell, Mail, Calendar, Eye, CheckCircle, 
  Clock, AlertTriangle, ChevronRight, Syringe
} from 'lucide-react';
import { getBMIStats, getVaccinationStats, getVisionTestStats } from '@/data/mockData';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, appointments, alerts, messages, visionTests } = useData();

  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.appointmentDate.startsWith(today) && a.status === 'Scheduled';
  });

  const pendingReports = 8; // Mock value
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const unreadMessages = messages.filter(m => m.recipientId === user?.id && !m.isRead).length;

  const bmiStats = getBMIStats();
  const vaccinationStats = getVaccinationStats();
  const visionStats = getVisionTestStats();

  const recentStudents = students.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}</h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle="Students scheduled"
          icon={Calendar}
          variant="primary"
          onClick={() => navigate('/doctor/appointments')}
        />
        <StatCard
          title="Pending Reports"
          value={pendingReports}
          subtitle="Awaiting review"
          icon={FileText}
          variant="warning"
          onClick={() => navigate('/doctor/reports')}
        />
        <StatCard
          title="Alerts"
          value={unreadAlerts}
          subtitle="Unread notifications"
          icon={Bell}
          variant={unreadAlerts > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/doctor/alerts')}
        />
        <StatCard
          title="Messages"
          value={unreadMessages}
          subtitle="New messages"
          icon={Mail}
          variant={unreadMessages > 0 ? 'primary' : 'default'}
          onClick={() => navigate('/doctor/messages')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BMIChart data={bmiStats} />
        <VaccinationChart data={vaccinationStats} />
      </div>

      {/* Vision Tests & Schedule Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vision Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Vision Tests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/vision')}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{visionStats.Passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950">
                <Eye className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{visionStats.Failed}</p>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Vaccinations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Vaccination Schedule</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/vaccinations')}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Syringe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">MMR Vaccine</p>
                <p className="text-sm text-muted-foreground">Due next week</p>
              </div>
              <Badge variant="outline">12 students</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                <Syringe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Tdap Booster</p>
                <p className="text-sm text-muted-foreground">Next month</p>
              </div>
              <Badge variant="outline">8 students</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Hepatitis B</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <Badge variant="destructive">5 students</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Student Records</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/students')}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                compact
                onClick={() => navigate(`/doctor/students/${student.id}`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
