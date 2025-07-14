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
  X
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

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
    gender: "",
    notes: ""
  });
  const [familyEditForm, setFamilyEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
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
      setNewChildForm({ firstName: "", lastName: "", birthDate: "", gender: "", notes: "" });
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
        email: family.email || "",
        phone: family.phone || "",
        address: family.address || "",
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
    <div className="min-h-screen bg-gray-50">
      <TopNavigation user={user} currentSchool={null} currentRole={currentRole} />
      
      <div className="pt-16">
        <Sidebar currentRole={currentRole} />
        
        <div className="lg:ml-64">
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
                  <Button variant="outline" onClick={handleFamilyEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Family
                  </Button>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Family Information */}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Family Name</Label>
                      <p className="mt-1">{family.name || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Primary Contact</Label>
                      <p className="mt-1">{family.primaryContactName || "Not assigned"}</p>
                    </div>
                  </div>
                  
                  {family.email && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{family.email}</span>
                    </div>
                  )}
                  
                  {family.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{family.phone}</span>
                    </div>
                  )}
                  
                  {family.address && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{family.address}</span>
                    </div>
                  )}
                  
                  {family.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Notes</Label>
                      <p className="mt-1 text-sm text-gray-600">{family.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Children */}
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
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select onValueChange={(value) => setNewChildForm(prev => ({ ...prev, gender: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <div>
                              <h4 className="font-medium">{child.firstName} {child.lastName}</h4>
                              <p className="text-sm text-gray-600">
                                Born: {new Date(child.birthDate).toLocaleDateString()}
                              </p>
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
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
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
                </div>
              </TabsContent>

              {/* Enrollment Tab */}
              <TabsContent value="enrollment" className="space-y-6">
                <Card>
              <CardHeader>
                <CardTitle>Enrollment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {children.map((child: any) => {
                    const enrollment = enrollments.find((e: any) => e.childId === child.id);
                    return (
                      <div key={child.id} className="p-6 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium">{child.firstName} {child.lastName}</h4>
                          {!enrollment && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Enroll
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enroll {child.firstName} {child.lastName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Classroom</Label>
                                    <Select onValueChange={(classroomId) => handleCreateEnrollment(child.id, classroomId)}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select classroom" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {classrooms.map((classroom: any) => (
                                          <SelectItem key={classroom.id} value={classroom.id}>
                                            {classroom.name} ({classroom.level})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>

                        {enrollment ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Status</Label>
                              <div className="mt-1">
                                <Badge className={getStatusColor(enrollment.status)}>
                                  {enrollment.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Classroom</Label>
                              <div className="mt-1">
                                {enrollment.classroom ? (
                                  <Badge className={getClassroomColor(enrollment.classroom.level)}>
                                    {enrollment.classroom.name}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-500">Not assigned</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                              <p className="mt-1">
                                {enrollment.startDate 
                                  ? new Date(enrollment.startDate).toLocaleDateString()
                                  : "Not set"
                                }
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500">Not enrolled</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {children.length === 0 && (
                    <div className="text-center py-8">
                      <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No children to enroll</p>
                      <p className="text-sm text-gray-500">Add children in the Overview tab first</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={familyEditForm.email}
                  onChange={(e) => setFamilyEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={familyEditForm.phone}
                  onChange={(e) => setFamilyEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={familyEditForm.address}
                  onChange={(e) => setFamilyEditForm(prev => ({ ...prev, address: e.target.value }))}
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
            </div>
          </div>
        </div>
      </div>
      
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}