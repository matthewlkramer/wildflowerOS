import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      icon: "fas fa-users",
      label: "Total Students",
      value: stats?.totalStudents || 0,
      color: "text-primary",
      bgColor: "bg-blue-50",
      link: "/families",
      linkText: "View details",
    },
    {
      icon: "fas fa-chalkboard-teacher",
      label: "Active Classrooms",
      value: stats?.activeClassrooms || 0,
      color: "text-secondary",
      bgColor: "bg-green-50",
      link: "/classrooms",
      linkText: "Manage classrooms",
    },
    {
      icon: "fas fa-exclamation-triangle",
      label: "Pending Tasks",
      value: stats?.pendingTasks || 0,
      color: "text-warning",
      bgColor: "bg-yellow-50",
      link: "/tasks",
      linkText: "View tasks",
    },
    {
      icon: "fas fa-dollar-sign",
      label: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`,
      color: "text-success",
      bgColor: "bg-green-50",
      link: "/billing",
      linkText: "View billing",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="overflow-hidden shadow rounded-lg">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className={`${stat.icon} text-2xl ${stat.color}`}></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className={`${stat.bgColor} px-5 py-3`}>
            <div className="text-sm">
              <a 
                href={stat.link} 
                className={`font-medium ${stat.color} hover:opacity-80`}
              >
                {stat.linkText}
              </a>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
