import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActivityFeed() {
  // This would normally come from an API
  const activities = [
    {
      id: 1,
      user: {
        name: "Emily Rodriguez",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&h=150",
      },
      description: "Added a new comment to the \"Fall Curriculum Planning\" discussion",
      timestamp: "2 hours ago",
      icon: "fas fa-comment",
      iconColor: "text-primary",
    },
    {
      id: 2,
      user: {
        name: "Michael Chen",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150",
      },
      description: "Completed enrollment for the Johnson family - 2 children enrolled in Primary classroom",
      timestamp: "4 hours ago",
      icon: "fas fa-user-plus",
      iconColor: "text-secondary",
    },
    {
      id: 3,
      user: {
        name: "Sarah Williams",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150",
      },
      description: "Created task: \"Prepare materials for next week's practical life lessons\"",
      timestamp: "6 hours ago",
      icon: "fas fa-tasks",
      iconColor: "text-warning",
    },
  ];

  return (
    <Card className="shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <img 
                        className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white object-cover" 
                        src={activity.user.profileImageUrl}
                        alt={activity.user.name}
                      />
                      <span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl px-0.5 py-px">
                        <i className={`${activity.icon} ${activity.iconColor} text-xs`}></i>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-gray-900">
                            {activity.user.name}
                          </a>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {activity.timestamp}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
