// User Types
export type UserRole = 'doctor' | 'school_admin' | 'blood_bank' | 'parent';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  organization?: string;
  specialization?: string;
  licenseNumber?: string;
  linkedStudentIds?: string[];
  isActive: boolean;
  createdAt: string;
}

// Student Types
export interface Student {
  id: string;
  rollNumber: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  class: string;
  section: string;
  admissionDate: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// Health Records
export interface HealthRecord {
  id: string;
  studentId: string;
  doctorId: string;
  checkupDate: string;
  height: number;
  weight: number;
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  bloodPressure: string;
  temperature: number;
  pulseRate?: number;
  notes: string;
  nextCheckupDate?: string;
  createdAt: string;
}

// Medical Conditions
export interface MedicalCondition {
  id: string;
  studentId: string;
  conditionName: string;
  diagnosisDate: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// Allergies
export interface Allergy {
  id: string;
  studentId: string;
  allergyType: 'Food' | 'Drug' | 'Environmental';
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  createdAt: string;
}

// Emergency Contacts
export interface EmergencyContact {
  id: string;
  studentId: string;
  contactName: string;
  relationship: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
}

// Vaccinations
export interface Vaccination {
  id: string;
  studentId: string;
  vaccineName: string;
  vaccineType: string;
  doseNumber: number;
  administeredDate?: string;
  nextDoseDate?: string;
  administeredBy?: string;
  batchNumber?: string;
  status: 'Completed' | 'Pending' | 'Overdue';
  createdAt: string;
}

// Vision Tests
export interface VisionTest {
  id: string;
  studentId: string;
  testDate: string;
  leftEyeVision: string;
  rightEyeVision: string;
  result: 'Passed' | 'Failed';
  requiresGlasses: boolean;
  notes?: string;
  createdAt: string;
}

// Alerts
export interface Alert {
  id: string;
  studentId: string;
  alertType: 'Medical Emergency' | 'Vaccination Due' | 'Checkup Reminder' | 'Blood Request';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  isRead: boolean;
  createdBy: string;
  createdAt: string;
  resolvedAt?: string;
}

// Messages
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  message: string;
  isRead: boolean;
  parentMessageId?: string;
  createdAt: string;
}

// Blood Requests
export interface BloodRequest {
  id: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  requestedBy: string;
  hospitalName: string;
  contactNumber: string;
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  requestedAt: string;
  fulfilledAt?: string;
}

// Blood Donors
export interface BloodDonor {
  id: string;
  studentId: string;
  bloodGroup: BloodGroup;
  lastDonationDate?: string;
  isEligible: boolean;
  notes?: string;
  createdAt: string;
}

// Appointments
export interface Appointment {
  id: string;
  studentId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentType: 'Regular Checkup' | 'Follow-up' | 'Emergency' | 'Vaccination';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  notes?: string;
  createdAt: string;
}

// Reports
export interface Report {
  id: string;
  studentId: string;
  reportType: 'Health Checkup' | 'Vaccination' | 'Vision Test' | 'Complete Health';
  generatedBy: string;
  reportData: Record<string, unknown>;
  status: 'Draft' | 'Submitted' | 'Approved';
  createdAt: string;
}
