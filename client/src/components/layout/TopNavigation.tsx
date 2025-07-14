import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import { Users, GraduationCap, Heart, Building2, Shield, Star, Bell, MessageCircle, ChevronDown, Settings, LogOut, User } from "lucide-react";

interface TopNavigationProps {
  user: any;
  currentSchool?: any;
  currentRole?: any;
}

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
  teacher_leader: "TL",
  teacher: "Teacher",
  assistant: "Assistant",
  aide: "Aide",
  parent: "Parent",
  board_member: "Board",
  central_staff: "Partner",
  network_admin: "Admin",
};

export default function TopNavigation({ user, currentSchool, currentRole }: TopNavigationProps) {
  const [notificationCount] = useState(3);
  const [messageCount] = useState(7);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user roles
  const { data: userRoles = [] } = useQuery<UserRole[]>({
    queryKey: ['/api/user/roles'],
  });

  // Fetch current role
  const { data: currentUserRole } = useQuery<UserRole>({
    queryKey: ['/api/user/current-role'],
  });

  // Role switching mutation
  const switchRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return apiRequest(`/api/user/switch-role`, {
        method: 'POST',
        body: { roleId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/current-role'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/roles'] });
      toast({
        title: "Role switched",
        description: "Your active role has been updated successfully.",
      });
      // Reload the page to refresh the context
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Error switching role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getContextDisplayName = () => {
    if (currentUserRole) {
      const roleDisplay = roleLabels[currentUserRole.role as keyof typeof roleLabels] || currentUserRole.role;
      return roleDisplay;
    }
    return "Select Role";
  };



  const handleRoleSwitch = (roleId: string) => {
    switchRoleMutation.mutate(roleId);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">WildflowerOS</h1>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center">
              <Select value={currentUserRole?.id || ""} onValueChange={handleRoleSwitch}>
                <SelectTrigger className="w-20 border-gray-300">
                  <div className="flex items-center truncate">
                    {currentUserRole && (
                      <span className="truncate">{getContextDisplayName()}</span>
                    )}
                    {!currentUserRole && <SelectValue placeholder="Select role" />}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => {
                      const roleDisplay = roleLabels[role.role as keyof typeof roleLabels] || role.role;
                      return (
                        <SelectItem key={role.id} value={role.id}>
                          {roleDisplay}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      No roles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pr-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            
            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="h-4 w-4" />
              {messageCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0"
                >
                  {messageCount}
                </Badge>
              )}
            </Button>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  {user.profileImageUrl ? (
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={user.profileImageUrl} 
                      alt="User profile"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
