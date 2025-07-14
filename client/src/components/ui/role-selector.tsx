import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@shared/schema";
import { Users, GraduationCap, Heart, Building2, Shield, Star } from "lucide-react";

const roleIcons = {
  teacher_leader: GraduationCap,
  teacher: GraduationCap,
  assistant: Users,
  aide: Users,
  parent: Heart,
  board_member: Building2,
  central_staff: Shield,
  network_admin: Star,
};

const roleLabels = {
  teacher_leader: "Teacher Leader",
  teacher: "Teacher",
  assistant: "Assistant",
  aide: "Aide",
  parent: "Parent",
  board_member: "Board Member",
  central_staff: "Central Staff",
  network_admin: "Network Admin",
};

export default function RoleSelector() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Get user's current active role
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
  });

  // Get all user roles
  const { data: userRoles = [], isLoading } = useQuery<UserRole[]>({
    queryKey: ["/api/user/roles"],
  });

  // Mutation to switch role
  const switchRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await fetch("/api/user/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });
      if (!response.ok) throw new Error("Failed to switch role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/current-role"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Role switched",
        description: "Your active role has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to switch role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSwitch = () => {
    if (selectedRole) {
      switchRoleMutation.mutate(selectedRole);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Selector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userRoles.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Selector
          </CardTitle>
          <CardDescription>
            No roles assigned to your account.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userRoles.length === 1) {
    const role = userRoles[0];
    const Icon = roleIcons[role.role];
    
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium">{roleLabels[role.role]}</div>
              {role.schoolId && (
                <div className="text-sm text-gray-500">School Context</div>
              )}
            </div>
            <Badge variant="default" className="ml-auto">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Your Role
        </CardTitle>
        <CardDescription>
          Choose which role you're operating as today.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Active Role */}
        {currentRole && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Current Role
            </div>
            <div className="flex items-center gap-2 mt-1">
              {(() => {
                const Icon = roleIcons[currentRole.role];
                return <Icon className="h-4 w-4 text-blue-600" />;
              })()}
              <span className="text-blue-900 dark:text-blue-100">
                {roleLabels[currentRole.role]}
              </span>
              <Badge variant="secondary" size="sm">
                Active
              </Badge>
            </div>
          </div>
        )}

        {/* Role Selector */}
        <div className="space-y-3">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Switch to a different role..." />
            </SelectTrigger>
            <SelectContent>
              {userRoles
                .filter(role => role.active)
                .map((role) => {
                  const Icon = roleIcons[role.role];
                  return (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{roleLabels[role.role]}</span>
                        {role.schoolId && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            School
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleRoleSwitch} 
            disabled={!selectedRole || switchRoleMutation.isPending}
            className="w-full"
          >
            {switchRoleMutation.isPending ? "Switching..." : "Switch Role"}
          </Button>
        </div>

        {/* Available Roles List */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Available Roles
          </div>
          <div className="space-y-2">
            {userRoles.map((role) => {
              const Icon = roleIcons[role.role];
              const isActive = currentRole?.id === role.id;
              
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                  <div className="flex-1">
                    <div className={`text-sm ${isActive ? "font-medium text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"}`}>
                      {roleLabels[role.role]}
                    </div>
                    {role.schoolId && (
                      <div className="text-xs text-gray-500">
                        School-specific role
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <Badge variant="default" size="sm">
                      Current
                    </Badge>
                  )}
                  {!role.active && (
                    <Badge variant="secondary" size="sm">
                      Inactive
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}