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
  ArrowLeft, 
  Edit, 
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  Heart,
  GraduationCap,
  FileText,
  Shield,
  Activity,
  Stethoscope,
  Brain,
  Car,
  Save,
  X,
  Baby,
  User
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

export default function ChildDetailsPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/children/:childId");
  const childId = params?.childId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });

  const [editingChild, setEditingChild] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    genderId: '',
    raceEthnicityIds: [],
    primaryLanguageId: '',
    notes: ''
  });

  // Fetch child details
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ["/api/children", childId],
    enabled: !!childId,
  });

  // Fetch child's family details
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ["/api/families", child?.familyId],
    enabled: !!child?.familyId,
  });

  // Fetch child's enrollments
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/families", child?.familyId, "enrollments"],
    enabled: !!child?.familyId,
  });

  // Fetch reference data
  const { data: genders = [] } = useQuery({
    queryKey: ["/api/genders"],
  });

  const { data: raceEthnicities = [] } = useQuery({
    queryKey: ["/api/race-ethnicities"],
  });

  const { data: languages = [] } = useQuery({
    queryKey: ["/api/languages"],
  });

  // Update child mutation
  const updateChildMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/children/${childId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Child information updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/children", childId] });
      setEditingChild(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update child information",
        variant: "destructive",
      });
    },
  });

  // Filter enrollments for this child
  const childEnrollments = enrollments.filter((e: any) => e.childId === childId);

  const handleEditChild = () => {
    setEditForm({
      firstName: child?.firstName || '',
      lastName: child?.lastName || '',
      birthDate: child?.birthDate ? new Date(child.birthDate).toISOString().split('T')[0] : '',
      genderId: child?.genderId || '',
      raceEthnicityIds: child?.raceEthnicityIds || [],
      primaryLanguageId: child?.primaryLanguageId || '',
      notes: child?.notes || ''
    });
    setEditingChild(true);
  };

  const handleSaveChild = () => {
    const updateData = {
      ...editForm,
      birthDate: editForm.birthDate ? new Date(editForm.birthDate) : null,
    };
    updateChildMutation.mutate(updateData);
  };

  const handleCancelEdit = () => {
    setEditingChild(false);
    setEditForm({
      firstName: '',
      lastName: '',
      birthDate: '',
      genderId: '',
      raceEthnicityIds: [],
      primaryLanguageId: '',
      notes: ''
    });
  };

  if (childLoading || familyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopNavigation />
        <div className="lg:flex">
          <Sidebar />
          <main className="flex-1 px-4 pt-16 pb-20 lg:pb-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading child details...</p>
              </div>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopNavigation />
        <div className="lg:flex">
          <Sidebar />
          <main className="flex-1 px-4 pt-16 pb-20 lg:pb-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Baby className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Child Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400">The child you're looking for doesn't exist.</p>
                <Link href="/families">
                  <Button className="mt-4" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Families
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavigation />
      <div className="lg:flex">
        <Sidebar />
        <main className="flex-1 px-4 pt-16 pb-20 lg:pb-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href={`/families/${child.familyId}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Family
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {child.firstName} {child.lastName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatAgeDisplay(child.birthDate)} • {family?.name}
                    </p>
                  </div>
                </div>
                <Button onClick={handleEditChild} variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Child
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="learning">Learning</TabsTrigger>
                <TabsTrigger value="transportation">Transportation</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                          <p className="text-gray-900 dark:text-white">{child.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                          <p className="text-gray-900 dark:text-white">{child.lastName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Birth Date</Label>
                          <p className="text-gray-900 dark:text-white">
                            {child.birthDate ? new Date(child.birthDate).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</Label>
                          <p className="text-gray-900 dark:text-white">{formatAgeDisplay(child.birthDate)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</Label>
                          <p className="text-gray-900 dark:text-white">
                            {genders.find((g: any) => g.id === child.genderId)?.name || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Language</Label>
                          <p className="text-gray-900 dark:text-white">
                            {languages.find((l: any) => l.id === child.primaryLanguageId)?.name || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      {child.notes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                          <p className="text-gray-900 dark:text-white">{child.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Family Connection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Family Connection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{family?.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Primary Family</p>
                          </div>
                          <Link href={`/families/${child.familyId}`}>
                            <Button variant="outline" size="sm">
                              View Family
                            </Button>
                          </Link>
                        </div>
                        {family?.address && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{family.address}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {family.city}, {family.state} {family.zipCode}
                              </p>
                            </div>
                          </div>
                        )}
                        {family?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-900 dark:text-white">{family.phone}</p>
                          </div>
                        )}
                        {family?.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-900 dark:text-white">{family.email}</p>
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
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Educational Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childEnrollments.length > 0 ? (
                      <EnrollmentTimeline
                        child={child}
                        enrollments={childEnrollments}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No enrollment history found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          This child hasn't been enrolled in any classrooms yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Health Tab */}
              <TabsContent value="health" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="mr-2 h-5 w-5" />
                      Health Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Health information not available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Health profiles will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Learning Tab */}
              <TabsContent value="learning" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" />
                      Learning Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Learning information not available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Learning profiles will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transportation Tab */}
              <TabsContent value="transportation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Car className="mr-2 h-5 w-5" />
                      Transportation Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Transportation information not available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Transportation profiles will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No documents available</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Document management will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {/* Edit Child Dialog */}
      <Dialog open={editingChild} onOpenChange={setEditingChild}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Child Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="genderId">Gender</Label>
                <Select value={editForm.genderId} onValueChange={(value) => setEditForm({ ...editForm, genderId: value })}>
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
              </div>
            </div>
            <div>
              <Label htmlFor="primaryLanguageId">Primary Language</Label>
              <Select value={editForm.primaryLanguageId} onValueChange={(value) => setEditForm({ ...editForm, primaryLanguageId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language: any) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveChild} disabled={updateChildMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}