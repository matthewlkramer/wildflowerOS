import { useState, useEffect } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import { 
  ArrowLeft,
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Camera, 
  ClipboardList, 
  UserCheck, 
  MessageSquare,
  School,
  GraduationCap,
  Activity,
  FileText,
  Grid3X3,
  PlusCircle,
  Eye,
  Edit,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Settings,
  Video,
  Upload,
  QrCode,
  Tablet,
  X,
  ChevronRight
} from "lucide-react";

// AttendanceInterface Component
function AttendanceInterface({ classroomId, students, classroom }: { classroomId: string; students: any[]; classroom: any }) {
  const [attendanceMode, setAttendanceMode] = useState<'teacher' | 'family' | 'qr'>('teacher');
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize attendance data - default all students to present or load current attendance
  React.useEffect(() => {
    const initialData: Record<string, boolean> = {};
    
    // If we have current attendance data, use it
    if (currentAttendance.length > 0) {
      students.forEach(student => {
        const existingRecord = currentAttendance.find(record => record.studentId === student.id);
        initialData[student.id] = existingRecord ? existingRecord.isPresent : true;
      });
    } else {
      // Default all students to present
      students.forEach(student => {
        initialData[student.id] = true;
      });
    }
    
    setAttendanceData(initialData);
  }, [students, currentAttendance]);

  // Fetch current attendance for selected date
  const { data: currentAttendance = [], isLoading: loadingCurrentAttendance } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/attendance/${selectedDate}/current`],
    enabled: !!classroomId && !!selectedDate,
  });

  // Fetch attendance history
  const { data: attendanceHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/attendance-history`],
    enabled: !!classroomId && showHistory,
  });

  // Fetch detailed records for selected history date
  const { data: historyRecords = [], isLoading: loadingHistoryRecords } = useQuery({
    queryKey: [`/api/classrooms/${classroomId}/attendance/${selectedHistoryDate}`],
    enabled: !!classroomId && !!selectedHistoryDate,
  });

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: { date: string; attendance: Record<string, boolean>; correctionReason?: string }) => {
      return apiRequest('POST', `/api/classrooms/${classroomId}/attendance`, data);
    },
    onSuccess: () => {
      toast({
        title: "Attendance saved",
        description: "Daily attendance has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/classrooms/${classroomId}/attendance`] });
      queryClient.invalidateQueries({ queryKey: [`/api/classrooms/${classroomId}/attendance-history`] });
      setCorrectionReason('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving attendance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Family check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (studentId: string) => {
      return apiRequest('POST', `/api/classrooms/${classroomId}/check-in/${studentId}`, {
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: (_, studentId) => {
      setAttendanceData(prev => ({ ...prev, [studentId]: true }));
      toast({
        title: "Student checked in",
        description: "Attendance recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = () => {
    saveAttendanceMutation.mutate({
      date: selectedDate,
      attendance: attendanceData,
      correctionReason: correctionReason || undefined
    });
  };

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  if (attendanceMode === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Teacher Attendance
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setAttendanceMode('family')}>
                  <Tablet className="mr-2 h-4 w-4" />
                  Family Check-in
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAttendanceMode('qr')}>
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{presentCount}</div>
                <div className="text-sm text-green-600 dark:text-green-500">Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</div>
                <div className="text-sm text-red-600 dark:text-red-500">Absent</div>
              </div>
            </div>

            {/* Correction Reason */}
            {currentAttendance.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Update (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Student arrived late, Correcting error..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            )}

            {/* Student List */}
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    attendanceData[student.id]
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {student.child?.firstName?.[0]}{student.child?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {student.child?.firstName} {student.child?.lastName}
                      </div>
                      <div className={`text-sm ${attendanceData[student.id] ? 'text-green-600' : 'text-red-600'}`}>
                        {attendanceData[student.id] ? 'Present' : 'Absent'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={attendanceData[student.id]}
                    onCheckedChange={() => toggleAttendance(student.id)}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                disabled={saveAttendanceMutation.isPending || loadingCurrentAttendance}
                className="w-full sm:w-auto"
              >
                {saveAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Attendance History
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'View History'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showHistory && (
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-4">Loading history...</div>
              ) : attendanceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No attendance records found</div>
              ) : (
                <div className="space-y-3">
                  {attendanceHistory.map((record: any) => (
                    <div
                      key={record.date}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedHistoryDate(record.date)}
                    >
                      <div>
                        <div className="font-medium">{new Date(record.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{record.recordCount} record(s)</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Date Details */}
              {selectedHistoryDate && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-medium mb-4">
                    Records for {new Date(selectedHistoryDate).toLocaleDateString()}
                  </h4>
                  {loadingHistoryRecords ? (
                    <div className="text-center py-4">Loading records...</div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(
                        historyRecords.reduce((groups: any, record: any) => {
                          const key = `${record.studentFirstName} ${record.studentLastName}`;
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(record);
                          return groups;
                        }, {})
                      ).map(([studentName, records]: [string, any[]]) => (
                        <div key={studentName} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-3">{studentName}</h5>
                          <div className="space-y-2">
                            {records.map((record: any, index: number) => (
                              <div
                                key={record.id}
                                className={`flex items-center justify-between p-2 rounded ${
                                  record.isCurrent 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                                    : 'bg-gray-50 dark:bg-gray-800'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      record.isPresent 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {record.isPresent ? 'Present' : 'Absent'}
                                    </span>
                                    <span className="text-xs text-gray-500">{record.method}</span>
                                    {record.isCurrent && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Current</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Entered at {new Date(record.enteredAt).toLocaleString()} 
                                    {record.enteredByFirstName && (
                                      <span> by {record.enteredByFirstName} {record.enteredByLastName}</span>
                                    )}
                                  </div>
                                  {record.correctionReason && (
                                    <div className="text-xs text-orange-600 mt-1">
                                      Reason: {record.correctionReason}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDate(selectedHistoryDate);
                                    setAttendanceData(prev => ({
                                      ...prev,
                                      [record.studentId]: record.isPresent
                                    }));
                                    setCorrectionReason('');
                                  }}
                                >
                                  Add Update
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  if (attendanceMode === 'family') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Tablet className="mr-2 h-5 w-5" />
                Family Check-in Tablet
              </div>
              <Button variant="outline" size="sm" onClick={() => setAttendanceMode('teacher')}>
                <X className="mr-2 h-4 w-4" />
                Exit Tablet Mode
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to {classroom?.name}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please tap your child's name to check them in for today
              </p>
            </div>

            {/* Large Check-in Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((student: any) => (
                <Button
                  key={student.id}
                  variant={attendanceData[student.id] ? "default" : "outline"}
                  size="lg"
                  onClick={() => checkInMutation.mutate(student.id)}
                  disabled={checkInMutation.isPending || attendanceData[student.id]}
                  className="h-20 flex-col space-y-2 text-lg"
                >
                  <div className="font-semibold">
                    {student.child?.firstName} {student.child?.lastName}
                  </div>
                  <div className="text-sm opacity-75">
                    {attendanceData[student.id] ? 'Checked In ✓' : 'Tap to Check In'}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attendanceMode === 'qr') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCode className="mr-2 h-5 w-5" />
                QR Code Check-in
              </div>
              <Button variant="outline" size="sm" onClick={() => setAttendanceMode('teacher')}>
                <X className="mr-2 h-4 w-4" />
                Exit QR Mode
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scan to Check In
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Families can scan this QR code with their phones to automatically check in their children
              </p>
              <div className="space-y-3">
                <Button onClick={() => setShowQRDialog(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  View Individual QR Codes
                </Button>
                <div className="text-sm text-gray-500">
                  QR Code URL: {window.location.origin}/check-in/{classroomId}
                </div>
              </div>
            </div>

            {/* Recent Check-ins */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Check-ins</h4>
              <div className="space-y-2">
                {students.filter(s => attendanceData[s.id]).map((student: any) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{student.child?.firstName} {student.child?.lastName}</span>
                    <span className="text-sm text-gray-500">Just now</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Individual QR Codes</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {students.map((student: any) => (
                <div key={student.id} className="text-center p-4 border rounded-lg">
                  <div className="w-32 h-32 mx-auto mb-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="font-medium text-sm">
                    {student.child?.firstName} {student.child?.lastName}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}

export default function ClassroomDetailPage() {
  const { user } = useAuth();
  const { currentRole } = useCurrentRole();
  const [match, params] = useRoute("/classrooms/:classroomId");
  const classroomId = params?.classroomId;
  const [activeTab, setActiveTab] = useState("overview");

  // Get user's school context
  const schoolId = currentRole?.schoolId;

  // Fetch classroom details
  const { data: classroom, isLoading: classroomLoading } = useQuery({
    queryKey: ["/api/classrooms", classroomId],
    enabled: !!classroomId,
  });

  // Fetch students in this classroom
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/classrooms", classroomId, "students"],
    enabled: !!classroomId,
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "infant": return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400";
      case "toddler": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "primary": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "lower_elem": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "upper_elem": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "junior_high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high_school": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatLevel = (level: string) => {
    switch (level) {
      case "infant": return "Infant";
      case "toddler": return "Toddler";
      case "primary": return "Primary";
      case "lower_elem": return "Lower Elementary";
      case "upper_elem": return "Upper Elementary";
      case "junior_high": return "Junior High";
      case "high_school": return "High School";
      default: return level;
    }
  };

  const getAgeRange = (level: string) => {
    switch (level) {
      case "infant": return "0-18 months";
      case "toddler": return "18 months - 3 years";
      case "primary": return "3-6 years";
      case "lower_elem": return "6-9 years";
      case "upper_elem": return "9-12 years";
      case "junior_high": return "12-15 years";
      case "high_school": return "15-18 years";
      default: return "Various";
    }
  };

  if (classroomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classroom details...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Classroom not found</h1>
            <p className="mt-2 text-gray-600">The requested classroom could not be found.</p>
            <Link href="/classrooms">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Classrooms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <TopNavigation user={user} currentSchool={null} currentRole={currentRole} />
      
      <div className="flex-1 flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 lg:p-6 pb-20">
            <div className="max-w-7xl mx-auto">
              
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
                    <Link href="/classrooms">
                      <Button variant="ghost" size="sm" className="w-fit">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Back to Classrooms</span>
                        <span className="sm:hidden">Back</span>
                      </Button>
                    </Link>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                          <School className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          {classroom.name}
                        </h1>
                        <Badge className={getLevelColor(classroom.level)}>
                          {formatLevel(classroom.level)}
                        </Badge>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {getAgeRange(classroom.level)} • {students.length} student{students.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="attendance" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Attendance</span>
                    <span className="sm:hidden">Attend</span>
                  </TabsTrigger>
                  <TabsTrigger value="lessons" className="text-xs sm:text-sm">Lessons</TabsTrigger>
                  <TabsTrigger value="observations" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Observations</span>
                    <span className="sm:hidden">Observe</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                  <TabsTrigger value="photos" className="text-xs sm:text-sm">Photos</TabsTrigger>
                  <TabsTrigger value="conferences" className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Conferences</span>
                    <span className="sm:hidden">Conf</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Today's Snapshot */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="mr-2 h-5 w-5" />
                          Today's Snapshot
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">85%</div>
                            <div className="text-sm text-green-600 dark:text-green-500">Attendance</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">12</div>
                            <div className="text-sm text-blue-600 dark:text-blue-500">Lessons</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <ClipboardList className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">8</div>
                            <div className="text-sm text-purple-600 dark:text-purple-500">Observations</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <Camera className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">15</div>
                            <div className="text-sm text-orange-600 dark:text-orange-500">Photos</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Attendance taken</div>
                            <div className="text-xs text-gray-500">10 minutes ago</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <ClipboardList className="h-4 w-4 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Observation recorded</div>
                            <div className="text-xs text-gray-500">1 hour ago</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">Lesson planned</div>
                            <div className="text-xs text-gray-500">2 hours ago</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Student Roster */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="mr-2 h-5 w-5" />
                          Student Roster ({students.length})
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : students.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No students enrolled yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {students.slice(0, 6).map((student: any) => (
                            <div key={student.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {student.child?.firstName?.[0]}{student.child?.lastName?.[0]}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {student.child?.firstName} {student.child?.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Present today
                                  </div>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="space-y-6">
                  <AttendanceInterface classroomId={classroomId} students={students} classroom={classroom} />
                </TabsContent>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-5 w-5" />
                          Montessori Lesson Planning
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Plan Lesson
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Lesson Planning System
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Plan and track Montessori lessons with curriculum alignment and student progress
                        </p>
                        <Button>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Start Planning Lessons
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Observations Tab */}
                <TabsContent value="observations" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Grid3X3 className="mr-2 h-5 w-5" />
                          Student Observations Grid
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Observation
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Grid3X3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Observation Grid System
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Track student presentations, practice, and mastery in a visual grid format
                        </p>
                        <Button>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Start Observing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Photos Tab */}
                <TabsContent value="photos" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Camera className="mr-2 h-5 w-5" />
                          Photo Management
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photos
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Smart Photo System
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Capture and organize student photos with facial recognition and activity tagging
                        </p>
                        <Button>
                          <Camera className="mr-2 h-4 w-4" />
                          Start Photo Management
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Classroom Notes
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Note
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Note Taking System
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Quick tablet-friendly notes about classroom activities, student behavior, and daily observations
                        </p>
                        <Button>
                          <Edit className="mr-2 h-4 w-4" />
                          Start Taking Notes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Conferences Tab */}
                <TabsContent value="conferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          Parent Conferences
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Schedule Conference
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Conference Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Plan, schedule, and conduct parent conferences with automated reporting
                        </p>
                        <Button>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Manage Conferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}