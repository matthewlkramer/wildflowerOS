import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function QuickActions() {
  const { t } = useTranslation();
  
  const actions = [
    {
      icon: "fas fa-user-plus",
      label: t("new_enrollment"),
      color: "text-primary",
      onClick: () => {
        // Navigate to enrollment form
        window.location.href = "/enrollment/new";
      },
    },
    {
      icon: "fas fa-comment",
      label: t("send_message"),
      color: "text-secondary",
      onClick: () => {
        // Open message composer
        window.location.href = "/messages/new";
      },
    },
    {
      icon: "fas fa-plus",
      label: t("create_task"),
      color: "text-warning",
      onClick: () => {
        // Open task creation dialog
        window.location.href = "/tasks/new";
      },
    },
    {
      icon: "fas fa-receipt",
      label: t("view_billing"),
      color: "text-success",
      onClick: () => {
        // Navigate to billing
        window.location.href = "/billing";
      },
    },
  ];

  return (
    <Card className="shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {t("quick_actions")}
        </h3>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start"
              onClick={action.onClick}
            >
              <i className={`${action.icon} mr-3 ${action.color}`}></i>
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
