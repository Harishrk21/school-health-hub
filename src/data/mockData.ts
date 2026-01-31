import { 
  User, Student, HealthRecord, MedicalCondition, Allergy, 
  EmergencyContact, Vaccination, VisionTest, Alert, Message,
  BloodRequest, Appointment, BloodGroup
} from '@/types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'doc-001',
    email: 'doctor@shis.com',
    role: 'doctor',
    fullName: 'Dr. Rajesh Kumar',
    phone: '+91 98765 43210',
    organization: 'City Public School',
    specialization: 'Pediatrics',
    licenseNumber: 'MCI-2015-12345',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'admin-001',
    email: 'admin@shis.com',
    role: 'school_admin',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43211',
    organization: 'City Public School',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'blood-001',
    email: 'bloodbank@shis.com',
    role: 'blood_bank',
    fullName: 'Red Cross Blood Bank',
    phone: '+91 98765 43212',
    organization: 'Red Cross Society',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'parent-001',
    email: 'parent@shis.com',
    role: 'parent',
    fullName: 'Sunita Verma',
    phone: '+91 98765 43213',
    linkedStudentIds: ['STU-001', 'STU-002'],
    isActive: true,
    createdAt: '2024-01-01'
  }
];

// Indian first names
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Ananya', 'Diya', 'Priya', 'Isha', 'Kavya', 'Meera', 'Riya', 'Saanvi',
  'Rohan', 'Karthik', 'Pranav', 'Ishaan', 'Advait', 'Dhruv', 'Kabir', 'Krishna',
  'Aanya', 'Aisha', 'Avni', 'Kiara', 'Myra', 'Navya', 'Pari', 'Sara'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Nair',
  'Iyer', 'Menon', 'Joshi', 'Desai', 'Shah', 'Mehta', 'Agarwal', 'Banerjee'
];

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D'];

// Generate 50 students
export const mockStudents: Student[] = Array.from({ length: 50 }, (_, i) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const classNum = classes[Math.floor(Math.random() * classes.length)];
  const section = sections[Math.floor(Math.random() * sections.length)];
  const year = 2020 + Math.floor(Math.random() * 5);
  const birthYear = 2024 - (parseInt(classNum) + 5);
  
  return {
    id: `STU-${String(i + 1).padStart(3, '0')}`,
    rollNumber: `${classNum}${section}-${String(i + 1).padStart(3, '0')}`,
    studentId: `SCH${year}-${String(i + 1).padStart(3, '0')}`,
    firstName,
    lastName,
    dateOfBirth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
    class: classNum,
    section,
    admissionDate: `${year}-04-01`,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
    createdAt: `${year}-04-01`,
    updatedAt: new Date().toISOString().split('T')[0]
  };
});

// Generate health records
const bmiCategories: ('Underweight' | 'Normal' | 'Overweight' | 'Obese')[] = ['Underweight', 'Normal', 'Overweight', 'Obese'];

export const mockHealthRecords: HealthRecord[] = mockStudents.flatMap(student => {
  const numRecords = Math.floor(Math.random() * 3) + 1;
  return Array.from({ length: numRecords }, (_, i) => {
    const height = 100 + Math.random() * 80;
    const weight = 20 + Math.random() * 50;
    const bmi = weight / ((height / 100) ** 2);
    let bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';
    
    const months = ['01', '04', '07', '10'];
    const year = 2024 - Math.floor(i / 2);
    
    return {
      id: generateId(),
      studentId: student.id,
      doctorId: 'doc-001',
      checkupDate: `${year}-${months[i % 4]}-15`,
      height: Math.round(height * 10) / 10,
      weight: Math.round(weight * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      bloodPressure: `${100 + Math.floor(Math.random() * 30)}/${60 + Math.floor(Math.random() * 20)}`,
      temperature: Math.round((36 + Math.random() * 2) * 10) / 10,
      pulseRate: 60 + Math.floor(Math.random() * 40),
      notes: 'Regular checkup completed. Student appears healthy.',
      nextCheckupDate: `${year + 1}-${months[(i + 1) % 4]}-15`,
      createdAt: `${year}-${months[i % 4]}-15`
    };
  });
});

// Medical conditions for some students
const conditions = ['Asthma', 'Diabetes Type 1', 'Epilepsy', 'ADHD', 'Eczema', 'Migraine'];
export const mockMedicalConditions: MedicalCondition[] = mockStudents
  .filter(() => Math.random() > 0.7)
  .map(student => ({
    id: generateId(),
    studentId: student.id,
    conditionName: conditions[Math.floor(Math.random() * conditions.length)],
    diagnosisDate: '2023-01-15',
    severity: (['Mild', 'Moderate', 'Severe'] as const)[Math.floor(Math.random() * 3)],
    notes: 'Under medication, regular monitoring required.',
    isActive: true,
    createdAt: '2023-01-15'
  }));

// Allergies for some students
const allergyTypes: ('Food' | 'Drug' | 'Environmental')[] = ['Food', 'Drug', 'Environmental'];
const allergens = {
  Food: ['Peanuts', 'Milk', 'Eggs', 'Shellfish', 'Wheat', 'Soy'],
  Drug: ['Penicillin', 'Aspirin', 'Ibuprofen', 'Sulfa drugs'],
  Environmental: ['Pollen', 'Dust mites', 'Pet dander', 'Mold']
};

export const mockAllergies: Allergy[] = mockStudents
  .filter(() => Math.random() > 0.75)
  .map(student => {
    const type = allergyTypes[Math.floor(Math.random() * allergyTypes.length)];
    const allergenList = allergens[type];
    return {
      id: generateId(),
      studentId: student.id,
      allergyType: type,
      allergen: allergenList[Math.floor(Math.random() * allergenList.length)],
      reaction: 'Rash, swelling, difficulty breathing',
      severity: (['Mild', 'Moderate', 'Severe', 'Life-threatening'] as const)[Math.floor(Math.random() * 4)],
      createdAt: '2023-01-01'
    };
  });

// Emergency contacts
export const mockEmergencyContacts: EmergencyContact[] = mockStudents.flatMap(student => [
  {
    id: generateId(),
    studentId: student.id,
    contactName: `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${student.lastName}`,
    relationship: 'Father',
    phonePrimary: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    phoneSecondary: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    email: `parent.${student.lastName.toLowerCase()}@email.com`,
    address: '123 Main Street, City',
    isPrimary: true,
    createdAt: student.createdAt
  },
  {
    id: generateId(),
    studentId: student.id,
    contactName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${student.lastName}`,
    relationship: 'Mother',
    phonePrimary: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    email: `mother.${student.lastName.toLowerCase()}@email.com`,
    isPrimary: false,
    createdAt: student.createdAt
  }
]);

// Vaccinations
const vaccinesList = [
  { name: 'MMR', type: 'Measles, Mumps, Rubella', doses: 2 },
  { name: 'Tdap', type: 'Tetanus, Diphtheria, Pertussis', doses: 1 },
  { name: 'Polio', type: 'Inactivated Poliovirus', doses: 4 },
  { name: 'Hepatitis B', type: 'Hepatitis B', doses: 3 },
  { name: 'Varicella', type: 'Chickenpox', doses: 2 },
  { name: 'HPV', type: 'Human Papillomavirus', doses: 2 }
];

export const mockVaccinations: Vaccination[] = mockStudents.flatMap(student => 
  vaccinesList.map(vaccine => {
    const status = Math.random() > 0.3 ? 'Completed' : (Math.random() > 0.5 ? 'Pending' : 'Overdue');
    return {
      id: generateId(),
      studentId: student.id,
      vaccineName: vaccine.name,
      vaccineType: vaccine.type,
      doseNumber: status === 'Completed' ? vaccine.doses : Math.floor(Math.random() * vaccine.doses) + 1,
      administeredDate: status === 'Completed' ? '2023-06-15' : undefined,
      nextDoseDate: status !== 'Completed' ? '2026-03-15' : undefined,
      administeredBy: status === 'Completed' ? 'Dr. Rajesh Kumar' : undefined,
      batchNumber: status === 'Completed' ? `BATCH-${Math.floor(Math.random() * 10000)}` : undefined,
      status,
      createdAt: '2023-01-01'
    };
  })
);

// Vision tests
export const mockVisionTests: VisionTest[] = mockStudents.map(student => {
  const passed = Math.random() > 0.2;
  return {
    id: generateId(),
    studentId: student.id,
    testDate: '2025-01-15',
    leftEyeVision: passed ? '20/20' : `20/${20 + Math.floor(Math.random() * 40)}`,
    rightEyeVision: passed ? '20/20' : `20/${20 + Math.floor(Math.random() * 40)}`,
    result: passed ? 'Passed' : 'Failed',
    requiresGlasses: !passed,
    notes: passed ? 'Vision is normal.' : 'Recommended to consult an ophthalmologist.',
    createdAt: '2025-01-15'
  };
});

// Alerts
export const mockAlerts: Alert[] = [
  {
    id: generateId(),
    studentId: 'STU-001',
    alertType: 'Vaccination Due',
    severity: 'Medium',
    message: 'Tdap booster vaccination is due next week.',
    isRead: false,
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: generateId(),
    studentId: 'STU-003',
    alertType: 'Medical Emergency',
    severity: 'High',
    message: 'Student reported breathing difficulty. Asthma attack suspected.',
    isRead: false,
    createdBy: 'doc-001',
    createdAt: new Date().toISOString()
  },
  {
    id: generateId(),
    studentId: 'STU-005',
    alertType: 'Checkup Reminder',
    severity: 'Low',
    message: 'Annual health checkup is due.',
    isRead: true,
    createdBy: 'system',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Messages
export const mockMessages: Message[] = [
  {
    id: generateId(),
    senderId: 'parent-001',
    recipientId: 'doc-001',
    subject: 'Query about vaccination schedule',
    message: 'Dear Dr. Kumar, I wanted to know about the upcoming vaccination schedule for my child. When is the next dose due?',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: generateId(),
    senderId: 'doc-001',
    recipientId: 'parent-001',
    subject: 'Re: Query about vaccination schedule',
    message: 'Dear Mrs. Verma, The next Tdap booster is due on March 15, 2026. Please ensure your child is available on that date.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: generateId(),
    senderId: 'admin-001',
    recipientId: 'doc-001',
    subject: 'Health camp next month',
    message: 'We are planning a health camp for all students next month. Please confirm your availability.',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Blood requests
export const mockBloodRequests: BloodRequest[] = [
  {
    id: generateId(),
    bloodGroup: 'O+',
    unitsRequired: 3,
    urgency: 'Urgent',
    requestedBy: 'blood-001',
    hospitalName: 'City General Hospital',
    contactNumber: '+91 98765 00001',
    status: 'Pending',
    requestedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    bloodGroup: 'B-',
    unitsRequired: 2,
    urgency: 'Critical',
    requestedBy: 'blood-001',
    hospitalName: 'Apollo Hospital',
    contactNumber: '+91 98765 00002',
    status: 'Fulfilled',
    requestedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    fulfilledAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Appointments
export const mockAppointments: Appointment[] = mockStudents.slice(0, 15).map((student, i) => ({
  id: generateId(),
  studentId: student.id,
  doctorId: 'doc-001',
  appointmentDate: new Date(Date.now() + 86400000 * i).toISOString(),
  appointmentType: (['Regular Checkup', 'Follow-up', 'Vaccination'] as const)[i % 3],
  status: i < 5 ? 'Scheduled' : (i < 10 ? 'Completed' : 'Scheduled'),
  notes: 'Regular checkup appointment',
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
}));

// Helper functions
export const getStudentById = (id: string) => mockStudents.find(s => s.id === id);
export const getHealthRecordsByStudent = (studentId: string) => mockHealthRecords.filter(r => r.studentId === studentId);
export const getMedicalConditionsByStudent = (studentId: string) => mockMedicalConditions.filter(c => c.studentId === studentId);
export const getAllergiesByStudent = (studentId: string) => mockAllergies.filter(a => a.studentId === studentId);
export const getEmergencyContactsByStudent = (studentId: string) => mockEmergencyContacts.filter(c => c.studentId === studentId);
export const getVaccinationsByStudent = (studentId: string) => mockVaccinations.filter(v => v.studentId === studentId);
export const getVisionTestsByStudent = (studentId: string) => mockVisionTests.filter(v => v.studentId === studentId);
export const getAppointmentsByDoctor = (doctorId: string) => mockAppointments.filter(a => a.doctorId === doctorId);
export const getTodayAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockAppointments.filter(a => a.appointmentDate.startsWith(today) && a.status === 'Scheduled');
};

// Blood group statistics
export const getBloodGroupStats = () => {
  const stats: Record<BloodGroup, number> = {
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  };
  mockStudents.forEach(s => stats[s.bloodGroup]++);
  return stats;
};

// BMI statistics
export const getBMIStats = () => {
  const stats = { Underweight: 0, Normal: 0, Overweight: 0, Obese: 0 };
  const latestRecords = new Map<string, HealthRecord>();
  mockHealthRecords.forEach(r => {
    const existing = latestRecords.get(r.studentId);
    if (!existing || new Date(r.checkupDate) > new Date(existing.checkupDate)) {
      latestRecords.set(r.studentId, r);
    }
  });
  latestRecords.forEach(r => stats[r.bmiCategory]++);
  return stats;
};

// Vaccination stats
export const getVaccinationStats = () => {
  const stats = { Completed: 0, Pending: 0, Overdue: 0 };
  mockVaccinations.forEach(v => stats[v.status]++);
  return stats;
};

// Vision test stats
export const getVisionTestStats = () => {
  const stats = { Passed: 0, Failed: 0 };
  mockVisionTests.forEach(v => stats[v.result]++);
  return stats;
};
