import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Droplets, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalEmergencySearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { students, medicalConditions, allergies, emergencyContacts } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Filter students based on search query
  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students.slice(0, 10); // Show first 10 if no search

    const query = searchQuery.toLowerCase();
    return students.filter(s =>
      s.rollNumber.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
      `${s.class}${s.section}`.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [students, searchQuery]);

  const handleSelectStudent = (studentId: string) => {
    setOpen(false);
    navigate(`/admin/emergency?student=${studentId}`);
    // Also navigate to emergency lookup page if not already there
    if (!window.location.pathname.includes('/emergency')) {
      navigate(`/admin/emergency?student=${studentId}`);
    }
  };

  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-500', 'A-': 'bg-red-600',
    'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    'O+': 'bg-green-500', 'O-': 'bg-green-600',
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search student by roll number, ID, or name... (Emergency Lookup)" 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No students found.</CommandEmpty>
          <CommandGroup heading="Emergency Student Lookup">
            {filteredStudents.map((student) => {
              const studentAllergies = allergies.filter(a => a.studentId === student.id);
              const studentConditions = medicalConditions.filter(c => c.studentId === student.id && c.isActive);
              const primaryContact = emergencyContacts.find(c => c.studentId === student.id && c.isPrimary);
              const hasCriticalAllergy = studentAllergies.some(a => 
                a.severity === 'Life-threatening' || a.severity === 'Severe'
              );

              return (
                <CommandItem
                  key={student.id}
                  value={`${student.rollNumber} ${student.studentId} ${student.firstName} ${student.lastName}`}
                  onSelect={() => handleSelectStudent(student.id)}
                  className="p-4"
                >
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profileImage} alt={student.firstName} />
                      <AvatarFallback>
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        {hasCriticalAllergy && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{student.rollNumber}</span>
                        <span>•</span>
                        <span>{student.studentId}</span>
                        <span>•</span>
                        <span>Class {student.class}{student.section}</span>
                      </div>
                      {(studentAllergies.length > 0 || studentConditions.length > 0) && (
                        <div className="flex items-center gap-2 mt-1">
                          {hasCriticalAllergy && (
                            <Badge variant="destructive" className="text-xs">
                              Critical Allergy
                            </Badge>
                          )}
                          {studentConditions.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {studentConditions.length} Condition{studentConditions.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={cn(
                        "px-3 py-1 rounded text-white text-sm font-bold",
                        bloodGroupColors[student.bloodGroup] || 'bg-gray-500'
                      )}>
                        {student.bloodGroup}
                      </div>
                      {primaryContact && (
                        <p className="text-xs text-muted-foreground">
                          {primaryContact.phonePrimary}
                        </p>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 hidden md:flex items-center gap-2 px-3 py-2 bg-background border rounded-lg shadow-lg text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd> for emergency lookup</span>
      </div>
    </>
  );
}


