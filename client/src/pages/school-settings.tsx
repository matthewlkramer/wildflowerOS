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
  Clock,
  School,
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
function RoleTree({ showSSJ, networkDefaultOnly = false }: { showSSJ: boolean, networkDefaultOnly?: boolean }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch role definitions based on toggle state
  const { data: roles = [] } = useQuery({
    queryKey: showSSJ ? ["/api/roles/educator_admin"] : ["/api/roles/educator_admin_ongoing"],
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

  // Build hierarchical structure based on toggle state
  const buildHierarchy = (roles: any[]) => {
    const hierarchy: any = {};
    
    roles.forEach(role => {
      // Filter to only show network default roles if specified
      if (networkDefaultOnly && !role.networkDefault) {
        return;
      }
      
      const parts = role.name.split('_');
      
      if (showSSJ) {
        // Show all educator_admin roles starting from level 3 (startup, ongoing)
        if (parts[0] !== 'educator' || parts[1] !== 'admin' || parts.length < 3) {
          return;
        }
        
        // Start from level 3 - skip the "educator_admin" prefix
        const relevantParts = parts.slice(2);
        let current = hierarchy;
        
        // Build the nested structure starting from level 3
        for (let i = 0; i < relevantParts.length; i++) {
          const part = relevantParts[i];
          const fullPath = parts.slice(0, i + 3).join('_');
          
          if (!current[part]) {
            current[part] = {
              id: fullPath,
              name: part,
              displayName: i === relevantParts.length - 1 ? role.displayName : part.charAt(0).toUpperCase() + part.slice(1),
              description: i === relevantParts.length - 1 ? role.description : '',
              active: role.networkDefault,
              children: {},
              isLeaf: i === relevantParts.length - 1,
              level: i + 1
            };
          }
          
          current = current[part].children;
        }
      } else {
        // Show only educator_admin_ongoing roles starting from level 4
        if (parts[0] !== 'educator' || parts[1] !== 'admin' || parts[2] !== 'ongoing' || parts.length < 4) {
          return;
        }
        
        // Start from level 4 - skip the "educator_admin_ongoing" prefix
        const relevantParts = parts.slice(3);
        let current = hierarchy;
        
        // Build the nested structure starting from level 4
        for (let i = 0; i < relevantParts.length; i++) {
          const part = relevantParts[i];
          const fullPath = parts.slice(0, i + 4).join('_');
          
          if (!current[part]) {
            current[part] = {
              id: fullPath,
              name: part,
              displayName: i === relevantParts.length - 1 ? role.displayName : part.charAt(0).toUpperCase() + part.slice(1),
              description: i === relevantParts.length - 1 ? role.description : '',
              active: role.networkDefault,
              children: {},
              isLeaf: i === relevantParts.length - 1,
              level: i + 1
            };
          }
          
          current = current[part].children;
        }
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

  // Add colors for categories based on toggle state
  const getColorForCategory = (name: string) => {
    if (showSSJ) {
      // Colors for level 3 (startup, ongoing)
      switch (name) {
        case 'startup': return 'bg-blue-100 text-blue-800';
        case 'ongoing': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      // Colors for level 4 ongoing categories
      switch (name) {
        case 'admissions': return 'bg-blue-100 text-blue-800';
        case 'finance': return 'bg-green-100 text-green-800';
        case 'board': return 'bg-purple-100 text-purple-800';
        case 'communications': return 'bg-orange-100 text-orange-800';
        case 'facility': return 'bg-red-100 text-red-800';
        case 'family': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
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

// System Holidays Component
function SystemHolidaysOverview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<any>(null);
  
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    description: "",
    rule: "",
  });

  // Fetch system holidays from API
  const { data: systemHolidays = [], isLoading } = useQuery({
    queryKey: ["/api/system-holidays"],
    enabled: true,
  });

  const createHolidayMutation = useMutation({
    mutationFn: (holidayData: any) => apiRequest("/api/system-holidays", {
      method: "POST",
      body: JSON.stringify(holidayData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-holidays"] });
      toast({
        title: "Holiday added",
        description: `${holidayForm.name} has been added to system holidays.`
      });
      setHolidayForm({ name: "", description: "", rule: "" });
      setAddingHoliday(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add holiday. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateHolidayMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/system-holidays/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-holidays"] });
      toast({
        title: "Holiday updated",
        description: `${holidayForm.name} has been updated.`
      });
      setHolidayForm({ name: "", description: "", rule: "" });
      setEditingHoliday(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update holiday. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/system-holidays/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-holidays"] });
      toast({
        title: "Holiday removed",
        description: `Holiday has been removed from system holidays.`
      });
      setDeletingHoliday(null);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to delete holiday. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddHoliday = () => {
    if (!holidayForm.name || !holidayForm.rule) {
      toast({
        title: "Error",
        description: "Please fill in name and rule fields.",
        variant: "destructive"
      });
      return;
    }

    createHolidayMutation.mutate({
      name: holidayForm.name,
      description: holidayForm.description,
      rule: holidayForm.rule,
      networkDefault: true,
      active: true,
    });
  };

  const handleEditHoliday = (holiday: any) => {
    setHolidayForm({
      name: holiday.name,
      description: holiday.description || "",
      rule: holiday.rule || "",
    });
    setEditingHoliday(holiday);
  };

  const handleUpdateHoliday = () => {
    if (!holidayForm.name || !holidayForm.rule) {
      toast({
        title: "Error",
        description: "Please fill in name and rule fields.",
        variant: "destructive"
      });
      return;
    }

    updateHolidayMutation.mutate({
      id: editingHoliday.id,
      name: holidayForm.name,
      description: holidayForm.description,
      rule: holidayForm.rule,
    });
  };

  const handleDeleteHoliday = (holiday: any) => {
    deleteHolidayMutation.mutate(holiday.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Holidays</CardTitle>
          <Button onClick={() => setAddingHoliday(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Common school holidays with standard rules that new schools can inherit.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Holiday Name</th>
                  <th className="text-left p-3 font-medium">Rule</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Loading holidays...
                    </td>
                  </tr>
                ) : systemHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No system holidays found. Add some holidays to get started.
                    </td>
                  </tr>
                ) : (
                  systemHolidays.map((holiday: any) => (
                    <tr key={holiday.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{holiday.name}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {holiday.rule || 'No rule set'}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{holiday.description}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditHoliday(holiday)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDeletingHoliday(holiday)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Holiday Dialog */}
        <Dialog open={addingHoliday} onOpenChange={setAddingHoliday}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add System Holiday</DialogTitle>
              <DialogDescription>
                Add a new holiday rule that schools can inherit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Holiday Name</Label>
                <Input
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Labor Day"
                />
              </div>
              <div>
                <Label>Rule</Label>
                <Input
                  value={holidayForm.rule}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, rule: e.target.value }))}
                  placeholder="e.g., First Monday in September"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAddingHoliday(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddHoliday}>
                  Add Holiday
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Holiday Dialog */}
        <Dialog open={!!editingHoliday} onOpenChange={() => setEditingHoliday(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit System Holiday</DialogTitle>
              <DialogDescription>
                Update holiday rule settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Holiday Name</Label>
                <Input
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Rule</Label>
                <Input
                  value={holidayForm.rule}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, rule: e.target.value }))}
                  placeholder="e.g., First Monday in September"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingHoliday(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateHoliday}>
                  Update Holiday
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingHoliday} onOpenChange={() => setDeletingHoliday(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingHoliday?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteHoliday(deletingHoliday)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// Academic Calendar Overview Component
function AcademicCalendarOverview({ 
  schoolYears, 
  selectedSchoolYear, 
  onSchoolYearSelect 
}: { 
  schoolYears: any[], 
  selectedSchoolYear: any,
  onSchoolYearSelect: (year: any) => void 
}) {
  // Default to active school year if none selected
  const displayYear = selectedSchoolYear || schoolYears.find((year: any) => year.isActive) || schoolYears[0];

  // Fetch academic calendar for display year
  const { data: academicCalendar } = useQuery({
    queryKey: ["/api/school-years", displayYear?.id, "calendar"],
    enabled: !!displayYear?.id,
  });

  const { data: calendarClosures } = useQuery({
    queryKey: ["/api/academic-calendars", academicCalendar?.id, "closures"],
    enabled: !!academicCalendar?.id,
  });

  if (!displayYear) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Academic Calendar Overview</CardTitle>
          <Select 
            value={displayYear.id} 
            onValueChange={(yearId) => {
              const year = schoolYears.find(y => y.id === yearId);
              onSchoolYearSelect(year);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((year: any) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.isActive && "(Current)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* First Day */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">First Day of School</h4>
            <p className="text-sm text-blue-600 mt-1">
              {academicCalendar?.firstDayOfSchool 
                ? new Date(academicCalendar.firstDayOfSchool).toLocaleDateString()
                : "Not set"
              }
            </p>
          </div>
          
          {/* Last Day */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">Last Day of School</h4>
            <p className="text-sm text-purple-600 mt-1">
              {academicCalendar?.lastDayOfSchool 
                ? new Date(academicCalendar.lastDayOfSchool).toLocaleDateString()
                : "Not set"
              }
            </p>
          </div>

          {/* Holidays Count */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Holidays & Closures</h4>
            <p className="text-sm text-green-600 mt-1">
              {calendarClosures?.length || 0} scheduled
            </p>
          </div>

          {/* Quick Action */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSchoolYearSelect(displayYear)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Calendar
            </Button>
          </div>
        </div>

        {/* Recent Holidays */}
        {calendarClosures && calendarClosures.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Upcoming Holidays & Closures</h4>
            <div className="space-y-2">
              {calendarClosures
                .filter((closure: any) => new Date(closure.date) >= new Date())
                .slice(0, 3)
                .map((closure: any) => (
                  <div key={closure.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{closure.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {new Date(closure.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Academic Calendar Dialog Component
function AcademicCalendarView({ schoolYear }: { schoolYear: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [calendarForm, setCalendarForm] = useState({
    firstDayOfSchool: "",
    lastDayOfSchool: "",
  });

  const [addingClosure, setAddingClosure] = useState(false);
  const [closureForm, setClosureForm] = useState({
    name: "",
    date: "",
    description: "",
    type: "holiday",
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

  const createClosureMutation = useMutation({
    mutationFn: async (closureData: any) => {
      return apiRequest('POST', `/api/academic-calendars/${academicCalendar.id}/closures`, closureData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic-calendars", academicCalendar.id, "closures"] });
      setAddingClosure(false);
      setClosureForm({ name: "", date: "", description: "", type: "holiday" });
      toast({
        title: "Holiday added",
        description: "Holiday has been added to the calendar successfully.",
      });
    },
  });

  const deleteClosureMutation = useMutation({
    mutationFn: async (closureId: string) => {
      return apiRequest('DELETE', `/api/calendar-closures/${closureId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academic-calendars", academicCalendar.id, "closures"] });
      toast({
        title: "Holiday deleted",
        description: "Holiday has been removed from the calendar successfully.",
      });
    },
  });

  const handleAddClosure = () => {
    createClosureMutation.mutate(closureForm);
  };

  const handleDeleteClosure = (closureId: string) => {
    deleteClosureMutation.mutate(closureId);
  };

  if (isLoading) {
    return <div className="p-4">Loading calendar...</div>;
  }



  return (
    <div className="space-y-6">
      {/* Calendar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Academic Calendar Settings - {schoolYear?.name}</CardTitle>
          {academicCalendar ? (
            <p className="text-sm text-gray-600">
              Editing existing calendar (created {new Date(academicCalendar.createdAt).toLocaleDateString()})
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              No calendar exists yet - create one below
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <Label>First Day of School</Label>
              <Input
                type="date"
                value={calendarForm.firstDayOfSchool}
                onChange={(e) => setCalendarForm(prev => ({ ...prev, firstDayOfSchool: e.target.value }))}
                placeholder="Select first day"
              />
              {!calendarForm.firstDayOfSchool && (
                <p className="text-xs text-gray-500 mt-1">No date set</p>
              )}
            </div>
            <div>
              <Label>Last Day of School</Label>
              <Input
                type="date"
                value={calendarForm.lastDayOfSchool}
                onChange={(e) => setCalendarForm(prev => ({ ...prev, lastDayOfSchool: e.target.value }))}
                placeholder="Select last day"
              />
              {!calendarForm.lastDayOfSchool && (
                <p className="text-xs text-gray-500 mt-1">No date set</p>
              )}
            </div>
            <div>
              <Button onClick={handleSaveCalendar}>
                {academicCalendar ? "Update Calendar" : "Create Calendar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Closures */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Holidays & Closures</CardTitle>
            <Button size="sm" onClick={() => setAddingClosure(true)} disabled={!academicCalendar}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calendarClosures && calendarClosures.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Showing {calendarClosures.length} holiday{calendarClosures.length !== 1 ? 's' : ''} for {schoolYear?.name}
              </p>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClosure(closure.id)}
                    >
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

      {/* Add Holiday Dialog */}
      <Dialog open={addingClosure} onOpenChange={setAddingClosure}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Holiday/Closure</DialogTitle>
            <DialogDescription>
              Add a holiday, break, or school closure date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input
                id="name"
                value={closureForm.name}
                onChange={(e) => setClosureForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Winter Break"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={closureForm.date}
                onChange={(e) => setClosureForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={closureForm.type} onValueChange={(value) => setClosureForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="closure">School Closure</SelectItem>
                  <SelectItem value="professional_development">Professional Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAddingClosure(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddClosure}
              disabled={!closureForm.name || !closureForm.date || createClosureMutation.isPending}
            >
              {createClosureMutation.isPending ? "Adding..." : "Add Holiday"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
  const [importingSystemHolidays, setImportingSystemHolidays] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [addingSubsidy, setAddingSubsidy] = useState(false);
  const [showSSJ, setShowSSJ] = useState(true);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  // System administrator tab state
  const [systemAdminTab, setSystemAdminTab] = useState("non-school-users");
  
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

  // Auto-populate dates for system admin when name changes
  const handleSchoolYearNameChange = (name: string) => {
    setSchoolYearForm(prev => ({ ...prev, name }));
    
    // For system admin, auto-populate July 1 - June 30 dates
    if (currentRole?.roleName?.startsWith('sysadmin')) {
      const yearMatch = name.match(/(\d{4})/);
      if (yearMatch) {
        const startYear = yearMatch[1];
        const endYear = (parseInt(startYear) + 1).toString();
        setSchoolYearForm(prev => ({
          ...prev,
          startDate: `${startYear}-07-01`,
          endDate: `${endYear}-06-30`
        }));
      }
    }
  };

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
  
  // Use session-selected school or role's school
  const effectiveSchoolId = selectedSchoolId || schoolId;

  // Check if we need to show school selector - trigger immediately when conditions are met
  useEffect(() => {
    console.log('School selector check:', { 
      currentRole: currentRole?.roleName, 
      schoolId: currentRole?.schoolId,
      effectiveSchoolId, 
      showSchoolSelector,
      shouldShow: currentRole && currentRole.roleName?.startsWith('educator') && !effectiveSchoolId
    });
    
    if (currentRole && currentRole.roleName?.startsWith('educator') && !effectiveSchoolId) {
      console.log('Triggering school selector popup');
      setShowSchoolSelector(true);
    }
  }, [currentRole?.roleName, currentRole?.schoolId]);

  // Reset school selection when role changes
  useEffect(() => {
    if (currentRole && !currentRole.roleName?.startsWith('educator')) {
      setSelectedSchoolId(null);
      setShowSchoolSelector(false);
    }
  }, [currentRole?.roleName]);

  // Fetch school data
  const { data: school } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId],
    enabled: !!effectiveSchoolId,
  });

  // Fetch staff
  const { data: staff = [], isLoading: staffLoading, error: staffError } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "staff"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch classrooms
  const { data: classrooms = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "classrooms"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch school years
  const { data: schoolYears = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "school-years"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch tuition plans
  const { data: tuitionPlans = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "tuition-plans"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch public subsidies
  const { data: publicSubsidies = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "public-subsidies"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch all educator admins for school selection (only when needed)
  const { data: availableEducators = [] } = useQuery({
    queryKey: ["/api/educators/admin-roles"],
    enabled: showSchoolSelector,
  });

  // Fetch system holidays for import functionality
  const { data: systemHolidays = [] } = useQuery({
    queryKey: ["/api/system-holidays"],
    enabled: !!currentRole && !currentRole.roleName?.startsWith('sysadmin'),
  });

  // Fetch network default school years (for system admins)
  const { data: networkSchoolYears = [] } = useQuery({
    queryKey: ["/api/network-school-years"],
    enabled: !!currentRole && currentRole.roleName?.startsWith('sysadmin'),
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      return apiRequest('POST', `/api/schools/${effectiveSchoolId}/staff`, staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", effectiveSchoolId, "staff"] });
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

  // Network school year mutations (for system admin)
  const addNetworkSchoolYearMutation = useMutation({
    mutationFn: async (schoolYearData: any) => {
      return apiRequest('POST', `/api/network-school-years`, schoolYearData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-school-years"] });
      setAddingSchoolYear(false);
      setSchoolYearForm({ name: "", startDate: "", endDate: "" });
      toast({
        title: "Network school year created",
        description: "New network default school year has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating network school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateNetworkSchoolYearMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest('PATCH', `/api/network-school-years/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-school-years"] });
      setEditingSchoolYear(null);
      setSchoolYearForm({ name: "", startDate: "", endDate: "" });
      toast({
        title: "Network school year updated",
        description: "Network default school year has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating network school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNetworkSchoolYearMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/network-school-years/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-school-years"] });
      toast({
        title: "Network school year deleted",
        description: "Network default school year has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting network school year",
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

  // Import system holidays mutation
  const importSystemHolidaysMutation = useMutation({
    mutationFn: async (data: { schoolYearId: string, academicCalendarId: string }) => {
      const promises = systemHolidays.map((holiday: any) => {
        // Convert rules to approximate dates for the school year
        let holidayDate = null;
        if (holiday.rule && schoolYearForm.startDate) {
          // For now, use start date of school year plus offset based on holiday name
          const startDate = new Date(schoolYearForm.startDate);
          const year = startDate.getFullYear();
          
          // Simple approximation mapping for common holidays
          if (holiday.name.includes('Labor Day')) holidayDate = new Date(year, 8, 2); // First Monday in September
          else if (holiday.name.includes('Thanksgiving')) holidayDate = new Date(year, 10, 26); // Fourth Thursday in November
          else if (holiday.name.includes('Winter Break')) holidayDate = new Date(year, 11, 23); // Week before Christmas
          else if (holiday.name.includes('MLK')) holidayDate = new Date(year + 1, 0, 20); // Third Monday in January
          else if (holiday.name.includes('Presidents')) holidayDate = new Date(year + 1, 1, 17); // Third Monday in February
          else if (holiday.name.includes('Memorial Day')) holidayDate = new Date(year + 1, 4, 26); // Last Monday in May
          else holidayDate = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Random within 30 days
        }
        
        return apiRequest('POST', `/api/academic-calendars/${data.academicCalendarId}/closures`, {
          name: holiday.name,
          description: holiday.description,
          date: holidayDate ? holidayDate.toISOString().split('T')[0] : null,
          type: 'holiday',
          active: true
        });
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      if (selectedSchoolYear?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/school-years", selectedSchoolYear.id, "calendar"] });
        queryClient.invalidateQueries({ queryKey: ["/api/academic-calendars"] });
      }
      setImportingSystemHolidays(false);
      toast({
        title: "System holidays imported",
        description: `${systemHolidays.length} system holidays have been imported and customized for your school year.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing holidays",
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
    // Handle network default school year creation for system admin
    if (currentRole?.roleName?.startsWith('sysadmin')) {
      addNetworkSchoolYearMutation.mutate({
        ...schoolYearForm,
        networkDefault: true,
        schoolId: null // Network defaults have no specific school
      });
    } else {
      // Handle regular school year creation
      addSchoolYearMutation.mutate({
        ...schoolYearForm,
        schoolId: schoolId
      });
    }
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
      // Handle network school year updates for system admin
      if (currentRole?.roleName?.startsWith('sysadmin')) {
        updateNetworkSchoolYearMutation.mutate({
          id: editingSchoolYear.id,
          data: schoolYearForm
        });
      } else {
        // Handle regular school year updates
        updateSchoolYearMutation.mutate({
          id: editingSchoolYear.id,
          data: schoolYearForm
        });
      }
    }
  };

  const handleDeleteSchoolYear = (year: any) => {
    setDeletingSchoolYear(year);
  };

  const confirmDeleteSchoolYear = () => {
    if (deletingSchoolYear) {
      // Handle network school year deletion for system admin
      if (currentRole?.roleName?.startsWith('sysadmin')) {
        deleteNetworkSchoolYearMutation.mutate(deletingSchoolYear.id);
      } else {
        // Handle regular school year deletion
        deleteSchoolYearMutation.mutate(deletingSchoolYear.id);
      }
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

  const handleImportSystemHolidays = async () => {
    if (!schoolYearForm.name || !schoolYearForm.startDate || !schoolYearForm.endDate) {
      toast({
        title: "Error",
        description: "Please fill in school year details first.",
        variant: "destructive",
      });
      return;
    }

    // First create the school year, then import holidays
    try {
      const response = await addSchoolYearMutation.mutateAsync({
        ...schoolYearForm,
        schoolId: schoolId
      });
      
      // Now import system holidays to the academic calendar
      if (response.academicCalendarId) {
        await importSystemHolidaysMutation.mutateAsync({
          schoolYearId: response.id,
          academicCalendarId: response.academicCalendarId
        });
      }
      
      setAddingSchoolYear(false);
      setSchoolYearForm({ name: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error('Error creating school year with holidays:', error);
    }
  };

  // Update selected school year when clicking Edit Calendar from overview
  useEffect(() => {
    if (selectedSchoolYear && !showCalendar) {
      setShowCalendar(true);
    }
  }, [selectedSchoolYear]);

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
    <div className="min-h-screen flex flex-col">
      <TopNavigation user={user} currentSchool={currentSchoolForNav} currentRole={currentRole} />
      
      <div className="flex-1 flex">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 lg:p-6 pb-20">
      
      {/* School Selector Dialog for Educators without School ID */}
      <Dialog open={showSchoolSelector} onOpenChange={setShowSchoolSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select School to Emulate</DialogTitle>
            <DialogDescription>
              You're in educator mode but don't have a specific school assigned. 
              Choose an educator to emulate and work with their school context.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableEducators.length > 0 ? (
              <div className="space-y-2">
                {availableEducators.map((educator: any, index: number) => (
                  <div
                    key={`educator-${index}-${educator.userId}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      console.log('Selected educator:', educator);
                      setSelectedSchoolId(educator.schoolId);
                      setShowSchoolSelector(false);
                      toast({
                        title: "School context selected",
                        description: `Now working with ${educator.schoolName} as ${educator.firstName} ${educator.lastName}`,
                      });
                    }}
                  >
                    <div>
                      <div className="font-medium">{educator.firstName} {educator.lastName}</div>
                      <div className="text-sm text-gray-600">{educator.schoolName}</div>
                      <div className="text-xs text-gray-500">{educator.roleDisplayName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No educator admins found. Contact support to set up school access.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
            {/* Render different interfaces based on user role */}
            {currentRole?.roleName?.startsWith('sysadmin') ? (
              // System Administrator View
              <div className="space-y-6">
                {/* System Admin Header */}
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">System Administration</h3>
                  <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    Manage network-wide settings, user accounts, and school configurations.
                  </p>
                </div>

                {/* System Admin Top Level Tabs */}
                <Tabs value={systemAdminTab} onValueChange={setSystemAdminTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="non-school-users" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Non-School Users
                    </TabsTrigger>
                    <TabsTrigger value="schools" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      Schools
                    </TabsTrigger>
                    <TabsTrigger value="sensible-defaults" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Sensible Defaults
                    </TabsTrigger>
                  </TabsList>

                  {/* Non-School Users Tab */}
                  <TabsContent value="non-school-users" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Network-Wide Users</CardTitle>
                        <p className="text-sm text-gray-600">Users with roles that span across multiple schools or the entire network.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Non-school user management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Schools Tab */}
                  <TabsContent value="schools" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>School Management</CardTitle>
                        <p className="text-sm text-gray-600">Manage all schools in the Wildflower network.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          School management interface will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sensible Defaults Tab */}
                  <TabsContent value="sensible-defaults" className="space-y-6">
                    {/* This will contain the same tabs as school settings, but for defaults */}
                    <div className="border-b border-gray-200 pb-2">
                      <h4 className="text-md font-medium text-gray-900">Default Settings for New Schools</h4>
                      <p className="text-sm text-gray-500">Configure the default settings that new schools will inherit.</p>
                    </div>
                    
                    {/* Default Settings Tabs (excluding staff and classrooms) */}
                    <Tabs defaultValue="roles" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="roles" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Roles
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

                      {/* Default Roles */}
                      <TabsContent value="roles" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>Default Role Definitions</CardTitle>
                                <p className="text-sm text-gray-600">
                                  Manage default roles that will be available in all new schools. These roles form the foundation for staff assignments.
                                </p>
                              </div>
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Role
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="text-sm text-gray-600 mb-4">
                                These role definitions will be automatically available in every new school that joins the network.
                              </div>
                              
                              {/* Role tree structure matching school version */}
                              <RoleTree showSSJ={false} networkDefaultOnly={true} />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>



                      {/* Default School Years */}
                      <TabsContent value="school-years" className="space-y-6">
                        {/* Network Default School Years */}
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>Network Default School Years</CardTitle>
                                <p className="text-sm text-gray-600">
                                  Create school years with default holidays that all schools can inherit.
                                </p>
                              </div>
                              <Button onClick={() => setAddingSchoolYear(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Network School Year
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {networkSchoolYears?.map((year) => (
                                <div key={year.id} className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">{year.name}</h4>
                                      <p className="text-sm text-gray-600">
                                        {year.startDate ? (() => {
                                          const dateStr = year.startDate.split('T')[0]; // Get just the date part
                                          const [y, m, d] = dateStr.split('-');
                                          return `${m}/${d}/${y}`;
                                        })() : 'No start date'} - {year.endDate ? (() => {
                                          const dateStr = year.endDate.split('T')[0]; // Get just the date part
                                          const [y, m, d] = dateStr.split('-');
                                          return `${m}/${d}/${y}`;
                                        })() : 'No end date'}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditSchoolYear(year)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDeleteSchoolYear(year)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {(!networkSchoolYears || networkSchoolYears.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                  No network default school years created yet.
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* System Holidays - After School Years */}
                        <SystemHolidaysOverview />
                      </TabsContent>

                      {/* Default Schedules */}
                      <TabsContent value="schedules" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Default Classroom Schedules</CardTitle>
                            <p className="text-sm text-gray-600">Configure default schedule templates for new schools.</p>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-8 text-gray-500">
                              Default schedule templates will be implemented here.
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Default Tuition Plans */}
                      <TabsContent value="tuition" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Default Tuition Plans</CardTitle>
                            <p className="text-sm text-gray-600">Configure default tuition plan templates for new schools.</p>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-8 text-gray-500">
                              Default tuition plan templates will be implemented here.
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Default Subsidies */}
                      <TabsContent value="subsidies" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Default Public Subsidies</CardTitle>
                            <p className="text-sm text-gray-600">Configure default public subsidy information for new schools.</p>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-8 text-gray-500">
                              Default public subsidy templates will be implemented here.
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>

                {/* Add Network School Year Dialog */}
                <Dialog open={addingSchoolYear} onOpenChange={setAddingSchoolYear}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Network School Year</DialogTitle>
                      <DialogDescription>
                        Create a new school year with dates for outer boundaries that all schools can inherit.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Year Name</Label>
                        <Input
                          value={schoolYearForm.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setSchoolYearForm(prev => ({ ...prev, name: newName }));
                            
                            // Auto-populate dates based on year name (e.g., "2024-2025" -> July 1, 2024 - June 30, 2025)
                            const yearMatch = newName.match(/^(\d{4})-(\d{4})$/);
                            if (yearMatch) {
                              const startYear = yearMatch[1];
                              const endYear = yearMatch[2];
                              setSchoolYearForm(prev => ({
                                ...prev,
                                name: newName,
                                startDate: `${startYear}-07-01`,
                                endDate: `${endYear}-06-30`
                              }));
                            }
                          }}
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
                          Add Network School Year
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Network School Year Dialog */}
                <Dialog open={editingSchoolYear !== null} onOpenChange={(open) => !open && setEditingSchoolYear(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Network School Year</DialogTitle>
                      <DialogDescription>
                        Update the network default school year information and dates.
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
                          Update Network School Year
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Network School Year Confirmation Dialog */}
                <AlertDialog open={deletingSchoolYear !== null} onOpenChange={(open) => !open && setDeletingSchoolYear(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Network School Year</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{deletingSchoolYear?.name}"? This will remove the network default school year and cannot be undone.
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
                        Delete Network School Year
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : currentRole?.roleName?.startsWith('parent') ? (
              // Parent View
              <div className="space-y-6">
                {/* Parent Header */}
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Family Settings</h3>
                  <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    Manage your family's enrollment, billing, and communication preferences.
                  </p>
                </div>

                {/* Parent-specific content */}
                <Tabs defaultValue="family-info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="family-info" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Family Info
                    </TabsTrigger>
                    <TabsTrigger value="enrollment" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      Enrollment
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Billing
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Communication
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="family-info" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Family Information</CardTitle>
                        <p className="text-sm text-gray-600">Update your family's contact information and emergency contacts.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Family information management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="enrollment" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Enrollment Status</CardTitle>
                        <p className="text-sm text-gray-600">View and manage your children's enrollment status and applications.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Enrollment management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Billing & Payments</CardTitle>
                        <p className="text-sm text-gray-600">Manage payment methods, view statements, and update billing information.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Billing management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="communication" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Communication Preferences</CardTitle>
                        <p className="text-sm text-gray-600">Set your preferences for receiving school communications and updates.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Communication preferences will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : currentRole?.roleName?.startsWith('board') ? (
              // Board Member View
              <div className="space-y-6">
                {/* Board Header */}
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Board Governance</h3>
                  <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    Access board documents, meeting materials, and governance tools.
                  </p>
                </div>

                {/* Board-specific content */}
                <Tabs defaultValue="meetings" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="meetings" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Meetings
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="finances" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Finances
                    </TabsTrigger>
                    <TabsTrigger value="policies" className="flex items-center">
                      <School className="mr-2 h-4 w-4" />
                      Policies
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="meetings" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Board Meetings</CardTitle>
                        <p className="text-sm text-gray-600">View upcoming meetings, agendas, and past meeting minutes.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Board meeting management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Board Documents</CardTitle>
                        <p className="text-sm text-gray-600">Access bylaws, resolutions, and other governance documents.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Document management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="finances" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Oversight</CardTitle>
                        <p className="text-sm text-gray-600">Review budgets, financial reports, and audit materials.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Financial oversight tools will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Policies & Procedures</CardTitle>
                        <p className="text-sm text-gray-600">Review and approve school policies and procedures.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Policy management will be implemented here.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Educator/Default School-Level Settings View (existing functionality)
              <div className="space-y-6">
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Show SSJ</span>
                      <Button
                        variant={showSSJ ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowSSJ(!showSSJ)}
                        className="h-8"
                      >
                        {showSSJ ? "ON" : "OFF"}
                      </Button>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Custom Role
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Role Categories */}
                  <RoleTree showSSJ={showSSJ} />
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Show SSJ</span>
                      <Button
                        variant={showSSJ ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowSSJ(!showSSJ)}
                        className="h-8"
                      >
                        {showSSJ ? "ON" : "OFF"}
                      </Button>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Survey
                    </Button>
                  </div>
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
                          {currentRole?.roleName?.startsWith('sysadmin') 
                            ? "Create a new school year with dates for outer boundaries."
                            : "Create a new school year with start and end dates for your school."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Year Name</Label>
                          <Input
                            value={schoolYearForm.name}
                            onChange={(e) => handleSchoolYearNameChange(e.target.value)}
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
                        <div className="flex justify-between">
                          <div className="space-x-2">
                            {!currentRole?.roleName?.startsWith('sysadmin') && systemHolidays.length > 0 && (
                              <Button 
                                variant="outline"
                                onClick={handleImportSystemHolidays}
                                disabled={!schoolYearForm.name || !schoolYearForm.startDate || !schoolYearForm.endDate || importSystemHolidaysMutation.isPending}
                              >
                                {importSystemHolidaysMutation.isPending ? "Importing..." : "Import & Customize System Defaults"}
                              </Button>
                            )}
                          </div>
                          <div className="space-x-2">
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
                          {/* Hide calendar button for system admin */}
                          {!currentRole?.roleName?.startsWith('sysadmin') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewCalendar(year)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
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

            {/* Academic Calendar Overview */}
            <AcademicCalendarOverview 
              schoolYears={schoolYears} 
              selectedSchoolYear={selectedSchoolYear}
              onSchoolYearSelect={setSelectedSchoolYear}
            />

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
            )}
          </div>
        </main>
      </div>
      
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}