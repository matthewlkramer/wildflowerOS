import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import "./lib/i18n"; // Initialize i18n
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import FamiliesPage from "@/pages/families";
import FamilyDetailsPage from "@/pages/family-details";
import FamilyBillingPage from "@/pages/family-billing";
import ChildDetailsPage from "@/pages/child-details";
import SchoolSettingsPage from "@/pages/school-settings";
import StaffRolesPage from "@/pages/staff-roles";
import MessagesPage from "@/pages/messages";
import TasksPage from "@/pages/tasks";
import EnhancedMessagesPage from "@/pages/enhanced-messages";
import ChannelTestPage from "@/pages/channel-test";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/families" component={FamiliesPage} />
          <Route path="/families/:familyId" component={FamilyDetailsPage} />
          <Route path="/families/:familyId/billing" component={FamilyBillingPage} />
          <Route path="/children/:childId" component={ChildDetailsPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/enhanced-messages" component={EnhancedMessagesPage} />
          <Route path="/channel-test" component={ChannelTestPage} />
          <Route path="/tasks" component={TasksPage} />
          <Route path="/staff-roles" component={StaffRolesPage} />
          <Route path="/settings" component={SchoolSettingsPage} />
          {/* Add more authenticated routes here */}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Enable dark mode for mobile and tablet devices automatically
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (isMobileOrTablet) {
      document.documentElement.classList.add('dark');
    }
    
    // Listen for window resize to toggle dark mode based on screen size
    const handleResize = () => {
      const isMobileOrTablet = window.innerWidth <= 1024;
      if (isMobileOrTablet) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
