import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

export default function DoctorReports() {
  const { students, healthRecords } = useData();

  // Mock recent reports
  const recentReports = students.slice(0, 10).map(student => {
    const latestRecord = healthRecords
      .filter(r => r.studentId === student.id)
      .sort((a, b) => new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime())[0];

    return {
      id: Math.random().toString(36).substr(2, 9),
      student,
      reportType: 'Health Checkup',
      generatedAt: latestRecord?.createdAt || new Date().toISOString(),
      status: 'Approved'
    };
  });

  const handleGenerateReport = (type: string) => {
    try {
      generatePDF({
        title: type,
        dateRange: 'All Time',
      });
      toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  const handleDownloadStudentReport = (student: typeof students[0]) => {
    try {
      generatePDF({
        title: 'Individual Health Report',
        studentName: `${student.firstName} ${student.lastName}`,
        dateRange: 'All Time',
      });
      toast.success('PDF report generated. Please use your browser\'s print dialog to save as PDF.');
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground">Generate and manage health reports</p>
        </div>
        <Button onClick={() => handleGenerateReport('Health Summary Report')}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleGenerateReport('Individual Health Report')}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Individual Health Report</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate for a single student</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleGenerateReport('Class Health Summary')}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Class Health Summary</h3>
            <p className="text-sm text-muted-foreground mt-1">Aggregate report by class</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleGenerateReport('Vaccination Report')}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold">Vaccination Report</h3>
            <p className="text-sm text-muted-foreground mt-1">Compliance and status report</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {report.student.firstName} {report.student.lastName} - {report.reportType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{report.status}</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadStudentReport(report.student)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
