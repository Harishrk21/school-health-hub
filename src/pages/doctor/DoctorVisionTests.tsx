import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Glasses } from 'lucide-react';
import { getVisionTestStats } from '@/data/mockData';

export default function DoctorVisionTests() {
  const { students, visionTests } = useData();
  const stats = getVisionTestStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Vision Tests
        </h1>
        <p className="text-muted-foreground">Track student vision screening results</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Passed + stats.Failed}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Passed}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <Glasses className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Failed}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vision Test Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Test Date</TableHead>
                <TableHead>Left Eye</TableHead>
                <TableHead>Right Eye</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Glasses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visionTests.map(test => {
                const student = students.find(s => s.id === test.studentId);
                if (!student) return null;

                return (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(test.testDate).toLocaleDateString()}</TableCell>
                    <TableCell>{test.leftEyeVision}</TableCell>
                    <TableCell>{test.rightEyeVision}</TableCell>
                    <TableCell>
                      <Badge variant={test.result === 'Passed' ? 'default' : 'destructive'}>
                        {test.result === 'Passed' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Passed</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.requiresGlasses ? (
                        <Badge variant="outline">
                          <Glasses className="h-3 w-3 mr-1" />
                          Required
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
