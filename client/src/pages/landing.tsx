import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-school text-2xl text-white"></i>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Wildflower Schools Network
            </CardTitle>
            <CardDescription className="text-gray-600">
              A unified platform for Montessori educators, families, and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <i className="fas fa-check text-primary"></i>
                <span>Manage families and enrollments</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-check text-primary"></i>
                <span>Track classroom activities</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-check text-primary"></i>
                <span>Communicate with community</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-check text-primary"></i>
                <span>Access knowledge base</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-blue-700"
              onClick={() => window.location.href = "/api/login"}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In to Continue
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Secure authentication powered by your educational account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
