import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { AlertsList } from '@/components/shared/AlertsList';

export default function DoctorAlerts() {
  const { alerts, students, markAlertRead } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alerts
          </h1>
          <p className="text-muted-foreground">Important notifications and reminders</p>
        </div>
        <Badge variant="outline">{alerts.filter(a => !a.isRead).length} unread</Badge>
      </div>

      <AlertsList alerts={alerts} students={students} onMarkRead={markAlertRead} />
    </div>
  );
}
