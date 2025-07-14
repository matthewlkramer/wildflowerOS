import { useState } from "react";
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

interface TopNavigationProps {
  user: any;
  currentSchool?: any;
  currentRole?: any;
}

export default function TopNavigation({ user, currentSchool, currentRole }: TopNavigationProps) {
  const [notificationCount] = useState(3);
  const [messageCount] = useState(7);

  const getContextDisplayName = () => {
    if (currentRole && currentSchool) {
      const roleDisplay = currentRole.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      return `${roleDisplay} - ${currentSchool.name}`;
    }
    return "Select Context";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">Wildflower Schools</h1>
            </div>
            
            {/* Role/School Context Switcher */}
            <div className="hidden md:block">
              <Select value={getContextDisplayName()}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  {user.roles?.map((role: any) => {
                    const school = user.schools?.find((s: any) => s.id === role.schoolId);
                    if (school) {
                      const roleDisplay = role.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                      return (
                        <SelectItem key={role.id} value={`${roleDisplay} - ${school.name}`}>
                          {roleDisplay} - {school.name}
                        </SelectItem>
                      );
                    }
                    return null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <i className="fas fa-bell"></i>
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
              <i className="fas fa-comment"></i>
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
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">{user.firstName}</span>
                  <i className="fas fa-chevron-down text-gray-400"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                  <i className="fas fa-sign-out-alt mr-2"></i>
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
