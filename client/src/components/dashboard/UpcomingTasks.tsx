import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingTasks() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks/my"],
  });

  const upcomingTasks = tasks?.filter((task: any) => 
    task.status === "open" || task.status === "in_progress"
  ).slice(0, 3) || [];

  const getPriorityColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 1) return "bg-red-500";
    if (diffDays <= 3) return "bg-warning";
    return "bg-secondary";
  };

  const formatDueDate = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 0) return "Overdue";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${due.toLocaleDateString()}`;
  };

  return (
    <Card className="shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Upcoming Tasks
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-check-circle text-4xl mb-4 text-gray-300"></i>
            <p>No pending tasks</p>
            <p className="text-sm">Great job staying on top of everything!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div 
                      className={`w-2 h-2 rounded-full ${getPriorityColor(task.dueDate)}`}
                    ></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <i className="fas fa-check"></i>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <a href="/tasks" className="text-sm font-medium text-primary hover:text-blue-900">
            View all tasks →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
