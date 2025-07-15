import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MobileBottomNavProps {
  currentRole?: any;
}

export default function MobileBottomNav({ currentRole }: MobileBottomNavProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  // Main navigation items - always visible with labels
  const mainNavItems = [
    { icon: "fas fa-home", label: t("dashboard"), href: "/" },
    { icon: "fas fa-users", label: t("families"), href: "/families" },
    { icon: "fas fa-chalkboard-teacher", label: t("classrooms"), href: "/classrooms" },
    { icon: "fas fa-comments", label: t("messages"), href: "/messages" },
    { icon: "fas fa-cog", label: t("settings"), href: "/settings" },
  ];

  // Secondary items - only these go in "More" menu
  const secondaryNavItems = [
    { icon: "fas fa-user-tie", label: "Staff and Roles", href: "/staff-roles" },
    { icon: "fas fa-tasks", label: t("tasks"), href: "/tasks" },
    { icon: "fas fa-user-plus", label: t("enrollment"), href: "/enrollment" },
    { icon: "fas fa-credit-card", label: t("billing"), href: "/billing" },
    { icon: "fas fa-book", label: t("knowledge"), href: "/knowledge" },
  ];

  // Show settings for all roles - no need to hide based on role type
  const showSchoolSettings = true;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-40">
      <div className="flex justify-around">
        {/* Main navigation items - always visible with labels */}
        {mainNavItems.map((item, index) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-1",
                isActive ? "text-primary" : "text-gray-400 dark:text-gray-400"
              )}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More menu for additional items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex flex-col items-center py-2 px-1 h-auto",
                secondaryNavItems.some(item => 
                  location === item.href || (location.startsWith(item.href) && item.href !== '/')
                ) ? "text-primary" : "text-gray-400 dark:text-gray-300"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs mt-1">{t("more")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mb-2">

            
            {/* All secondary navigation items */}
            {secondaryNavItems.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link href={item.href} className="flex items-center w-full">
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
