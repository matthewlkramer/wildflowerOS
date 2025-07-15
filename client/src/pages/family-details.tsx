import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  ArrowLeft, 
  Edit, 
  Plus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  GraduationCap,
  CreditCard,
  FileText,
  Trash2,
  Save,
  X,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { formatAgeDisplay } from "@/lib/ageUtils";
import EnrollmentTimeline from "@/components/families/EnrollmentTimeline";

export default function FamilyDetailsPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/families/:familyId");
  const familyId = params?.familyId;
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  const [editingFamily, setEditingFamily] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [newChildForm, setNewChildForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    genderId: "",
    genderOther: "",
    raceEthnicityIds: [] as string[],
    raceEthnicityOther: "",
    primaryLanguageIds: [] as string[],
    primaryLanguageOther: "",
    notes: ""
  });

  const [editingChild, setEditingChild] = useState<any>(null);
  const [editChildForm, setEditChildForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    genderId: "",
    genderOther: "",
    raceEthnicityIds: [] as string[],
    raceEthnicityOther: "",
    primaryLanguageIds: [] as string[],
    primaryLanguageOther: "",
    notes: ""
  });
  const [familyEditForm, setFamilyEditForm] = useState({
    name: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user's school context from the current role

  const schoolId = currentRole?.schoolId;

  // Fetch family data
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ["/api/families", familyId],
    enabled: !!familyId,
  });

  // Fetch children
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["/api/families", familyId, "children"],
    enabled: !!familyId,
  });

  // Fetch family adults (users with parent roles)
  const { data: adults = [], isLoading: adultsLoading } = useQuery({
    queryKey: ["/api/families", familyId, "adults"],
    enabled: !!familyId,
  });



  // Fetch enrollments for this family
  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/families", familyId, "enrollments"],
    enabled: !!familyId,
  });

  // Fetch classrooms for enrollment dropdown
  const { data: classrooms = [] } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
    enabled: !!schoolId,
  });

  // Fetch billing information
  const { data: billingSetup } = useQuery({
    queryKey: ["/api/families", familyId, "billing"],
    enabled: !!familyId,
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/families", familyId, "invoices"],
    enabled: !!familyId,
  });

  // Fetch demographic reference data
  const { data: genders = [] } = useQuery({
    queryKey: ["/api/genders"],
  });

  const { data: raceEthnicities = [] } = useQuery({
    queryKey: ["/api/race-ethnicities"],
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["/api/languages"],
  });

  // Update family mutation
  const updateFamilyMutation = useMutation({
    mutationFn: async (familyData: any) => {
      return apiRequest(`/api/families/${familyId}`, {
        method: 'PATCH',
        body: familyData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId] });
      setEditingFamily(false);
      toast({
        title: "Family updated",
        description: "Family information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating family",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add child mutation
  const addChildMutation = useMutation({
    mutationFn: async (childData: any) => {
      return apiRequest(`/api/families/${familyId}/children`, {
        method: 'POST',
        body: { ...childData, familyId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId, "children"] });
      setAddingChild(false);
      setNewChildForm({ 
        firstName: "", 
        lastName: "", 
        birthDate: "", 
        genderId: "",
        genderOther: "",
        raceEthnicityIds: [],
        raceEthnicityOther: "",
        primaryLanguageIds: [],
        primaryLanguageOther: "",
        notes: "" 
      });
      toast({
        title: "Child added",
        description: "New child has been added to the family.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding child",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update child mutation
  const updateChildMutation = useMutation({
    mutationFn: async ({ childId, childData }: { childId: string; childData: any }) => {
      return apiRequest(`/api/children/${childId}`, {
        method: 'PATCH',
        body: childData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId, "children"] });
      setEditingChild(null);
      toast({
        title: "Child updated",
        description: "Child information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating child",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create enrollment mutation
  const createEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentData: any) => {
      return apiRequest(`/api/enrollments`, {
        method: 'POST',
        body: enrollmentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId, "enrollments"] });
      toast({
        title: "Enrollment created",
        description: "Child has been enrolled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating enrollment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFamilyEdit = () => {
    if (family) {
      setFamilyEditForm({
        name: family.name || "",
        notes: family.notes || ""
      });
      setEditingFamily(true);
    }
  };

  const handleFamilyUpdate = () => {
    updateFamilyMutation.mutate(familyEditForm);
  };

  const handleAddChild = () => {
    addChildMutation.mutate(newChildForm);
  };

  const handleEditChild = (child: any) => {
    setEditChildForm({
      firstName: child.firstName || "",
      lastName: child.lastName || "",
      birthDate: child.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : "",
      genderId: child.genderId || "",
      genderOther: child.genderOther || "",
      raceEthnicityIds: child.raceEthnicityIds || [],
      raceEthnicityOther: child.raceEthnicityOther || "",
      primaryLanguageIds: child.primaryLanguageIds || [],
      primaryLanguageOther: child.primaryLanguageOther || "",
      notes: child.notes || ""
    });
    setEditingChild(child);
  };

  const handleUpdateChild = () => {
    if (editingChild) {
      updateChildMutation.mutate({
        childId: editingChild.id,
        childData: editChildForm
      });
    }
  };

  // Helper functions for multiple selections
  const toggleSelection = (id: string, currentIds: string[], setter: (ids: string[]) => void) => {
    if (currentIds.includes(id)) {
      setter(currentIds.filter(existingId => existingId !== id));
    } else {
      setter([...currentIds, id]);
    }
  };

  const getLabelForIds = (ids: string[], items: any[], field: string) => {
    if (!ids || ids.length === 0) return "";
    const labels = ids.map(id => {
      const item = items.find(i => i.id === id);
      return item ? item[field] : "";
    }).filter(Boolean);
    return labels.join(", ");
  };

  const handleCreateEnrollment = (childId: string, classroomId: string) => {
    createEnrollmentMutation.mutate({
      childId,
      schoolId,
      classroomId,
      status: "prospective",
      startDate: new Date().toISOString(),
    });
  };

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

  if (familyLoading || childrenLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family details...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Family not found</h1>
            <p className="mt-2 text-gray-600">The requested family could not be found.</p>
            <Link href="/families">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Families
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopNavigation user={user} currentSchool={null} currentRole={currentRole} />
      
      <div className="flex-1 flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 lg:p-6 pb-20">
            <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href="/families">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Families
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Users className="mr-3 h-8 w-8 text-primary" />
                      {family.name || "Unnamed Family"}
                    </h1>
                    <p className="mt-2 text-gray-600">
                      {children.length} {children.length === 1 ? "child" : "children"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Family Information - Full Width */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Family Information
                      <Button variant="ghost" size="sm" onClick={handleFamilyEdit}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Family Name</Label>
                      <p className="mt-1">{family.name || "Not provided"}</p>
                    </div>
                    
                    {family.notes && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Notes</Label>
                        <p className="mt-1 text-sm text-gray-600">{family.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Adults - Full Width */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Adults
                      </div>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Adult
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adultsLoading ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : adults.length === 0 ? (
                      <div className="text-center py-6">
                        <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm mb-3">No adults added yet</p>
                        <p className="text-xs text-gray-400 mb-3">Connect existing users with parent roles to this family</p>
                        <Button size="sm" variant="outline">
                          <Plus className="mr-2 h-3 w-3" />
                          Add First Adult
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {adults.map((adult: any) => (
                          <div key={adult.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">
                                  {adult.firstName} {adult.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Parent/Guardian
                                </div>
                                {adult.email && (
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{adult.email}</span>
                                  </div>
                                )}
                                {adult.phone && (
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                                    {adult.phone}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Children - Full Width */}
                <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Children
                    <Dialog open={addingChild} onOpenChange={setAddingChild}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Child
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Child</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={newChildForm.firstName}
                                onChange={(e) => setNewChildForm(prev => ({ ...prev, firstName: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={newChildForm.lastName}
                                onChange={(e) => setNewChildForm(prev => ({ ...prev, lastName: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={newChildForm.birthDate}
                              onChange={(e) => setNewChildForm(prev => ({ ...prev, birthDate: e.target.value }))}
                            />
                          </div>
                          {/* Gender Selection */}
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select onValueChange={(value) => setNewChildForm(prev => ({ ...prev, genderId: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {genders.map((gender: any) => (
                                  <SelectItem key={gender.id} value={gender.id}>
                                    {gender.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {newChildForm.genderId && genders.find((g: any) => g.id === newChildForm.genderId)?.name === "Other" && (
                              <div className="mt-2">
                                <Input
                                  placeholder="Please specify"
                                  value={newChildForm.genderOther}
                                  onChange={(e) => setNewChildForm(prev => ({ ...prev, genderOther: e.target.value }))}
                                />
                              </div>
                            )}
                          </div>

                          {/* Race/Ethnicity Selection */}
                          <div>
                            <Label>Race/Ethnicity (select all that apply)</Label>
                            <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                              {raceEthnicities.map((race: any) => (
                                <div key={race.id} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="checkbox"
                                    id={`race-${race.id}`}
                                    checked={newChildForm.raceEthnicityIds.includes(race.id)}
                                    onChange={() => toggleSelection(race.id, newChildForm.raceEthnicityIds, 
                                      (ids) => setNewChildForm(prev => ({ ...prev, raceEthnicityIds: ids })))}
                                    className="rounded"
                                  />
                                  <label htmlFor={`race-${race.id}`} className="text-sm">
                                    {race.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {newChildForm.raceEthnicityIds.some(id => 
                              raceEthnicities.find((r: any) => r.id === id)?.name.includes("Other")
                            ) && (
                              <div className="mt-2">
                                <Input
                                  placeholder="Please specify other race/ethnicity"
                                  value={newChildForm.raceEthnicityOther}
                                  onChange={(e) => setNewChildForm(prev => ({ ...prev, raceEthnicityOther: e.target.value }))}
                                />
                              </div>
                            )}
                          </div>

                          {/* Primary Language Selection */}
                          <div>
                            <Label>Primary Language(s) (select all that apply)</Label>
                            <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                              {languages.map((language: any) => (
                                <div key={language.id} className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="checkbox"
                                    id={`lang-${language.id}`}
                                    checked={newChildForm.primaryLanguageIds.includes(language.id)}
                                    onChange={() => toggleSelection(language.id, newChildForm.primaryLanguageIds, 
                                      (ids) => setNewChildForm(prev => ({ ...prev, primaryLanguageIds: ids })))}
                                    className="rounded"
                                  />
                                  <label htmlFor={`lang-${language.id}`} className="text-sm">
                                    {language.nameEnglish} - {language.nameNative}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {newChildForm.primaryLanguageIds.some(id => 
                              languages.find((l: any) => l.id === id)?.nameEnglish.includes("Other")
                            ) && (
                              <div className="mt-2">
                                <Input
                                  placeholder="Please specify other language"
                                  value={newChildForm.primaryLanguageOther}
                                  onChange={(e) => setNewChildForm(prev => ({ ...prev, primaryLanguageOther: e.target.value }))}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              value={newChildForm.notes}
                              onChange={(e) => setNewChildForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setAddingChild(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAddChild}
                              disabled={!newChildForm.firstName || !newChildForm.lastName}
                            >
                              Add Child
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {children.map((child: any) => {
                      const enrollment = enrollments.find((e: any) => e.childId === child.id);
                      return (
                        <div key={child.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <Link href={`/children/${child.id}`} className="flex-1 cursor-pointer">
                              <div className="hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors">
                                <h4 className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{child.firstName} {child.lastName}</h4>
                                <p className="text-sm text-gray-600">
                                  Born: {new Date(child.birthDate).toLocaleDateString()} • Age: {formatAgeDisplay(child.birthDate)}
                                </p>
                                {child.genderId && (
                                  <p className="text-sm text-gray-600">
                                    Gender: {genders.find((g: any) => g.id === child.genderId)?.name || "Unknown"}
                                    {child.genderOther && ` (${child.genderOther})`}
                                  </p>
                                )}
                                {child.raceEthnicityIds && child.raceEthnicityIds.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    Race/Ethnicity: {getLabelForIds(child.raceEthnicityIds, raceEthnicities, "name")}
                                    {child.raceEthnicityOther && ` (${child.raceEthnicityOther})`}
                                  </p>
                                )}
                                {child.primaryLanguageIds && child.primaryLanguageIds.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    Languages: {getLabelForIds(child.primaryLanguageIds, languages, "nameEnglish")}
                                    {child.primaryLanguageOther && ` (${child.primaryLanguageOther})`}
                                  </p>
                                )}
                                {enrollment && (
                                  <div className="mt-2 flex items-center space-x-2">
                                    <Badge className={getStatusColor(enrollment.status)}>
                                      {enrollment.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Badge>
                                    {enrollment.classroom && (
                                      <Badge className={getClassroomColor(enrollment.classroom.level)}>
                                        {enrollment.classroom.name}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex space-x-2">
                              <Link href={`/children/${child.id}`}>
                                <Button variant="outline" size="sm" title="View child details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm" onClick={() => handleEditChild(child)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Child</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this child from the family? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Remove</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {children.length === 0 && (
                      <div className="text-center py-8">
                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No children added yet</p>
                        <Button className="mt-2" onClick={() => setAddingChild(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Child
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </TabsContent>

              {/* Enrollment Tab */}
              <TabsContent value="enrollment" className="space-y-6">
                <div className="space-y-6">
                  {children.length === 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Educational Journey</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">No children to show enrollment for</p>
                          <p className="text-sm text-gray-500">Add children in the Overview tab first</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    children.map((child: any) => {
                      // Get all enrollments for this child
                      const childEnrollments = enrollments.filter((e: any) => e.childId === child.id);
                      return (
                        <EnrollmentTimeline
                          key={child.id}
                          child={child}
                          enrollments={childEnrollments}
                        />
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Billing Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Billing Setup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billingSetup ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Billing Schedule</Label>
                        <p className="mt-1 capitalize">{billingSetup.billingSchedule}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                        <p className="mt-1 capitalize">{billingSetup.paymentMethod.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Autopay</Label>
                        <Badge className={billingSetup.autopayEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {billingSetup.autopayEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Billing Setup
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No billing setup configured</p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Setup Billing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Recent Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {invoices.length > 0 ? (
                    <div className="space-y-3">
                      {invoices.slice(0, 5).map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">#{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${invoice.totalAmount}</p>
                            <Badge className={
                              invoice.status === 'paid' ? "bg-green-100 text-green-800" :
                              invoice.status === 'overdue' ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        View All Invoices
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No invoices yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-6">
                <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Communication features coming soon</p>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
            </div>

            {/* Edit Child Dialog */}
            <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Child Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editFirstName">First Name</Label>
                      <Input
                        id="editFirstName"
                        value={editChildForm.firstName}
                        onChange={(e) => setEditChildForm(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editLastName">Last Name</Label>
                      <Input
                        id="editLastName"
                        value={editChildForm.lastName}
                        onChange={(e) => setEditChildForm(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editBirthDate">Birth Date</Label>
                    <Input
                      id="editBirthDate"
                      type="date"
                      value={editChildForm.birthDate}
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>

                  {/* Gender Selection */}
                  <div>
                    <Label htmlFor="editGender">Gender</Label>
                    <Select value={editChildForm.genderId} onValueChange={(value) => setEditChildForm(prev => ({ ...prev, genderId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender: any) => (
                          <SelectItem key={gender.id} value={gender.id}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editChildForm.genderId && genders.find((g: any) => g.id === editChildForm.genderId)?.name === "Other" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Please specify"
                          value={editChildForm.genderOther}
                          onChange={(e) => setEditChildForm(prev => ({ ...prev, genderOther: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Race/Ethnicity Selection */}
                  <div>
                    <Label>Race/Ethnicity (select all that apply)</Label>
                    <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                      {raceEthnicities.map((race: any) => (
                        <div key={race.id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`edit-race-${race.id}`}
                            checked={editChildForm.raceEthnicityIds.includes(race.id)}
                            onChange={() => toggleSelection(race.id, editChildForm.raceEthnicityIds, 
                              (ids) => setEditChildForm(prev => ({ ...prev, raceEthnicityIds: ids })))}
                            className="rounded"
                          />
                          <label htmlFor={`edit-race-${race.id}`} className="text-sm">
                            {race.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {editChildForm.raceEthnicityIds.some(id => 
                      raceEthnicities.find((r: any) => r.id === id)?.name.includes("Other")
                    ) && (
                      <div className="mt-2">
                        <Input
                          placeholder="Please specify other race/ethnicity"
                          value={editChildForm.raceEthnicityOther}
                          onChange={(e) => setEditChildForm(prev => ({ ...prev, raceEthnicityOther: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary Language Selection */}
                  <div>
                    <Label>Primary Language(s) (select all that apply)</Label>
                    <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                      {languages.map((language: any) => (
                        <div key={language.id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`edit-lang-${language.id}`}
                            checked={editChildForm.primaryLanguageIds.includes(language.id)}
                            onChange={() => toggleSelection(language.id, editChildForm.primaryLanguageIds, 
                              (ids) => setEditChildForm(prev => ({ ...prev, primaryLanguageIds: ids })))}
                            className="rounded"
                          />
                          <label htmlFor={`edit-lang-${language.id}`} className="text-sm">
                            {language.nameEnglish} - {language.nameNative}
                          </label>
                        </div>
                      ))}
                    </div>
                    {editChildForm.primaryLanguageIds.some(id => 
                      languages.find((l: any) => l.id === id)?.nameEnglish.includes("Other")
                    ) && (
                      <div className="mt-2">
                        <Input
                          placeholder="Please specify other language"
                          value={editChildForm.primaryLanguageOther}
                          onChange={(e) => setEditChildForm(prev => ({ ...prev, primaryLanguageOther: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="editNotes">Notes</Label>
                    <Textarea
                      id="editNotes"
                      value={editChildForm.notes}
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingChild(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateChild}
                      disabled={!editChildForm.firstName || !editChildForm.lastName}
                    >
                      Update Child
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Family Dialog */}
        <Dialog open={editingFamily} onOpenChange={setEditingFamily}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Family Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  value={familyEditForm.name}
                  onChange={(e) => setFamilyEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="familyNotes">Notes</Label>
                <Textarea
                  id="familyNotes"
                  value={familyEditForm.notes}
                  onChange={(e) => setFamilyEditForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingFamily(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleFamilyUpdate} disabled={updateFamilyMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateFamilyMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </main>
      </div>
      
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}