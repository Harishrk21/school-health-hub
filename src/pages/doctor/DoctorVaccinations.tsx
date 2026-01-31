import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Syringe, Search, Filter, CheckCircle, Clock, AlertTriangle,
  Calendar, ChevronRight
} from 'lucide-react';
import { getVaccinationStats } from '@/data/mockData';

export default function DoctorVaccinations() {
  const { students, vaccinations, updateVaccination } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vaccineFilter, setVaccineFilter] = useState<string>('all');

  const stats = getVaccinationStats();
  const total = stats.Completed + stats.Pending + stats.Overdue;
  const complianceRate = total > 0 ? ((stats.Completed / total) * 100).toFixed(1) : 0;

  const vaccineTypes = [...new Set(vaccinations.map(v => v.vaccineName))];

  const filteredVaccinations = vaccinations.filter(v => {
    const student = students.find(s => s.id === v.studentId);
    if (!student) return false;

    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesVaccine = vaccineFilter === 'all' || v.vaccineName === vaccineFilter;

    return matchesSearch && matchesStatus && matchesVaccine;
  });

  const handleMarkComplete = (id: string) => {
    updateVaccination(id, {
      status: 'Completed',
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: 'Dr. Rajesh Kumar'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Syringe className="h-6 w-6 text-primary" />
          Vaccination Management
        </h1>
        <p className="text-muted-foreground">Track and manage student vaccinations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Syringe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{complianceRate}%</p>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
              </div>
            </div>
            <Progress value={parseFloat(complianceRate as string)} className="mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.Overdue}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vaccineFilter} onValueChange={setVaccineFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Vaccine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vaccines</SelectItem>
                {vaccineTypes.map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaccinations.slice(0, 50).map(vax => {
                const student = students.find(s => s.id === vax.studentId);
                if (!student) return null;
                
                return (
                  <TableRow key={vax.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vax.vaccineName}</p>
                        <p className="text-sm text-muted-foreground">{vax.vaccineType}</p>
                      </div>
                    </TableCell>
                    <TableCell>Dose {vax.doseNumber}</TableCell>
                    <TableCell>
                      <Badge variant={
                        vax.status === 'Completed' ? 'default' :
                        vax.status === 'Overdue' ? 'destructive' : 'secondary'
                      }>
                        {vax.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vax.administeredDate ? (
                        new Date(vax.administeredDate).toLocaleDateString()
                      ) : vax.nextDoseDate ? (
                        <span className="text-muted-foreground">
                          Due: {new Date(vax.nextDoseDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {vax.status !== 'Completed' && (
                        <Button size="sm" onClick={() => handleMarkComplete(vax.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
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
