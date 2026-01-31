import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/shared/StatCard';
import { BMIChart } from '@/components/shared/BMIChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, UserPlus, Syringe, FileText, Droplets, BarChart3, 
  Calendar, AlertTriangle, Bell, TrendingUp, Activity, 
  Eye, Heart, ArrowRight, Clock
} from 'lucide-react';
import { getBMIStats, getVaccinationStats, getBloodGroupStats } from '@/data/mockData';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { students, appointments, alerts, vaccinations, healthRecords } = useData();
  const bmiStats = getBMIStats();
  const vaccinationStats = getVaccinationStats();
  const bloodStats = getBloodGroupStats();

  // Calculate today's appointments
  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => 
      a.appointmentDate.startsWith(today) && a.status === 'Scheduled'
    ).length;
  }, [appointments]);

  // Calculate pending checkups (students without checkup in last 6 months)
  const pendingCheckups = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentCheckups = new Set(
      healthRecords
        .filter(r => new Date(r.checkupDate) >= sixMonthsAgo)
        .map(r => r.studentId)
    );
    return students.filter(s => !recentCheckups.has(s.id)).length;
  }, [students, healthRecords]);

  // Calculate critical alerts
  const criticalAlerts = useMemo(() => {
    return alerts.filter(a => 
      (a.severity === 'Critical' || a.severity === 'High') && !a.isRead
    ).length;
  }, [alerts]);

  // Calculate vaccination compliance rate
  const vaccinationCompliance = useMemo(() => {
    const totalVaccinations = vaccinations.length;
    const completed = vaccinations.filter(v => v.status === 'Completed').length;
    return totalVaccinations > 0 ? Math.round((completed / totalVaccinations) * 100) : 0;
  }, [vaccinations]);

  // Get recent activities (last 5)
  const recentActivities = useMemo(() => {
    const activities: Array<{ id: string; studentName: string; action: string; time: string }> = [];
    
    // Recent checkups
    healthRecords
      .sort((a, b) => new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime())
      .slice(0, 3)
      .forEach(record => {
        const student = students.find(s => s.id === record.studentId);
        if (student) {
          activities.push({
            id: record.id,
            studentName: `${student.firstName} ${student.lastName}`,
            action: 'Checkup Done',
            time: format(new Date(record.checkupDate), 'MMM d, yyyy')
          });
        }
      });

    // Recent vaccinations
    vaccinations
      .filter(v => v.status === 'Completed' && v.administeredDate)
      .sort((a, b) => new Date(b.administeredDate!).getTime() - new Date(a.administeredDate!).getTime())
      .slice(0, 2)
      .forEach(vaccination => {
        const student = students.find(s => s.id === vaccination.studentId);
        if (student) {
          activities.push({
            id: vaccination.id,
            studentName: `${student.firstName} ${student.lastName}`,
            action: 'Vaccine Administered',
            time: vaccination.administeredDate ? format(new Date(vaccination.administeredDate), 'MMM d, yyyy') : ''
          });
        }
      });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  }, [healthRecords, vaccinations, students]);

  // Get upcoming vaccinations due
  const upcomingVaccinations = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return vaccinations.filter(v => {
      if (!v.nextDoseDate) return false;
      const dueDate = new Date(v.nextDoseDate);
      return dueDate <= nextWeek && v.status === 'Pending';
    }).length;
  }, [vaccinations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Admin Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of student health management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students" 
          value={students.length} 
          icon={Users} 
          variant="primary" 
          onClick={() => navigate('/admin/students')}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCard 
          title="Today's Appointments" 
          value={todayAppointments} 
          subtitle={`${todayAppointments > 0 ? 'Scheduled' : 'No appointments'}`}
          icon={Calendar} 
          variant="default"
          onClick={() => navigate('/admin/appointments')}
        />
        <StatCard 
          title="Critical Alerts" 
          value={criticalAlerts} 
          subtitle={criticalAlerts > 0 ? 'Requires attention' : 'All clear'}
          icon={AlertTriangle} 
          variant={criticalAlerts > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/admin/alerts')}
        />
        <StatCard 
          title="Vaccination Compliance" 
          value={`${vaccinationCompliance}%`} 
          subtitle="School-wide coverage"
          icon={Syringe} 
          variant="success"
          trend={{ value: 2.5, isPositive: true }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Pending Checkups" 
          value={pendingCheckups} 
          subtitle="Overdue for 6+ months"
          icon={FileText} 
          variant="warning"
        />
        <StatCard 
          title="Vaccinations Due" 
          value={upcomingVaccinations} 
          subtitle="Next 7 days"
          icon={Clock} 
          variant="warning"
        />
        <StatCard 
          title="Blood Donors" 
          value={students.filter(s => {
            const age = new Date().getFullYear() - new Date(s.dateOfBirth).getFullYear();
            return age >= 18;
          }).length}
          subtitle="Eligible students"
          icon={Droplets} 
          variant="danger"
        />
        <StatCard 
          title="Active Alerts" 
          value={alerts.filter(a => !a.isRead).length} 
          subtitle="Unread notifications"
          icon={Bell} 
          variant="default"
        />
      </div>

      {/* Charts and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Distribution */}
        <BMIChart data={bmiStats} />

        {/* Blood Group Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-500" />
              Blood Group Distribution
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blood-bank')}>
              View Details <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(bloodStats).map(([group, count]) => (
                <div key={group} className="text-center p-3 rounded-lg border hover:bg-accent transition-colors">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground">{group}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Students</span>
                <span className="font-semibold">{students.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Student Activities
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/students')}>
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.studentName}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent activities</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/enroll')}>
              <UserPlus className="h-4 w-4 mr-2" /> Enroll New Student
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/students')}>
              <Users className="h-4 w-4 mr-2" /> View All Students
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/checkups/schedule')}>
              <Calendar className="h-4 w-4 mr-2" /> Schedule Checkup
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/vaccinations/campaigns')}>
              <Syringe className="h-4 w-4 mr-2" /> Schedule Vaccination Campaign
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/reports')}>
              <FileText className="h-4 w-4 mr-2" /> Generate Reports
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/blood-bank')}>
              <Droplets className="h-4 w-4 mr-2" /> Blood Bank Integration
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/emergency')}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Emergency Lookup
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Vaccination Due and Blood Bank Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccination Due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Vaccinations Due Next Week
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/vaccinations')}>
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingVaccinations > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  {upcomingVaccinations} students have vaccinations due in the next 7 days.
                </p>
                <Button className="w-full" onClick={() => navigate('/admin/vaccinations')}>
                  Send Reminders
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No vaccinations due next week</p>
            )}
          </CardContent>
        </Card>

        {/* Blood Bank API Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-500" />
              National Blood Bank API
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Operational
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Status</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">5 minutes ago</span>
              </div>
              <div className="pt-3 border-t space-y-2">
                <Button className="w-full" variant="outline" onClick={() => navigate('/admin/blood-bank')}>
                  Check Blood Availability
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/admin/blood-bank/request')}>
                  Request Blood
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
