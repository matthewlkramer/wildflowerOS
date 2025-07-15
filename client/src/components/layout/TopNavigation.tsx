import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import { Users, GraduationCap, Heart, Building2, Shield, Star, Bell, MessageCircle, ChevronDown, Settings, LogOut, User } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
// Import will be handled by public folder

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

const getRoleLabels = (t: any) => ({
  parent: t("parent"),
  educator: t("educator"), 
  board: t("board_director"),
  sysadmin: t("systems_administrator"),
});

export default function TopNavigation({ user, currentSchool, currentRole }: TopNavigationProps) {
  const { t } = useTranslation();
  const [notificationCount] = useState(3);
  const [messageCount] = useState(7);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  const roleLabels = getRoleLabels(t);
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

  // Fetch available educators for emulation when needed
  const { data: availableEducators = [] } = useQuery<any[]>({
    queryKey: ['/api/educator-admins'],
    enabled: showSchoolSelector,
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

  // Check if we need to show school selector when switching to educator role
  useEffect(() => {
    console.log('TopNav school selector check:', { 
      currentUserRole: currentUserRole?.roleName, 
      schoolId: currentUserRole?.schoolId,
      selectedSchoolId,
      showSchoolSelector
    });
    
    // Only show popup if educator role, no school ID, no selected school ID, and popup not already showing
    if (currentUserRole && currentUserRole.roleName?.startsWith('educator') && !currentUserRole.schoolId && !selectedSchoolId && !showSchoolSelector) {
      console.log('Triggering school selector popup from TopNav');
      setShowSchoolSelector(true);
    }
  }, [currentUserRole?.roleName, currentUserRole?.schoolId, selectedSchoolId]);

  // Reset school selection when role changes away from educator
  useEffect(() => {
    if (currentUserRole && !currentUserRole.roleName?.startsWith('educator')) {
      setSelectedSchoolId(null);
      setShowSchoolSelector(false);
    }
  }, [currentUserRole?.roleName]);

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
    <>
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
                    onClick={async () => {
                      console.log('Selected educator:', educator);
                      try {
                        // Set school context in session
                        await apiRequest('POST', '/api/user/set-school-context', { schoolId: educator.schoolId });
                        setSelectedSchoolId(educator.schoolId);
                        setShowSchoolSelector(false);
                        toast({
                          title: "School context selected",
                          description: `Now working with ${educator.schoolName} as ${educator.firstName} ${educator.lastName}`,
                        });
                        // Reload to apply new context
                        window.location.reload();
                      } catch (error) {
                        console.error('Failed to set school context:', error);
                        toast({
                          title: "Error",
                          description: "Failed to set school context",
                          variant: "destructive",
                        });
                      }
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

      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {/* Mobile logo */}
              <div className="sm:hidden">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 32 32" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  {/* Flower petals */}
                  <circle cx="16" cy="8" r="4" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="24" cy="16" r="4" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="16" cy="24" r="4" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="8" cy="16" r="4" fill="#F59E0B" opacity="0.8"/>
                  <circle cx="22" cy="10" r="3" fill="#EAB308" opacity="0.7"/>
                  <circle cx="22" cy="22" r="3" fill="#EAB308" opacity="0.7"/>
                  <circle cx="10" cy="22" r="3" fill="#EAB308" opacity="0.7"/>
                  <circle cx="10" cy="10" r="3" fill="#EAB308" opacity="0.7"/>
                  {/* Flower center */}
                  <circle cx="16" cy="16" r="4" fill="#059669"/>
                  <circle cx="16" cy="16" r="2" fill="#10B981"/>
                </svg>
              </div>
              {/* Desktop text */}
              <h1 className="hidden sm:block text-xl lg:text-2xl font-bold text-primary dark:text-primary">WildflowerOS</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-4 lg:space-x-6">
            {/* Role Switcher */}
            <div className="flex items-center">
              <Select value={currentUserRole?.roleName?.split('_')[0] || ""} onValueChange={handleRoleSwitch}>
                <SelectTrigger className="w-28 sm:w-32 lg:w-36 border-gray-300 dark:border-gray-600 text-sm dark:text-gray-200 dark:bg-gray-800">
                  <div className="flex items-center truncate">
                    {currentUserRole && (
                      <span className="truncate text-xs sm:text-sm">{getContextDisplayName()}</span>
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

            <div className="flex items-center space-x-3 sm:space-x-3 lg:space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
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
              <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <MessageCircle className="h-5 w-5" />
                {messageCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center p-0"
                  >
                    {messageCount}
                  </Badge>
                )}
              </Button>
              
              {/* Language Switcher */}
              <LanguageSwitcher compact />
              
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
                    <div className="h-8 w-8 rounded-full bg-primary text-white dark:text-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
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
    </>
  );
}
