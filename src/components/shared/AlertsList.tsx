import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertTriangle, Clock, Syringe, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types';
import type { Student } from '@/types';

const alertIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Medical Emergency': AlertTriangle,
  'Vaccination Due': Syringe,
  'Checkup Reminder': Calendar,
  'Blood Request': Bell,
};

const alertColors: Record<string, string> = {
  Critical: 'border-red-500 bg-red-50 dark:bg-red-950',
  High: 'border-amber-500 bg-amber-50 dark:bg-amber-950',
  Medium: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  Low: 'border-muted bg-muted/50',
};

interface AlertsListProps {
  alerts: Alert[];
  students: Student[];
  onMarkRead: (id: string) => void;
  onResolve?: (id: string) => void;
  showResolve?: boolean;
}

export function AlertsList({ alerts, students, onMarkRead, onResolve, showResolve = false }: AlertsListProps) {
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedAlerts.map((alert) => {
        const student = students.find((s) => s.id === alert.studentId);
        const Icon = alertIcons[alert.alertType] || Bell;

        return (
          <Card
            key={alert.id}
            className={cn(
              'transition-all',
              alertColors[alert.severity] ?? alertColors.Low,
              !alert.isRead && 'border-l-4'
            )}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    alert.severity === 'Critical' && 'bg-red-100 text-red-600',
                    alert.severity === 'High' && 'bg-amber-100 text-amber-600',
                    (alert.severity === 'Medium' || alert.severity === 'Low') && 'bg-blue-100 text-blue-600'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge
                      variant={
                        alert.severity === 'Critical'
                          ? 'destructive'
                          : alert.severity === 'High'
                            ? 'default'
                            : 'secondary'
                      }
                    >
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
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    {!alert.isRead && (
                      <Button size="sm" variant="outline" onClick={() => onMarkRead(alert.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                    {showResolve && onResolve && !alert.resolvedAt && (
                      <Button size="sm" variant="outline" onClick={() => onResolve(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {sortedAlerts.length === 0 && (
        <p className="text-muted-foreground text-center py-8">No alerts found</p>
      )}
    </div>
  );
}
