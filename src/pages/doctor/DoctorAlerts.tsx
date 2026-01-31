import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, Clock, Syringe, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DoctorAlerts() {
  const { alerts, students, markAlertRead } = useData();
  const { user } = useAuth();

  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const alertIcons = {
    'Medical Emergency': AlertTriangle,
    'Vaccination Due': Syringe,
    'Checkup Reminder': Calendar,
    'Blood Request': Bell
  };

  const alertColors = {
    Critical: 'border-red-500 bg-red-50 dark:bg-red-950',
    High: 'border-amber-500 bg-amber-50 dark:bg-amber-950',
    Medium: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    Low: 'border-muted bg-muted/50'
  };

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

      <div className="space-y-4">
        {sortedAlerts.map(alert => {
          const student = students.find(s => s.id === alert.studentId);
          const Icon = alertIcons[alert.alertType as keyof typeof alertIcons] || Bell;

          return (
            <Card 
              key={alert.id} 
              className={cn(
                "transition-all",
                alertColors[alert.severity as keyof typeof alertColors],
                !alert.isRead && "border-l-4"
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    alert.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'High' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        alert.severity === 'Critical' ? 'destructive' :
                        alert.severity === 'High' ? 'default' : 'secondary'
                      }>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{alert.alertType}</span>
                    </div>
                    <p className="font-medium">{alert.message}</p>
                    {student && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Student: {student.firstName} {student.lastName} ({student.rollNumber})
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      {!alert.isRead && (
                        <Button size="sm" variant="outline" onClick={() => markAlertRead(alert.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
