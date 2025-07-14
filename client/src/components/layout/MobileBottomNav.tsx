import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", icon: "fas fa-home", label: "Home" },
    { id: "families", icon: "fas fa-users", label: "Families" },
    { id: "messages", icon: "fas fa-comments", label: "Messages" },
    { id: "tasks", icon: "fas fa-tasks", label: "Tasks" },
    { id: "more", icon: "fas fa-ellipsis-h", label: "More" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center py-2 px-3",
              activeTab === item.id ? "text-primary" : "text-gray-400"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={`${item.icon} text-xl`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
