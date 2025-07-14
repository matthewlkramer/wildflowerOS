import { useState, useEffect } from "react";
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
  Clock,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";


// Role Tree Component
function RoleTree() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch all role definitions from the database
  const { data: roles = [] } = useQuery({
    queryKey: ["/api/roles"],
    enabled: true,
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Build hierarchical structure from flat role data
  const buildHierarchy = (roles: any[]) => {
    const hierarchy: any = {};
    
    roles.forEach(role => {
      const parts = role.name.split('_');
      let current = hierarchy;
      
      // Build the nested structure
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const fullPath = parts.slice(0, i + 1).join('_');
        
        if (!current[part]) {
          current[part] = {
            id: fullPath,
            name: part,
            displayName: i === parts.length - 1 ? role.displayName : part.charAt(0).toUpperCase() + part.slice(1),
            description: i === parts.length - 1 ? role.description : '',
            active: role.networkDefault,
            children: {},
            isLeaf: i === parts.length - 1,
            level: i + 1
          };
        }
        
        current = current[part].children;
      }
    });
    
    return hierarchy;
  };

  // Convert hierarchy object to array format for rendering
  const convertToArray = (obj: any): any[] => {
    return Object.keys(obj).map(key => {
      const item = obj[key];
      const children = Object.keys(item.children).length > 0 ? convertToArray(item.children) : [];
      
      return {
        ...item,
        children,
        count: children.length > 0 ? children.reduce((sum, child) => sum + (child.count || 1), 0) : 1
      };
    });
  };

  const roleHierarchy = roles.length > 0 ? convertToArray(buildHierarchy(roles)) : [];

  // Add colors for top-level categories
  const getColorForCategory = (name: string) => {
    switch (name) {
      case 'educator': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'board': return 'bg-purple-100 text-purple-800';
      case 'sysadmin': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNode = (node: any, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = level * 24;

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer`}
          style={{ paddingLeft: paddingLeft + 8 }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
            {!hasChildren && <div className="w-4 h-4"></div>}
            <div className={`w-2 h-2 rounded-full ${node.active === false ? 'bg-gray-400' : 'bg-green-500'}`}></div>
            <div className="flex-1">
              <div className="font-medium">{node.displayName || node.name}</div>
              {node.description && (
                <div className="text-sm text-gray-600">{node.description}</div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {level === 0 && (
              <Badge className={getColorForCategory(node.name)}>{node.count}</Badge>
            )}
            {level > 0 && (
              <Badge variant="outline">{node.count} {node.count === 1 ? 'role' : 'roles'}</Badge>
            )}
            {node.active !== undefined && (
              <Badge variant={node.active ? "default" : "secondary"}>
                {node.active ? "Active" : "Inactive"}
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {roleHierarchy.map((node) => renderNode(node))}
    </div>
  );
}

// Academic Calendar Component
function AcademicCalendarView({ schoolYear }: { schoolYear: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [calendarForm, setCalendarForm] = useState({
    firstDayOfSchool: "",
    lastDayOfSchool: "",
  });

  // Fetch academic calendar for this school year
  const { data: academicCalendar, isLoading } = useQuery({
    queryKey: ["/api/school-years", schoolYear?.id, "calendar"],
    enabled: !!schoolYear?.id,
  });

  const { data: calendarClosures } = useQuery({
    queryKey: ["/api/academic-calendars", academicCalendar?.id, "closures"],
    enabled: !!academicCalendar?.id,
  });

  // Update form when calendar data loads
  useEffect(() => {
    if (academicCalendar) {
      setCalendarForm({
        firstDayOfSchool: academicCalendar.firstDayOfSchool ? new Date(academicCalendar.firstDayOfSchool).toISOString().split('T')[0] : "",
        lastDayOfSchool: academicCalendar.lastDayOfSchool ? new Date(academicCalendar.lastDayOfSchool).toISOString().split('T')[0] : "",
      });
    }
  }, [academicCalendar]);

  const createCalendarMutation = useMutation({
    mutationFn: async (calendarData: any) => {
      return apiRequest('POST', `/api/school-years/${schoolYear.id}/calendar`, calendarData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYear.id, "calendar"] });
      toast({
        title: "Academic calendar created",
        description: "Academic calendar has been set up successfully.",
      });
    },
  });

  const updateCalendarMutation = useMutation({
    mutationFn: async (calendarData: any) => {
      return apiRequest('PATCH', `/api/academic-calendars/${academicCalendar.id}`, calendarData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYear.id, "calendar"] });
      toast({
        title: "Academic calendar updated",
        description: "Academic calendar has been updated successfully.",
      });
    },
  });

  const handleSaveCalendar = () => {
    if (academicCalendar) {
      updateCalendarMutation.mutate(calendarForm);
    } else {
      createCalendarMutation.mutate(calendarForm);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* School Year Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">School Year Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">School Year Period</Label>
              <p className="text-sm text-gray-600">
                {schoolYear?.startDate && schoolYear?.endDate ? (
                  `${new Date(schoolYear.startDate).toLocaleDateString()} - ${new Date(schoolYear.endDate).toLocaleDateString()}`
                ) : (
                  "No dates set"
                )}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex items-center space-x-2">
                {schoolYear?.isActive && (
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                )}
                {schoolYear?.networkDefault && (
                  <Badge className="bg-blue-100 text-blue-800">Network Default</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Academic Calendar Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First and Last Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Day of School</Label>
              <Input
                type="date"
                value={calendarForm.firstDayOfSchool}
                onChange={(e) => setCalendarForm(prev => ({ ...prev, firstDayOfSchool: e.target.value }))}
              />
            </div>
            <div>
              <Label>Last Day of School</Label>
              <Input
                type="date"
                value={calendarForm.lastDayOfSchool}
                onChange={(e) => setCalendarForm(prev => ({ ...prev, lastDayOfSchool: e.target.value }))}
              />
            </div>
          </div>

          {/* Note about scheduling */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Classroom operating days and hours are now managed per classroom in the scheduling system. 
              This calendar focuses on academic year boundaries and school-wide closures.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveCalendar}>
              {academicCalendar ? "Update Calendar" : "Create Calendar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Closures */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Holidays & Closures</CardTitle>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calendarClosures && calendarClosures.length > 0 ? (
            <div className="space-y-2">
              {calendarClosures.map((closure: any) => (
                <div key={closure.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{closure.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(closure.date).toLocaleDateString()}
                    </p>
                    {closure.description && (
                      <p className="text-xs text-gray-500 mt-1">{closure.description}</p>
                    )}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No holidays or closures scheduled</p>
              <p className="text-sm text-gray-500">Add holidays, breaks, and school closure dates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [editingSchoolYear, setEditingSchoolYear] = useState<any>(null);
  const [deletingSchoolYear, setDeletingSchoolYear] = useState<any>(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [addingSubsidy, setAddingSubsidy] = useState(false);
  
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

  const [subsidyForm, setSubsidyForm] = useState({
    name: "",
    type: "",
    description: "",
    startDate: "",
    endDate: "",
    externalId: "",
    applicationDeadline: "",
    requiredDocumentation: ""
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

  // Fetch public subsidies
  const { data: publicSubsidies = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "public-subsidies"],
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

  // School year mutations
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

  const updateSchoolYearMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PATCH', `/api/school-years/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setEditingSchoolYear(null);
      toast({
        title: "School year updated",
        description: "School year has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSchoolYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      return apiRequest('DELETE', `/api/school-years/${yearId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setDeletingSchoolYear(null);
      toast({
        title: "School year deleted",
        description: "School year has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting school year",
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

  // Add public subsidy mutation
  const addSubsidyMutation = useMutation({
    mutationFn: async (subsidyData: any) => {
      return apiRequest('POST', `/api/schools/${schoolId}/public-subsidies`, subsidyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "public-subsidies"] });
      setAddingSubsidy(false);
      setSubsidyForm({
        name: "",
        type: "",
        description: "",
        startDate: "",
        endDate: "",
        externalId: "",
        applicationDeadline: "",
        requiredDocumentation: ""
      });
      toast({
        title: "Public subsidy program added",
        description: "New subsidy program has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding subsidy program",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddStaff = () => {
    addStaffMutation.mutate({
      ...staffForm,
      schoolId,
      startDate: new Date(staffForm.startDate),
      coreRole: staffForm.role
    });
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

  const handleEditSchoolYear = (year: any) => {
    setEditingSchoolYear(year);
    setSchoolYearForm({
      name: year.name,
      startDate: year.startDate ? new Date(year.startDate).toISOString().split('T')[0] : "",
      endDate: year.endDate ? new Date(year.endDate).toISOString().split('T')[0] : ""
    });
  };

  const handleUpdateSchoolYear = () => {
    if (editingSchoolYear) {
      updateSchoolYearMutation.mutate({
        id: editingSchoolYear.id,
        data: schoolYearForm
      });
    }
  };

  const handleDeleteSchoolYear = (year: any) => {
    setDeletingSchoolYear(year);
  };

  const confirmDeleteSchoolYear = () => {
    if (deletingSchoolYear) {
      deleteSchoolYearMutation.mutate(deletingSchoolYear.id);
    }
  };

  const handleSetActiveSchoolYear = (yearId: string) => {
    setActiveSchoolYearMutation.mutate(yearId);
  };

  const handleAddSubsidy = () => {
    addSubsidyMutation.mutate(subsidyForm);
  };

  const handleViewCalendar = (year: any) => {
    setSelectedSchoolYear(year);
    setShowCalendar(true);
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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="staff" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Assignments
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
            <TabsTrigger value="subsidies" className="flex items-center">
              <School className="mr-2 h-4 w-4" />
              Public Subsidies
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
                          <Label>Core Role</Label>
                          <Select onValueChange={(value) => setStaffForm(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select core role" />
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

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            {/* School Roles Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>School Roles</CardTitle>
                    <p className="text-sm text-gray-600">
                      Manage and customize roles available at this school. These roles form the foundation for staff assignments.
                    </p>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Role Categories */}
                  <RoleTree />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Role Interest Surveys */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role Interest Surveys</CardTitle>
                    <p className="text-sm text-gray-600">
                      Staff complete surveys rating their skill/experience, enthusiasm, and growth interest for each role.
                    </p>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Survey
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Survey List */}
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Johnson", date: "2024-10-15", roles: 12, status: "Complete" },
                      { name: "Michael Chen", date: "2024-10-14", roles: 8, status: "In Progress" },
                      { name: "Emily Rodriguez", date: "2024-10-13", roles: 15, status: "Complete" },
                      { name: "David Kim", date: "2024-10-12", roles: 6, status: "Complete" }
                    ].map((survey) => (
                      <div key={survey.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium">{survey.name}</div>
                          <div className="text-sm text-gray-600">
                            {survey.roles} roles • {new Date(survey.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={survey.status === 'Complete' ? 'default' : 'secondary'}>
                            {survey.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Role Assignments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Role Assignments</CardTitle>
                    <p className="text-sm text-gray-600">
                      View and manage current role assignments organized by hierarchy.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="assignment-date" className="text-sm">Assignment as of:</Label>
                      <Input
                        id="assignment-date"
                        type="date"
                        value="2024-10-15"
                        className="w-auto"
                      />
                    </div>
                    <Button onClick={() => window.open('/role-assignment-editor', '_blank', 'width=1200,height=800')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Assignments
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Assignment Matrix - Grouped by Role Hierarchy */}
                  <div className="space-y-6">
                    {/* Level 1 - Educator Roles */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Educator Roles</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Role
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Sarah Johnson
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Michael Chen
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Emily Rodriguez
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                David Kim
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { name: "Educator Admin → Ongoing → Finance", assigned: "Sarah Johnson" },
                              { name: "Educator Admin → Startup → Marketing", assigned: "Emily Rodriguez" },
                              { name: "Educator Classroom → Lead", assigned: "Michael Chen" },
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
                    </div>

                    {/* Level 2 - Board Roles */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Board Roles</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Role
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Board Member 1
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                                Board Member 2
                              </th>
                              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Board Member 3
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {[
                              { name: "Board Chair", assigned: "Board Member 1" },
                              { name: "Board Secretary", assigned: "Board Member 2" },
                              { name: "Board Treasurer", assigned: null }
                            ].map((role, index) => (
                              <tr key={role.name} className={`${role.assigned ? 'bg-green-50' : 'bg-red-50'} ${index % 2 === 0 ? '' : 'bg-opacity-50'}`}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${role.assigned ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                    {role.name}
                                  </div>
                                </td>
                                {["Board Member 1", "Board Member 2", "Board Member 3"].map((staff) => (
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
                    </div>

                    {/* Assignment Summary */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <strong>5 of 7</strong> roles assigned
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                          <span>Unassigned</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                          <span>Assigned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment History */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment History</CardTitle>
                <p className="text-sm text-gray-600">
                  Historical record of role assignments and changes over time.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                    <div>Role</div>
                    <div>Staff Member</div>
                    <div>Date Assigned</div>
                    <div>Date Ended</div>
                    <div>Status</div>
                  </div>
                  
                  {[
                    {
                      role: "Educator Admin → Ongoing → Finance",
                      staff: "Sarah Johnson",
                      dateAssigned: "2024-08-15",
                      dateEnded: null,
                      status: "Active"
                    },
                    {
                      role: "Educator Classroom → Lead", 
                      staff: "Michael Chen",
                      dateAssigned: "2024-08-20",
                      dateEnded: null,
                      status: "Active"
                    },
                    {
                      role: "Board Chair",
                      staff: "Board Member 1",
                      dateAssigned: "2024-08-25",
                      dateEnded: null,
                      status: "Active"
                    },
                    {
                      role: "Educator Admin → Startup → Marketing",
                      staff: "Former Staff",
                      dateAssigned: "2023-08-15",
                      dateEnded: "2024-06-30",
                      status: "Ended"
                    }
                  ].map((assignment, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 py-2 border-b border-gray-100 last:border-b-0 text-sm">
                      <div className="font-medium">{assignment.role}</div>
                      <div>{assignment.staff}</div>
                      <div className="text-gray-600">
                        {new Date(assignment.dateAssigned).toLocaleDateString()}
                      </div>
                      <div className="text-gray-600">
                        {assignment.dateEnded ? new Date(assignment.dateEnded).toLocaleDateString() : "—"}
                      </div>
                      <div>
                        <Badge variant={assignment.status === 'Active' ? 'default' : 'secondary'}>
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                        <DialogDescription>
                          Create a new school year with start and end dates for your school.
                        </DialogDescription>
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

                  {/* Edit School Year Dialog */}
                  <Dialog open={editingSchoolYear !== null} onOpenChange={(open) => !open && setEditingSchoolYear(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit School Year</DialogTitle>
                        <DialogDescription>
                          Update the school year information and dates.
                        </DialogDescription>
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
                          <Button variant="outline" onClick={() => setEditingSchoolYear(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleUpdateSchoolYear}
                            disabled={!schoolYearForm.name || !schoolYearForm.startDate || !schoolYearForm.endDate}
                          >
                            Update School Year
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete School Year Confirmation Dialog */}
                  <AlertDialog open={deletingSchoolYear !== null} onOpenChange={(open) => !open && setDeletingSchoolYear(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete School Year</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{deletingSchoolYear?.name}"? This action cannot be undone and will remove all associated academic calendar data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingSchoolYear(null)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmDeleteSchoolYear}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete School Year
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Academic Calendar Dialog */}
                  <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Academic Calendar - {selectedSchoolYear?.name}</DialogTitle>
                        <DialogDescription>
                          Manage the academic calendar including first/last day of school, operational days, and holidays.
                        </DialogDescription>
                      </DialogHeader>
                      <AcademicCalendarView schoolYear={selectedSchoolYear} />
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
                            {year.networkDefault && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800">
                                Network Default
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCalendar(year)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSchoolYear(year)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!year.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSchoolYear(year)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

          {/* Public Subsidies Tab */}
          <TabsContent value="subsidies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Public Subsidy Programs</CardTitle>
                    <p className="text-sm text-gray-600">
                      Manage charter funding, childcare subsidies, ESA funding, and other public support programs
                    </p>
                  </div>
                  <Dialog open={addingSubsidy} onOpenChange={setAddingSubsidy}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subsidy Program
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Public Subsidy Program</DialogTitle>
                        <DialogDescription>
                          Create a new public subsidy program with specific eligibility criteria and rates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Program Name</Label>
                            <Input
                              value={subsidyForm.name}
                              onChange={(e) => setSubsidyForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., State Childcare Subsidy"
                            />
                          </div>
                          <div>
                            <Label>Program Type</Label>
                            <Select onValueChange={(value) => setSubsidyForm(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="charter">Charter School Funding</SelectItem>
                                <SelectItem value="childcare_subsidy">Childcare Subsidy</SelectItem>
                                <SelectItem value="esa">Education Savings Account (ESA)</SelectItem>
                                <SelectItem value="scholarship">Private Scholarship</SelectItem>
                                <SelectItem value="universal_prek">Universal Pre-K</SelectItem>
                                <SelectItem value="head_start">Head Start</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={subsidyForm.description}
                            onChange={(e) => setSubsidyForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Program details, eligibility requirements, application process..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={subsidyForm.startDate}
                              onChange={(e) => setSubsidyForm(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>End Date (Optional)</Label>
                            <Input
                              type="date"
                              value={subsidyForm.endDate}
                              onChange={(e) => setSubsidyForm(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>External Program ID</Label>
                            <Input
                              value={subsidyForm.externalId}
                              onChange={(e) => setSubsidyForm(prev => ({ ...prev, externalId: e.target.value }))}
                              placeholder="State/federal program ID"
                            />
                          </div>
                          <div>
                            <Label>Application Deadline</Label>
                            <Input
                              type="date"
                              value={subsidyForm.applicationDeadline}
                              onChange={(e) => setSubsidyForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Required Documentation</Label>
                          <Textarea
                            value={subsidyForm.requiredDocumentation}
                            onChange={(e) => setSubsidyForm(prev => ({ ...prev, requiredDocumentation: e.target.value }))}
                            placeholder="List required documents for application..."
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setAddingSubsidy(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddSubsidy}
                            disabled={addSubsidyMutation.isPending}
                          >
                            {addSubsidyMutation.isPending ? "Adding..." : "Add Program"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {publicSubsidies.map((program: any) => (
                    <Card key={program.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-semibold">{program.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">
                                  {program.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant={program.isActive ? "default" : "destructive"}>
                                  {program.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
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
                        {program.description && (
                          <p className="text-sm text-gray-600 mt-2">{program.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Start Date</Label>
                            <p>{new Date(program.startDate).toLocaleDateString()}</p>
                          </div>
                          {program.endDate && (
                            <div>
                              <Label className="text-xs text-gray-500">End Date</Label>
                              <p>{new Date(program.endDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {program.applicationDeadline && (
                            <div>
                              <Label className="text-xs text-gray-500">Application Deadline</Label>
                              <p>{new Date(program.applicationDeadline).toLocaleDateString()}</p>
                            </div>
                          )}
                          {program.externalId && (
                            <div>
                              <Label className="text-xs text-gray-500">External ID</Label>
                              <p>{program.externalId}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Subsidy Rates</Label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Rate
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Subsidy Rate</DialogTitle>
                                  <DialogDescription>
                                    Configure rate structure for {program.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Child Type</Label>
                                      <Select>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="baseline">Baseline</SelectItem>
                                          <SelectItem value="special_education">Special Education</SelectItem>
                                          <SelectItem value="low_income">Low Income</SelectItem>
                                          <SelectItem value="at_risk">At Risk</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Rate Amount ($)</Label>
                                      <Input type="number" step="0.01" placeholder="0.00" />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Effective Date</Label>
                                      <Input type="date" />
                                    </div>
                                    <div>
                                      <Label>Expiration Date (Optional)</Label>
                                      <Input type="date" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Min Age (months)</Label>
                                      <Input type="number" placeholder="0" />
                                    </div>
                                    <div>
                                      <Label>Max Age (months)</Label>
                                      <Input type="number" placeholder="72" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Income Min ($)</Label>
                                      <Input type="number" placeholder="0" />
                                    </div>
                                    <div>
                                      <Label>Income Max ($)</Label>
                                      <Input type="number" placeholder="50000" />
                                    </div>
                                  </div>

                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Add Rate</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          <div className="border rounded-lg p-3 bg-gray-50">
                            <p className="text-sm text-gray-600">
                              No rates configured yet. Add rates to define eligibility and amounts.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {publicSubsidies.length === 0 && (
                    <div className="text-center py-12">
                      <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Public Subsidies</h3>
                      <p className="text-gray-600 mb-6">
                        Get started by adding your first public subsidy program
                      </p>
                      <Button onClick={() => setAddingSubsidy(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Subsidy Program
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