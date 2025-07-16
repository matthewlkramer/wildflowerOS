import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, Filter, Plus, Eye, BookOpen, Target, CheckCircle, StickyNote, Camera, Upload, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ObservationsGridProps {
  classroomId: string;
  students: any[];
}

const OBSERVATION_TYPES = [
  { id: 'presentation', label: 'Presentation', color: 'bg-blue-500', icon: BookOpen },
  { id: 'practice', label: 'Practice', color: 'bg-green-500', icon: Target },
  { id: 'observation', label: 'Observation', color: 'bg-yellow-500', icon: Eye },
  { id: 'mastery', label: 'Mastery', color: 'bg-purple-500', icon: CheckCircle },
];

const CURRICULUM_AREAS = [
  'Practical Life',
  'Sensorial',
  'Language',
  'Mathematics',
  'Cultural Studies',
  'Art',
  'Music',
  'Movement'
];

const AGE_GROUPS = [
  'Infant',
  'Toddler', 
  'Primary',
  'Lower Elementary',
  'Upper Elementary',
  'Junior High',
  'High School'
];

const YEAR_GROUPS = ['1st Year', '2nd Year', '3rd Year'];

export default function ObservationsGrid({ classroomId, students }: ObservationsGridProps) {
  const [selectedObservationTypes, setSelectedObservationTypes] = useState(OBSERVATION_TYPES.map(t => t.id));
  const [filters, setFilters] = useState({
    curriculumArea: 'all',
    ageGroup: 'all',
    yearGroup: 'all',
    presentedBefore: false
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [gridMode, setGridMode] = useState<'cell' | 'row' | 'column'>('cell');
  
  // Note and photo dialog state
  const [noteDialog, setNoteDialog] = useState({ open: false, studentId: '', studentName: '' });
  const [photoDialog, setPhotoDialog] = useState({ open: false, studentId: '', studentName: '' });
  const [noteText, setNoteText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lessons with current filters
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/lessons`, filters],
    enabled: !!classroomId,
  });

  // Fetch observations with current filters
  const { data: observations = [], isLoading: observationsLoading } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/observations`, {
      observationType: selectedObservationTypes,
      studentIds: selectedStudents.length > 0 ? selectedStudents : undefined
    }],
    enabled: !!classroomId,
  });

  // Fetch student year groups
  const { data: studentYearGroups = [] } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/student-year-groups`],
    enabled: !!classroomId,
  });

  // Create observation mutation
  const createObservationMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/classrooms/${classroomId}/observations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/classrooms/${classroomId}/observations`] });
      toast({ title: "Observation recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record observation", variant: "destructive" });
    }
  });

  // Bulk observations mutation
  const createBulkObservationsMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/classrooms/${classroomId}/observations/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/classrooms/${classroomId}/observations`] });
      toast({ title: "Bulk observations recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record bulk observations", variant: "destructive" });
    }
  });

  // Note creation mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/classrooms/${classroomId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({ title: "Note added successfully" });
      setNoteDialog({ open: false, studentId: '', studentName: '' });
      setNoteText('');
    },
    onError: () => {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch(`/api/classrooms/${classroomId}/photos`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Photo uploaded successfully" });
      setPhotoDialog({ open: false, studentId: '', studentName: '' });
      setSelectedFile(null);
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    }
  });

  // Get observation data for a specific student and lesson
  const getObservationData = (studentId: string, lessonId: string) => {
    return observations.filter(obs => 
      obs.studentId === studentId && 
      obs.lessonId === lessonId
    );
  };

  // Get student year group
  const getStudentYearGroup = (studentId: string) => {
    const yearGroup = studentYearGroups.find(yg => yg.studentId === studentId);
    return yearGroup?.yearGroup || '1st Year';
  };

  // Handle cell click for single observation
  const handleCellClick = (studentId: string, lessonId: string, observationType: string) => {
    const existingObs = observations.find(obs => 
      obs.studentId === studentId && 
      obs.lessonId === lessonId && 
      obs.observationType === observationType
    );

    if (existingObs) {
      // Toggle off - could implement delete functionality here
      toast({ title: "Observation already exists" });
      return;
    }

    createObservationMutation.mutate({
      studentId,
      lessonId,
      observationType,
      notes: `${observationType} recorded via grid`
    });
  };

  // Handle row click for all lessons for a student
  const handleRowClick = (studentId: string, observationType: string) => {
    const observationsToCreate = lessons.map(lesson => ({
      studentId,
      lessonId: lesson.id,
      observationType,
      notes: `${observationType} recorded via row selection`
    }));

    createBulkObservationsMutation.mutate({ observations: observationsToCreate });
  };

  // Handle column click for all students for a lesson
  const handleColumnClick = (lessonId: string, observationType: string) => {
    const observationsToCreate = students.map(student => ({
      studentId: student.id,
      lessonId,
      observationType,
      notes: `${observationType} recorded via column selection`
    }));

    createBulkObservationsMutation.mutate({ observations: observationsToCreate });
  };

  // Handler functions for notes and photos
  const handleAddNote = (studentId: string, studentName: string) => {
    setNoteDialog({ open: true, studentId, studentName });
  };

  const handleTakePhoto = (studentId: string, studentName: string) => {
    setPhotoDialog({ open: true, studentId, studentName });
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    createNoteMutation.mutate({
      studentId: noteDialog.studentId,
      content: noteText,
      date: new Date().toISOString().split('T')[0],
      type: 'observation'
    });
  };

  const handlePhotoUpload = (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('studentId', photoDialog.studentId);
    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('type', 'classroom');
    
    uploadPhotoMutation.mutate(formData);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handlePhotoUpload(file);
    }
  };

  // Filter students based on year group
  const filteredStudents = students.filter(student => {
    if (!filters.yearGroup || filters.yearGroup === 'all') return true;
    return getStudentYearGroup(student.id) === filters.yearGroup;
  });

  // Filter lessons based on current filters
  const filteredLessons = lessons.filter(lesson => {
    if (filters.curriculumArea && filters.curriculumArea !== 'all' && lesson.curriculumArea !== filters.curriculumArea) return false;
    if (filters.ageGroup && filters.ageGroup !== 'all' && lesson.ageGroup !== filters.ageGroup) return false;
    return true;
  });

  // Render observation cell with color-coded indicators
  const renderObservationCell = (studentId: string, lessonId: string) => {
    const cellObservations = getObservationData(studentId, lessonId);
    const hasObservations = cellObservations.length > 0;

    // Group observations by type for color display
    const observationsByType = OBSERVATION_TYPES.reduce((acc, type) => {
      const typeObs = cellObservations.filter(obs => obs.observationType === type.id);
      if (typeObs.length > 0) {
        acc[type.id] = {
          color: type.color,
          dates: typeObs.map(obs => format(new Date(obs.observationDate), 'MM/dd'))
        };
      }
      return acc;
    }, {} as Record<string, { color: string; dates: string[] }>);

    const observationTypeKeys = Object.keys(observationsByType);
    const cellSize = observationTypeKeys.length;

    return (
      <div
        className={`
          relative h-12 w-20 border border-gray-200 cursor-pointer hover:bg-gray-50
          ${!hasObservations ? 'bg-white' : ''}
        `}
        onClick={() => {
          if (gridMode === 'cell' && selectedObservationTypes.length === 1) {
            handleCellClick(studentId, lessonId, selectedObservationTypes[0]);
          }
        }}
      >
        {observationTypeKeys.length > 0 && (
          <div className="h-full w-full flex">
            {observationTypeKeys.map((typeId, index) => {
              const typeData = observationsByType[typeId];
              const width = `${100 / cellSize}%`;
              
              return (
                <div
                  key={typeId}
                  className={`${typeData.color} h-full flex flex-col justify-center items-center text-white text-xs`}
                  style={{ width }}
                >
                  <div className="text-[10px] leading-none">
                    {typeData.dates.join(',')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!hasObservations && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
            <Plus className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  };

  if (lessonsLoading || observationsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Lesson Observations Grid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Observation Type Toggles */}
          <div>
            <label className="text-sm font-medium mb-2 block">Observation Types</label>
            <div className="flex flex-wrap gap-2">
              {OBSERVATION_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <Toggle
                    key={type.id}
                    pressed={selectedObservationTypes.includes(type.id)}
                    onPressedChange={(pressed) => {
                      if (pressed) {
                        setSelectedObservationTypes([...selectedObservationTypes, type.id]);
                      } else {
                        setSelectedObservationTypes(selectedObservationTypes.filter(id => id !== type.id));
                      }
                    }}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </Toggle>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Curriculum Area</label>
              <Select value={filters.curriculumArea} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, curriculumArea: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All areas</SelectItem>
                  {CURRICULUM_AREAS.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Age Group</label>
              <Select value={filters.ageGroup} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, ageGroup: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  {AGE_GROUPS.map(age => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Student Year</label>
              <Select value={filters.yearGroup} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, yearGroup: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {YEAR_GROUPS.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Input Mode</label>
              <Select value={gridMode} onValueChange={(value: any) => setGridMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cell">Single Cell</SelectItem>
                  <SelectItem value="row">Full Row</SelectItem>
                  <SelectItem value="column">Full Column</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              {/* Header row with student names and action buttons */}
              <div className="flex mb-2">
                <div className="w-48 p-2 font-medium border-r">Lesson</div>
                {filteredStudents.map(student => (
                  <div key={student.id} className="w-20 p-1 text-xs font-medium text-center border-r">
                    <div className="truncate mb-1">{student.firstName}</div>
                    <Badge variant="outline" className="text-[10px] mb-2">
                      {getStudentYearGroup(student.id)}
                    </Badge>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-full text-[10px] px-1"
                        onClick={() => handleAddNote(student.id, student.firstName)}
                      >
                        <StickyNote className="h-3 w-3 mr-1" />
                        Note
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-full text-[10px] px-1"
                        onClick={() => handleTakePhoto(student.id, student.firstName)}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        Photo
                      </Button>
                    </div>
                  </div>
                ))}
                {gridMode === 'column' && (
                  <div className="w-20 p-2 text-center font-medium">Actions</div>
                )}
              </div>

              {/* Grid rows */}
              {filteredLessons.map(lesson => (
                <div key={lesson.id} className="flex border-b">
                  <div className="w-48 p-2 border-r">
                    <div className="font-medium text-sm">{lesson.name}</div>
                    <div className="text-xs text-gray-500">{lesson.curriculumArea}</div>
                    {lesson.ageGroup && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {lesson.ageGroup}
                      </Badge>
                    )}
                  </div>
                  
                  {filteredStudents.map(student => (
                    <div key={student.id} className="border-r w-20">
                      {renderObservationCell(student.id, lesson.id)}
                    </div>
                  ))}

                  {gridMode === 'column' && selectedObservationTypes.length === 1 && (
                    <div className="w-20 p-2 border-r">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-full text-xs"
                        onClick={() => handleColumnClick(lesson.id, selectedObservationTypes[0])}
                      >
                        All
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Row actions for bulk student operations */}
              {gridMode === 'row' && selectedObservationTypes.length === 1 && (
                <div className="flex mt-2">
                  <div className="w-48 p-2 font-medium border-r">Bulk Actions</div>
                  {filteredStudents.map(student => (
                    <div key={student.id} className="w-20 p-1 border-r">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-full text-xs"
                        onClick={() => handleRowClick(student.id, selectedObservationTypes[0])}
                      >
                        All
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">Legend:</span>
              {OBSERVATION_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <div key={type.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${type.color} rounded`}></div>
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onOpenChange={(open) => setNoteDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note for {noteDialog.studentName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note for {format(new Date(), 'MMM dd, yyyy')}</Label>
              <Textarea
                id="note"
                placeholder="Enter your observation or note about this student..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setNoteDialog({ open: false, studentId: '', studentName: '' })}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNote}
                disabled={!noteText.trim() || createNoteMutation.isPending}
              >
                {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={photoDialog.open} onOpenChange={(open) => setPhotoDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Photo for {photoDialog.studentName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Choose how to add a photo for {format(new Date(), 'MMM dd, yyyy')}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gallery-upload">Choose from Gallery</Label>
                <div className="mt-2">
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('gallery-upload')?.click()}
                    disabled={uploadPhotoMutation.isPending}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="camera-upload">Take New Photo</Label>
                <div className="mt-2">
                  <input
                    id="camera-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('camera-upload')?.click()}
                    disabled={uploadPhotoMutation.isPending}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>

            {uploadPhotoMutation.isPending && (
              <div className="text-center text-sm text-gray-600">
                Uploading photo...
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setPhotoDialog({ open: false, studentId: '', studentName: '' })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}