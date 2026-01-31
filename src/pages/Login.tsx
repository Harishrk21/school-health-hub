import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Shield, Users, Stethoscope, Droplets, UserCircle, Building2 } from 'lucide-react';
import { UserRole } from '@/types';

const roleInfo = [
  { role: 'doctor' as UserRole, email: 'doctor@shis.com', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600' },
  { role: 'school_admin' as UserRole, email: 'admin@shis.com', label: 'School Admin', icon: Building2, color: 'text-green-600' },
  { role: 'blood_bank' as UserRole, email: 'bloodbank@shis.com', label: 'Blood Bank', icon: Droplets, color: 'text-red-600' },
  { role: 'parent' as UserRole, email: 'parent@shis.com', label: 'Parent', icon: UserCircle, color: 'text-purple-600' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        doctor: '/doctor',
        school_admin: '/admin',
        blood_bank: '/blood-bank',
        parent: '/parent'
      };
      const role = roleInfo.find(r => r.email === email)?.role || 'doctor';
      navigate(roleRoutes[role] || '/doctor');
    } else {
      setError('Invalid email or password. Use password: password123');
    }
    setIsLoading(false);
  };

  const quickLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    const success = await login(roleEmail, 'password123');
    if (success) {
      const role = roleInfo.find(r => r.email === roleEmail)?.role;
      const routes: Record<string, string> = {
        doctor: '/doctor',
        school_admin: '/admin',
        blood_bank: '/blood-bank',
        parent: '/parent'
      };
      navigate(routes[role!] || '/doctor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-info/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">SHIS</h1>
              <p className="text-muted-foreground">School Health Information System</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Health Records</h3>
                <p className="text-sm text-muted-foreground">Manage student health data with role-based access control</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Health Checkups</h3>
                <p className="text-sm text-muted-foreground">Track BMI, vaccinations, vision tests, and more</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Blood Bank Integration</h3>
                <p className="text-sm text-muted-foreground">Emergency blood requests and donor management</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Parent Portal</h3>
                <p className="text-sm text-muted-foreground">Keep parents informed about their child's health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 md:hidden">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground">
                <Heart className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Quick Demo Login</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {roleInfo.map(({ role, email, label, icon: Icon, color }) => (
                <Button
                  key={role}
                  variant="outline"
                  className="flex items-center gap-2 h-auto py-3"
                  onClick={() => quickLogin(email)}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Demo password: <code className="bg-muted px-1 rounded">password123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
