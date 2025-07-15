import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Plus, Clock, User, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import type { Task } from "@shared/schema";

interface TasksPageProps {}

export default function TasksPage({}: TasksPageProps) {
  const { user, currentRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    enabled: !!user,
  });

  const formatDate = (date: string | null) => {
    if (!date) return "No due date";
    const formatted = new Date(date).toLocaleDateString();
    const isOverdue = new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
    return { formatted, isOverdue };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'blue';
      case 'overdue':
        return 'destructive';
      case 'canceled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getOwnerName = (assignedToId: string | null) => {
    if (!assignedToId) return "Unassigned";
    return `User ${assignedToId.substring(0, 8)}`;
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout user={user} currentRole={currentRole}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-3 lg:p-6">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and track all tasks across your school operations
            </p>
          </div>

          {/* Mobile-first Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-4 lg:w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 lg:h-10 text-base lg:text-sm"
                />
              </div>
              <Button className="h-12 lg:h-10">
                <Plus className="h-5 w-5 lg:h-4 lg:w-4 mr-2" />
                New Task
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 h-12 lg:h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1 h-12 lg:h-10">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Count Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
            </div>
          </div>

          {/* Tasks Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const dueDateInfo = formatDate(task.dueDate);
                const isCompleted = task.status === 'completed';
                const isOverdue = typeof dueDateInfo === 'object' && dueDateInfo.isOverdue;
                
                return (
                  <Card key={task.id} className={`transition-all ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className="mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${isCompleted ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant={getPriorityColor(task.priority || 'medium') as any}
                                className="text-xs"
                              >
                                {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              {/* Due Date */}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className={`${
                                  dueDateInfo === 'No due date' 
                                    ? 'text-gray-400' 
                                    : isOverdue
                                      ? 'text-red-600 font-medium'
                                      : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {typeof dueDateInfo === 'object' ? dueDateInfo.formatted : dueDateInfo}
                                </span>
                              </div>
                              
                              {/* Owner */}
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {getOwnerName(task.assignedToId)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status */}
                            <Badge 
                              variant={getStatusColor(task.status || 'open') as any}
                              className="text-xs"
                            >
                              {(task.status || 'open').replace('_', ' ').charAt(0).toUpperCase() + (task.status || 'open').replace('_', ' ').slice(1)}
                            </Badge>
                          </div>
                          
                          {isOverdue && !isCompleted && (
                            <div className="flex items-center gap-1 mt-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Overdue</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}