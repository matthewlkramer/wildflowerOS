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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  School,
  ChevronDown,
  ChevronRight,
  Download
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";

// Network School Year Holidays Component
function SchoolYearHolidays({ schoolYearId }: { schoolYearId: string }) {
  const { toast } = useToast();
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: 1
  });

  // Fetch holidays for this school year
  const { data: holidays = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/school-years", schoolYearId, "closures"],
    enabled: !!schoolYearId,
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
  });

  // Force refetch when component mounts or schoolYearId changes
  useEffect(() => {
    if (schoolYearId) {
      refetch();
    }
  }, [schoolYearId, refetch]);

  // Create holiday mutation
  const createHolidayMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/calendar-closures`, {
        ...data,
        schoolYearId,
        networkDefault: false,
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYearId, "closures"] });
      setAddingHoliday(false);
      setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
      toast({
        title: "Holiday created",
        description: "Holiday has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating holiday",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update holiday mutation
  const updateHolidayMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/calendar-closures/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYearId, "closures"] });
      setEditingHoliday(null);
      setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
      toast({
        title: "Holiday updated",
        description: "Holiday has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating holiday",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: async (holidayId: string) => {
      return apiRequest('DELETE', `/api/calendar-closures/${holidayId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYearId, "closures"] });
      toast({
        title: "Holiday deleted",
        description: "Holiday has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting holiday",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name || "",
      description: holiday.description || "",
      startDate: holiday.startDate ? new Date(holiday.startDate).toISOString().split('T')[0] : "",
      endDate: holiday.endDate ? new Date(holiday.endDate).toISOString().split('T')[0] : "",
      duration: holiday.duration || 1
    });
  };

  const handleUpdateHoliday = () => {
    if (!holidayForm.name || !holidayForm.startDate || !holidayForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateHolidayMutation.mutate({
      id: editingHoliday.id,
      name: holidayForm.name,
      description: holidayForm.description,
      startDate: holidayForm.startDate,
      endDate: holidayForm.endDate,
      duration: holidayForm.duration
    });
  };

  const handleCreateHoliday = () => {
    if (!holidayForm.name || !holidayForm.startDate || !holidayForm.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createHolidayMutation.mutate({
      name: holidayForm.name,
      description: holidayForm.description,
      startDate: holidayForm.startDate,
      endDate: holidayForm.endDate,
      duration: holidayForm.duration
    });
  };

  const handleDeleteHoliday = (holidayId: string) => {
    if (confirm("Are you sure you want to delete this holiday? This action cannot be undone.")) {
      deleteHolidayMutation.mutate(holidayId);
    }
  };

  const handleStartDateChange = (startDate: string) => {
    setHolidayForm(prev => ({
      ...prev,
      startDate,
      endDate: startDate // Default end date to same as start date
    }));
  };

  if (!schoolYearId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Associated Holidays</h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{holidays.length} holidays</span>
          <Button
            size="sm"
            onClick={() => setAddingHoliday(true)}
            disabled={addingHoliday}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Holiday
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading holidays...</div>
      ) : (
        <div className="space-y-2">
          {/* Add Holiday Form */}
          {addingHoliday && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Add New Holiday</h5>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingHoliday(false);
                    setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Name *</Label>
                  <Input
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Labor Day"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Start Date *</Label>
                  <Input
                    type="date"
                    value={holidayForm.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date *</Label>
                  <Input
                    type="date"
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={holidayForm.duration}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAddingHoliday(false);
                    setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateHoliday}
                  disabled={createHolidayMutation.isPending}
                >
                  {createHolidayMutation.isPending ? "Creating..." : "Create Holiday"}
                </Button>
              </div>
            </div>
          )}

          {/* Holiday List */}
          {holidays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No holidays found for this school year.</div>
              <div className="text-xs mt-1">Click "Add Holiday" to create your first holiday.</div>
            </div>
          ) : (
            holidays
              .sort((a: any, b: any) => {
                // Sort by start date
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateA.getTime() - dateB.getTime();
              })
              .map((holiday: any) => (
                <div key={holiday.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {editingHoliday?.id === holiday.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">Edit Holiday</h5>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingHoliday(null);
                            setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Name *</Label>
                          <Input
                            value={holidayForm.name}
                            onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Labor Day"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={holidayForm.description}
                            onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional description"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs">Start Date *</Label>
                          <Input
                            type="date"
                            value={holidayForm.startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Date *</Label>
                          <Input
                            type="date"
                            value={holidayForm.endDate}
                            onChange={(e) => setHolidayForm(prev => ({ ...prev, endDate: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration (days)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={holidayForm.duration}
                            onChange={(e) => setHolidayForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingHoliday(null);
                            setHolidayForm({ name: "", description: "", startDate: "", endDate: "", duration: 1 });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpdateHoliday}
                          disabled={updateHolidayMutation.isPending}
                        >
                          {updateHolidayMutation.isPending ? "Updating..." : "Update Holiday"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-gray-900">{holiday.name}</h5>
                          <span className="text-xs text-gray-500">
                            {holiday.duration} day{holiday.duration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-600">
                            {(() => {
                              // Extract date parts to avoid timezone conversion
                              const startDateStr = holiday.startDate.split('T')[0];
                              const endDateStr = holiday.endDate.split('T')[0];
                              const [startYear, startMonth, startDay] = startDateStr.split('-');
                              const [endYear, endMonth, endDay] = endDateStr.split('-');
                              const startFormatted = `${parseInt(startMonth)}/${parseInt(startDay)}/${startYear}`;
                              const endFormatted = `${parseInt(endMonth)}/${parseInt(endDay)}/${endYear}`;
                              return holiday.duration === 1 ? startFormatted : `${startFormatted} - ${endFormatted}`;
                            })()}
                          </span>
                          {holiday.description && (
                            <span className="text-xs text-gray-500">{holiday.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditHoliday(holiday)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

function NetworkSchoolYearHolidays({ schoolYearId }: { schoolYearId: string }) {
  const { toast } = useToast();
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    description: "",
    date: "",
    rule: ""
  });

  // Fetch holidays for this school year
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ["/api/school-years", schoolYearId, "closures"],
    enabled: !!schoolYearId,
  });

  // Update holiday mutation
  const updateHolidayMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/calendar-closures/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYearId, "closures"] });
      setEditingHoliday(null);
      setHolidayForm({ name: "", description: "", date: "", rule: "" });
      toast({
        title: "Holiday updated",
        description: "Holiday has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating holiday",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: async (holidayId: string) => {
      return apiRequest('DELETE', `/api/calendar-closures/${holidayId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/school-years", schoolYearId, "closures"] });
      toast({
        title: "Holiday deleted",
        description: "Holiday has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting holiday",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name || "",
      description: holiday.description || "",
      date: holiday.date ? new Date(holiday.date).toISOString().split('T')[0] : "",
      rule: holiday.rule || ""
    });
  };

  const handleUpdateHoliday = () => {
    updateHolidayMutation.mutate({
      id: editingHoliday.id,
      ...holidayForm
    });
  };

  const handleDeleteHoliday = (holidayId: string) => {
    if (confirm("Are you sure you want to delete this holiday? This action cannot be undone.")) {
      deleteHolidayMutation.mutate(holidayId);
    }
  };

  if (!schoolYearId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Associated Holidays</h4>
        <span className="text-xs text-gray-500">{holidays.length} holidays</span>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading holidays...</div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No holidays found for this school year.</div>
      ) : (
        <div className="space-y-2">
          {holidays
            .sort((a: any, b: any) => {
              // Academic year order starting with Labor Day (September)
              const academicYearOrder = [
                'Labor Day',
                'Rosh Hashanah', 
                'Indigenous Peoples Day',
                'Yom Kippur',
                'Veterans Day',
                'Thanksgiving',
                'Winter Break',
                'MLK Day',
                'Presidents Day',
                'Good Friday',
                'Eid',
                'Memorial Day',
                'Juneteenth'
              ];
              
              const indexA = academicYearOrder.indexOf(a.name);
              const indexB = academicYearOrder.indexOf(b.name);
              
              // If both are in the predefined order, sort by that order
              if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
              }
              
              // If only one is in the predefined order, it comes first
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              
              // Otherwise sort by date
              const dateA = new Date(a.start_date || a.date);
              const dateB = new Date(b.start_date || b.date);
              return dateA.getTime() - dateB.getTime();
            })
            .map((holiday: any) => (
            <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              {editingHoliday?.id === holiday.id ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={holidayForm.name}
                      onChange={(e) => setHolidayForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Holiday name"
                      className="text-sm"
                    />
                    <Input
                      type="date"
                      value={holidayForm.date}
                      onChange={(e) => setHolidayForm(prev => ({ ...prev, date: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Input
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleUpdateHoliday}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingHoliday(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{holiday.name}</div>
                    <div className="text-xs text-gray-600">
                      {holiday.start_date ? 
                        (holiday.start_date === holiday.end_date ? 
                          holiday.start_date.split('T')[0] : 
                          `${holiday.start_date.split('T')[0]} to ${holiday.end_date.split('T')[0]}`
                        ) : 
                        holiday.date ? holiday.date.split('T')[0] : 'No date set'
                      }
                    </div>
                    {holiday.description && (
                      <div className="text-xs text-gray-500 mt-1">{holiday.description}</div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditHoliday(holiday)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// School Year Holidays Pills Component  
function SchoolYearHolidaysPills({ schoolYearId }: { schoolYearId: string }) {
  const { data: holidays = [] } = useQuery({
    queryKey: ["/api/school-years", schoolYearId, "closures"],
    enabled: !!schoolYearId,
  });

  if (!holidays.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {holidays.map((holiday: any) => (
        <Badge key={holiday.id} variant="secondary" className="text-xs">
          {holiday.name}
        </Badge>
      ))}
    </div>
  );
}

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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Common school holidays with standard rules that new schools can inherit.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Holiday Name</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Rule</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Description</th>
                  <th className="text-left p-3 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Loading holidays...
                    </td>
                  </tr>
                ) : systemHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No system holidays found. Add some holidays to get started.
                    </td>
                  </tr>
                ) : (
                  systemHolidays.map((holiday: any) => (
                    <tr key={holiday.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-medium text-gray-900 dark:text-white">{holiday.name}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                        {holiday.rule || 'No rule set'}
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{holiday.description}</td>
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
                ? academicCalendar.firstDayOfSchool.split('T')[0]
                : "Not set"
              }
            </p>
          </div>
          
          {/* Last Day */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">Last Day of School</h4>
            <p className="text-sm text-purple-600 mt-1">
              {academicCalendar?.lastDayOfSchool 
                ? academicCalendar.lastDayOfSchool.split('T')[0]
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
                        {closure.date.split('T')[0]}
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
              Editing existing calendar (created {academicCalendar.createdAt.split('T')[0]})
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
                      {closure.date.split('T')[0]}
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
  const [activeTab, setActiveTab] = useState("roles");
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedNetworkYear, setSelectedNetworkYear] = useState<string>("");
  const [schoolStartDate, setSchoolStartDate] = useState("");
  const [schoolEndDate, setSchoolEndDate] = useState("");
  const [addingSubsidy, setAddingSubsidy] = useState(false);
  const [showSSJ, setShowSSJ] = useState(true);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  // Schedule management state
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  
  // Tuition management state
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedClassroomSchedule, setSelectedClassroomSchedule] = useState<string>("");
  const [calculatedPricePerHour, setCalculatedPricePerHour] = useState<string>("0.00");
  const [deletingSchedule, setDeletingSchedule] = useState<any>(null);
  
  // System administrator tab state
  const [systemAdminTab, setSystemAdminTab] = useState("non-school-users");
  const [addingUserInvitation, setAddingUserInvitation] = useState(false);
  
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
    classroomId: "",
    classroomScheduleId: "",
    schoolYearId: "",
    fullPrice: "",
    billingFrequency: "monthly",
    slidingScalePolicyId: ""
  });
  
  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    mondayOpen: false,
    tuesdayOpen: false,
    wednesdayOpen: false,
    thursdayOpen: false,
    fridayOpen: false,
    saturdayOpen: false,
    sundayOpen: false,
    selectedClassrooms: [] as string[], // Array of classroom IDs
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

  // Fetch tuition overview (classrooms with schedules and plans)
  const { data: tuitionOverview = { classrooms: [], plans: [] } } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "tuition-overview"],
    enabled: !!effectiveSchoolId,
  });
  
  const classroomsWithSchedules = tuitionOverview.classrooms || [];
  const tuitionPlans = tuitionOverview.plans || [];

  // Fetch public subsidies
  const { data: publicSubsidies = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "public-subsidies"],
    enabled: !!effectiveSchoolId,
  });

  // Fetch classroom schedules
  const { data: classroomSchedules = [] } = useQuery({
    queryKey: ["/api/schools", effectiveSchoolId, "schedules"],
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

  // Fetch network default school years (for system admins and educators)
  const { data: networkSchoolYears = [] } = useQuery({
    queryKey: ["/api/network-school-years"],
    enabled: !!currentRole,
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
      return apiRequest('POST', `/api/tuition-plans`, tuitionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", effectiveSchoolId, "tuition-overview"] });
      setAddingTuitionPlan(false);
      setTuitionForm({ 
        name: "", 
        classroomId: "", 
        classroomScheduleId: "", 
        schoolYearId: "", 
        fullPrice: "", 
        billingFrequency: "monthly", 
        slidingScalePolicyId: "" 
      });
      setCalculatedPricePerHour("0.00");
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

  // School year import mutations
  const importWithSystemHolidaysMutation = useMutation({
    mutationFn: async (networkYearId: string) => {
      // Validate dates before sending request
      if (!schoolStartDate || !schoolEndDate) {
        throw new Error("School start date and end date are required");
      }
      
      // Validate date format
      const startDate = new Date(schoolStartDate);
      const endDate = new Date(schoolEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format provided");
      }
      
      return apiRequest('POST', `/api/schools/${schoolId}/import-school-year`, {
        networkYearId,
        importType: 'system_holidays',
        schoolStartDate,
        schoolEndDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setShowImportDialog(false);
      setSelectedNetworkYear("");
      setSchoolStartDate("");
      setSchoolEndDate("");
      toast({
        title: "School year imported",
        description: "School year imported with system default holidays.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importWithCurrentYearHolidaysMutation = useMutation({
    mutationFn: async (networkYearId: string) => {
      // Validate dates before sending request
      if (!schoolStartDate || !schoolEndDate) {
        throw new Error("School start date and end date are required");
      }
      
      // Validate date format
      const startDate = new Date(schoolStartDate);
      const endDate = new Date(schoolEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format provided");
      }
      
      return apiRequest('POST', `/api/schools/${schoolId}/import-school-year`, {
        networkYearId,
        importType: 'current_year_holidays',
        schoolStartDate,
        schoolEndDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setShowImportDialog(false);
      setSelectedNetworkYear("");
      setSchoolStartDate("");
      setSchoolEndDate("");
      toast({
        title: "School year imported",
        description: "School year imported with current year holidays.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importWithNoHolidaysMutation = useMutation({
    mutationFn: async (networkYearId: string) => {
      // Validate dates before sending request
      if (!schoolStartDate || !schoolEndDate) {
        throw new Error("School start date and end date are required");
      }
      
      // Validate date format
      const startDate = new Date(schoolStartDate);
      const endDate = new Date(schoolEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format provided");
      }
      
      return apiRequest('POST', `/api/schools/${schoolId}/import-school-year`, {
        networkYearId,
        importType: 'no_holidays',
        schoolStartDate,
        schoolEndDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", schoolId, "school-years"] });
      setShowImportDialog(false);
      setSelectedNetworkYear("");
      setSchoolStartDate("");
      setSchoolEndDate("");
      toast({
        title: "School year imported",
        description: "School year imported with no holidays.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error importing school year",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Schedule mutations
  const addScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return apiRequest('POST', `/api/schools/${effectiveSchoolId}/schedules`, scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", effectiveSchoolId, "schedules"] });
      setAddingSchedule(false);
      setScheduleForm({
        name: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        mondayOpen: false,
        tuesdayOpen: false,
        wednesdayOpen: false,
        thursdayOpen: false,
        fridayOpen: false,
        saturdayOpen: false,
        sundayOpen: false,
        selectedClassrooms: [],
      });
      toast({
        title: "Schedule created",
        description: "New schedule has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      return apiRequest('PATCH', `/api/schedules/${scheduleData.id}`, scheduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", effectiveSchoolId, "schedules"] });
      setEditingSchedule(null);
      setScheduleForm({
        name: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        mondayOpen: false,
        tuesdayOpen: false,
        wednesdayOpen: false,
        thursdayOpen: false,
        fridayOpen: false,
        saturdayOpen: false,
        sundayOpen: false,
        selectedClassrooms: [],
      });
      toast({
        title: "Schedule updated",
        description: "Schedule has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      return apiRequest('DELETE', `/api/schedules/${scheduleId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools", effectiveSchoolId, "schedules"] });
      setDeletingSchedule(null);
      toast({
        title: "Schedule deleted",
        description: "Schedule has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddTuitionPlan = () => {
    if (!tuitionForm.name || !tuitionForm.fullPrice || !selectedSchedule) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Convert "none" to null for schoolYearId
    const formData = {
      ...tuitionForm,
      schoolYearId: tuitionForm.schoolYearId === "none" ? null : tuitionForm.schoolYearId
    };
    
    addTuitionPlanMutation.mutate({
      ...formData,
      classroomId: selectedSchedule.classroom.id,
      classroomScheduleId: selectedSchedule.schedule.id,
      // Convert empty string to null for UUID fields
      schoolYearId: formData.schoolYearId === "" ? null : formData.schoolYearId
    });
  };

  // Helper function to calculate hours per week from schedule
  const calculateHoursPerWeek = (schedule: any) => {
    const daysPerWeek = [
      schedule.mondayOpen,
      schedule.tuesdayOpen,
      schedule.wednesdayOpen,
      schedule.thursdayOpen,
      schedule.fridayOpen,
      schedule.saturdayOpen,
      schedule.sundayOpen
    ].filter(Boolean).length;

    const startTime = schedule.startTime || '08:00:00';
    const endTime = schedule.endTime || '15:00:00';
    
    const startHour = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
    const endHour = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;
    const hoursPerDay = endHour - startHour;
    
    return (hoursPerDay * daysPerWeek).toFixed(1);
  };

  // Helper function to calculate price per hour
  const calculatePricePerHour = (price: string, frequency: string) => {
    if (!price || !frequency || !selectedSchedule) return;
    
    const fullPrice = parseFloat(price);
    const hoursPerWeek = parseFloat(calculateHoursPerWeek(selectedSchedule.schedule));
    const weeksPerYear = selectedSchedule.classroom.programType === 'continuous' ? 52 : 36;
    const totalHoursPerYear = hoursPerWeek * weeksPerYear;
    
    let pricePerHour = 0;
    switch (frequency) {
      case 'weekly':
        pricePerHour = fullPrice / hoursPerWeek;
        break;
      case 'monthly':
        pricePerHour = (fullPrice * 12) / totalHoursPerYear;
        break;
      case 'annually':
        pricePerHour = fullPrice / totalHoursPerYear;
        break;
    }
    
    setCalculatedPricePerHour(pricePerHour.toFixed(2));
  };

  const handleEditTuitionPlan = (plan: any) => {
    // Implementation for editing tuition plans
    console.log('Edit tuition plan:', plan);
  };

  const handleDeleteTuitionPlan = (plan: any) => {
    if (confirm("Are you sure you want to delete this tuition plan?")) {
      // Implementation for deleting tuition plans
      console.log('Delete tuition plan:', plan);
    }
  };

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
    mutationFn: async (data: { schoolYearId: string }) => {
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
        
        return apiRequest('POST', `/api/school-years/${data.schoolYearId}/closures`, {
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

  // Schedule handler functions
  const handleAddSchedule = () => {
    const { selectedClassrooms, ...scheduleData } = scheduleForm;
    addScheduleMutation.mutate({
      ...scheduleData,
      schoolId: effectiveSchoolId,
      classroomIds: selectedClassrooms
    });
  };

  const handleEditSchedule = (schedule: any) => {
    setScheduleForm({
      name: schedule.name,
      startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : "",
      endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : "",
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      mondayOpen: schedule.mondayOpen,
      tuesdayOpen: schedule.tuesdayOpen,
      wednesdayOpen: schedule.wednesdayOpen,
      thursdayOpen: schedule.thursdayOpen,
      fridayOpen: schedule.fridayOpen,
      saturdayOpen: schedule.saturdayOpen,
      sundayOpen: schedule.sundayOpen,
      selectedClassrooms: [], // Reset for editing
    });
    setEditingSchedule(schedule);
  };

  const handleUpdateSchedule = () => {
    updateScheduleMutation.mutate({
      id: editingSchedule.id,
      ...scheduleForm,
    });
  };

  const handleDeleteSchedule = (schedule: any) => {
    setDeletingSchedule(schedule);
  };

  const confirmDeleteSchedule = () => {
    if (deletingSchedule) {
      deleteScheduleMutation.mutate(deletingSchedule.id);
      setDeletingSchedule(null);
    }
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
      
      // Now import system holidays to the school year
      if (response.id) {
        await importSystemHolidaysMutation.mutateAsync({
          schoolYearId: response.id
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <TopNavigation user={user} currentSchool={currentSchoolForNav} currentRole={currentRole} />
      <div className="flex-1 flex">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
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
                    className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
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
              (<div className="space-y-6">
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
                        <p className="text-sm text-gray-600">Invite partners, central staff, and other network-wide team members.</p>
                      </CardHeader>
                      <CardContent>
                        <UserInvitationsTable />
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
                          Admin Roles
                        </TabsTrigger>
                        <TabsTrigger value="school-years" className="flex items-center">
                          <Calendar className="mr-1 sm:mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">School </span>Years
                        </TabsTrigger>
                        <TabsTrigger value="schedules" className="flex items-center">
                          <Clock className="mr-1 sm:mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Sched</span><span className="sm:hidden">Sched</span><span className="hidden sm:inline">ules</span>
                        </TabsTrigger>
                        <TabsTrigger value="tuition" className="flex items-center">
                          <DollarSign className="mr-1 sm:mr-2 h-4 w-4" />
                          Tuition<span className="hidden sm:inline"> Plans</span>
                        </TabsTrigger>
                        <TabsTrigger value="subsidies" className="flex items-center">
                          <School className="mr-1 sm:mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Public </span>Subsidies
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
                                    <div className="flex-1">
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
                                      <SchoolYearHolidaysPills schoolYearId={year.id} />
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
                            
                            // Auto-populate dates based on year name (e.g., "2024-25" or "2024-2025" -> July 1, 2024 - June 30, 2025)
                            const yearMatch = newName.match(/^(\d{4})-(\d{2,4})$/);
                            if (yearMatch) {
                              const startYear = yearMatch[1];
                              let endYear = yearMatch[2];
                              
                              // If end year is 2 digits, assume it's in the same century as start year
                              if (endYear.length === 2) {
                                const century = startYear.substring(0, 2);
                                endYear = century + endYear;
                              }
                              
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
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Network School Year</DialogTitle>
                      <DialogDescription>
                        Update the network default school year information, dates, and associated holidays.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* School Year Basic Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">School Year Information</h4>
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
                      </div>

                      {/* Associated Holidays */}
                      <NetworkSchoolYearHolidays schoolYearId={editingSchoolYear?.id || ''} />

                      <div className="flex justify-end space-x-2 pt-4 border-t">
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
              </div>)
            ) : currentRole?.roleName?.startsWith('parent') ? (
              // Parent View
              (<div className="space-y-6">
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
              </div>)
            ) : currentRole?.roleName?.startsWith('board') ? (
              // Board Member View
              (<div className="space-y-6">
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
              </div>)
            ) : (
              // Educator/Default School-Level Settings View (existing functionality)
              (<div className="space-y-6">
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Settings className="mr-3 h-8 w-8 text-primary" />
                    School Settings
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage administrative roles, classrooms, schedules, and tuition plans for {school?.name || "your school"}
                  </p>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="roles" className="flex items-center px-1 sm:px-3">
                      <Settings className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Admin Roles</span>
                    </TabsTrigger>
                    <TabsTrigger value="classrooms" className="flex items-center px-1 sm:px-3">
                      <Home className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Rooms</span>
                    </TabsTrigger>
                    <TabsTrigger value="school-years" className="flex items-center px-1 sm:px-3">
                      <Calendar className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Years</span>
                    </TabsTrigger>
                    <TabsTrigger value="schedules" className="flex items-center px-1 sm:px-3">
                      <Clock className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Schedule</span>
                    </TabsTrigger>
                    <TabsTrigger value="tuition" className="flex items-center px-1 sm:px-3">
                      <DollarSign className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Tuition</span>
                    </TabsTrigger>
                    <TabsTrigger value="subsidies" className="flex items-center px-1 sm:px-3">
                      <School className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Subsidy</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Admin Roles Tab */}
                  <TabsContent value="roles" className="space-y-6">
                    {/* School Roles Management */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>School Admin Roles</CardTitle>
                            <p className="text-sm text-gray-600">
                              Manage and customize administrative roles available at this school. These roles form the foundation for staff assignments.
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
                              <Button onClick={() => {
                                if (currentRole?.roleName?.startsWith('sysadmin')) {
                                  setAddingSchoolYear(true);
                                } else {
                                  setShowImportDialog(true);
                                }
                              }}>
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
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit School Year</DialogTitle>
                                <DialogDescription>
                                  Update the school year information, dates, and associated holidays.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* School Year Basic Info */}
                                <div className="space-y-4">
                                  <h4 className="text-sm font-medium text-gray-900">School Year Information</h4>
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
                                </div>

                                {/* Associated Holidays */}
                                <SchoolYearHolidays schoolYearId={editingSchoolYear?.id || ''} />

                                <div className="flex justify-end space-x-2 pt-4 border-t">
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



                          {/* Import School Year Dialog */}
                          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center">
                                  <Download className="mr-2 h-5 w-5" />
                                  Add New School Year
                                </DialogTitle>
                                <DialogDescription>
                                  Select a network default school year to import and choose how to handle holidays.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Network Year Selection */}
                                <div className="space-y-4">
                                  <Label>Select School Year to Create</Label>
                                  {(() => {
                                    const availableYears = networkSchoolYears.filter(networkYear => 
                                      !schoolYears.some(schoolYear => schoolYear.name === networkYear.name)
                                    );
                                    
                                    if (availableYears.length === 0) {
                                      return (
                                        <div className="text-center py-8 text-gray-500">
                                          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                          <p>All network default school years have been imported.</p>
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <RadioGroup value={selectedNetworkYear} onValueChange={setSelectedNetworkYear}>
                                        <div className="space-y-3">
                                          {availableYears.map((year) => (
                                            <div key={year.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                              <RadioGroupItem value={year.id} id={year.id} />
                                              <Label htmlFor={year.id} className="flex-1 cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                  <div>
                                                    <p className="font-medium">{year.name}</p>
                                                  </div>
                                                  <Badge variant="outline">Network Default</Badge>
                                                </div>
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                      </RadioGroup>
                                    );
                                  })()}
                                </div>

                                {/* School Date Selection */}
                                {selectedNetworkYear && (
                                  <div className="space-y-4">
                                    <div className="border-t pt-4">
                                      <Label>Set Your School's Actual Dates</Label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="schoolStartDate">
                                          School Start Date
                                        </Label>
                                        <Input
                                          id="schoolStartDate"
                                          type="date"
                                          value={schoolStartDate}
                                          onChange={(e) => setSchoolStartDate(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="schoolEndDate">
                                          School End Date
                                        </Label>
                                        <Input
                                          id="schoolEndDate"
                                          type="date"
                                          value={schoolEndDate}
                                          onChange={(e) => setSchoolEndDate(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {selectedNetworkYear && schoolStartDate && schoolEndDate && (
                                  <div className="space-y-4">
                                    <div className="border-t pt-4">
                                      <Label>Choose how to handle holidays:</Label>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                      <Button 
                                        variant="outline"
                                        onClick={() => importWithSystemHolidaysMutation.mutate(selectedNetworkYear)}
                                        disabled={importWithSystemHolidaysMutation.isPending}
                                        className="justify-start h-auto p-4"
                                      >
                                        <div className="text-left">
                                          <div className="font-medium">Add with system default holidays</div>
                                        </div>
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => importWithCurrentYearHolidaysMutation.mutate(selectedNetworkYear)}
                                        disabled={importWithCurrentYearHolidaysMutation.isPending}
                                        className="justify-start h-auto p-4"
                                      >
                                        <div className="text-left">
                                          <div className="font-medium">Add with the same holidays we used this year</div>
                                          <div className="text-sm text-gray-500">Update them to the correct dates for this new year</div>
                                        </div>
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        onClick={() => importWithNoHolidaysMutation.mutate(selectedNetworkYear)}
                                        disabled={importWithNoHolidaysMutation.isPending}
                                        className="justify-start h-auto p-4"
                                      >
                                        <div className="text-left">
                                          <div className="font-medium">Add with no holidays</div>
                                          <div className="text-sm text-gray-500">I'll add them later</div>
                                        </div>
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Cancel Button */}
                                <div className="flex justify-end border-t pt-4">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setShowImportDialog(false);
                                      setSelectedNetworkYear("");
                                      setSchoolStartDate("");
                                      setSchoolEndDate("");
                                    }}
                                  >
                                    Cancel
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
                              <Button onClick={() => {
                                if (currentRole?.roleName?.startsWith('sysadmin')) {
                                  setAddingSchoolYear(true);
                                } else {
                                  setShowImportDialog(true);
                                }
                              }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create First School Year
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Note: Academic Calendar functionality has been simplified */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Academic Calendar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Academic calendar management has been simplified. Holiday management is now handled through the school year editing interface.
                        </p>
                      </CardContent>
                    </Card>

                  </TabsContent>

                  {/* Schedules Tab */}
                  <TabsContent value="schedules" className="space-y-6">
                    {/* Schedule Management */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Classroom Schedules</CardTitle>
                            <p className="text-sm text-gray-600">
                              Manage operating schedules for your classrooms and programs
                            </p>
                          </div>
                          <Dialog open={addingSchedule} onOpenChange={setAddingSchedule}>
                            <DialogTrigger asChild>
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Schedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Schedule</DialogTitle>
                                <DialogDescription>
                                  Create a schedule template with operating hours and days
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Schedule Name</Label>
                                  <Input
                                    value={scheduleForm.name}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Primary Full Day, Elementary Extended"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Date</Label>
                                    <Input
                                      type="date"
                                      value={scheduleForm.startDate}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>End Date (Optional)</Label>
                                    <Input
                                      type="date"
                                      value={scheduleForm.endDate}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Time</Label>
                                    <Input
                                      type="time"
                                      value={scheduleForm.startTime}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>End Time</Label>
                                    <Input
                                      type="time"
                                      value={scheduleForm.endTime}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label>Operating Days</Label>
                                  <div className="grid grid-cols-7 gap-2 mt-2">
                                    {[
                                      { key: 'mondayOpen', label: 'Mon' },
                                      { key: 'tuesdayOpen', label: 'Tue' },
                                      { key: 'wednesdayOpen', label: 'Wed' },
                                      { key: 'thursdayOpen', label: 'Thu' },
                                      { key: 'fridayOpen', label: 'Fri' },
                                      { key: 'saturdayOpen', label: 'Sat' },
                                      { key: 'sundayOpen', label: 'Sun' }
                                    ].map(day => (
                                      <div key={day.key} className="flex flex-col items-center">
                                        <label className="text-xs font-medium mb-1">{day.label}</label>
                                        <input
                                          type="checkbox"
                                          checked={scheduleForm[day.key as keyof typeof scheduleForm] as boolean}
                                          onChange={(e) => setScheduleForm(prev => ({ 
                                            ...prev, 
                                            [day.key]: e.target.checked 
                                          }))}
                                          className="h-4 w-4 text-primary rounded border-gray-300"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Classroom Multi-Selection */}
                                <div className="mt-6 space-y-3">
                                  <Label className="text-base font-medium">Apply Schedule to Classrooms</Label>
                                  <p className="text-sm text-gray-600">
                                    Select which classrooms this schedule will apply to
                                  </p>
                                  <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                                    {classrooms?.map((classroom: any) => (
                                      <div key={classroom.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                                        <input
                                          type="checkbox"
                                          id={`classroom-${classroom.id}`}
                                          checked={scheduleForm.selectedClassrooms.includes(classroom.id)}
                                          onChange={(e) => {
                                            const classroomId = classroom.id;
                                            setScheduleForm(prev => ({
                                              ...prev,
                                              selectedClassrooms: e.target.checked
                                                ? [...prev.selectedClassrooms, classroomId]
                                                : prev.selectedClassrooms.filter(id => id !== classroomId)
                                            }));
                                          }}
                                          className="h-4 w-4 text-primary rounded border-gray-300"
                                        />
                                        <label 
                                          htmlFor={`classroom-${classroom.id}`}
                                          className="flex-1 cursor-pointer"
                                        >
                                          <div className="font-medium">{classroom.name}</div>
                                          <div className="text-sm text-gray-500">
                                            {classroom.level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • {classroom.ageRange}
                                          </div>
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                  {scheduleForm.selectedClassrooms.length === 0 && (
                                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                      Select at least one classroom to apply this schedule
                                    </p>
                                  )}
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button variant="outline" onClick={() => setAddingSchedule(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleAddSchedule}
                                    disabled={!scheduleForm.name || !scheduleForm.startTime || !scheduleForm.endTime || scheduleForm.selectedClassrooms.length === 0}
                                  >
                                    Create Schedule
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Edit Schedule Dialog */}
                          <Dialog open={editingSchedule !== null} onOpenChange={(open) => !open && setEditingSchedule(null)}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Schedule</DialogTitle>
                                <DialogDescription>
                                  Update the schedule template with new operating hours and days
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Schedule Name</Label>
                                  <Input
                                    value={scheduleForm.name}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Primary Full Day, Elementary Extended"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Date</Label>
                                    <Input
                                      type="date"
                                      value={scheduleForm.startDate}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>End Date (Optional)</Label>
                                    <Input
                                      type="date"
                                      value={scheduleForm.endDate}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Time</Label>
                                    <Input
                                      type="time"
                                      value={scheduleForm.startTime}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label>End Time</Label>
                                    <Input
                                      type="time"
                                      value={scheduleForm.endTime}
                                      onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label>Operating Days</Label>
                                  <div className="grid grid-cols-7 gap-2 mt-2">
                                    {[
                                      { key: 'mondayOpen', label: 'Mon' },
                                      { key: 'tuesdayOpen', label: 'Tue' },
                                      { key: 'wednesdayOpen', label: 'Wed' },
                                      { key: 'thursdayOpen', label: 'Thu' },
                                      { key: 'fridayOpen', label: 'Fri' },
                                      { key: 'saturdayOpen', label: 'Sat' },
                                      { key: 'sundayOpen', label: 'Sun' }
                                    ].map(day => (
                                      <div key={day.key} className="flex flex-col items-center">
                                        <label className="text-xs font-medium mb-1">{day.label}</label>
                                        <input
                                          type="checkbox"
                                          checked={scheduleForm[day.key as keyof typeof scheduleForm] as boolean}
                                          onChange={(e) => setScheduleForm(prev => ({ 
                                            ...prev, 
                                            [day.key]: e.target.checked 
                                          }))}
                                          className="h-4 w-4 text-primary rounded border-gray-300"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingSchedule(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleUpdateSchedule}
                                    disabled={!scheduleForm.name || !scheduleForm.startTime || !scheduleForm.endTime || updateScheduleMutation.isPending}
                                  >
                                    {updateScheduleMutation.isPending ? "Updating..." : "Update Schedule"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Delete Schedule Confirmation Dialog */}
                          <AlertDialog open={deletingSchedule !== null} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{deletingSchedule?.name}"? This action cannot be undone and will affect any classrooms using this schedule.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingSchedule(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDeleteSchedule}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Schedule
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {classroomSchedules.map((schedule: any) => (
                            <div key={schedule.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">{schedule.name}</h4>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditSchedule(schedule)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(schedule)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Operating Hours:</span>
                                  <Badge variant="outline">
                                    {schedule.startTime} - {schedule.endTime}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="flex items-center justify-between">
                                    <span>Days:</span>
                                    <div className="flex space-x-1">
                                      {schedule.mondayOpen && <Badge variant="secondary" className="text-xs">M</Badge>}
                                      {schedule.tuesdayOpen && <Badge variant="secondary" className="text-xs">T</Badge>}
                                      {schedule.wednesdayOpen && <Badge variant="secondary" className="text-xs">W</Badge>}
                                      {schedule.thursdayOpen && <Badge variant="secondary" className="text-xs">T</Badge>}
                                      {schedule.fridayOpen && <Badge variant="secondary" className="text-xs">F</Badge>}
                                      {schedule.saturdayOpen && <Badge variant="secondary" className="text-xs">S</Badge>}
                                      {schedule.sundayOpen && <Badge variant="secondary" className="text-xs">S</Badge>}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                  {schedule.startDate && (
                                    <div>Start: {new Date(schedule.startDate).toLocaleDateString()}</div>
                                  )}
                                  {schedule.endDate && (
                                    <div>End: {new Date(schedule.endDate).toLocaleDateString()}</div>
                                  )}
                                  <div>Created: {new Date(schedule.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {classroomSchedules.length === 0 && (
                            <div className="col-span-full text-center py-8">
                              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-gray-600">No schedules configured yet</p>
                              <p className="text-sm text-gray-500 mb-4">
                                Create schedule templates to define operating hours and days for your classrooms
                              </p>
                              <Button onClick={() => setAddingSchedule(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create First Schedule
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tuition Plans Tab */}
                  <TabsContent value="tuition" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Side: Classrooms and Schedules */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Classrooms & Schedules</CardTitle>
                          <p className="text-sm text-gray-600">
                            Select a classroom schedule to set pricing
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {classroomsWithSchedules
                            .sort((a: any, b: any) => {
                              // Define age level order from youngest to oldest
                              const levelOrder = {
                                'infant': 1,
                                'toddler': 2, 
                                'primary': 3,
                                'lower_elementary': 4,
                                'upper_elementary': 5,
                                'junior_high': 6,
                                'high_school': 7
                              };
                              return (levelOrder[a.level as keyof typeof levelOrder] || 999) - 
                                     (levelOrder[b.level as keyof typeof levelOrder] || 999);
                            })
                            .map((classroom: any) => (
                            <div key={classroom.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium">{classroom.name}</h4>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {classroom.level.replace('_', ' ')} • {classroom.capacity} students
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {classroom.programType === 'continuous' ? 'Year-round' : 'School Year'}
                                </Badge>
                              </div>
                              
                              {/* Schedule Selection Row */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  {(classroom.schedules && classroom.schedules.filter((s: any) => s?.id && s.id.toString().trim() !== '').length > 0) ? (
                                    <Select 
                                      value={selectedClassroomSchedule} 
                                      onValueChange={(value) => {
                                        if (value === "create-new") {
                                          setAddingSchedule(true);
                                        } else {
                                          setSelectedClassroomSchedule(value);
                                          
                                          // Find the selected schedule
                                          const selectedScheduleObj = classroom.schedules.find((s: any) => s.id === value);
                                          if (selectedScheduleObj) {
                                            setSelectedSchedule({ classroom, schedule: selectedScheduleObj });
                                          }
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a schedule..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {classroom.schedules
                                          ?.filter((schedule: any) => {
                                            // Ensure schedule exists, has an id, and it's not empty
                                            return schedule && 
                                                   schedule.id && 
                                                   schedule.id.toString().trim() !== '' &&
                                                   schedule.id !== 'undefined' &&
                                                   schedule.id !== 'null';
                                          })
                                          .map((schedule: any) => (
                                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                              <div className="flex items-center justify-between w-full">
                                                <span className="font-medium">{schedule.name || 'Unnamed Schedule'}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                  {schedule.startTime} - {schedule.endTime} • {calculateHoursPerWeek(schedule)} hrs/week
                                                </span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        <SelectItem value="create-new">
                                          <div className="flex items-center text-blue-600">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New Schedule
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="flex items-center justify-center py-2 text-gray-500">
                                      <Clock className="mr-2 h-4 w-4" />
                                      <span className="text-sm">No schedules available</span>
                                    </div>
                                  )}
                                </div>
                                
                                <Button 
                                  disabled={!selectedClassroomSchedule || selectedClassroomSchedule === "create-new"}
                                  onClick={() => {
                                    const selectedScheduleObj = classroom.schedules.find((s: any) => s.id === selectedClassroomSchedule);
                                    if (selectedScheduleObj) {
                                      setSelectedSchedule({ classroom, schedule: selectedScheduleObj });
                                      setAddingTuitionPlan(true);
                                    }
                                  }}
                                >
                                  Set Pricing
                                </Button>
                              </div>
                              
                              {/* Show schedule details if one is selected */}
                              {selectedClassroomSchedule && selectedClassroomSchedule !== "create-new" && (
                                <div className="mt-3 p-3 bg-gray-50 rounded border">
                                  {(() => {
                                    const selectedScheduleObj = classroom.schedules.find((s: any) => s.id === selectedClassroomSchedule);
                                    if (!selectedScheduleObj) return null;
                                    return (
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium text-sm">{selectedScheduleObj.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {selectedScheduleObj.startTime} - {selectedScheduleObj.endTime}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-medium">
                                            {[
                                              selectedScheduleObj.mondayOpen && 'M',
                                              selectedScheduleObj.tuesdayOpen && 'T', 
                                              selectedScheduleObj.wednesdayOpen && 'W',
                                              selectedScheduleObj.thursdayOpen && 'Th',
                                              selectedScheduleObj.fridayOpen && 'F',
                                              selectedScheduleObj.saturdayOpen && 'S',
                                              selectedScheduleObj.sundayOpen && 'Su'
                                            ].filter(Boolean).join(', ')}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {calculateHoursPerWeek(selectedScheduleObj)} hrs/week
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {classroomsWithSchedules.length === 0 && (
                            <div className="text-center py-8">
                              <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-gray-600">No classrooms found</p>
                              <Button 
                                variant="outline" 
                                className="mt-2"
                                onClick={() => setActiveTab('classrooms')}
                              >
                                Add Classroom
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Right Side: Tuition Pricing */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Tuition Pricing</CardTitle>
                              <p className="text-sm text-gray-600">
                                {selectedSchedule ? 
                                  `Set pricing for ${selectedSchedule.classroom.name} - ${selectedSchedule.schedule.name}` :
                                  'Select a schedule to set pricing'
                                }
                              </p>
                            </div>
                            {selectedSchedule && (
                              <Dialog open={addingTuitionPlan} onOpenChange={setAddingTuitionPlan}>
                                <DialogTrigger asChild>
                                  <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Pricing
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Set Tuition Pricing</DialogTitle>
                                    <DialogDescription>
                                      {selectedSchedule.classroom.name} - {selectedSchedule.schedule.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Plan Name</Label>
                                      <Input
                                        value={tuitionForm.name}
                                        onChange={(e) => setTuitionForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder={`${selectedSchedule.classroom.name} - ${selectedSchedule.schedule.name}`}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Full Price</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={tuitionForm.fullPrice}
                                          onChange={(e) => {
                                            setTuitionForm(prev => ({ ...prev, fullPrice: e.target.value }));
                                            calculatePricePerHour(e.target.value, tuitionForm.billingFrequency);
                                          }}
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div>
                                        <Label>Billing Frequency</Label>
                                        <Select onValueChange={(value) => {
                                          setTuitionForm(prev => ({ ...prev, billingFrequency: value }));
                                          calculatePricePerHour(tuitionForm.fullPrice, value);
                                        }}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="annually">Annually</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    {/* Pricing Calculation Display */}
                                    {tuitionForm.fullPrice && tuitionForm.billingFrequency && (
                                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                        <h4 className="font-medium text-blue-900">Price Calculation</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <p className="text-gray-600">Hours per week:</p>
                                            <p className="font-medium">{calculateHoursPerWeek(selectedSchedule.schedule)} hours</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">Weeks per year:</p>
                                            <p className="font-medium">{selectedSchedule.classroom.programType === 'continuous' ? '52' : '36'} weeks</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">Total hours/year:</p>
                                            <p className="font-medium">
                                              {(parseFloat(calculateHoursPerWeek(selectedSchedule.schedule)) * 
                                                (selectedSchedule.classroom.programType === 'continuous' ? 52 : 36)).toFixed(0)} hours
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-600">Price per hour:</p>
                                            <p className="font-medium text-blue-600">
                                              ${calculatedPricePerHour}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <Label>School Year (for annual pricing)</Label>
                                      <Select onValueChange={(value) => setTuitionForm(prev => ({ ...prev, schoolYearId: value }))}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select school year (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">No specific year</SelectItem>
                                          {schoolYears.map((year: any) => (
                                            <SelectItem key={year.id} value={year.id}>
                                              {year.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setAddingTuitionPlan(false)}>
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={handleAddTuitionPlan}
                                        disabled={addTuitionPlanMutation.isPending || !tuitionForm.fullPrice || !tuitionForm.billingFrequency}
                                      >
                                        {addTuitionPlanMutation.isPending ? "Adding..." : "Add Pricing"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {selectedSchedule ? (
                            <div className="space-y-4">
                              {/* Current Pricing Plans */}
                              {tuitionPlans
                                .filter((plan: any) => 
                                  plan.plan?.classroomId === selectedSchedule.classroom.id && 
                                  plan.plan?.classroomScheduleId === selectedSchedule.schedule.id
                                )
                                .map((planData: any) => {
                                  const plan = planData.plan;
                                  return (
                                    <Card key={plan.id} className="border-l-4 border-l-green-500">
                                      <CardHeader>
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h4 className="font-medium">{plan.name}</h4>
                                            <p className="text-sm text-gray-600">
                                              ${plan.fullPrice} per {plan.billingFrequency}
                                            </p>
                                            {plan.pricePerHour && (
                                              <p className="text-xs text-blue-600">
                                                ${plan.pricePerHour}/hour • {plan.hoursPerWeek} hrs/week • {plan.totalHoursPerYear} hrs/year
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleEditTuitionPlan(plan)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => handleDeleteTuitionPlan(plan)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardHeader>
                                    </Card>
                                  );
                                })}
                              
                              {tuitionPlans.filter((plan: any) => 
                                plan.plan?.classroomId === selectedSchedule.classroom.id && 
                                plan.plan?.classroomScheduleId === selectedSchedule.schedule.id
                              ).length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                  <p className="text-gray-600">No pricing set for this schedule</p>
                                  <Button 
                                    className="mt-2" 
                                    onClick={() => setAddingTuitionPlan(true)}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Set Pricing
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <DollarSign className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                              <p className="text-lg font-medium mb-2">Select a Schedule</p>
                              <p className="text-sm">
                                Choose a classroom schedule from the left to set tuition pricing
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
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
              </div>)
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}

// User Invitations Table Component
function UserInvitationsTable() {
  const { toast } = useToast();
  const [invitationForm, setInvitationForm] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });

  // Fetch user invitations
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["/api/user-invitations"],
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitation: any) => {
      return await apiRequest("/api/user-invitations", "POST", invitation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-invitations"] });
      toast({
        title: "Invitation sent",
        description: "User invitation has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user invitation.",
        variant: "destructive",
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest(`/api/user-invitations/${invitationId}/cancel`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-invitations"] });
      toast({
        title: "Invitation cancelled",
        description: "User invitation has been cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive",
      });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await apiRequest(`/api/user-invitations/${invitationId}/resend`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-invitations"] });
      toast({
        title: "Invitation resent",
        description: "User invitation has been resent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive",
      });
    },
  });

  const handleCreateInvitation = () => {
    if (!invitationForm.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    createInvitationMutation.mutate(invitationForm);
    setInvitationForm({ email: "", firstName: "", lastName: "" });
  };

  const getStatusBadge = (invitation: any) => {
    const isExpired = new Date(invitation.expiresAt) < new Date();
    const status = isExpired ? 'expired' : invitation.status;
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600 border-red-600">Expired</Badge>;
      default:
        return <Badge variant="outline">{invitation.status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading invitations...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Create Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite New User</CardTitle>
          <p className="text-sm text-gray-600">Send an invitation to join the Wildflower network as central staff or a partner.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={invitationForm.email}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={invitationForm.firstName}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={invitationForm.lastName}
                onChange={(e) => setInvitationForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleCreateInvitation}
              disabled={createInvitationMutation.isPending || !invitationForm.email}
            >
              {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <div className="space-y-3">
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No invitations sent yet. Create your first invitation above.
          </div>
        ) : (
          invitations.map((invitation: any) => (
            <Card key={invitation.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">
                          {invitation.firstName || invitation.lastName 
                            ? `${invitation.firstName || ''} ${invitation.lastName || ''}`.trim()
                            : invitation.email}
                        </p>
                        <p className="text-sm text-gray-600">{invitation.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(invitation)}
                          <span className="text-xs text-gray-500">
                            Sent {new Date(invitation.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {invitation.status === 'pending' && new Date(invitation.expiresAt) > new Date() && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitationMutation.mutate(invitation.id)}
                          disabled={resendInvitationMutation.isPending}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                          disabled={cancelInvitationMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}