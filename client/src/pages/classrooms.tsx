import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import { 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Camera, 
  ClipboardList, 
  UserCheck, 
  MessageSquare,
  Search,
  Filter,
  Grid3X3,
  School,
  GraduationCap,
  Activity,
  FileText
} from "lucide-react";

export default function ClassroomsPage() {
  const { user } = useAuth();
  const { currentRole } = useCurrentRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  // Get user's school context
  const schoolId = currentRole?.schoolId;

  // Fetch classrooms for the school
  const { data: classrooms = [], isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
    enabled: !!schoolId,
  });

  // Fetch enrollment data for each classroom
  const { data: enrollmentsData = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "enrollments"],
    enabled: !!schoolId,
  });

  // Filter classrooms based on search and level
  const filteredClassrooms = classrooms.filter((classroom: any) => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || classroom.level === levelFilter;
    return matchesSearch && matchesLevel;
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

  const getClassroomStats = (classroomId: string) => {
    const enrollments = enrollmentsData.filter((e: any) => e.classroom?.id === classroomId && e.status === "enrolled");
    const totalStudents = enrollments.length;
    
    return {
      totalStudents,
      enrollments
    };
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classrooms...</p>
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
              {/* Page Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <School className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      Classrooms
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Manage your classroom activities, attendance, and lessons
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                    <span className="font-medium">{filteredClassrooms.length}</span>
                    <span className="ml-1">classroom{filteredClassrooms.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search classrooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="infant">Infant</SelectItem>
                        <SelectItem value="toddler">Toddler</SelectItem>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="lower_elem">Lower Elementary</SelectItem>
                        <SelectItem value="upper_elem">Upper Elementary</SelectItem>
                        <SelectItem value="junior_high">Junior High</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Classroom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClassrooms.map((classroom: any) => {
                  const stats = getClassroomStats(classroom.id);
                  
                  return (
                    <Card key={classroom.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <Link href={`/classrooms/${classroom.id}`}>
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {classroom.name}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getLevelColor(classroom.level)}>
                                  {formatLevel(classroom.level)}
                                </Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {getAgeRange(classroom.level)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.totalStudents}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                student{stats.totalStudents !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                              <div className="text-sm font-medium">Today's Attendance</div>
                              <div className="text-xs text-gray-500">--</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                              <div className="text-sm font-medium">Active Lessons</div>
                              <div className="text-xs text-gray-500">--</div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle quick attendance
                              }}
                            >
                              <UserCheck className="mr-1 h-3 w-3" />
                              Attendance
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle quick observation
                              }}
                            >
                              <ClipboardList className="mr-1 h-3 w-3" />
                              Observe
                            </Button>
                          </div>

                          {/* Program Type Indicator */}
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Program Type</span>
                              <Badge variant="outline" className="text-xs">
                                {classroom.programType === 'continuous' ? 'Year-round' : 'School Year'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredClassrooms.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No classrooms found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchTerm || levelFilter !== "all" 
                        ? "Try adjusting your search criteria" 
                        : "No classrooms have been set up yet"}
                    </p>
                    {!searchTerm && levelFilter === "all" && (
                      <Link href="/settings">
                        <Button>
                          <School className="mr-2 h-4 w-4" />
                          Set Up Classrooms
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}