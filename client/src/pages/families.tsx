import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classroomFilter, setClassroomFilter] = useState("all");

  // Get current user's school context from the current role

  const schoolId = currentRole?.schoolId;

  // Fetch families data
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "enrollments"],
    enabled: !!schoolId,
  });

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
      case "enrolled": return "bg-green-100 text-green-800";
      case "prospective": return "bg-yellow-100 text-yellow-800";
      case "withdrawn": return "bg-gray-100 text-gray-800";
      case "graduated": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getClassroomColor = (level: string) => {
    switch (level) {
      case "primary": return "bg-blue-100 text-blue-800";
      case "toddler": return "bg-green-100 text-green-800";
      case "lower_elem": return "bg-purple-100 text-purple-800";
      case "upper_elem": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
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
          <p className="mt-4 text-gray-600">Loading families...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation user={user} currentSchool={null} currentRole={currentRole} />
      
      <div className="flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden lg:ml-64">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-primary" />
                Families
              </h1>
              <p className="mt-2 text-gray-600">
                Manage family enrollment, billing, and communication
              </p>
            </div>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Family
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search families..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="prospective">Prospective</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classroomFilter} onValueChange={setClassroomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map((classroom: any) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 flex items-center">
                {filteredFamilies.length} families found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family List */}
        <div className="space-y-4">
          {filteredFamilies.map((familyGroup: any) => (
            <Card key={familyGroup.family.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Family Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {getFamilyInitials(familyGroup.family.name)}
                        </span>
                      </div>
                    </div>

                    {/* Family Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {familyGroup.family.name || "Unnamed Family"}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {familyGroup.children.length} {familyGroup.children.length === 1 ? "child" : "children"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {familyGroup.family.email && (
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            {familyGroup.family.email}
                          </div>
                        )}
                        {familyGroup.family.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            {familyGroup.family.phone}
                          </div>
                        )}
                        {familyGroup.family.address && (
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {familyGroup.family.address}
                          </div>
                        )}
                      </div>

                      {/* Children */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Children:</h4>
                        <div className="space-y-2">
                          {familyGroup.children.map((child: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{child.firstName} {child.lastName}</span>
                                {child.classroom && (
                                  <Badge className={getClassroomColor(child.classroom.level)}>
                                    {child.classroom.name}
                                  </Badge>
                                )}
                              </div>
                              <Badge className={getStatusColor(child.status)}>
                                {child.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <Link href={`/families/${familyGroup.family.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/families/${familyGroup.family.id}/billing`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Billing
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No families found</h3>
                <p className="text-gray-600 mb-4">
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
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}