import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Syringe, FileText, Droplets, BarChart3, ChevronRight } from 'lucide-react';
import { getBMIStats, getVaccinationStats, getBloodGroupStats } from '@/data/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { students } = useData();
  const bmiStats = getBMIStats();
  const vaccinationStats = getVaccinationStats();
  const bloodStats = getBloodGroupStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage students and view health summaries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} variant="primary" onClick={() => navigate('/admin/students')} />
        <StatCard title="Vaccinated" value={vaccinationStats.Completed} subtitle="Completed vaccinations" icon={Syringe} variant="success" />
        <StatCard title="Pending Checkups" value={15} icon={FileText} variant="warning" />
        <StatCard title="Blood Donors" value={Object.values(bloodStats).reduce((a, b) => a + b, 0)} icon={Droplets} variant="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Blood Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(bloodStats).map(([group, count]) => (
                <div key={group} className="text-center p-3 rounded-lg border">
                  <p className="text-xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground">{group}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/enroll')}>
              <UserPlus className="h-4 w-4 mr-2" /> Enroll New Student
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/students')}>
              <Users className="h-4 w-4 mr-2" /> View All Students
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/admin/reports')}>
              <FileText className="h-4 w-4 mr-2" /> Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
