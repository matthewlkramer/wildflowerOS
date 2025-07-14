import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { 
  DollarSign, 
  ArrowLeft, 
  CreditCard, 
  FileText, 
  Plus, 
  Edit, 
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function FamilyBillingPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/families/:familyId/billing");
  const familyId = params?.familyId;
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: !!user,
  });
  const [editingBilling, setEditingBilling] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [billingForm, setBillingForm] = useState({
    billingSchedule: "monthly",
    autopayEnabled: false,
    paymentMethod: "manual",
    billRecipientName: "",
    billRecipientEmail: ""
  });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: "",
    description: "",
    dueDate: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch family data
  const { data: family, isLoading: familyLoading } = useQuery({
    queryKey: ["/api/families", familyId],
    enabled: !!familyId,
  });

  // Fetch billing setup
  const { data: billingSetup, isLoading: billingLoading } = useQuery({
    queryKey: ["/api/families", familyId, "billing"],
    enabled: !!familyId,
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/families", familyId, "invoices"],
    enabled: !!familyId,
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ["/api/families", familyId, "payments"],
    enabled: !!familyId,
  });

  // Update billing setup mutation
  const updateBillingMutation = useMutation({
    mutationFn: async (billingData: any) => {
      return apiRequest(`/api/families/${familyId}/billing`, {
        method: billingSetup ? 'PATCH' : 'POST',
        body: { ...billingData, familyId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId, "billing"] });
      setEditingBilling(false);
      toast({
        title: "Billing setup updated",
        description: "Billing configuration has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating billing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      return apiRequest(`/api/families/${familyId}/invoices`, {
        method: 'POST',
        body: {
          ...invoiceData,
          familyId,
          issueDate: new Date().toISOString(),
          status: 'pending'
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families", familyId, "invoices"] });
      setCreatingInvoice(false);
      setInvoiceForm({ amount: "", description: "", dueDate: "" });
      toast({
        title: "Invoice created",
        description: "New invoice has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBillingEdit = () => {
    if (billingSetup) {
      setBillingForm({
        billingSchedule: billingSetup.billingSchedule || "monthly",
        autopayEnabled: billingSetup.autopayEnabled || false,
        paymentMethod: billingSetup.paymentMethod || "manual",
        billRecipientName: billingSetup.billRecipientName || "",
        billRecipientEmail: billingSetup.billRecipientEmail || ""
      });
    }
    setEditingBilling(true);
  };

  const handleBillingUpdate = () => {
    updateBillingMutation.mutate(billingForm);
  };

  const handleCreateInvoice = () => {
    createInvoiceMutation.mutate({
      totalAmount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      dueDate: invoiceForm.dueDate,
    });
  };

  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalBalance = () => {
    return invoices
      .filter((invoice: any) => invoice.status !== 'paid')
      .reduce((sum: number, invoice: any) => sum + invoice.totalAmount, 0);
  };

  const getTotalPaid = () => {
    return payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
  };

  if (familyLoading || billingLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation user={user} currentSchool={null} currentRole={currentRole} />
      
      <div className="flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden lg:ml-64">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/families/${familyId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Family
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="mr-3 h-8 w-8 text-primary" />
                  Billing - {family?.name || "Family"}
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage billing setup, invoices, and payments
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={creatingInvoice} onOpenChange={setCreatingInvoice}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={invoiceForm.description}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tuition, fees, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setCreatingInvoice(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateInvoice}
                        disabled={!invoiceForm.amount || !invoiceForm.description}
                      >
                        Create Invoice
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Financial Summary Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-gray-900">${getTotalBalance().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">${getTotalPaid().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Billing Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Billing Setup
                </div>
                <Button variant="ghost" size="sm" onClick={handleBillingEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingSetup ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Billing Schedule</Label>
                      <p className="mt-1 capitalize">{billingSetup.billingSchedule}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                      <p className="mt-1 capitalize">{billingSetup.paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Autopay</Label>
                    <div className="mt-1">
                      <Badge className={billingSetup.autopayEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {billingSetup.autopayEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  
                  {billingSetup.billRecipientName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bill Recipient</Label>
                      <p className="mt-1">{billingSetup.billRecipientName}</p>
                      {billingSetup.billRecipientEmail && (
                        <p className="text-sm text-gray-600">{billingSetup.billRecipientEmail}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No billing setup configured</p>
                  <Button onClick={handleBillingEdit}>
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Recent Invoices
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {getInvoiceStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium">#{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}</p>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.totalAmount.toFixed(2)}</p>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No invoices created yet</p>
                  <Button onClick={() => setCreatingInvoice(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Invoices Table */}
        {invoices.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Invoice #</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Issue Date</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          #{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
                        </td>
                        <td className="py-3 px-4">{invoice.description}</td>
                        <td className="py-3 px-4">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          ${invoice.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Billing Setup Dialog */}
        <Dialog open={editingBilling} onOpenChange={setEditingBilling}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {billingSetup ? "Edit Billing Setup" : "Setup Billing"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Billing Schedule</Label>
                <Select 
                  value={billingForm.billingSchedule} 
                  onValueChange={(value) => setBillingForm(prev => ({ ...prev, billingSchedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={billingForm.paymentMethod} 
                  onValueChange={(value) => setBillingForm(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={billingForm.autopayEnabled}
                  onCheckedChange={(checked) => setBillingForm(prev => ({ ...prev, autopayEnabled: checked }))}
                />
                <Label>Enable Autopay</Label>
              </div>
              
              <div>
                <Label>Bill Recipient Name</Label>
                <Input
                  value={billingForm.billRecipientName}
                  onChange={(e) => setBillingForm(prev => ({ ...prev, billRecipientName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Bill Recipient Email</Label>
                <Input
                  type="email"
                  value={billingForm.billRecipientEmail}
                  onChange={(e) => setBillingForm(prev => ({ ...prev, billRecipientEmail: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingBilling(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBillingUpdate} disabled={updateBillingMutation.isPending}>
                  {updateBillingMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </main>
      </div>
      
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}