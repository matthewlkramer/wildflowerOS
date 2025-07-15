import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, School, MapPin } from "lucide-react";
import { formatAgeDisplay } from "@/lib/ageUtils";

interface Enrollment {
  id: string;
  childId: string;
  status: string;
  startDate: string;
  endDate?: string;
  school?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
  };
  classroom?: {
    id: string;
    name: string;
    level: string;
  };
  schoolYear?: {
    id: string;
    name: string;
  };
  notes?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

interface EnrollmentTimelineProps {
  child: Child;
  enrollments: Enrollment[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'enrolled':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'prospective':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'graduated':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

function getLevelColor(level: string) {
  switch (level) {
    case 'infant':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'toddler':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'primary':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'lower_elem':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'upper_elem':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'junior_high':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'high_school':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

function formatLevelName(level: string) {
  switch (level) {
    case 'infant':
      return 'Infant';
    case 'toddler':
      return 'Toddler';
    case 'primary':
      return 'Primary';
    case 'lower_elem':
      return 'Lower Elementary';
    case 'upper_elem':
      return 'Upper Elementary';
    case 'junior_high':
      return 'Junior High';
    case 'high_school':
      return 'High School';
    default:
      return level;
  }
}

function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  if (end) {
    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
  } else {
    return `${start.toLocaleDateString('en-US', formatOptions)} - Present`;
  }
}

function calculateAgeAtEnrollment(birthDate: string, enrollmentDate: string) {
  const birth = new Date(birthDate);
  const enrollment = new Date(enrollmentDate);
  
  const ageInMonths = (enrollment.getFullYear() - birth.getFullYear()) * 12 + 
                     (enrollment.getMonth() - birth.getMonth());
  
  if (enrollment.getDate() < birth.getDate()) {
    return ageInMonths - 1;
  }
  
  return ageInMonths;
}

export default function EnrollmentTimeline({ child, enrollments }: EnrollmentTimelineProps) {
  // Sort enrollments by start date
  const sortedEnrollments = [...enrollments].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (sortedEnrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Enrollment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No enrollment history found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5" />
          <span>Educational Journey for {child.firstName}</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Current age: {formatAgeDisplay(child.birthDate)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEnrollments.map((enrollment, index) => {
            const ageAtStart = calculateAgeAtEnrollment(child.birthDate, enrollment.startDate);
            const ageAtStartFormatted = ageAtStart < 12 ? `${ageAtStart} months` : 
              ageAtStart < 24 ? `${Math.floor(ageAtStart / 12)}y ${ageAtStart % 12}m` :
              `${Math.floor(ageAtStart / 12)} years`;

            return (
              <div key={enrollment.id} className="relative">
                {/* Timeline line */}
                {index < sortedEnrollments.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                    ${enrollment.status === 'enrolled' ? 'bg-green-500' : 
                      enrollment.status === 'graduated' ? 'bg-blue-500' :
                      enrollment.status === 'withdrawn' ? 'bg-gray-500' : 'bg-yellow-500'}
                  `}>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Enrollment details */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={getStatusColor(enrollment.status)}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </Badge>
                        {enrollment.classroom && (
                          <Badge className={getLevelColor(enrollment.classroom.level)}>
                            {formatLevelName(enrollment.classroom.level)}
                          </Badge>
                        )}
                        {enrollment.schoolYear && (
                          <Badge variant="outline">
                            {enrollment.schoolYear.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {enrollment.classroom && (
                          <div className="flex items-center space-x-2 text-sm">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{enrollment.classroom.name}</span>
                          </div>
                        )}
                        
                        {enrollment.school && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <School className="h-4 w-4 text-gray-500" />
                            <span>{enrollment.school.name}</span>
                            {enrollment.school.city && enrollment.school.state && (
                              <>
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">{enrollment.school.city}, {enrollment.school.state}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDateRange(enrollment.startDate, enrollment.endDate)}</span>
                          <span className="text-xs text-gray-500">
                            (started at {ageAtStartFormatted})
                          </span>
                        </div>
                        
                        {enrollment.notes && (
                          <div className="text-sm text-gray-600 mt-2 p-2 bg-white dark:bg-gray-900 rounded border-l-2 border-gray-200 dark:border-gray-700">
                            {enrollment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}