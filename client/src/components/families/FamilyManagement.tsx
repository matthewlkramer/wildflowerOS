import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FamilyManagementProps {
  schoolId: string;
}

export default function FamilyManagement({ schoolId }: FamilyManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [classroomFilter, setClassroomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "enrollments"],
  });

  const { data: classrooms } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
  });

  // Group enrollments by family
  const familyGroups = enrollments?.reduce((acc: any, enrollment: any) => {
    const familyId = enrollment.family.id;
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
    });
    return acc;
  }, {}) || {};

  const families = Object.values(familyGroups);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enrolled": return "bg-green-100 text-green-800";
      case "prospective": return "bg-yellow-100 text-yellow-800";
      case "withdrawn": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
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

  return (
    <div className="mt-12">
      <Card className="shadow rounded-lg">
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Family Management
            </h3>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Family
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search families..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={classroomFilter} onValueChange={setClassroomFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Classrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms?.map((classroom: any) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="prospective">Prospective</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Family List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-users text-4xl mb-4 text-gray-300"></i>
              <p className="text-lg font-medium">No families found</p>
              <p className="text-sm">Start by adding your first family to the school.</p>
              <Button className="mt-4">
                <i className="fas fa-plus mr-2"></i>
                Add First Family
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {families.map((familyGroup: any) => (
                <div 
                  key={familyGroup.family.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {getFamilyInitials(familyGroup.family.name)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {familyGroup.family.name || "Unnamed Family"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {familyGroup.children.length} {familyGroup.children.length === 1 ? "child" : "children"} • {familyGroup.family.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 space-x-1">
                          {familyGroup.children.map((child: any, index: number) => (
                            <Badge 
                              key={index} 
                              className={`${child.classroom ? getClassroomColor(child.classroom.level) : "bg-gray-100 text-gray-800"}`}
                            >
                              {child.classroom?.name || "No Classroom"}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {familyGroup.children[0]?.status && (
                            <Badge className={getStatusColor(familyGroup.children[0].status)}>
                              {familyGroup.children[0].status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-ellipsis-h"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{Math.min(10, families.length)}</span> of{" "}
                  <span className="font-medium">{families.length}</span> families
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button variant="outline" size="sm" className="rounded-l-md">
                    <i className="fas fa-chevron-left"></i>
                  </Button>
                  <Button variant="default" size="sm" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-r-md">
                    <i className="fas fa-chevron-right"></i>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
