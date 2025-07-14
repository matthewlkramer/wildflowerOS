import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface ClassroomOverviewProps {
  schoolId: string;
}

export default function ClassroomOverview({ schoolId }: ClassroomOverviewProps) {
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ["/api/schools", schoolId, "classrooms"],
  });

  return (
    <Card className="shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          My Classrooms
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : classrooms?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-chalkboard-teacher text-4xl mb-4 text-gray-300"></i>
            <p>No classrooms assigned</p>
            <p className="text-sm">Contact your administrator to get access.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classrooms?.slice(0, 2).map((classroom: any) => (
              <div key={classroom.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {classroom.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {classroom.level.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {classroom.currentEnrollment}/{classroom.capacity || "∞"}
                    </div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={classroom.enrollmentPercentage} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-gray-500">
                      {classroom.enrollmentPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4">
          <a href="/classrooms" className="text-sm font-medium text-primary hover:text-blue-900">
            Manage classrooms →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
