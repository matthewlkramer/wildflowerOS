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
  parent: Heart,
  educator: GraduationCap,
  board: Building2,
  sysadmin: Shield,
};

const roleLabels = {
  parent: "Parent",
  educator: "Educator", 
  board: "Board",
  sysadmin: "Systems Admin",
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
      const response = await apiRequest('POST', `/api/user/switch-role`, { roleId });
      return response;
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
      // Extract the Level 1 category from the hierarchical role name
      const level1Category = currentUserRole.roleName?.split('_')[0] || currentUserRole.roleName;
      const roleDisplay = roleLabels[level1Category as keyof typeof roleLabels] || level1Category;
      return roleDisplay;
    }
    return "Select Role";
  };



  const handleRoleSwitch = (category: string) => {
    // Find the first role in the selected Level 1 category
    const rolesInCategory = userRoles.filter(role => {
      const level1Category = role.roleName?.split('_')[0];
      return level1Category === category && role.active;
    });
    
    if (rolesInCategory.length > 0) {
      switchRoleMutation.mutate(rolesInCategory[0].id);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">WildflowerOS</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Role Switcher */}
            <div className="flex items-center">
              <Select value={currentUserRole?.roleName?.split('_')[0] || ""} onValueChange={handleRoleSwitch}>
                <SelectTrigger className="w-32 border-gray-300 text-sm">
                  <div className="flex items-center truncate">
                    {currentUserRole && (
                      <span className="truncate text-sm">{getContextDisplayName()}</span>
                    )}
                    {!currentUserRole && <SelectValue placeholder="Role" />}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {userRoles.length > 0 ? (
                    Array.from(new Set(userRoles.filter(role => role.active).map(role => role.roleName?.split('_')[0]))).map((category) => {
                      if (!category) return null;
                      const Icon = roleIcons[category as keyof typeof roleIcons];
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{roleLabels[category as keyof typeof roleLabels] || category}</span>
                          </div>
                        </SelectItem>
                      );
                    }).filter(Boolean)
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      No roles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center p-0"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              
              {/* Messages */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <MessageCircle className="h-5 w-5" />
                {messageCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center p-0"
                  >
                    {messageCount}
                  </Badge>
                )}
              </Button>
              
              {/* User Profile */}
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 flex items-center space-x-1">
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
                  <ChevronDown className="h-3 w-3 text-gray-500" />
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
      </div>
    </nav>
  );
}
