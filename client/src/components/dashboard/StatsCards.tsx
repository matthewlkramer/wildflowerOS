import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, AlertTriangle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  schoolId: string;
}

export default function StatsCards({ schoolId }: StatsCardsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", schoolId],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-8 w-8 rounded mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      icon: Users,
      label: "Total Students",
      value: stats?.totalStudents || 0,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      link: "/families",
      linkText: "View details",
      trend: "+12% this month",
      trendUp: true,
    },
    {
      icon: GraduationCap,
      label: "Active Classrooms",
      value: stats?.activeClassrooms || 0,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      link: "/settings",
      linkText: "Manage classrooms",
      trend: "2 new this year",
      trendUp: true,
    },
    {
      icon: AlertTriangle,
      label: "Pending Tasks",
      value: stats?.pendingTasks || 0,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      link: "/tasks",
      linkText: "View tasks",
      trend: "-8% this week",
      trendUp: false,
    },
    {
      icon: DollarSign,
      label: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      link: "/billing",
      linkText: "View billing",
      trend: "+$2.4k this month",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <TrendIcon className={`h-3 w-3 mr-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-xs ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <a 
                  href={stat.link} 
                  className={`text-sm font-medium ${stat.color} hover:opacity-80 transition-opacity`}
                >
                  {stat.linkText} →
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
