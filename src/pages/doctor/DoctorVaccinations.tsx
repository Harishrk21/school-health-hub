import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Syringe, Search, CheckCircle, Clock, AlertTriangle,
  Plus, Pencil
} from 'lucide-react';
import { getVaccinationStats } from '@/data/mockData';
import { Vaccination } from '@/types';
import { toast } from 'sonner';

const COMMON_VACCINES = ['BCG', 'DPT', 'OPV', 'MMR', 'Hepatitis B', 'Typhoid', 'Chickenpox', 'COVID-19', 'Flu', 'Other'];

const emptyForm = {
  studentId: '',
  vaccineName: '',
  vaccineType: '',
  doseNumber: '1',
  status: 'Pending' as 'Completed' | 'Pending' | 'Overdue',
  administeredDate: '',
  nextDoseDate: '',
  administeredBy: '',
  batchNumber: '',
};

export default function DoctorVaccinations() {
  const { user } = useAuth();
  const { students, vaccinations, addVaccination, updateVaccination } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vaccineFilter, setVaccineFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVax, setEditingVax] = useState<Vaccination | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  const openAdd = () => {
    setEditingVax(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (vax: Vaccination) => {
    setEditingVax(vax);
    setForm({
      studentId: vax.studentId,
      vaccineName: vax.vaccineName,
      vaccineType: vax.vaccineType,
      doseNumber: String(vax.doseNumber),
      status: vax.status,
      administeredDate: vax.administeredDate || '',
      nextDoseDate: vax.nextDoseDate || '',
      administeredBy: vax.administeredBy || '',
      batchNumber: vax.batchNumber || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vaccineName = form.vaccineName.trim() || (form.vaccineName === 'Other' ? 'Other' : '');
    if (!vaccineName && !editingVax) return;
    const studentId = form.studentId || editingVax?.studentId;
    if (!studentId) {
      toast.error('Please select a student');
      return;
    }

    const doseNumber = parseInt(form.doseNumber, 10) || 1;
    const today = new Date().toISOString().split('T')[0];

    if (editingVax) {
      updateVaccination(editingVax.id, {
        vaccineName: form.vaccineName === 'Other' ? form.vaccineType || 'Other' : form.vaccineName,
        vaccineType: form.vaccineType || form.vaccineName,
        doseNumber,
        status: form.status,
        administeredDate: form.status === 'Completed' ? (form.administeredDate || today) : undefined,
        nextDoseDate: form.nextDoseDate || undefined,
        administeredBy: form.administeredBy || user?.fullName,
        batchNumber: form.batchNumber || undefined,
      });
      toast.success('Vaccination record updated');
    } else {
      const name = form.vaccineName === 'Other' ? (form.vaccineType || 'Other') : form.vaccineName;
      const newVax: Vaccination = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        vaccineName: name,
        vaccineType: form.vaccineType || name,
        doseNumber,
        status: form.status,
        administeredDate: form.status === 'Completed' ? (form.administeredDate || today) : undefined,
        nextDoseDate: form.nextDoseDate || undefined,
        administeredBy: form.administeredBy || user?.fullName,
        batchNumber: form.batchNumber || undefined,
        createdAt: new Date().toISOString(),
      };
      addVaccination(newVax);
      toast.success('Vaccination record added');
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingVax(null);
  };

  const handleMarkComplete = (id: string) => {
    updateVaccination(id, {
      status: 'Completed',
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: user?.fullName || 'Doctor'
    });
    toast.success('Vaccination marked as completed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Syringe className="h-6 w-6 text-primary" />
            Vaccination Management
          </h1>
          <p className="text-muted-foreground">Track and manage student vaccinations — add records, mark completed, edit due dates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingVax(null); setForm(emptyForm); }}>
          <Button onClick={() => { openAdd(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add vaccination
          </Button>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVax ? 'Edit vaccination' : 'Add vaccination record'}</DialogTitle>
              <DialogDescription>
                {editingVax ? 'Update vaccine details, status, and dates.' : 'Record a vaccine given or schedule one due later.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingVax && (
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={form.studentId} onValueChange={(v) => setForm(f => ({ ...f, studentId: v }))} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} — {s.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Vaccine name</Label>
                <Select value={form.vaccineName} onValueChange={(v) => setForm(f => ({ ...f, vaccineName: v }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vaccine" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_VACCINES.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.vaccineName === 'Other' && (
                  <Input
                    placeholder="Enter vaccine name"
                    value={form.vaccineType}
                    onChange={(e) => setForm(f => ({ ...f, vaccineType: e.target.value }))}
                    className="mt-2"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dose number</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.doseNumber}
                    onChange={(e) => setForm(f => ({ ...f, doseNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: 'Completed' | 'Pending' | 'Overdue') => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending (to take)</SelectItem>
                      <SelectItem value="Completed">Completed (taken)</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Administered date (if taken)</Label>
                  <Input
                    type="date"
                    value={form.administeredDate}
                    onChange={(e) => setForm(f => ({ ...f, administeredDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next dose due date</Label>
                  <Input
                    type="date"
                    value={form.nextDoseDate}
                    onChange={(e) => setForm(f => ({ ...f, nextDoseDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Administered by (optional)</Label>
                <Input
                  placeholder="Doctor or nurse name"
                  value={form.administeredBy}
                  onChange={(e) => setForm(f => ({ ...f, administeredBy: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Batch number (optional)</Label>
                <Input
                  placeholder="Batch #"
                  value={form.batchNumber}
                  onChange={(e) => setForm(f => ({ ...f, batchNumber: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingVax ? 'Update' : 'Add record'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                      <div className="flex items-center gap-2">
                        {vax.status !== 'Completed' && (
                          <Button size="sm" onClick={() => handleMarkComplete(vax.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openEdit(vax)}>
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
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
