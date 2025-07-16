import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Upload
} from "lucide-react";

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

              {/* Quick Actions Bar - Tablet Optimized */}
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Button 
                      onClick={() => setActiveTab('attendance')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span className="text-xs">Attendance</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('observations')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <ClipboardList className="h-5 w-5" />
                      <span className="text-xs">Observe</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('lessons')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Lessons</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('photos')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-xs">Photos</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('notes')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs">Notes</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('conferences')}
                      className="h-16 flex-col space-y-1 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" 
                      variant="ghost"
                    >
                      <CalendarIcon className="h-5 w-5" />
                      <span className="text-xs">Conferences</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserCheck className="mr-2 h-5 w-5" />
                          Daily Attendance
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Take Attendance
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <UserCheck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Attendance System
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Tablet-optimized attendance taking with quick check-in/out functionality
                        </p>
                        <Button>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Start Taking Attendance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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