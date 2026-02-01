import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, BarChart3, TrendingUp, Users,
  Syringe, Eye, Heart, Calendar, Filter
} from 'lucide-react';
import { getBMIStats, getVaccinationStats, getBloodGroupStats } from '@/data/mockData';
import { BMIChart } from '@/components/shared/BMIChart';
import { generatePDF, generatePDFFromElement, generateCSV, generateExcel } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

export default function ReportsAnalytics() {
  const { students, healthRecords, vaccinations, visionTests } = useData();
  const [reportType, setReportType] = useState<string>('student');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [includeSections, setIncludeSections] = useState({
    personalInfo: true,
    healthMetrics: true,
    vaccinations: true,
    visionTests: false,
    medicalConditions: true,
    emergencyContacts: false,
  });

  const bmiStats = getBMIStats();
  const vaccinationStats = getVaccinationStats();
  const bloodStats = getBloodGroupStats();

  const handleGenerateReport = () => {
    try {
      const student = selectedStudent !== 'all' ? students.find(s => s.id === selectedStudent) : null;
      generatePDF({
        title: 'Custom Health Report',
        studentName: student ? `${student.firstName} ${student.lastName}` : 'All Students',
        dateRange: dateRange !== 'all' ? dateRange : 'All Time',
        sections: Object.entries(includeSections)
          .filter(([_, included]) => included)
          .map(([key]) => key),
      });
      toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  const handleExportData = (format: 'pdf' | 'csv' | 'excel') => {
    try {
      if (format === 'pdf') {
        // Generate PDF based on active tab
        let elementId: string | null = null;
        let title = 'Health Reports & Analytics';
        
        if (activeTab === 'analytics') {
          elementId = 'analytics-content';
          title = 'Health Analytics Report';
        } else if (activeTab === 'reports') {
          elementId = 'reports-content';
          title = 'Health Reports';
        } else if (activeTab === 'custom') {
          elementId = 'custom-report-content';
          title = 'Custom Health Report';
        }
        
        // Try to generate from element if it exists
        if (elementId) {
          const element = document.getElementById(elementId);
          if (element) {
            generatePDFFromElement(elementId, title);
            toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
            return;
          }
        }
        
        // Fallback: Generate generic PDF
        generatePDF({
          title: title,
          dateRange: dateRange !== 'all' ? dateRange : 'All Time',
          sections: Object.entries(includeSections)
            .filter(([_, included]) => included)
            .map(([key]) => key),
        });
        toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
      } else if (format === 'csv') {
        // Export students data as CSV
        const exportData = students.map(s => ({
          'Student ID': s.studentId,
          'Roll Number': s.rollNumber,
          'First Name': s.firstName,
          'Last Name': s.lastName,
          'Class': s.class,
          'Section': s.section,
          'Blood Group': s.bloodGroup,
          'Date of Birth': s.dateOfBirth,
        }));
        generateCSV(exportData, 'students_export');
        toast.success('CSV file downloaded successfully');
      } else if (format === 'excel') {
        // Export as Excel (CSV format)
        const exportData = students.map(s => ({
          'Student ID': s.studentId,
          'Roll Number': s.rollNumber,
          'First Name': s.firstName,
          'Last Name': s.lastName,
          'Class': s.class,
          'Section': s.section,
          'Blood Group': s.bloodGroup,
          'Date of Birth': s.dateOfBirth,
        }));
        generateExcel(exportData, 'students_export');
        toast.success('Excel file downloaded successfully');
      }
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}. Please try again.`);
      console.error('Export error:', error);
    }
  };

  const handleDownloadReport = (reportType: string) => {
    try {
      const reportTitles: Record<string, string> = {
        'Student Health Summary': 'Student Health Summary Report',
        'Class Health Overview': 'Class Health Overview Report',
        'Vaccination Coverage Report': 'Vaccination Coverage Report',
        'BMI Analysis Report': 'BMI Analysis Report',
        'Vision Test Results': 'Vision Test Results Report',
        'Medical Conditions Report': 'Medical Conditions Report',
      };

      generatePDF({
        title: reportTitles[reportType] || reportType,
        dateRange: dateRange !== 'all' ? dateRange : 'All Time',
      });
      toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate reports and view analytics</p>
      </div>

      <Tabs defaultValue="reports" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="custom">Custom Builder</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div id="reports-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pre-built Reports</CardTitle>
                <CardDescription>Quick access to common reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('Student Health Summary')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Student Health Summary
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('Class Health Overview')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Class Health Overview
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('Vaccination Coverage Report')}
                >
                  <Syringe className="h-4 w-4 mr-2" />
                  Vaccination Coverage Report
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('BMI Analysis Report')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  BMI Analysis Report
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('Vision Test Results')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Vision Test Results
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleDownloadReport('Medical Conditions Report')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Medical Conditions Report
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Export</CardTitle>
                <CardDescription>Export data in various formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('excel')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </Button>
              </CardContent>
            </Card>
          </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div id="analytics-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BMIChart data={bmiStats} />

            <Card>
              <CardHeader>
                <CardTitle>Vaccination Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const total = vaccinationStats.Completed + vaccinationStats.Pending + vaccinationStats.Overdue;
                  const completedPercent = total > 0 ? (vaccinationStats.Completed / total) * 100 : 0;
                  const pendingPercent = total > 0 ? (vaccinationStats.Pending / total) * 100 : 0;
                  const overduePercent = total > 0 ? (vaccinationStats.Overdue / total) * 100 : 0;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completed</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${completedPercent}%` }}
                            />
                          </div>
                          <span className="font-medium">{vaccinationStats.Completed}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-amber-600 h-2 rounded-full" 
                              style={{ width: `${pendingPercent}%` }}
                            />
                          </div>
                          <span className="font-medium">{vaccinationStats.Pending}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${overduePercent}%` }}
                            />
                          </div>
                          <span className="font-medium">{vaccinationStats.Overdue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blood Group Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Object.entries(bloodStats).map(([group, count]) => (
                  <div key={group} className="text-center p-3 rounded-lg border">
                    <p className="text-xl font-bold text-primary">{count}</p>
                    <p className="text-sm text-muted-foreground">{group}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Builder Tab */}
        <TabsContent value="custom" className="space-y-4">
          <div id="custom-report-content">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create a custom report with your selected parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Health Summary</SelectItem>
                      <SelectItem value="class">Class Health Overview</SelectItem>
                      <SelectItem value="school">School-wide Report</SelectItem>
                      <SelectItem value="vaccination">Vaccination Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reportType === 'student' && (
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} - {s.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                <Label>Sections to Include</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="personalInfo"
                      checked={includeSections.personalInfo}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, personalInfo: checked as boolean })
                      }
                    />
                    <Label htmlFor="personalInfo" className="text-sm font-normal cursor-pointer">
                      Personal Information
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="healthMetrics"
                      checked={includeSections.healthMetrics}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, healthMetrics: checked as boolean })
                      }
                    />
                    <Label htmlFor="healthMetrics" className="text-sm font-normal cursor-pointer">
                      Health Metrics (BMI, Vitals)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaccinations"
                      checked={includeSections.vaccinations}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, vaccinations: checked as boolean })
                      }
                    />
                    <Label htmlFor="vaccinations" className="text-sm font-normal cursor-pointer">
                      Vaccination Records
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visionTests"
                      checked={includeSections.visionTests}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, visionTests: checked as boolean })
                      }
                    />
                    <Label htmlFor="visionTests" className="text-sm font-normal cursor-pointer">
                      Vision Test Results
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicalConditions"
                      checked={includeSections.medicalConditions}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, medicalConditions: checked as boolean })
                      }
                    />
                    <Label htmlFor="medicalConditions" className="text-sm font-normal cursor-pointer">
                      Medical Conditions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergencyContacts"
                      checked={includeSections.emergencyContacts}
                      onCheckedChange={(checked) => 
                        setIncludeSections({ ...includeSections, emergencyContacts: checked as boolean })
                      }
                    />
                    <Label htmlFor="emergencyContacts" className="text-sm font-normal cursor-pointer">
                      Emergency Contacts
                    </Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

