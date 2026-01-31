import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, Plus, AlertTriangle, CheckCircle, Clock, 
  Filter, Search, Mail, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Alert } from '@/types';

export default function AlertsManagement() {
  const { alerts, students, addAlert, markAlertRead } = useData();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newAlert, setNewAlert] = useState({
    studentId: '',
    alertType: 'Checkup Reminder' as Alert['alertType'],
    severity: 'Low' as Alert['severity'],
    message: '',
    sendEmail: false,
    sendSMS: false,
  });

  // Filter alerts
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesType = filterType === 'all' || alert.alertType === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'read' && alert.isRead) ||
        (filterStatus === 'unread' && !alert.isRead) ||
        (filterStatus === 'resolved' && alert.resolvedAt);
      
      const student = students.find(s => s.id === alert.studentId);
      const matchesSearch = !searchTerm || 
        (student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSeverity && matchesType && matchesStatus && matchesSearch;
    });
  }, [alerts, filterSeverity, filterType, filterStatus, searchTerm, students]);

  const handleCreateAlert = () => {
    if (!newAlert.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an alert message',
        variant: 'destructive',
      });
      return;
    }

    const alert: Alert = {
      id: `ALERT-${Date.now()}`,
      studentId: newAlert.studentId || 'all',
      alertType: newAlert.alertType,
      severity: newAlert.severity,
      message: newAlert.message,
      isRead: false,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
    };

    addAlert(alert);
    
    toast({
      title: 'Alert Created',
      description: 'Alert has been created successfully',
    });

    setNewAlert({
      studentId: '',
      alertType: 'Checkup Reminder',
      severity: 'Low',
      message: '',
      sendEmail: false,
      sendSMS: false,
    });
  };

  const handleMarkResolved = (alertId: string) => {
    // In a real system, this would update the alert
    toast({
      title: 'Alert Resolved',
      description: 'Alert has been marked as resolved',
    });
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' && !a.isRead).length;
  const highAlerts = alerts.filter(a => a.severity === 'High' && !a.isRead).length;
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Manage alerts and notifications for students</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select
                  value={newAlert.alertType}
                  onValueChange={(value) => setNewAlert({ ...newAlert, alertType: value as Alert['alertType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                    <SelectItem value="Vaccination Due">Vaccination Due</SelectItem>
                    <SelectItem value="Checkup Reminder">Checkup Reminder</SelectItem>
                    <SelectItem value="Blood Request">Blood Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <RadioGroup
                  value={newAlert.severity}
                  onValueChange={(value) => setNewAlert({ ...newAlert, severity: value as Alert['severity'] })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Low" id="low" />
                    <Label htmlFor="low" className="font-normal cursor-pointer">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="High" id="high" />
                    <Label htmlFor="high" className="font-normal cursor-pointer">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Critical" id="critical" />
                    <Label htmlFor="critical" className="font-normal cursor-pointer">Critical</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select
                  value={newAlert.studentId}
                  onValueChange={(value) => setNewAlert({ ...newAlert, studentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student or leave for all" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Students</SelectItem>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.rollNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Alert Message *</Label>
                <Textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Enter alert message..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={newAlert.sendEmail}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, sendEmail: checked as boolean })}
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
                    Send email notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendSMS"
                    checked={newAlert.sendSMS}
                    onCheckedChange={(checked) => setNewAlert({ ...newAlert, sendSMS: checked as boolean })}
                    disabled={newAlert.severity !== 'Critical'}
                  />
                  <Label htmlFor="sendSMS" className="text-sm font-normal cursor-pointer">
                    Send SMS (Critical alerts only)
                  </Label>
                </div>
              </div>

              <Button onClick={handleCreateAlert} className="w-full">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{highAlerts}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-sm text-muted-foreground">Unread Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                <SelectItem value="Vaccination Due">Vaccination Due</SelectItem>
                <SelectItem value="Checkup Reminder">Checkup Reminder</SelectItem>
                <SelectItem value="Blood Request">Blood Request</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
          <CardDescription>
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map(alert => {
                  const student = students.find(s => s.id === alert.studentId);
                  return (
                    <TableRow key={alert.id} className={!alert.isRead ? 'bg-primary/5' : ''}>
                      <TableCell>
                        {student ? `${student.firstName} ${student.lastName}` : 'All Students'}
                      </TableCell>
                      <TableCell>{alert.alertType}</TableCell>
                      <TableCell>
                        <Badge variant={
                          alert.severity === 'Critical' ? 'destructive' :
                          alert.severity === 'High' ? 'default' :
                          alert.severity === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                      <TableCell>
                        {format(new Date(alert.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {alert.resolvedAt ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Resolved
                          </Badge>
                        ) : alert.isRead ? (
                          <Badge variant="outline">Read</Badge>
                        ) : (
                          <Badge variant="default">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAlertRead(alert.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          {!alert.resolvedAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkResolved(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No alerts found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

