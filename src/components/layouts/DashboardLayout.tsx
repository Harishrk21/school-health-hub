import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, LayoutDashboard, Users, FileText, Bell, Mail, 
  LogOut, Search, Syringe, Eye, AlertTriangle, Calendar,
  Building2, Upload, BarChart3, Droplets, UserCircle, Settings,
  ClipboardList, UserPlus, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { GlobalEmergencySearch } from '@/components/GlobalEmergencySearch';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const doctorNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/doctor', icon: LayoutDashboard },
  { title: 'Students', url: '/doctor/students', icon: Users },
  { title: 'Emergency Lookup', url: '/doctor/emergency', icon: AlertTriangle },
  { title: 'Health Checkups', url: '/doctor/checkups', icon: ClipboardList },
  { title: 'Vaccinations', url: '/doctor/vaccinations', icon: Syringe },
  { title: 'Vision Tests', url: '/doctor/vision', icon: Eye },
  { title: 'Appointments', url: '/doctor/appointments', icon: Calendar },
  { title: 'Reports', url: '/doctor/reports', icon: FileText },
  { title: 'Alerts', url: '/doctor/alerts', icon: Bell },
  { title: 'Messages', url: '/doctor/messages', icon: Mail },
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Students', url: '/admin/students', icon: Users },
  { title: 'Enroll Student', url: '/admin/enroll', icon: UserPlus },
  { title: 'Bulk Upload', url: '/admin/bulk-upload', icon: Upload },
  { title: 'Emergency Lookup', url: '/admin/emergency', icon: AlertTriangle },
  { title: 'Health Management', url: '/admin/health-summary', icon: ClipboardList },
  { title: 'Vaccinations', url: '/admin/vaccinations', icon: Syringe },
  { title: 'Vaccination Campaigns', url: '/admin/vaccinations/campaigns', icon: Calendar },
  { title: 'Appointments', url: '/admin/appointments', icon: Calendar },
  { title: 'Blood Bank', url: '/admin/blood-bank', icon: Droplets },
  { title: 'Reports', url: '/admin/reports', icon: FileText },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Alerts', url: '/admin/alerts', icon: Bell },
  { title: 'Messages & Communication', url: '/admin/communication', icon: MessageSquare },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Documents', url: '/admin/documents', icon: FileText },
];

const bloodBankNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/blood-bank', icon: LayoutDashboard },
  { title: 'Blood Groups', url: '/blood-bank/groups', icon: Droplets },
  { title: 'Requests', url: '/blood-bank/requests', icon: ClipboardList },
  { title: 'Donors', url: '/blood-bank/donors', icon: Users },
  { title: 'Emergency', url: '/blood-bank/emergency', icon: AlertTriangle },
];

const parentNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/parent', icon: LayoutDashboard },
  { title: 'Health Records', url: '/parent/health', icon: ClipboardList },
  { title: 'Vaccinations', url: '/parent/vaccinations', icon: Syringe },
  { title: 'Appointments', url: '/parent/appointments', icon: Calendar },
  { title: 'Reports', url: '/parent/reports', icon: FileText },
  { title: 'Messages', url: '/parent/messages', icon: Mail },
  { title: 'Emergency Info', url: '/parent/emergency', icon: AlertTriangle },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  doctor: doctorNavItems,
  school_admin: adminNavItems,
  blood_bank: bloodBankNavItems,
  parent: parentNavItems,
};

const roleTitles: Record<UserRole, string> = {
  doctor: 'Doctor Portal',
  school_admin: 'School Admin Portal',
  blood_bank: 'Blood Bank Portal',
  parent: 'Parent Portal',
};

const roleColors: Record<UserRole, string> = {
  doctor: 'bg-blue-600',
  school_admin: 'bg-green-600',
  blood_bank: 'bg-red-600',
  parent: 'bg-purple-600',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navItemsByRole[user.role];
  const portalTitle = roleTitles[user.role];
  const roleColor = roleColors[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <GlobalEmergencySearch />
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
                  <SidebarHeader className="border-b p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg text-white", roleColor)}>
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-base">SHIS</h2>
                        <p className="text-xs text-muted-foreground">School Health Information System</p>
                        <p className="text-xs text-muted-foreground">{portalTitle}</p>
                      </div>
                    </div>
                  </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === `/doctor` || item.url === '/admin' || item.url === '/blood-bank' || item.url === '/parent'}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={cn("text-white", roleColor)}>
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 border-b bg-card flex items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                // Trigger global search
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
              }}
              title="Emergency Search (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </header>
          <div className="flex-1 p-6 overflow-auto bg-background">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
