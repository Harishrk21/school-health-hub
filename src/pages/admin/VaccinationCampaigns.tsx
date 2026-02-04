import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Syringe, Calendar, Users, Plus, CheckCircle, Clock,
  AlertCircle, TrendingUp, FileText, Bell
} from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  vaccineType: string;
  date: string;
  time: string;
  location: string;
  targetClasses: string[];
  targetCount: number;
  completedCount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export default function VaccinationCampaigns() {
  const navigate = useNavigate();
  const { students, vaccinations } = useData();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    vaccineType: '',
    date: '',
    startTime: '',
    endTime: '',
    location: 'School Health Center',
    targetClasses: [] as string[],
    sendReminders: true,
    requireConsent: true,
  });

  const vaccineTypes = [
    'MMR (Measles, Mumps, Rubella)',
    'Tdap (Tetanus, Diphtheria, Pertussis)',
    'Polio',
    'Hepatitis B',
    'Varicella (Chickenpox)',
    'HPV (Human Papillomavirus)',
    'Influenza',
    'Meningococcal',
  ];

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  // Calculate vaccination compliance
  const complianceStats = React.useMemo(() => {
    const total = vaccinations.length;
    const completed = vaccinations.filter(v => v.status === 'Completed').length;
    const pending = vaccinations.filter(v => v.status === 'Pending').length;
    const overdue = vaccinations.filter(v => v.status === 'Overdue').length;
    const compliance = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, compliance };
  }, [vaccinations]);

  // Get students with overdue vaccinations
  const overdueStudents = React.useMemo(() => {
    const overdueVax = vaccinations.filter(v => v.status === 'Overdue');
    const studentIds = new Set(overdueVax.map(v => v.studentId));
    return students.filter(s => studentIds.has(s.id));
  }, [students, vaccinations]);

  const handleCreateCampaign = () => {
    const targetCount = students.filter(s => 
      campaignForm.targetClasses.includes(s.class)
    ).length;

    const newCampaign: Campaign = {
      id: `CAMP-${Date.now()}`,
      name: campaignForm.name,
      vaccineType: campaignForm.vaccineType,
      date: campaignForm.date,
      time: `${campaignForm.startTime} - ${campaignForm.endTime}`,
      location: campaignForm.location,
      targetClasses: campaignForm.targetClasses,
      targetCount,
      completedCount: 0,
      status: 'scheduled',
    };

    setCampaigns([...campaigns, newCampaign]);
    setShowCreateForm(false);
    setCampaignForm({
      name: '',
      vaccineType: '',
      date: '',
      startTime: '',
      endTime: '',
      location: 'School Health Center',
      targetClasses: [],
      sendReminders: true,
      requireConsent: true,
    });
  };

  const toggleClass = (classNum: string) => {
    setCampaignForm(prev => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(classNum)
        ? prev.targetClasses.filter(c => c !== classNum)
        : [...prev.targetClasses, classNum],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vaccination Management</h1>
          <p className="text-muted-foreground">Schedule campaigns and track compliance</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Campaign
        </Button>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{complianceStats.compliance}%</p>
              <p className="text-sm text-muted-foreground">Compliance Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{complianceStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{complianceStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{complianceStats.overdue}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Vaccination Campaign</CardTitle>
                <CardDescription>Create a new vaccination campaign for selected classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Name *</Label>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    placeholder="e.g., Annual MMR Vaccination Drive"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vaccine Type *</Label>
                  <Select
                    value={campaignForm.vaccineType}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, vaccineType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vaccineTypes.map(vax => (
                        <SelectItem key={vax} value={vax}>{vax}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Date *</Label>
                    <Input
                      type="date"
                      value={campaignForm.date}
                      onChange={(e) => setCampaignForm({ ...campaignForm, date: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={campaignForm.startTime}
                        onChange={(e) => setCampaignForm({ ...campaignForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={campaignForm.endTime}
                        onChange={(e) => setCampaignForm({ ...campaignForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={campaignForm.location}
                    onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Classes *</Label>
                  <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
                    {classes.map(classNum => (
                      <div key={classNum} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${classNum}`}
                          checked={campaignForm.targetClasses.includes(classNum)}
                          onCheckedChange={() => toggleClass(classNum)}
                        />
                        <Label htmlFor={`class-${classNum}`} className="text-sm font-normal cursor-pointer">
                          Class {classNum}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {students.filter(s => campaignForm.targetClasses.includes(s.class)).length} students selected
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendReminders"
                      checked={campaignForm.sendReminders}
                      onCheckedChange={(checked) => 
                        setCampaignForm({ ...campaignForm, sendReminders: checked as boolean })
                      }
                    />
                    <Label htmlFor="sendReminders" className="text-sm font-normal cursor-pointer">
                      Send reminders to parents (7 days before)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireConsent"
                      checked={campaignForm.requireConsent}
                      onCheckedChange={(checked) => 
                        setCampaignForm({ ...campaignForm, requireConsent: checked as boolean })
                      }
                    />
                    <Label htmlFor="requireConsent" className="text-sm font-normal cursor-pointer">
                      Require parent consent
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign} className="flex-1" disabled={
                    !campaignForm.name || !campaignForm.vaccineType || !campaignForm.date || 
                    campaignForm.targetClasses.length === 0
                  }>
                    Schedule Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Vaccination Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Vaccine</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.vaccineType}</TableCell>
                        <TableCell>
                          {format(new Date(campaign.date), 'MMM d, yyyy')}
                          <br />
                          <span className="text-xs text-muted-foreground">{campaign.time}</span>
                        </TableCell>
                        <TableCell>
                          {campaign.targetCount} students
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Classes: {campaign.targetClasses.join(', ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(campaign.completedCount / campaign.targetCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {campaign.completedCount}/{campaign.targetCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            campaign.status === 'completed' ? 'default' :
                            campaign.status === 'in_progress' ? 'secondary' :
                            campaign.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No campaigns scheduled. Click "Schedule Campaign" to create one.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vaccination Compliance by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Compliance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map(classNum => {
                    const classStudents = students.filter(s => s.class === classNum);
                    const classVax = vaccinations.filter(v => 
                      classStudents.some(s => s.id === v.studentId)
                    );
                    const completed = classVax.filter(v => v.status === 'Completed').length;
                    const pending = classVax.filter(v => v.status === 'Pending').length;
                    const overdue = classVax.filter(v => v.status === 'Overdue').length;
                    const compliance = classVax.length > 0 
                      ? Math.round((completed / classVax.length) * 100) 
                      : 0;

                    return (
                      <TableRow key={classNum}>
                        <TableCell className="font-medium">Class {classNum}</TableCell>
                        <TableCell>{classStudents.length}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">{completed}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pending}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{overdue}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  compliance >= 90 ? 'bg-green-600' :
                                  compliance >= 70 ? 'bg-amber-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${compliance}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{compliance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students with Overdue Vaccinations</CardTitle>
              <CardDescription>
                {overdueStudents.length} students have overdue vaccinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Overdue Vaccines</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueStudents.map(student => {
                      const overdueVax = vaccinations.filter(
                        v => v.studentId === student.id && v.status === 'Overdue'
                      );
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{student.class}{student.section}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{overdueVax.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/admin/students/${student.id}?tab=vaccinations`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No students with overdue vaccinations! 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


