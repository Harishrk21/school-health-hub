import React from 'react';
import { Student } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
  onViewDetails?: () => void;
  onGenerateReport?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'A-': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'B-': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'AB+': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'AB-': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'O+': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'O-': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export function StudentCard({ 
  student, 
  onClick, 
  onViewDetails, 
  onGenerateReport,
  showActions = true,
  compact = false
}: StudentCardProps) {
  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
        onClick={onClick}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.profileImage} alt={student.firstName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {student.firstName} {student.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {student.studentId} • Class {student.class}{student.section}
          </p>
        </div>
        <Badge className={cn("shrink-0", bloodGroupColors[student.bloodGroup])}>
          {student.bloodGroup}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={student.profileImage} alt={student.firstName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {student.firstName} {student.lastName}
              </h3>
              <Badge className={cn(bloodGroupColors[student.bloodGroup])}>
                <Droplets className="h-3 w-3 mr-1" />
                {student.bloodGroup}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <p>ID: {student.studentId}</p>
              <p>Roll: {student.rollNumber}</p>
              <p>Class: {student.class}{student.section}</p>
              <p>Age: {age} years</p>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); onViewDetails?.(); }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); onGenerateReport?.(); }}
            >
              <FileText className="h-3 w-3 mr-1" />
              Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
