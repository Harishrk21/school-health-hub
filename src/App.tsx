import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Pages
import LoginPage from "./pages/Login";
import NotFound from "./pages/NotFound";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorStudents from "./pages/doctor/DoctorStudents";
import StudentDetail from "./pages/doctor/StudentDetail";
import EmergencyLookup from "./pages/doctor/EmergencyLookup";
import HealthCheckups from "./pages/doctor/HealthCheckups";
import DoctorVaccinations from "./pages/doctor/DoctorVaccinations";
import DoctorVisionTests from "./pages/doctor/DoctorVisionTests";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorAlerts from "./pages/doctor/DoctorAlerts";
import DoctorMessages from "./pages/doctor/DoctorMessages";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentEnrollment from "./pages/admin/StudentEnrollment";
import BloodBankIntegration from "./pages/admin/BloodBankIntegration";
import BulkUpload from "./pages/admin/BulkUpload";
import HealthManagement from "./pages/admin/HealthManagement";
import VaccinationCampaigns from "./pages/admin/VaccinationCampaigns";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import AlertsManagement from "./pages/admin/AlertsManagement";
import CommunicationHub from "./pages/admin/CommunicationHub";
import AppointmentsCalendar from "./pages/admin/AppointmentsCalendar";
import UserManagement from "./pages/admin/UserManagement";
import DocumentManagement from "./pages/admin/DocumentManagement";
import SystemSettings from "./pages/admin/SystemSettings";

// Blood Bank Pages
import BloodBankDashboard from "./pages/bloodbank/BloodBankDashboard";

// Parent Pages
import ParentDashboard from "./pages/parent/ParentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Doctor Routes */}
              <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DoctorDashboard />} />
                <Route path="students" element={<DoctorStudents />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="emergency" element={<EmergencyLookup />} />
                <Route path="checkups" element={<HealthCheckups />} />
                <Route path="vaccinations" element={<DoctorVaccinations />} />
                <Route path="vision" element={<DoctorVisionTests />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="reports" element={<DoctorReports />} />
                <Route path="alerts" element={<DoctorAlerts />} />
                <Route path="messages" element={<DoctorMessages />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['school_admin']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<DoctorStudents />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="enroll" element={<StudentEnrollment />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="health-summary" element={<HealthManagement />} />
                <Route path="checkups" element={<HealthManagement />} />
                <Route path="vaccinations" element={<DoctorVaccinations />} />
                <Route path="vaccinations/campaigns" element={<VaccinationCampaigns />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="analytics" element={<ReportsAnalytics />} />
                <Route path="blood-bank" element={<BloodBankIntegration />} />
                <Route path="messages" element={<Navigate to="/admin/communication" replace />} />
                <Route path="emergency" element={<EmergencyLookup />} />
                <Route path="alerts" element={<AlertsManagement />} />
                <Route path="appointments" element={<AppointmentsCalendar />} />
                <Route path="communication" element={<CommunicationHub />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="documents" element={<DocumentManagement />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>

              {/* Blood Bank Routes */}
              <Route path="/blood-bank" element={<ProtectedRoute allowedRoles={['blood_bank']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<BloodBankDashboard />} />
                <Route path="groups" element={<BloodBankDashboard />} />
                <Route path="requests" element={<BloodBankDashboard />} />
                <Route path="donors" element={<BloodBankDashboard />} />
                <Route path="emergency" element={<BloodBankDashboard />} />
              </Route>

              {/* Parent Routes */}
              <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<ParentDashboard />} />
                <Route path="health" element={<ParentDashboard />} />
                <Route path="vaccinations" element={<DoctorVaccinations />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="reports" element={<DoctorReports />} />
                <Route path="messages" element={<DoctorMessages />} />
                <Route path="emergency" element={<EmergencyLookup />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
