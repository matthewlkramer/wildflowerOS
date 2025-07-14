import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Users, 
  Home, 
  Calendar, 
  DollarSign,
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  School,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function SchoolSettingsPage() {
  const { user } = useAuth();
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  const [activeTab, setActiveTab] = useState("staff");
  const [addingStaff, setAddingStaff] = useState(false);
  const [addingClassroom, setAddingClassroom] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<any>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<any>(null);
  const [addingTuitionPlan, setAddingTuitionPlan] = useState(false);
  const [addingSchoolYear, setAddingSchoolYear] = useState(false);
  
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "teacher",
    startDate: ""
  });

  const [schoolYearForm, setSchoolYearForm] = useState({
    name: "",
    startDate: "",
    endDate: ""
  });

  const [classroomForm, setClassroomForm] = useState({
    name: "",
    level: "primary",
    capacity: "",
    ageRange: "3-6 years",
    description: ""
  });

  // Authentic age ranges from original Wildflower data model
  const levelAgeRanges = {
    infant: "0-18 months",
    toddler: "18 months - 3 years",
    primary: "3-6 years", 
    lower_elem: "6-9 years",
    upper_elem: "9-12 years",
    junior_high: "12-15 years",
    high_school: "15-18 years"
  };

  const [tuitionForm, setTuitionForm] = useState({
    name: "",
    level: "primary",
    amount: "",
    schedule: "monthly",
    description: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's school context from the current role

  const schoolId = currentRole?.schoolId;

  // Fetch school data
  const { data: school } = useQuery({
    queryKey: ["/api/schools", schoolId],
    enabled: !!schoolId,
  });

  // Fetch staff
  const { data: staff = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "staff"],
    enabled: !!schoolId,
  });

  // Fetch classrooms
  const { data: classrooms = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
    enabled: !!schoolId,
  });

  // Fetch school years
  const { data: schoolYears = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "school-years"],
    enabled: !!schoolId,
  });

  // Fetch tuition plans
  const { data: tuitionPlans = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "tuition-plans"],
    enabled: !!schoolId,
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/staff`, staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "staff"] });
      setAddingStaff(false);
      setStaffForm({ firstName: "", lastName: "", email: "", role: "teacher", startDate: "" });
      toast({
        title: "Staff member added",
        description: "New staff member has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding staff",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add classroom mutation
  const addClassroomMutation = useMutation({
    mutationFn: async (classroomData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/classrooms`, { ...classroomData, schoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "classrooms"] });
      setAddingClassroom(false);
      setClassroomForm({ name: "", level: "primary", capacity: "", ageRange: "3-6 years", description: "" });
      toast({
        title: "Classroom added",
        description: "New classroom has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding classroom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update classroom mutation
  const updateClassroomMutation = useMutation({
    mutationFn: async (classroomData: any) => {
      return apiRequest('PATCH', `/api/classrooms/${classroomData.id}`, classroomData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "classrooms"] });
      setEditingClassroom(null);
      setClassroomForm({ name: "", level: "primary", capacity: "", ageRange: "3-6 years", description: "" });
      toast({
        title: "Classroom updated",
        description: "Classroom has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating classroom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete classroom mutation
  const deleteClassroomMutation = useMutation({
    mutationFn: async (classroomId: string) => {
      return apiRequest('DELETE', `/api/classrooms/${classroomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "classrooms"] });
      toast({
        title: "Classroom deleted",
        description: "Classroom has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting classroom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add tuition plan mutation
  const addTuitionPlanMutation = useMutation({
    mutationFn: async (tuitionData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/tuition-plans`, { ...tuitionData, schoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "tuition-plans"] });
      setAddingTuitionPlan(false);
      setTuitionForm({ name: "", level: "primary", amount: "", schedule: "monthly", description: "" });
      toast({
        title: "Tuition plan added",
        description: "New tuition plan has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding tuition plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add school year mutation
  const addSchoolYearMutation = useMutation({
    mutationFn: async (schoolYearData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/school-years`, schoolYearData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setAddingSchoolYear(false);
      setSchoolYearForm({ name: "", startDate: "", endDate: "" });
      toast({
        title: "School year added",
        description: "New school year has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set active school year mutation
  const setActiveSchoolYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      return apiRequest('PATCH', `/api/school-years/${yearId}/set-active`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      toast({
        title: "Active school year updated",
        description: "The active school year has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating active school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddStaff = () => {
    addStaffMutation.mutate(staffForm);
  };

  const handleAddClassroom = () => {
    addClassroomMutation.mutate({
      ...classroomForm,
      capacity: parseInt(classroomForm.capacity) || null,
    });
  };

  const handleEditClassroom = (classroom: any) => {
    setClassroomForm({
      name: classroom.name,
      level: classroom.level,
      capacity: classroom.capacity?.toString() || "",
      ageRange: classroom.ageRange || levelAgeRanges[classroom.level as keyof typeof levelAgeRanges] || "",
      description: classroom.description || ""
    });
    setEditingClassroom(classroom);
  };

  const handleUpdateClassroom = () => {
    updateClassroomMutation.mutate({
      id: editingClassroom.id,
      ...classroomForm,
      capacity: parseInt(classroomForm.capacity) || null,
    });
  };

  const handleDeleteClassroom = (classroom: any) => {
    setDeletingClassroom(classroom);
  };

  const confirmDeleteClassroom = () => {
    if (deletingClassroom) {
      deleteClassroomMutation.mutate(deletingClassroom.id);
      setDeletingClassroom(null);
    }
  };

  const handleLevelChange = (level: string) => {
    setClassroomForm(prev => ({
      ...prev,
      level,
      ageRange: levelAgeRanges[level as keyof typeof levelAgeRanges] || ""
    }));
  };

  const handleAddTuitionPlan = () => {
    addTuitionPlanMutation.mutate({
      ...tuitionForm,
      amount: parseFloat(tuitionForm.amount),
    });
  };

  const handleAddSchoolYear = () => {
    addSchoolYearMutation.mutate({
      ...schoolYearForm,
      schoolId: schoolId
    });
  };

  const handleSetActiveSchoolYear = (yearId: string) => {
    setActiveSchoolYearMutation.mutate(yearId);
  };

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case "infant": return "bg-pink-100 text-pink-800";
      case "toddler": return "bg-green-100 text-green-800";
      case "primary": return "bg-blue-100 text-blue-800";
      case "lower_elem": return "bg-purple-100 text-purple-800";
      case "upper_elem": return "bg-indigo-100 text-indigo-800";
      case "junior_high": return "bg-orange-100 text-orange-800";
      case "high_school": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "";
    return role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const formatLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      infant: "Infant",
      toddler: "Toddler",
      primary: "Primary",
      lower_elem: "Lower Elementary",
      upper_elem: "Upper Elementary", 
      junior_high: "Junior High",
      high_school: "High School"
    };
    return levelMap[level] || level;
  };

  // Get current school context for navigation
  const currentSchoolForNav = school;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation user={user} currentSchool={currentSchoolForNav} currentRole={currentRole} />
      
      <div className="flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden lg:ml-64">
          <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-primary" />
            School Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage staff, classrooms, schedules, and tuition plans for {school?.name || "your school"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="staff" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="classrooms" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Classrooms
            </TabsTrigger>
            <TabsTrigger value="school-years" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              School Years
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="tuition" className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Tuition Plans
            </TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Staff Members</CardTitle>
                  <Dialog open={addingStaff} onOpenChange={setAddingStaff}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input
                              value={staffForm.firstName}
                              onChange={(e) => setStaffForm(prev => ({ ...prev, firstName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input
                              value={staffForm.lastName}
                              onChange={(e) => setStaffForm(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select onValueChange={(value) => setStaffForm(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
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
                          <Label>Start Date</Label>
                          <Input
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Group staff by user (email/name combination)
                    const groupedStaff = staff.reduce((acc: any, member: any) => {
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
                        startDate: member.startDate
                      });
                      // Use earliest start date
                      if (!acc[key].startDate || (member.startDate && new Date(member.startDate) < new Date(acc[key].startDate))) {
                        acc[key].startDate = member.startDate;
                      }
                      return acc;
                    }, {});

                    return Object.values(groupedStaff).map((person: any, index: number) => (
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
                              {person.roles.map((roleInfo: any, roleIndex: number) => (
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
                    ));
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

          {/* Classrooms Tab */}
          <TabsContent value="classrooms" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Classrooms</CardTitle>
                  <Dialog open={addingClassroom} onOpenChange={setAddingClassroom}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Classroom
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Classroom</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Classroom Name</Label>
                          <Input
                            value={classroomForm.name}
                            onChange={(e) => setClassroomForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Maple Room, Oak Room"
                          />
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Select onValueChange={handleLevelChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infant">Infant (0-18 months)</SelectItem>
                              <SelectItem value="toddler">Toddler (18 months - 3 years)</SelectItem>
                              <SelectItem value="primary">Primary (3-6 years)</SelectItem>
                              <SelectItem value="lower_elem">Lower Elementary (6-9 years)</SelectItem>
                              <SelectItem value="upper_elem">Upper Elementary (9-12 years)</SelectItem>
                              <SelectItem value="junior_high">Junior High (12-15 years)</SelectItem>
                              <SelectItem value="high_school">High School (15-18 years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Capacity</Label>
                            <Input
                              type="number"
                              value={classroomForm.capacity}
                              onChange={(e) => setClassroomForm(prev => ({ ...prev, capacity: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Age Range</Label>
                            <Input
                              value={classroomForm.ageRange}
                              onChange={(e) => setClassroomForm(prev => ({ ...prev, ageRange: e.target.value }))}
                              placeholder="e.g., 3-6 years"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={classroomForm.description}
                            onChange={(e) => setClassroomForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setAddingClassroom(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddClassroom}
                            disabled={!classroomForm.name || !classroomForm.level}
                          >
                            Add Classroom
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Classroom Dialog */}
                  <Dialog open={editingClassroom !== null} onOpenChange={(open) => !open && setEditingClassroom(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Classroom</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Classroom Name</Label>
                          <Input
                            value={classroomForm.name}
                            onChange={(e) => setClassroomForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Maple Room, Oak Room"
                          />
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Select value={classroomForm.level} onValueChange={handleLevelChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infant">Infant (0-18 months)</SelectItem>
                              <SelectItem value="toddler">Toddler (18 months - 3 years)</SelectItem>
                              <SelectItem value="primary">Primary (3-6 years)</SelectItem>
                              <SelectItem value="lower_elem">Lower Elementary (6-9 years)</SelectItem>
                              <SelectItem value="upper_elem">Upper Elementary (9-12 years)</SelectItem>
                              <SelectItem value="junior_high">Junior High (12-15 years)</SelectItem>
                              <SelectItem value="high_school">High School (15-18 years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Capacity</Label>
                            <Input
                              type="number"
                              value={classroomForm.capacity}
                              onChange={(e) => setClassroomForm(prev => ({ ...prev, capacity: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Age Range</Label>
                            <Input
                              value={classroomForm.ageRange}
                              onChange={(e) => setClassroomForm(prev => ({ ...prev, ageRange: e.target.value }))}
                              placeholder="e.g., 3-6 years"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={classroomForm.description}
                            onChange={(e) => setClassroomForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setEditingClassroom(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleUpdateClassroom}
                            disabled={!classroomForm.name || !classroomForm.level || updateClassroomMutation.isPending}
                          >
                            {updateClassroomMutation.isPending ? "Updating..." : "Update Classroom"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Classroom Confirmation Dialog */}
                  <AlertDialog open={deletingClassroom !== null} onOpenChange={(open) => !open && setDeletingClassroom(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{deletingClassroom?.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingClassroom(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDeleteClassroom}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Classroom
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.map((classroom: any) => (
                    <div key={classroom.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{classroom.name}</h4>
                        <Badge className={getLevelColor(classroom.level)}>
                          {formatLevel(classroom.level)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {classroom.capacity && (
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Capacity: {classroom.capacity}
                          </div>
                        )}
                        {classroom.ageRange && (
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Age: {classroom.ageRange}
                          </div>
                        )}
                        {classroom.description && (
                          <p className="text-xs mt-2">{classroom.description}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClassroom(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClassroom(classroom)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {classrooms.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No classrooms configured yet</p>
                      <Button className="mt-2" onClick={() => setAddingClassroom(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Classroom
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Years Tab */}
          <TabsContent value="school-years" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>School Years</CardTitle>
                  <Dialog open={addingSchoolYear} onOpenChange={setAddingSchoolYear}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add School Year
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New School Year</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Year Name</Label>
                          <Input
                            value={schoolYearForm.name}
                            onChange={(e) => setSchoolYearForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., 2024-2025"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={schoolYearForm.startDate}
                              onChange={(e) => setSchoolYearForm(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={schoolYearForm.endDate}
                              onChange={(e) => setSchoolYearForm(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setAddingSchoolYear(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddSchoolYear}
                            disabled={!schoolYearForm.name || !schoolYearForm.startDate || !schoolYearForm.endDate}
                          >
                            Add School Year
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schoolYears.map((year: any) => (
                    <div key={year.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium flex items-center">
                            {year.name}
                            {year.isActive && (
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                Current
                              </Badge>
                            )}
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {year.startDate && year.endDate && (
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!year.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetActiveSchoolYear(year.id)}
                            >
                              Set Active
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {schoolYears.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">No school years configured yet</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first school year to start managing academic calendars, enrollment periods, and schedules.
                      </p>
                      <Button onClick={() => setAddingSchoolYear(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First School Year
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Events */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">First Day of School</h4>
                    <p className="text-sm text-blue-600 mt-1">September 5, 2024</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800">Fall Break</h4>
                    <p className="text-sm text-orange-600 mt-1">October 9-13, 2024</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800">Winter Break</h4>
                    <p className="text-sm text-red-600 mt-1">December 18 - January 8</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Spring Break</h4>
                    <p className="text-sm text-green-600 mt-1">March 24-28, 2025</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Last Day of School</h4>
                    <p className="text-sm text-purple-600 mt-1">June 12, 2025</p>
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-6">
            {/* Daily Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Schedule Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Primary Program</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-800">Full Day</span>
                          <Badge className="bg-blue-100 text-blue-800">8:00 AM - 3:00 PM</Badge>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">7 hours of programming</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800">Half Day Morning</span>
                          <Badge className="bg-green-100 text-green-800">8:00 AM - 12:00 PM</Badge>
                        </div>
                        <p className="text-sm text-green-600 mt-1">4 hours of programming</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-yellow-800">Extended Day</span>
                          <Badge className="bg-yellow-100 text-yellow-800">8:00 AM - 5:00 PM</Badge>
                        </div>
                        <p className="text-sm text-yellow-600 mt-1">Includes aftercare</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Toddler Program</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-purple-800">Full Day</span>
                          <Badge className="bg-purple-100 text-purple-800">8:00 AM - 3:00 PM</Badge>
                        </div>
                        <p className="text-sm text-purple-600 mt-1">7 hours with nap time</p>
                      </div>
                      <div className="p-3 bg-pink-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-pink-800">Half Day</span>
                          <Badge className="bg-pink-100 text-pink-800">8:00 AM - 12:00 PM</Badge>
                        </div>
                        <p className="text-sm text-pink-600 mt-1">4 hours morning program</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Weekly Schedule</h4>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Schedule
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm">{day}</h5>
                        <div className="mt-2 space-y-1">
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Morning Circle
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Work Time
                          </div>
                          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Outdoor Time
                          </div>
                          {day === 'Friday' && (
                            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Art & Music
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Periods */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Open Enrollment</h4>
                        <p className="text-sm text-gray-600">January 15 - March 15, 2025</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Priority Enrollment (Returning Families)</h4>
                        <p className="text-sm text-gray-600">December 1 - January 14, 2025</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Rolling Enrollment</h4>
                        <p className="text-sm text-gray-600">March 16 - August 31, 2025</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Planned</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tuition Plans Tab */}
          <TabsContent value="tuition" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tuition Plans</CardTitle>
                  <Dialog open={addingTuitionPlan} onOpenChange={setAddingTuitionPlan}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tuition Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Tuition Plan</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Plan Name</Label>
                          <Input
                            value={tuitionForm.name}
                            onChange={(e) => setTuitionForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Full Day Primary, Half Day Toddler"
                          />
                        </div>
                        <div>
                          <Label>Level</Label>
                          <Select onValueChange={(value) => setTuitionForm(prev => ({ ...prev, level: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Amount ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={tuitionForm.amount}
                              onChange={(e) => setTuitionForm(prev => ({ ...prev, amount: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Schedule</Label>
                            <Select onValueChange={(value) => setTuitionForm(prev => ({ ...prev, schedule: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="semester">Semester</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={tuitionForm.description}
                            onChange={(e) => setTuitionForm(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setAddingTuitionPlan(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddTuitionPlan}
                            disabled={!tuitionForm.name || !tuitionForm.amount}
                          >
                            Add Tuition Plan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tuitionPlans.map((plan: any) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{plan.name}</h4>
                        <Badge className={getLevelColor(plan.level)}>
                          {formatLevel(plan.level)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          ${plan.amount}
                          <span className="text-sm font-normal text-gray-600">
                            /{plan.schedule}
                          </span>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {tuitionPlans.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No tuition plans configured yet</p>
                      <Button className="mt-2" onClick={() => setAddingTuitionPlan(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Tuition Plan
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>

      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}