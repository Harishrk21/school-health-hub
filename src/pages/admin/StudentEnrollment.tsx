import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, ArrowRight, Check, User, Heart, Phone, 
  Upload, Calendar, Droplets, GraduationCap, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Student, BloodGroup, EmergencyContact, MedicalCondition, Allergy } from '@/types';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  class: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
});

const medicalInfoSchema = z.object({
  hasMedicalConditions: z.boolean().optional(),
  medicalConditions: z.array(z.object({
    conditionName: z.string(),
    diagnosisDate: z.string(),
    severity: z.enum(['Mild', 'Moderate', 'Severe']),
    notes: z.string().optional(),
  })).optional(),
  hasAllergies: z.boolean().optional(),
  allergies: z.array(z.object({
    allergyType: z.enum(['Food', 'Drug', 'Environmental']),
    allergen: z.string(),
    reaction: z.string(),
    severity: z.enum(['Mild', 'Moderate', 'Severe', 'Life-threatening']),
  })).optional(),
});

const emergencyContactSchema = z.object({
  primaryContact: z.object({
    contactName: z.string().min(2, 'Contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phonePrimary: z.string().min(10, 'Phone number is required'),
    phoneSecondary: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
  secondaryContact: z.object({
    contactName: z.string().optional(),
    relationship: z.string().optional(),
    phonePrimary: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
  }).optional(),
});

// Combined schema for full form validation
const fullFormSchema = personalInfoSchema
  .merge(medicalInfoSchema)
  .merge(emergencyContactSchema);

type FormData = z.infer<typeof fullFormSchema>;

const STEPS = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Medical Information', icon: Heart },
  { id: 3, title: 'Emergency Contacts', icon: Phone },
  { id: 4, title: 'Review & Submit', icon: Check },
];

export default function StudentEnrollment() {
  const navigate = useNavigate();
  const { addStudent, addMedicalCondition, addAllergy, addEmergencyContact } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: 'O+',
      class: '',
      section: 'A',
      admissionDate: new Date().toISOString().split('T')[0],
      hasMedicalConditions: false,
      medicalConditions: [],
      hasAllergies: false,
      allergies: [],
      primaryContact: {
        contactName: '',
        relationship: 'Father',
        phonePrimary: '',
        phoneSecondary: '',
        email: '',
        address: '',
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = form;
  const hasMedicalConditions = watch('hasMedicalConditions');
  const hasAllergies = watch('hasAllergies');
  const medicalConditions = watch('medicalConditions') || [];
  const allergies = watch('allergies') || [];

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup', 'class', 'section', 'admissionDate']);
    } else if (currentStep === 2) {
      isValid = true; // Medical info is optional
    } else if (currentStep === 3) {
      isValid = await trigger(['primaryContact']);
    }

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateStudentId = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SCH${year}-${random}`;
  };

  const generateRollNumber = (classNum: string, section: string): string => {
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${classNum}${section}-${random}`;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Validate all required fields before submission
      const isPersonalValid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'gender', 'bloodGroup', 'class', 'section', 'admissionDate']);
      const isEmergencyValid = await trigger(['primaryContact']);
      
      if (!isPersonalValid || !isEmergencyValid) {
        toast.error('Please fill in all required fields before submitting.');
        // Navigate to first invalid step
        if (!isPersonalValid) {
          setCurrentStep(1);
        } else if (!isEmergencyValid) {
          setCurrentStep(3);
        }
        return;
      }

      // Generate student ID and roll number
      const studentId = generateStudentId();
      const rollNumber = generateRollNumber(data.class, data.section);

      // Create student
      const newStudent: Student = {
        id: `STU-${Date.now()}`,
        rollNumber,
        studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup as BloodGroup,
        class: data.class,
        section: data.section,
        admissionDate: data.admissionDate,
        profileImage: profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}${data.lastName}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      addStudent(newStudent);

      // Add medical conditions
      if (data.medicalConditions && data.medicalConditions.length > 0) {
        data.medicalConditions.forEach(condition => {
          const newCondition: MedicalCondition = {
            id: `MC-${Date.now()}-${Math.random()}`,
            studentId: newStudent.id,
            conditionName: condition.conditionName,
            diagnosisDate: condition.diagnosisDate,
            severity: condition.severity,
            notes: condition.notes,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          addMedicalCondition(newCondition);
        });
      }

      // Add allergies
      if (data.allergies && data.allergies.length > 0) {
        data.allergies.forEach(allergy => {
          const newAllergy: Allergy = {
            id: `ALG-${Date.now()}-${Math.random()}`,
            studentId: newStudent.id,
            allergyType: allergy.allergyType,
            allergen: allergy.allergen,
            reaction: allergy.reaction,
            severity: allergy.severity,
            createdAt: new Date().toISOString(),
          };
          addAllergy(newAllergy);
        });
      }

      // Add emergency contacts
      const primaryContact: EmergencyContact = {
        id: `EC-${Date.now()}-1`,
        studentId: newStudent.id,
        contactName: data.primaryContact.contactName,
        relationship: data.primaryContact.relationship,
        phonePrimary: data.primaryContact.phonePrimary,
        phoneSecondary: data.primaryContact.phoneSecondary,
        email: data.primaryContact.email,
        address: data.primaryContact.address,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      };
      addEmergencyContact(primaryContact);

      if (data.secondaryContact?.contactName) {
        const secondaryContact: EmergencyContact = {
          id: `EC-${Date.now()}-2`,
          studentId: newStudent.id,
          contactName: data.secondaryContact.contactName,
          relationship: data.secondaryContact.relationship || 'Mother',
          phonePrimary: data.secondaryContact.phonePrimary || '',
          email: data.secondaryContact.email,
          isPrimary: false,
          createdAt: new Date().toISOString(),
        };
        addEmergencyContact(secondaryContact);
      }

      toast.success(`${newStudent.firstName} ${newStudent.lastName} has been enrolled with ID ${studentId}`);

      navigate(`/admin/students/${newStudent.id}`);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(`Failed to enroll student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addMedicalConditionField = () => {
    const current = medicalConditions || [];
    setValue('medicalConditions', [
      ...current,
      { conditionName: '', diagnosisDate: new Date().toISOString().split('T')[0], severity: 'Mild', notes: '' }
    ]);
  };

  const removeMedicalCondition = (index: number) => {
    const current = medicalConditions || [];
    setValue('medicalConditions', current.filter((_, i) => i !== index));
  };

  const addAllergyField = () => {
    const current = allergies || [];
    setValue('allergies', [
      ...current,
      { allergyType: 'Food', allergen: '', reaction: '', severity: 'Mild' }
    ]);
  };

  const removeAllergy = (index: number) => {
    const current = allergies || [];
    setValue('allergies', current.filter((_, i) => i !== index));
  };

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enroll New Student</h1>
          <p className="text-muted-foreground">Multi-step registration form</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStep} of {STEPS.length}</span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
            <div className="flex items-center justify-between mt-4">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${!isActive && !isCompleted ? 'border-muted bg-muted text-muted-foreground' : ''}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error('Form validation errors:', errors);
        toast.error('Please fix the validation errors before submitting.');
        // Navigate to first step with errors
        if (errors.firstName || errors.lastName || errors.dateOfBirth || errors.gender || errors.bloodGroup || errors.class || errors.section || errors.admissionDate) {
          setCurrentStep(1);
        } else if (errors.primaryContact) {
          setCurrentStep(3);
        }
      })}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter the student\'s basic personal information'}
              {currentStep === 2 && 'Record any medical conditions or allergies (optional)'}
              {currentStep === 3 && 'Add emergency contact information'}
              {currentStep === 4 && 'Review all information before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={watch('gender')}
                      onValueChange={(value) => setValue('gender', value as 'Male' | 'Female' | 'Other')}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                    <Select
                      value={watch('bloodGroup')}
                      onValueChange={(value) => setValue('bloodGroup', value as BloodGroup)}
                    >
                      <SelectTrigger id="bloodGroup">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={watch('class')}
                      onValueChange={(value) => setValue('class', value)}
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c} value={c}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.class && (
                      <p className="text-sm text-destructive">{errors.class.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section *</Label>
                    <Select
                      value={watch('section')}
                      onValueChange={(value) => setValue('section', value)}
                    >
                      <SelectTrigger id="section">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(s => (
                          <SelectItem key={s} value={s}>Section {s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    {...register('admissionDate')}
                  />
                  {errors.admissionDate && (
                    <p className="text-sm text-destructive">{errors.admissionDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Photo (Optional)</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Medical Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Medical information is optional but highly recommended for emergency situations.
                  </AlertDescription>
                </Alert>

                {/* Medical Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasMedicalConditions"
                      checked={hasMedicalConditions}
                      onCheckedChange={(checked) => {
                        setValue('hasMedicalConditions', checked as boolean);
                        if (!checked) {
                          setValue('medicalConditions', []);
                        }
                      }}
                    />
                    <Label htmlFor="hasMedicalConditions" className="font-medium">
                      Student has medical conditions
                    </Label>
                  </div>

                  {hasMedicalConditions && (
                    <div className="space-y-4 pl-6 border-l-2">
                      {medicalConditions.map((condition, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Condition {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedicalCondition(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Condition Name</Label>
                                  <Input
                                    value={condition.conditionName}
                                    onChange={(e) => {
                                      const updated = [...medicalConditions];
                                      updated[index].conditionName = e.target.value;
                                      setValue('medicalConditions', updated);
                                    }}
                                    placeholder="e.g., Asthma, Diabetes"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Diagnosis Date</Label>
                                  <Input
                                    type="date"
                                    value={condition.diagnosisDate}
                                    onChange={(e) => {
                                      const updated = [...medicalConditions];
                                      updated[index].diagnosisDate = e.target.value;
                                      setValue('medicalConditions', updated);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Severity</Label>
                                  <Select
                                    value={condition.severity}
                                    onValueChange={(value) => {
                                      const updated = [...medicalConditions];
                                      updated[index].severity = value as 'Mild' | 'Moderate' | 'Severe';
                                      setValue('medicalConditions', updated);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Mild">Mild</SelectItem>
                                      <SelectItem value="Moderate">Moderate</SelectItem>
                                      <SelectItem value="Severe">Severe</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Notes (Optional)</Label>
                                  <Input
                                    value={condition.notes || ''}
                                    onChange={(e) => {
                                      const updated = [...medicalConditions];
                                      updated[index].notes = e.target.value;
                                      setValue('medicalConditions', updated);
                                    }}
                                    placeholder="Additional notes"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addMedicalConditionField}
                      >
                        + Add Another Condition
                      </Button>
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAllergies"
                      checked={hasAllergies}
                      onCheckedChange={(checked) => {
                        setValue('hasAllergies', checked as boolean);
                        if (!checked) {
                          setValue('allergies', []);
                        }
                      }}
                    />
                    <Label htmlFor="hasAllergies" className="font-medium">
                      Student has allergies
                    </Label>
                  </div>

                  {hasAllergies && (
                    <div className="space-y-4 pl-6 border-l-2">
                      {allergies.map((allergy, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Allergy {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAllergy(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Allergy Type</Label>
                                  <Select
                                    value={allergy.allergyType}
                                    onValueChange={(value) => {
                                      const updated = [...allergies];
                                      updated[index].allergyType = value as 'Food' | 'Drug' | 'Environmental';
                                      setValue('allergies', updated);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Food">Food</SelectItem>
                                      <SelectItem value="Drug">Drug</SelectItem>
                                      <SelectItem value="Environmental">Environmental</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Allergen</Label>
                                  <Input
                                    value={allergy.allergen}
                                    onChange={(e) => {
                                      const updated = [...allergies];
                                      updated[index].allergen = e.target.value;
                                      setValue('allergies', updated);
                                    }}
                                    placeholder="e.g., Peanuts, Penicillin"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Reaction</Label>
                                  <Input
                                    value={allergy.reaction}
                                    onChange={(e) => {
                                      const updated = [...allergies];
                                      updated[index].reaction = e.target.value;
                                      setValue('allergies', updated);
                                    }}
                                    placeholder="e.g., Rash, Difficulty breathing"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Severity</Label>
                                  <Select
                                    value={allergy.severity}
                                    onValueChange={(value) => {
                                      const updated = [...allergies];
                                      updated[index].severity = value as 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
                                      setValue('allergies', updated);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Mild">Mild</SelectItem>
                                      <SelectItem value="Moderate">Moderate</SelectItem>
                                      <SelectItem value="Severe">Severe</SelectItem>
                                      <SelectItem value="Life-threatening">Life-threatening</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAllergyField}
                      >
                        + Add Another Allergy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contacts */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Alert>
                  <Phone className="h-4 w-4" />
                  <AlertDescription>
                    At least one emergency contact is required. Primary contact will be used in emergency situations.
                  </AlertDescription>
                </Alert>

                {/* Primary Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Primary Emergency Contact *</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactName">Contact Name *</Label>
                      <Input
                        id="primaryContactName"
                        {...register('primaryContact.contactName')}
                        placeholder="Full name"
                      />
                      {errors.primaryContact?.contactName && (
                        <p className="text-sm text-destructive">{errors.primaryContact.contactName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryRelationship">Relationship *</Label>
                      <Select
                        value={watch('primaryContact.relationship')}
                        onValueChange={(value) => setValue('primaryContact.relationship', value)}
                      >
                        <SelectTrigger id="primaryRelationship">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">Primary Phone *</Label>
                      <Input
                        id="primaryPhone"
                        {...register('primaryContact.phonePrimary')}
                        placeholder="+91 98765 43210"
                      />
                      {errors.primaryContact?.phonePrimary && (
                        <p className="text-sm text-destructive">{errors.primaryContact.phonePrimary.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhoneSecondary">Secondary Phone</Label>
                      <Input
                        id="primaryPhoneSecondary"
                        {...register('primaryContact.phoneSecondary')}
                        placeholder="+91 98765 43211"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryEmail">Email</Label>
                      <Input
                        id="primaryEmail"
                        type="email"
                        {...register('primaryContact.email')}
                        placeholder="contact@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryAddress">Address</Label>
                      <Input
                        id="primaryAddress"
                        {...register('primaryContact.address')}
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Contact (Optional) */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Secondary Emergency Contact (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactName">Contact Name</Label>
                      <Input
                        id="secondaryContactName"
                        {...register('secondaryContact.contactName')}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryRelationship">Relationship</Label>
                      <Select
                        value={watch('secondaryContact.relationship') || 'Mother'}
                        onValueChange={(value) => setValue('secondaryContact.relationship', value)}
                      >
                        <SelectTrigger id="secondaryRelationship">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPhone">Phone</Label>
                      <Input
                        id="secondaryPhone"
                        {...register('secondaryContact.phonePrimary')}
                        placeholder="+91 98765 43212"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryEmail">Email</Label>
                      <Input
                        id="secondaryEmail"
                        type="email"
                        {...register('secondaryContact.email')}
                        placeholder="contact@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information carefully before submitting. You can go back to make changes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {watch('firstName')} {watch('lastName')}</p>
                      <p><span className="font-medium">Date of Birth:</span> {watch('dateOfBirth')}</p>
                      <p><span className="font-medium">Gender:</span> {watch('gender')}</p>
                      <p><span className="font-medium">Blood Group:</span> {watch('bloodGroup')}</p>
                      <p><span className="font-medium">Class:</span> {watch('class')} - Section {watch('section')}</p>
                      <p><span className="font-medium">Admission Date:</span> {watch('admissionDate')}</p>
                    </div>
                  </div>

                  {hasMedicalConditions && medicalConditions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Medical Conditions</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                        {medicalConditions.map((condition, index) => (
                          <p key={index}>
                            <span className="font-medium">{condition.conditionName}</span> - {condition.severity}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasAllergies && allergies.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Allergies</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                        {allergies.map((allergy, index) => (
                          <p key={index}>
                            <span className="font-medium">{allergy.allergen}</span> ({allergy.allergyType}) - {allergy.severity}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Emergency Contacts</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p><span className="font-medium">Primary:</span> {watch('primaryContact.contactName')} ({watch('primaryContact.relationship')})</p>
                      <p><span className="font-medium">Phone:</span> {watch('primaryContact.phonePrimary')}</p>
                      {watch('secondaryContact.contactName') && (
                        <>
                          <p className="mt-2"><span className="font-medium">Secondary:</span> {watch('secondaryContact.contactName')}</p>
                          <p><span className="font-medium">Phone:</span> {watch('secondaryContact.phonePrimary')}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  Enroll Student
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

