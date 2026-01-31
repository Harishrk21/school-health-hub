import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, AlertTriangle, Users, Plus } from 'lucide-react';
import { getBloodGroupStats } from '@/data/mockData';

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const { bloodRequests, students } = useData();
  const bloodStats = getBloodGroupStats();
  const pendingRequests = bloodRequests.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blood Bank Dashboard</h1>
        <p className="text-muted-foreground">Manage blood requests and donor registry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} variant="primary" />
        <StatCard title="Pending Requests" value={pendingRequests.length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Fulfilled This Month" value={bloodRequests.filter(r => r.status === 'Fulfilled').length} icon={Droplets} variant="success" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blood Group Distribution</CardTitle>
          <Button onClick={() => navigate('/blood-bank/requests')}><Plus className="h-4 w-4 mr-2" />New Request</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Object.entries(bloodStats).map(([group, count]) => (
              <div key={group} className="text-center p-4 rounded-lg border bg-red-50 dark:bg-red-950">
                <Droplets className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm font-medium">{group}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
