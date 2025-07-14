import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  currentRole?: any;
}

export default function Sidebar({ currentRole }: SidebarProps) {
  const [location] = useLocation();
  
  const menuItems = [
    { icon: "fas fa-home", label: "Dashboard", href: "/" },
    { icon: "fas fa-users", label: "Families & Children", href: "/families" },
    { icon: "fas fa-chalkboard-teacher", label: "Classrooms", href: "/classrooms" },
    { icon: "fas fa-user-plus", label: "Enrollment", href: "/enrollment" },
    { icon: "fas fa-comments", label: "Messages", href: "/messages" },
    { icon: "fas fa-credit-card", label: "Billing & Finance", href: "/billing" },
    { icon: "fas fa-tasks", label: "Tasks", href: "/tasks" },
    { icon: "fas fa-book", label: "Knowledge Base", href: "/knowledge" },
  ];

  const managementItems = [
    { icon: "fas fa-cog", label: "School Settings", href: "/settings" },
    { icon: "fas fa-users-cog", label: "Staff Management", href: "/settings" },
    { icon: "fas fa-chart-bar", label: "Analytics", href: "/analytics" },
  ];

  const showManagement = currentRole?.roleCategory === "educator" || currentRole?.roleCategory === "systems_administrator" || currentRole?.roleName === "school_admin";

  return (
    <aside className="w-64 bg-white shadow-sm h-screen fixed top-16 left-0 overflow-y-auto hidden lg:block">
      <nav className="mt-8">
        {menuItems.map((item, index) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                isActive && "text-gray-700 bg-blue-50 border-r-2 border-primary"
              )}
            >
              <i className={`${item.icon} mr-3`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {showManagement && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              School Management
            </h3>
            {managementItems.map((item, index) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-2",
                    isActive && "text-gray-700 bg-blue-50 border-r-2 border-primary"
                  )}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
