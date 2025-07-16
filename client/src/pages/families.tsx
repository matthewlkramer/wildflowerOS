import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  GraduationCap
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function FamiliesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classroomFilter, setClassroomFilter] = useState("all");

  // Determine if user is system admin
  const isSystemAdmin = currentRole?.name?.startsWith('sysadmin');
  
  // Get current user's school context from the current role or fallback to first school
  const schoolId = currentRole?.schoolId || user?.schools?.[0]?.id;

  // Fetch families data - either all families for system admin or school-specific
  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: isSystemAdmin ? ["/api/enrollments"] : ["/api/schools", schoolId, "enrollments"],
    enabled: isSystemAdmin || !!schoolId,
  });

  // Debug logging
  console.log("Families page - isSystemAdmin:", isSystemAdmin);
  console.log("Families page - schoolId:", schoolId);
  console.log("Families page - enrollments:", enrollments);
  console.log("Families page - isLoading:", isLoading);
  console.log("Families page - error:", error);

  const { data: classrooms = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
    enabled: !!schoolId,
  });

  // Group enrollments by family
  const familyGroups = enrollments.reduce((acc: any, enrollment: any) => {
    const familyId = enrollment.family?.id;
    if (!familyId) return acc;
    
    if (!acc[familyId]) {
      acc[familyId] = {
        family: enrollment.family,
        children: [],
      };
    }
    acc[familyId].children.push({
      ...enrollment.child,
      classroom: enrollment.classroom,
      status: enrollment.status,
      enrollment: enrollment,
    });
    return acc;
  }, {});

  const families = Object.values(familyGroups);

  // Filter families
  const filteredFamilies = families.filter((familyGroup: any) => {
    const matchesSearch = familyGroup.family.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         familyGroup.family.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         familyGroup.children.some((child: any) => child.status === statusFilter);
    
    const matchesClassroom = classroomFilter === "all" ||
                            familyGroup.children.some((child: any) => child.classroom?.id === classroomFilter);
    
    return matchesSearch && matchesStatus && matchesClassroom;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enrolled": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "prospective": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "withdrawn": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "graduated": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getClassroomColor = (level: string) => {
    switch (level) {
      case "primary": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "toddler": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "lower_elem": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "upper_elem": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getFamilyInitials = (familyName: string) => {
    return familyName
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
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
            <div className="max-w-6xl mx-auto">
              {/* Page Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <Users className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      {t("families")}
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {t("family_management")}
                    </p>
                  </div>
                  <Button className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="sm:inline">{t("add")} {t("families")}</span>
                  </Button>
                </div>
              </div>

              {/* Filters and Search */}
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                    <div className="relative col-span-full sm:col-span-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("search_families")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("all_statuses")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all_statuses")}</SelectItem>
                        <SelectItem value="prospective">{t("prospective")}</SelectItem>
                        <SelectItem value="enrolled">{t("enrolled")}</SelectItem>
                        <SelectItem value="graduated">{t("graduated")}</SelectItem>
                        <SelectItem value="withdrawn">{t("withdrawn")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={classroomFilter} onValueChange={setClassroomFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("all_classrooms")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("all_classrooms")}</SelectItem>
                        {classrooms.map((classroom: any) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start bg-gray-50 dark:bg-gray-800 rounded p-2 sm:bg-transparent sm:p-0">
                      <span className="font-medium">{filteredFamilies.length}</span>
                      <span className="ml-1">{t("families_found")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family List */}
              <div className="space-y-4">
                {filteredFamilies.map((familyGroup: any) => (
                  <Card key={familyGroup.family.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Family Header - Mobile Optimized */}
                        <div className="flex items-center space-x-4 sm:flex-col sm:space-x-0 sm:space-y-2 sm:flex-shrink-0">
                          {/* Family Avatar */}
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary text-white dark:text-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg sm:text-xl font-medium">
                              {getFamilyInitials(familyGroup.family.name)}
                            </span>
                          </div>
                          
                          {/* Mobile: Family Name and Count inline with avatar */}
                          <div className="flex-1 sm:hidden">
                            <Link href={`/families/${familyGroup.family.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                {familyGroup.family.name || "Unnamed Family"}
                              </h3>
                            </Link>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {familyGroup.children.length} {familyGroup.children.length === 1 ? "child" : "children"}
                            </Badge>
                          </div>
                        </div>

                        {/* Family Info */}
                        <div className="flex-1 min-w-0">
                          {/* Desktop: Family Name and Count */}
                          <div className="hidden sm:flex sm:items-center sm:space-x-3 sm:mb-3">
                            <Link href={`/families/${familyGroup.family.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                {familyGroup.family.name || "Unnamed Family"}
                              </h3>
                            </Link>
                            <Badge className="bg-blue-100 text-blue-800">
                              {familyGroup.children.length} {familyGroup.children.length === 1 ? "child" : "children"}
                            </Badge>
                          </div>

                          {/* Contact Info - Stack on mobile, grid on larger screens */}
                          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {familyGroup.family.email && (
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{familyGroup.family.email}</span>
                              </div>
                            )}
                            {familyGroup.family.phone && (
                              <div className="flex items-center">
                                <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                                {familyGroup.family.phone}
                              </div>
                            )}
                            {familyGroup.family.address && (
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{familyGroup.family.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Children */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Children:</h4>
                            <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-3">
                              {familyGroup.children.map((child: any) => (
                                <Link key={child.id} href={`/children/${child.id}`}>
                                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                      <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {child.firstName} {child.lastName}
                                      </span>
                                      {child.classroom && (
                                        <Badge className={`${getClassroomColor(child.classroom.level)} flex-shrink-0 hidden sm:inline-flex`}>
                                          {child.classroom.name}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      {child.classroom && (
                                        <Badge className={`${getClassroomColor(child.classroom.level)} text-xs sm:hidden`}>
                                          {child.classroom.name}
                                        </Badge>
                                      )}
                                      <Badge className={`${getStatusColor(child.status)} text-xs`}>
                                        {child.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                      </Badge>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Mobile: horizontal, Desktop: vertical */}
                        <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0">
                          <Link href={`/families/${familyGroup.family.id}`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                              <span className="sm:hidden">Details</span>
                              <span className="hidden sm:inline">View Details</span>
                            </Button>
                          </Link>
                          <Link href={`/families/${familyGroup.family.id}/billing`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                              <DollarSign className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Billing
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none w-full text-xs sm:text-sm">
                            <MessageCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sm:hidden">Msg</span>
                            <span className="hidden sm:inline">Message</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredFamilies.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No families found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {searchTerm || statusFilter !== "all" || classroomFilter !== "all" 
                          ? "Try adjusting your search criteria" 
                          : "Get started by adding your first family"}
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Family
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}