import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, FileText, Upload, Download, Trash2, Eye, Calendar, DollarSign, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Form schemas
const subsidyProgramSchema = z.object({
  state: z.string().length(2, 'State code must be 2 letters').toUpperCase(),
  programName: z.string().min(1, 'Program name is required').max(255),
  programCode: z.string().max(100).optional(),
  description: z.string().optional(),
});

const subsidyVersionSchema = z.object({
  versionName: z.string().min(1, 'Version name is required').max(255),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});

type SubsidyProgramFormData = z.infer<typeof subsidyProgramSchema>;
type SubsidyVersionFormData = z.infer<typeof subsidyVersionSchema>;

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export function PublicSubsidies() {
  const { toast } = useToast();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [createProgramOpen, setCreateProgramOpen] = useState(false);
  const [createVersionOpen, setCreateVersionOpen] = useState(false);
  const [deleteProgramOpen, setDeleteProgramOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Fetch programs
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['/api/subsidy-programs'],
  });

  // Fetch versions for selected program
  const { data: versions = [] } = useQuery({
    queryKey: ['/api/subsidy-program-versions', selectedProgram?.id],
    enabled: !!selectedProgram?.id,
  });

  // Fetch documents for selected version
  const { data: documents = [] } = useQuery({
    queryKey: ['/api/subsidy-documents', selectedVersion?.id],
    enabled: !!selectedVersion?.id,
  });

  // Create program mutation
  const createProgramMutation = useMutation({
    mutationFn: (data: SubsidyProgramFormData) => 
      apiRequest('/api/subsidy-programs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsidy-programs'] });
      setCreateProgramOpen(false);
      toast({
        title: 'Program created',
        description: 'The subsidy program has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create program',
        variant: 'destructive',
      });
    },
  });

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: (data: SubsidyVersionFormData) => 
      apiRequest('/api/subsidy-program-versions', {
        method: 'POST',
        body: JSON.stringify({ ...data, programId: selectedProgram?.id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsidy-program-versions', selectedProgram?.id] });
      setCreateVersionOpen(false);
      toast({
        title: 'Version created',
        description: 'The program version has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create version',
        variant: 'destructive',
      });
    },
  });

  // Delete program mutation
  const deleteProgramMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/subsidy-programs/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsidy-programs'] });
      setDeleteProgramOpen(false);
      setSelectedProgram(null);
      setSelectedVersion(null);
      toast({
        title: 'Program deleted',
        description: 'The subsidy program has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete program',
        variant: 'destructive',
      });
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', type);
      formData.append('versionId', selectedVersion?.id);

      return apiRequest('/api/subsidy-documents/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set content-type for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subsidy-documents', selectedVersion?.id] });
      setUploadDialogOpen(false);
      setUploadFile(null);
      setDocumentType('');
      toast({
        title: 'Document uploaded',
        description: 'The document has been uploaded successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    },
  });

  // Forms
  const programForm = useForm<SubsidyProgramFormData>({
    resolver: zodResolver(subsidyProgramSchema),
    defaultValues: {
      state: '',
      programName: '',
      programCode: '',
      description: '',
    },
  });

  const versionForm = useForm<SubsidyVersionFormData>({
    resolver: zodResolver(subsidyVersionSchema),
    defaultValues: {
      versionName: '',
      startDate: '',
      endDate: '',
    },
  });

  const handleProgramSubmit = (data: SubsidyProgramFormData) => {
    createProgramMutation.mutate(data);
  };

  const handleVersionSubmit = (data: SubsidyVersionFormData) => {
    createVersionMutation.mutate(data);
  };

  const handleFileUpload = () => {
    if (uploadFile && documentType) {
      uploadDocumentMutation.mutate({ file: uploadFile, type: documentType });
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'rates':
        return <DollarSign className="h-4 w-4" />;
      case 'copays':
        return <Users className="h-4 w-4" />;
      case 'eligibility':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'rates':
        return 'Provider Rates';
      case 'copays':
        return 'Parent Copays';
      case 'eligibility':
        return 'Eligibility Rules';
      default:
        return 'Other Document';
    }
  };

  if (isLoading) {
    return <div>Loading subsidy programs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Programs List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Public Subsidy Programs</CardTitle>
              <CardDescription>
                Manage state childcare assistance programs and their documentation
              </CardDescription>
            </div>
            <Dialog open={createProgramOpen} onOpenChange={setCreateProgramOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subsidy Program</DialogTitle>
                  <DialogDescription>
                    Add a new state childcare assistance program
                  </DialogDescription>
                </DialogHeader>
                <Form {...programForm}>
                  <form onSubmit={programForm.handleSubmit(handleProgramSubmit)} className="space-y-4">
                    <FormField
                      control={programForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                  {state.name} ({state.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="programName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Child Care Assistance Program (CCAP)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="programCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Code (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., MN-CCAP" />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for this program
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={programForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Additional information about this program..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setCreateProgramOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createProgramMutation.isPending}>
                        Create Program
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program: any) => (
              <Card 
                key={program.id} 
                className={`cursor-pointer transition-colors ${selectedProgram?.id === program.id ? 'border-primary' : ''}`}
                onClick={() => {
                  setSelectedProgram(program);
                  setSelectedVersion(null);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{program.programName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{program.state}</Badge>
                        {program.programCode && (
                          <span className="text-xs text-muted-foreground">{program.programCode}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProgram(program);
                        setDeleteProgramOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {program.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Versions */}
      {selectedProgram && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Program Versions</CardTitle>
                <CardDescription>
                  Manage versions and rate schedules for {selectedProgram.programName}
                </CardDescription>
              </div>
              <Dialog open={createVersionOpen} onOpenChange={setCreateVersionOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Version
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Program Version</DialogTitle>
                    <DialogDescription>
                      Add a new version with updated rates and eligibility rules
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...versionForm}>
                    <form onSubmit={versionForm.handleSubmit(handleVersionSubmit)} className="space-y-4">
                      <FormField
                        control={versionForm.control}
                        name="versionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Version Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 2025 Q1 Rates" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={versionForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={versionForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave blank if this version is ongoing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setCreateVersionOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createVersionMutation.isPending}>
                          Create Version
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions.map((version: any) => (
                <Card 
                  key={version.id}
                  className={`cursor-pointer transition-colors ${selectedVersion?.id === version.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">{version.versionName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(version.startDate), 'MMM d, yyyy')}
                            {version.endDate && ` - ${format(new Date(version.endDate), 'MMM d, yyyy')}`}
                          </span>
                          {version.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version Documents */}
      {selectedVersion && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Program Documents</CardTitle>
                <CardDescription>
                  Rate schedules, copay charts, and eligibility documentation
                </CardDescription>
              </div>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload rate schedules, copay charts, or eligibility documentation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Document Type</label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rates">Provider Rates</SelectItem>
                          <SelectItem value="copays">Parent Copays</SelectItem>
                          <SelectItem value="eligibility">Eligibility Rules</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">File</label>
                      <Input
                        type="file"
                        accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: PDF, Excel, CSV, Word
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleFileUpload} 
                        disabled={!uploadFile || !documentType || uploadDocumentMutation.isPending}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.documentType)}
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDocumentLabel(doc.documentType)} • Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/api/subsidy-documents/${doc.id}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/api/subsidy-documents/${doc.id}/view`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents uploaded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Program Dialog */}
      <AlertDialog open={deleteProgramOpen} onOpenChange={setDeleteProgramOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subsidy Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProgram?.programName}"? This will permanently delete
              the program and all associated versions and documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProgram && deleteProgramMutation.mutate(selectedProgram.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}