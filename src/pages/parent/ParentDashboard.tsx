import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Syringe, Calendar, FileText, ChevronRight, Droplets } from 'lucide-react';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, healthRecords, vaccinations, appointments } = useData();

  // Get linked children
  const children = students.filter(s => user?.linkedStudentIds?.includes(s.id));
  const child = children[0]; // Show first child by default

  const childRecords = child ? healthRecords.filter(r => r.studentId === child.id) : [];
  const childVaccinations = child ? vaccinations.filter(v => v.studentId === child.id) : [];
  const pendingVax = childVaccinations.filter(v => v.status !== 'Completed').length;
  const latestRecord = childRecords.sort((a, b) => new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime())[0];

  if (!child) {
    return <div className="text-center py-12"><p>No linked children found.</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
        <p className="text-muted-foreground">View your child's health information</p>
      </div>

      {/* Child Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={child.profileImage} />
              <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{child.firstName} {child.lastName}</h2>
              <p className="text-muted-foreground">Class {child.class}{child.section} • {child.studentId}</p>
            </div>
            <Badge className="text-white bg-red-500"><Droplets className="h-3 w-3 mr-1" />{child.bloodGroup}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Last Checkup" value={latestRecord ? new Date(latestRecord.checkupDate).toLocaleDateString() : 'N/A'} icon={Heart} variant="primary" />
        <StatCard title="BMI Status" value={latestRecord?.bmiCategory || 'N/A'} icon={Heart} variant="success" />
        <StatCard title="Pending Vaccines" value={pendingVax} icon={Syringe} variant={pendingVax > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Health Summary</CardTitle></CardHeader>
          <CardContent>
            {latestRecord ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Height</p><p className="font-medium">{latestRecord.height} cm</p></div>
                <div><p className="text-muted-foreground">Weight</p><p className="font-medium">{latestRecord.weight} kg</p></div>
                <div><p className="text-muted-foreground">BMI</p><p className="font-medium">{latestRecord.bmi}</p></div>
                <div><p className="text-muted-foreground">Blood Pressure</p><p className="font-medium">{latestRecord.bloodPressure}</p></div>
              </div>
            ) : <p className="text-muted-foreground">No health records available</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/parent/health')}><FileText className="h-4 w-4 mr-2" />View Health Records</Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/parent/vaccinations')}><Syringe className="h-4 w-4 mr-2" />Vaccination Status</Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/parent/messages')}><Calendar className="h-4 w-4 mr-2" />Message Doctor</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
