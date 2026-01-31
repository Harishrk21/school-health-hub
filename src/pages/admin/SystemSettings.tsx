import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, School, Activity, Database, Key, 
  Download, Upload, Save, AlertTriangle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
  const [schoolConfig, setSchoolConfig] = useState({
    name: 'Greenwood High School',
    address: '123 Education Street, Chennai - 600001',
    phone: '+91-44-12345678',
    email: 'admin@greenwood.edu',
    principalName: 'Dr. Ramesh Kumar',
    establishedYear: '1995',
    registrationNumber: 'SCH-12345',
  });

  const [healthParams, setHealthParams] = useState({
    bmiUnderweightThreshold: 18.5,
    bmiNormalMax: 25,
    bmiOverweightMax: 30,
    vaccinationReminderDays: 7,
    checkupFrequencyDays: 90,
    visionTestFrequencyDays: 180,
    emergencyAlertThreshold: 'high',
  });

  const [apiConfig, setApiConfig] = useState({
    bloodBankApiUrl: import.meta.env.VITE_BLOOD_BANK_API_URL || '',
    bloodBankApiKey: import.meta.env.VITE_BLOOD_BANK_API_KEY || '',
    useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
    smsApiEnabled: false,
    emailApiEnabled: true,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    vaccinationReminders: true,
    checkupReminders: true,
    emergencyAlerts: true,
    weeklyReports: false,
  });

  const handleSaveSchoolConfig = () => {
    // In real app, would save to backend
    toast.success('School configuration saved successfully');
  };

  const handleSaveHealthParams = () => {
    toast.success('Health parameters updated successfully');
  };

  const handleSaveApiConfig = () => {
    toast.success('API configuration saved. Please restart the application for changes to take effect.');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  const handleImportData = () => {
    toast.info('Data import feature coming soon');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList>
          <TabsTrigger value="school">School Config</TabsTrigger>
          <TabsTrigger value="health">Health Parameters</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Maintenance</TabsTrigger>
        </TabsList>

        {/* School Configuration */}
        <TabsContent value="school" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Basic school information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School Name *</Label>
                  <Input
                    value={schoolConfig.name}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Established Year</Label>
                  <Input
                    value={schoolConfig.establishedYear}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, establishedYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={schoolConfig.address}
                  onChange={(e) => setSchoolConfig({ ...schoolConfig, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={schoolConfig.phone}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={schoolConfig.email}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Principal Name</Label>
                  <Input
                    value={schoolConfig.principalName}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, principalName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input
                    value={schoolConfig.registrationNumber}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, registrationNumber: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSchoolConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Parameters */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Parameters
              </CardTitle>
              <CardDescription>
                Configure health thresholds and monitoring parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-4 block">BMI Thresholds</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Underweight Threshold</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={healthParams.bmiUnderweightThreshold}
                      onChange={(e) => setHealthParams({ ...healthParams, bmiUnderweightThreshold: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Normal Max</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={healthParams.bmiNormalMax}
                      onChange={(e) => setHealthParams({ ...healthParams, bmiNormalMax: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overweight Max</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={healthParams.bmiOverweightMax}
                      onChange={(e) => setHealthParams({ ...healthParams, bmiOverweightMax: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold mb-4 block">Reminder Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vaccination Reminder (days before)</Label>
                    <Input
                      type="number"
                      value={healthParams.vaccinationReminderDays}
                      onChange={(e) => setHealthParams({ ...healthParams, vaccinationReminderDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Checkup Frequency (days)</Label>
                    <Input
                      type="number"
                      value={healthParams.checkupFrequencyDays}
                      onChange={(e) => setHealthParams({ ...healthParams, checkupFrequencyDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Test Frequency (days)</Label>
                    <Input
                      type="number"
                      value={healthParams.visionTestFrequencyDays}
                      onChange={(e) => setHealthParams({ ...healthParams, visionTestFrequencyDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Alert Threshold</Label>
                    <Select
                      value={healthParams.emergencyAlertThreshold}
                      onValueChange={(value) => setHealthParams({ ...healthParams, emergencyAlertThreshold: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveHealthParams}>
                <Save className="h-4 w-4 mr-2" />
                Save Parameters
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure external API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Blood Bank API URL</Label>
                <Input
                  value={apiConfig.bloodBankApiUrl}
                  onChange={(e) => setApiConfig({ ...apiConfig, bloodBankApiUrl: e.target.value })}
                  placeholder="https://api.nationalbloodbank.gov.in/v1"
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Bank API Key</Label>
                <Input
                  type="password"
                  value={apiConfig.bloodBankApiKey}
                  onChange={(e) => setApiConfig({ ...apiConfig, bloodBankApiKey: e.target.value })}
                  placeholder="Enter API key"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Use Mock API</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable mock API for testing (disables real API calls)
                  </p>
                </div>
                <Switch
                  checked={apiConfig.useMockApi}
                  onCheckedChange={(checked) => setApiConfig({ ...apiConfig, useMockApi: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>SMS API</Label>
                    <p className="text-sm text-muted-foreground">Enable SMS notifications</p>
                  </div>
                  <Switch
                    checked={apiConfig.smsApiEnabled}
                    onCheckedChange={(checked) => setApiConfig({ ...apiConfig, smsApiEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Email API</Label>
                    <p className="text-sm text-muted-foreground">Enable email notifications</p>
                  </div>
                  <Switch
                    checked={apiConfig.emailApiEnabled}
                    onCheckedChange={(checked) => setApiConfig({ ...apiConfig, emailApiEnabled: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveApiConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save API Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure notification channels and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Notification Types</Label>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Vaccination Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminders for upcoming vaccinations</p>
                  </div>
                  <Switch
                    checked={notifications.vaccinationReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, vaccinationReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Checkup Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminders for scheduled checkups</p>
                  </div>
                  <Switch
                    checked={notifications.checkupReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, checkupReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Emergency Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive emergency alerts</p>
                  </div>
                  <Switch
                    checked={notifications.emergencyAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emergencyAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly health summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Maintenance */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Maintenance
              </CardTitle>
              <CardDescription>
                Manage data backups and system maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Last Backup</Label>
                    <Badge variant="outline">2 days ago</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automated backup completed successfully
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleExportData} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <Label>System Maintenance</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule maintenance windows to ensure optimal performance
                  </p>
                  <Button variant="outline">
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

