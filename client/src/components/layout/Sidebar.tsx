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

  // Show settings for all roles - no need to hide based on role type
  const showSchoolSettings = true;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 hidden lg:block">
      <nav className="mt-8">
        {menuItems.map((item, index) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                isActive && "text-gray-700 dark:text-white bg-blue-50 dark:bg-blue-900/30 border-r-2 border-primary"
              )}
            >
              <i className={`${item.icon} mr-3`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {showSchoolSettings && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Link
              href="/settings"
              className={cn(
                "flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                (location === "/settings" || location.startsWith("/settings")) && "text-gray-700 dark:text-white bg-blue-50 dark:bg-blue-900/30 border-r-2 border-primary"
              )}
            >
              <i className="fas fa-cog mr-3"></i>
              <span>Settings</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
