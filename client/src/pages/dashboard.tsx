import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import StatsCards from "@/components/dashboard/StatsCards";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import QuickActions from "@/components/dashboard/QuickActions";
import ClassroomOverview from "@/components/dashboard/ClassroomOverview";
import FamilyManagement from "@/components/families/FamilyManagement";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Get current role from API
  const { data: currentRole } = useQuery({
    queryKey: ["/api/user/current-role"],
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get current school context (first school for now)
  const currentSchool = user.schools?.[0];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation user={user} currentSchool={currentSchool} currentRole={currentRole} />
      
      <div className="flex-1 flex">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 lg:p-6 pb-20">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user.firstName}! Here's what's happening at {currentSchool?.name || "your school"}.
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Report
                </button>
              </div>
            </div>


          </div>

          {/* Stats Cards */}
          {currentSchool && <StatsCards schoolId={currentSchool.id} />}

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Recent Activity & Messages */}
            <div className="lg:col-span-2">
              <ActivityFeed />
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              <UpcomingTasks />
              <QuickActions />
              {currentSchool && <ClassroomOverview schoolId={currentSchool.id} />}
            </div>
          </div>

          {/* Family Management Section */}
          {currentSchool && <FamilyManagement schoolId={currentSchool.id} />}
          </div>
        </main>
      </div>

      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}
