import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Settings } from "lucide-react";

export default function StaffRolesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  
  // Get current school context
  const { data: school } = useQuery({
    queryKey: ["/api/user/current-school"],
    enabled: !!user,
  });
  
  // Get school ID for API calls
  const schoolId = school?.id || currentRole?.schoolId;
  
  // Fetch staff data
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "staff"],
    enabled: !!schoolId,
  });
  
  // State management
  const [activeTab, setActiveTab] = useState("staff");
  const [addingStaff, setAddingStaff] = useState(false);
  
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    startDate: ""
  });
  
  // Staff mutations
  const addStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/staff`, staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "staff"] });
      setAddingStaff(false);
      setStaffForm({
        firstName: "",
        lastName: "",
        email: "",
        role: "teacher",
        startDate: ""
      });
      toast({
        title: "Staff member added",
        description: "New staff member has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddStaff = () => {
    addStaffMutation.mutate({
      ...staffForm,
      schoolId: schoolId
    });
  };
  
  // Role formatting and coloring functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher_leader": return "bg-purple-100 text-purple-800";
      case "head_of_school": return "bg-indigo-100 text-indigo-800";
      case "school_admin": return "bg-indigo-100 text-indigo-800";
      case "classroom_guide": return "bg-green-100 text-green-800";
      case "teacher": return "bg-blue-100 text-blue-800";
      case "assistant": return "bg-green-100 text-green-800";
      case "aide": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatRole = (role: string) => {
    if (!role) return "";
    
    // Handle special Teacher Leader role
    if (role === 'teacher_leader') {
      return 'Teacher Leader';
    }
    
    // Remove "educator_" prefix for educator roles
    let displayRole = role;
    if (role.startsWith('educator_')) {
      displayRole = role.substring(9); // Remove "educator_" prefix
    }
    
    // Convert underscores to spaces and capitalize each word
    return displayRole.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <TopNavigation user={user} currentSchool={school} currentRole={currentRole} />
      
      <div className="flex-1 flex">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 lg:p-6 pb-20">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-primary" />
                Staff and Roles
              </h1>
              <p className="mt-2 text-gray-600">
                Manage staff members and role assignments for {school?.name || "your school"}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="staff" className="flex items-center px-3">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Staff</span>
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center px-3">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Role Assignments</span>
                </TabsTrigger>
              </TabsList>

              {/* Staff Tab */}
              <TabsContent value="staff" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Staff Members</CardTitle>
                      <Button onClick={() => setAddingStaff(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        // Filter to only show educator roles
                        const educatorStaff = staff.filter((member: any) => 
                          member.role && member.role.startsWith('educator_')
                        );
                        
                        // Group staff by user (email/name combination)
                        const groupedStaff = educatorStaff.reduce((acc: any, member: any) => {
                          const key = `${member.firstName}_${member.lastName}_${member.email}`;
                          if (!acc[key]) {
                            acc[key] = {
                              firstName: member.firstName,
                              lastName: member.lastName,
                              email: member.email,
                              roles: [],
                              startDate: member.startDate
                            };
                          }
                          acc[key].roles.push({
                            id: member.id,
                            role: member.role,
                            roleId: member.roleId,
                            startDate: member.startDate
                          });
                          // Use earliest start date
                          if (!acc[key].startDate || (member.startDate && new Date(member.startDate) < new Date(acc[key].startDate))) {
                            acc[key].startDate = member.startDate;
                          }
                          return acc;
                        }, {});

                        return Object.values(groupedStaff).map((person: any, index: number) => {
                          // Role IDs for Teacher Leader combination
                          const EDUCATOR_ADMIN_ROLE_ID = 'f438ae38-0c70-4182-9446-54903c001cd1';
                          const EDUCATOR_CLASSROOM_LEAD_ROLE_ID = '3c208f41-5a1b-44c1-a941-293585f7e8da';
                          
                          // Check if user has both educator_admin and educator_classroom_lead roles by roleId
                          const hasEducatorAdmin = person.roles.some((role: any) => role.roleId === EDUCATOR_ADMIN_ROLE_ID);
                          const hasEducatorClassroomLead = person.roles.some((role: any) => role.roleId === EDUCATOR_CLASSROOM_LEAD_ROLE_ID);
                          
                          let displayRoles = person.roles;
                          
                          // If user has both roles, replace them with single Teacher Leader role
                          if (hasEducatorAdmin && hasEducatorClassroomLead) {
                            // Filter out the two specific roles by roleId
                            const otherRoles = person.roles.filter((role: any) => 
                              role.roleId !== EDUCATOR_ADMIN_ROLE_ID && role.roleId !== EDUCATOR_CLASSROOM_LEAD_ROLE_ID
                            );
                            
                            // Add Teacher Leader role
                            displayRoles = [
                              {
                                id: 'teacher_leader',
                                role: 'teacher_leader',
                                startDate: person.startDate
                              },
                              ...otherRoles
                            ];
                          }
                          
                          return (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{person.firstName} {person.lastName}</h4>
                                  <p className="text-sm text-gray-600">{person.email}</p>
                                  {person.startDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Since {new Date(person.startDate).toLocaleDateString()}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center space-x-2 flex-wrap">
                                    {displayRoles.map((roleInfo: any, roleIndex: number) => (
                                      <Badge key={roleIndex} className={getRoleColor(roleInfo.role)}>
                                        {formatRole(roleInfo.role)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
                      {staff.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">No staff members added yet</p>
                          <Button className="mt-2" onClick={() => setAddingStaff(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Staff Member
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Role Assignments Tab */}
              <TabsContent value="assignments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Assignment Matrix</CardTitle>
                    <p className="text-sm text-gray-600">
                      Assign specific roles to staff members across different operational areas.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Survey Results Summary */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Survey Results</h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Staff members have completed self-assessment surveys rating their skills and interests.
                        </p>
                        <div className="space-y-2">
                          {[
                            { name: "Sarah Johnson", date: "2024-10-15", roles: 12, status: "Complete" },
                            { name: "Michael Chen", date: "2024-10-14", roles: 8, status: "In Progress" },
                            { name: "Emily Rodriguez", date: "2024-10-13", roles: 15, status: "Complete" },
                            { name: "David Kim", date: "2024-10-12", roles: 6, status: "Complete" }
                          ].map((survey, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded p-3 border">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">{survey.name}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {survey.roles} roles • {new Date(survey.date).toLocaleDateString()}
                              </div>
                              <Badge variant={survey.status === 'Complete' ? 'default' : 'secondary'}>
                                {survey.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Assignment Matrix */}
                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h3 className="font-semibold text-gray-900">Assignment Matrix</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Use survey results to guide role assignments through discussion.
                          </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left px-4 py-3 font-medium text-gray-900 border-r">Role</th>
                                <th className="text-center px-3 py-3 font-medium text-gray-900 border-r">Sarah Johnson</th>
                                <th className="text-center px-3 py-3 font-medium text-gray-900 border-r">Michael Chen</th>
                                <th className="text-center px-3 py-3 font-medium text-gray-900 border-r">Emily Rodriguez</th>
                                <th className="text-center px-3 py-3 font-medium text-gray-900">David Kim</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { name: "Educator Admin → Ongoing → Finance", assigned: "Sarah Johnson" },
                                { name: "Educator Admin → Startup → Marketing", assigned: "Emily Rodriguez" },
                                { name: "Educator Classroom → Lead", assigned: "Emily Rodriguez" },
                                { name: "Educator Classroom → Assistant", assigned: null }
                              ].map((role, index) => (
                                <tr key={role.name} className={`${role.assigned ? 'bg-green-50' : 'bg-red-50'} ${index % 2 === 0 ? '' : 'bg-opacity-50'}`}>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                    <div className="flex items-center">
                                      <div className={`w-3 h-3 rounded-full mr-2 ${role.assigned ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                      {role.name}
                                    </div>
                                  </td>
                                  {["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim"].map((staff) => (
                                    <td key={staff} className="px-3 py-3 text-center border-r last:border-r-0">
                                      <input 
                                        type="radio" 
                                        name={`role-${role.name}`}
                                        value={staff}
                                        checked={role.assigned === staff}
                                        readOnly
                                        className="h-4 w-4 text-primary"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="px-4 py-3 bg-gray-50 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <strong>5 of 7</strong> roles assigned
                            </div>
                            <Button size="sm">
                              Save Assignments
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Add Staff Dialog */}
      <Dialog open={addingStaff} onOpenChange={setAddingStaff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new staff member to your school team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={staffForm.role} onValueChange={(value) => setStaffForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher_leader">Teacher Leader</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="aide">Aide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={staffForm.startDate}
                onChange={(e) => setStaffForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddingStaff(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddStaff}
                disabled={!staffForm.firstName || !staffForm.lastName || !staffForm.email}
              >
                Add Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}