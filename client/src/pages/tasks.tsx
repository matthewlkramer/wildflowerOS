import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Search, Filter, Plus } from "lucide-react";
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

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getOwnerName = (assignedToId: string | null) => {
    if (!assignedToId) return "Unassigned";
    // This would ideally fetch user data - for now using user ID prefix
    return `User ${assignedToId.substring(0, 8)}`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout user={user} currentRole={currentRole}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and track all tasks across your school operations
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All Tasks ({filteredTasks.length})
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
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
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by priority" />
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
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first task to get started"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Complete/Incomplete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => {
                        const dueDateInfo = formatDate(task.dueDate);
                        const isCompleted = task.status === 'completed';
                        
                        return (
                          <TableRow key={task.id} className={isCompleted ? 'opacity-60' : ''}>
                            <TableCell>
                              <Checkbox checked={isCompleted} />
                            </TableCell>
                            <TableCell>
                              {typeof dueDateInfo === 'object' ? (
                                <span className={dueDateInfo.isOverdue ? 'text-red-600 font-medium' : ''}>
                                  {dueDateInfo.formatted}
                                </span>
                              ) : (
                                <span className="text-gray-500">{dueDateInfo}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-xs">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityColor(task.priority || 'medium')}>
                                {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {getOwnerName(task.assignedToId)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(task.status || 'open')}>
                                {(task.status || 'open').replace('_', ' ').charAt(0).toUpperCase() + (task.status || 'open').replace('_', ' ').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={isCompleted ? 'default' : 'outline'}>
                                {isCompleted ? 'Complete' : 'Incomplete'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}