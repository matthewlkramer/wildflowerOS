import TopNavigation from "@/components/layout/TopNavigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
  user: any;
  currentSchool?: any;
  currentRole?: any;
}

export default function AppLayout({ children, user, currentSchool, currentRole }: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <TopNavigation user={user} currentSchool={currentSchool} currentRole={currentRole} />
      
      <div className="flex-1 flex pt-16">
        <Sidebar currentRole={currentRole} />
        
        <main className="flex-1 lg:ml-64 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 lg:p-6 pb-20">
            {children}
          </div>
        </main>
      </div>
      
      <MobileBottomNav currentRole={currentRole} />
    </div>
  );
}