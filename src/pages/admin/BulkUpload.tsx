import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, Download, FileSpreadsheet, CheckCircle, 
  XCircle, AlertCircle, ArrowLeft, FileCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Student, BloodGroup } from '@/types';
import Papa from 'papaparse';

interface CSVRow {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  class: string;
  section: string;
  admissionDate: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelationship?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  data: CSVRow;
}

export default function BulkUpload() {
  const navigate = useNavigate();
  const { addStudent, addEmergencyContact } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'validate' | 'import' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [validRows, setValidRows] = useState<CSVRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  // Download CSV template
  const downloadTemplate = () => {
    const template: CSVRow = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      class: '10',
      section: 'A',
      admissionDate: '2024-04-01',
      parentName: 'Jane Doe',
      parentPhone: '+91-9876543210',
      parentEmail: 'parent@email.com',
      parentRelationship: 'Father',
    };

    const csv = Papa.unparse([template], {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded. Fill it with student data.',
    });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  // Parse CSV file
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[];
        setCsvData(data);
        validateData(data);
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: `Failed to parse CSV: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  // Validate CSV data
  const validateData = (data: CSVRow[]) => {
    const validationErrors: ValidationError[] = [];
    const valid: CSVRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because header is row 1, and arrays are 0-indexed
      let hasError = false;

      // Required fields validation
      if (!row.firstName || row.firstName.trim() === '') {
        validationErrors.push({
          row: rowNum,
          field: 'firstName',
          message: 'First name is required',
          data: row,
        });
        hasError = true;
      }

      if (!row.lastName || row.lastName.trim() === '') {
        validationErrors.push({
          row: rowNum,
          field: 'lastName',
          message: 'Last name is required',
          data: row,
        });
        hasError = true;
      }

      if (!row.dateOfBirth) {
        validationErrors.push({
          row: rowNum,
          field: 'dateOfBirth',
          message: 'Date of birth is required (format: YYYY-MM-DD)',
          data: row,
        });
        hasError = true;
      } else {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.dateOfBirth)) {
          validationErrors.push({
            row: rowNum,
            field: 'dateOfBirth',
            message: 'Invalid date format. Use YYYY-MM-DD',
            data: row,
          });
          hasError = true;
        }
      }

      if (!row.gender || !genders.includes(row.gender)) {
        validationErrors.push({
          row: rowNum,
          field: 'gender',
          message: `Gender must be one of: ${genders.join(', ')}`,
          data: row,
        });
        hasError = true;
      }

      if (!row.bloodGroup || !bloodGroups.includes(row.bloodGroup as BloodGroup)) {
        validationErrors.push({
          row: rowNum,
          field: 'bloodGroup',
          message: `Blood group must be one of: ${bloodGroups.join(', ')}`,
          data: row,
        });
        hasError = true;
      }

      if (!row.class || !classes.includes(row.class)) {
        validationErrors.push({
          row: rowNum,
          field: 'class',
          message: `Class must be one of: ${classes.join(', ')}`,
          data: row,
        });
        hasError = true;
      }

      if (!row.section || !sections.includes(row.section)) {
        validationErrors.push({
          row: rowNum,
          field: 'section',
          message: `Section must be one of: ${sections.join(', ')}`,
          data: row,
        });
        hasError = true;
      }

      if (!row.admissionDate) {
        validationErrors.push({
          row: rowNum,
          field: 'admissionDate',
          message: 'Admission date is required (format: YYYY-MM-DD)',
          data: row,
        });
        hasError = true;
      }

      if (!hasError) {
        valid.push(row);
      }
    });

    setErrors(validationErrors);
    setValidRows(valid);
    setStep('validate');
  };

  // Download error report
  const downloadErrorReport = () => {
    const errorData = errors.map(err => ({
      Row: err.row,
      Field: err.field,
      Error: err.message,
      ...err.data,
    }));

    const csv = Papa.unparse(errorData, {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'upload_errors.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import valid students
  const handleImport = async () => {
    setStep('import');
    setImportProgress(0);
    setImportedCount(0);

    let imported = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      try {
        // Generate student ID and roll number
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const studentId = `SCH${year}-${random}`;
        const rollNumber = `${row.class}${row.section}-${String(i + 1).padStart(2, '0')}`;

        // Create student
        const newStudent: Student = {
          id: `STU-${Date.now()}-${i}`,
          rollNumber,
          studentId,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          dateOfBirth: row.dateOfBirth,
          gender: row.gender as 'Male' | 'Female' | 'Other',
          bloodGroup: row.bloodGroup as BloodGroup,
          class: row.class,
          section: row.section,
          admissionDate: row.admissionDate,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.firstName}${row.lastName}`,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };

        addStudent(newStudent);

        // Add emergency contact if provided
        if (row.parentName && row.parentPhone) {
          addEmergencyContact({
            id: `EC-${Date.now()}-${i}`,
            studentId: newStudent.id,
            contactName: row.parentName.trim(),
            relationship: row.parentRelationship || 'Parent',
            phonePrimary: row.parentPhone.trim(),
            email: row.parentEmail?.trim(),
            isPrimary: true,
            createdAt: new Date().toISOString(),
          });
        }

        imported++;
        setImportedCount(imported);
        setImportProgress((imported / validRows.length) * 100);
      } catch (error) {
        console.error(`Error importing row ${i + 1}:`, error);
      }

      // Small delay for UI update
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setStep('complete');
    toast({
      title: 'Import Complete',
      description: `Successfully imported ${imported} students`,
    });
  };

  const resetUpload = () => {
    setFile(null);
    setCsvData([]);
    setErrors([]);
    setValidRows([]);
    setStep('upload');
    setImportProgress(0);
    setImportedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Upload Students</h1>
          <p className="text-muted-foreground">Upload multiple students via CSV file</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>

      {/* Step 1: Download Template / Upload */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Step 1: Download Template
              </CardTitle>
              <CardDescription>
                Download the CSV template with sample data and required columns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  The template includes all required fields and sample data. Fill it with your student information.
                </AlertDescription>
              </Alert>
              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 2: Upload CSV
              </CardTitle>
              <CardDescription>
                Select your filled CSV file to upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Validation Results */}
      {step === 'validate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Validation Results
            </CardTitle>
            <CardDescription>
              Review validation results before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold text-primary">{csvData.length}</p>
                <p className="text-sm text-muted-foreground">Total Rows</p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-green-50 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-600">{validRows.length}</p>
                <p className="text-sm text-muted-foreground">Valid Rows</p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{errors.length}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.length} row(s) have validation errors. Please fix them or download the error report.
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Validation Errors</h3>
                  <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Report
                  </Button>
                </div>
                <div className="max-h-64 overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Student Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.slice(0, 20).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{error.field}</Badge>
                          </TableCell>
                          <TableCell className="text-red-600">{error.message}</TableCell>
                          <TableCell>
                            {error.data.firstName} {error.data.lastName}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {errors.length > 20 && (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      Showing first 20 errors. Download error report to see all.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button variant="outline" onClick={resetUpload}>
                Upload New File
              </Button>
              {validRows.length > 0 && (
                <Button onClick={handleImport} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import {validRows.length} Valid Student{validRows.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Import Progress */}
      {step === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Students</CardTitle>
            <CardDescription>Please wait while students are being imported...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{importedCount} / {validRows.length}</span>
              </div>
              <Progress value={importProgress} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Importing student {importedCount} of {validRows.length}...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Import Complete
            </CardTitle>
            <CardDescription>
              Students have been successfully imported
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully imported {importedCount} student{importedCount > 1 ? 's' : ''} into the system.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/admin/students')} className="flex-1">
                View All Students
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Upload More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

