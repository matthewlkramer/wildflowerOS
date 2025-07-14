import { useAuth } from "@/hooks/useAuth";
import RoleSelector from "./role-selector";
import { Bell, Settings, LogOut } from "lucide-react";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Logo and app name */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">
              Wildflower Network
            </span>
          </div>
        </div>

        {/* Center - Role Selector */}
        <div className="flex-1 max-w-md mx-4">
          <RoleSelector />
        </div>

        {/* Right side - User menu and actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings className="w-5 h-5" />
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </div>
            </div>
            
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}

            {/* Logout */}
            <a
              href="/api/logout"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}