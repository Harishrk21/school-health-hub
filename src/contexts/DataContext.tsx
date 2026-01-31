import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Student, HealthRecord, MedicalCondition, Allergy, EmergencyContact, 
  Vaccination, VisionTest, Alert, Message, BloodRequest, Appointment 
} from '@/types';
import {
  mockStudents, mockHealthRecords, mockMedicalConditions, mockAllergies,
  mockEmergencyContacts, mockVaccinations, mockVisionTests, mockAlerts,
  mockMessages, mockBloodRequests, mockAppointments
} from '@/data/mockData';

interface DataContextType {
  students: Student[];
  healthRecords: HealthRecord[];
  medicalConditions: MedicalCondition[];
  allergies: Allergy[];
  emergencyContacts: EmergencyContact[];
  vaccinations: Vaccination[];
  visionTests: VisionTest[];
  alerts: Alert[];
  messages: Message[];
  bloodRequests: BloodRequest[];
  appointments: Appointment[];
  
  // CRUD operations
  addStudent: (student: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addHealthRecord: (record: HealthRecord) => void;
  addMedicalCondition: (condition: MedicalCondition) => void;
  addAllergy: (allergy: Allergy) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  addVaccination: (vaccination: Vaccination) => void;
  updateVaccination: (id: string, data: Partial<Vaccination>) => void;
  addVisionTest: (test: VisionTest) => void;
  
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  
  addMessage: (message: Message) => void;
  markMessageRead: (id: string) => void;
  
  addBloodRequest: (request: BloodRequest) => void;
  updateBloodRequest: (id: string, data: Partial<BloodRequest>) => void;
  
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  students: 'shis_students',
  healthRecords: 'shis_health_records',
  medicalConditions: 'shis_medical_conditions',
  allergies: 'shis_allergies',
  emergencyContacts: 'shis_emergency_contacts',
  vaccinations: 'shis_vaccinations',
  visionTests: 'shis_vision_tests',
  alerts: 'shis_alerts',
  messages: 'shis_messages',
  bloodRequests: 'shis_blood_requests',
  appointments: 'shis_appointments'
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => 
    loadFromStorage(STORAGE_KEYS.students, mockStudents)
  );
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => 
    loadFromStorage(STORAGE_KEYS.healthRecords, mockHealthRecords)
  );
  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>(() => 
    loadFromStorage(STORAGE_KEYS.medicalConditions, mockMedicalConditions)
  );
  const [allergies, setAllergies] = useState<Allergy[]>(() => 
    loadFromStorage(STORAGE_KEYS.allergies, mockAllergies)
  );
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => 
    loadFromStorage(STORAGE_KEYS.emergencyContacts, mockEmergencyContacts)
  );
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(() => 
    loadFromStorage(STORAGE_KEYS.vaccinations, mockVaccinations)
  );
  const [visionTests, setVisionTests] = useState<VisionTest[]>(() => 
    loadFromStorage(STORAGE_KEYS.visionTests, mockVisionTests)
  );
  const [alerts, setAlerts] = useState<Alert[]>(() => 
    loadFromStorage(STORAGE_KEYS.alerts, mockAlerts)
  );
  const [messages, setMessages] = useState<Message[]>(() => 
    loadFromStorage(STORAGE_KEYS.messages, mockMessages)
  );
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() => 
    loadFromStorage(STORAGE_KEYS.bloodRequests, mockBloodRequests)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() => 
    loadFromStorage(STORAGE_KEYS.appointments, mockAppointments)
  );

  // Save to session storage on changes
  useEffect(() => { saveToStorage(STORAGE_KEYS.students, students); }, [students]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.healthRecords, healthRecords); }, [healthRecords]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.medicalConditions, medicalConditions); }, [medicalConditions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.allergies, allergies); }, [allergies]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.emergencyContacts, emergencyContacts); }, [emergencyContacts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.vaccinations, vaccinations); }, [vaccinations]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.visionTests, visionTests); }, [visionTests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.alerts, alerts); }, [alerts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.messages, messages); }, [messages]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.bloodRequests, bloodRequests); }, [bloodRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.appointments, appointments); }, [appointments]);

  const value: DataContextType = {
    students,
    healthRecords,
    medicalConditions,
    allergies,
    emergencyContacts,
    vaccinations,
    visionTests,
    alerts,
    messages,
    bloodRequests,
    appointments,

    addStudent: (student) => setStudents(prev => [...prev, student]),
    updateStudent: (id, data) => setStudents(prev => 
      prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString().split('T')[0] } : s)
    ),
    deleteStudent: (id) => setStudents(prev => prev.filter(s => s.id !== id)),

    addHealthRecord: (record) => setHealthRecords(prev => [...prev, record]),
    addMedicalCondition: (condition) => setMedicalConditions(prev => [...prev, condition]),
    addAllergy: (allergy) => setAllergies(prev => [...prev, allergy]),
    addEmergencyContact: (contact) => setEmergencyContacts(prev => [...prev, contact]),
    addVaccination: (vaccination) => setVaccinations(prev => [...prev, vaccination]),
    updateVaccination: (id, data) => setVaccinations(prev => 
      prev.map(v => v.id === id ? { ...v, ...data } : v)
    ),
    addVisionTest: (test) => setVisionTests(prev => [...prev, test]),

    addAlert: (alert) => setAlerts(prev => [alert, ...prev]),
    markAlertRead: (id) => setAlerts(prev => 
      prev.map(a => a.id === id ? { ...a, isRead: true } : a)
    ),

    addMessage: (message) => setMessages(prev => [message, ...prev]),
    markMessageRead: (id) => setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, isRead: true } : m)
    ),

    addBloodRequest: (request) => setBloodRequests(prev => [request, ...prev]),
    updateBloodRequest: (id, data) => setBloodRequests(prev => 
      prev.map(r => r.id === id ? { ...r, ...data } : r)
    ),

    addAppointment: (appointment) => setAppointments(prev => [...prev, appointment]),
    updateAppointment: (id, data) => setAppointments(prev => 
      prev.map(a => a.id === id ? { ...a, ...data } : a)
    )
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
