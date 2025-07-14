import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface MobileBottomNavProps {
  currentRole?: any;
}

export default function MobileBottomNav({ currentRole }: MobileBottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: "fas fa-home", label: "Dashboard", href: "/" },
    { icon: "fas fa-users", label: "Families", href: "/families" },
    { icon: "fas fa-chalkboard-teacher", label: "Classrooms", href: "/classrooms" },
    { icon: "fas fa-comments", label: "Messages", href: "/messages" },
    { icon: "fas fa-tasks", label: "Tasks", href: "/tasks" },
  ];

  const showSchoolSettings = currentRole?.roleCategory === "educator" || 
                            currentRole?.roleCategory === "systems_administrator" || 
                            currentRole?.roleDefinition?.name === "school_admin";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
      <div className="flex justify-around">
        {navItems.map((item, index) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-2",
                isActive ? "text-primary" : "text-gray-400"
              )}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        {showSchoolSettings && (
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center py-2 px-2",
              (location === "/settings" || location.startsWith("/settings")) ? "text-primary" : "text-gray-400"
            )}
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        )}
      </div>
    </div>
  );
}
