import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AcceptInvitationPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL parameters
    const params = new URLSearchParams(window.location.search);
    const invitationToken = params.get('token');
    
    if (!invitationToken) {
      setStatus('error');
      setMessage('Invalid invitation link - no token provided.');
      return;
    }

    setToken(invitationToken);
    acceptInvitation(invitationToken);
  }, []);

  const acceptInvitation = async (token: string) => {
    try {
      const response = await apiRequest('POST', '/api/user-invitations/accept', {
        token
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome to Wildflower Schools Network! Your account has been activated.');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          setLocation('/');
        }, 3000);
      } else {
        const data = await response.json();
        if (data.message.includes('expired')) {
          setStatus('expired');
          setMessage('This invitation has expired. Please contact your administrator for a new invitation.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to accept invitation.');
        }
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again later.');
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getAlertVariant = () => {
    switch (status) {
      case 'success':
        return 'default'; // Success styling
      case 'error':
      case 'expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing Invitation...'}
            {status === 'success' && 'Welcome to Wildflower!'}
            {status === 'error' && 'Invitation Error'}
            {status === 'expired' && 'Invitation Expired'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we activate your account.'}
            {status === 'success' && 'Your account has been successfully activated.'}
            {status === 'error' && 'There was a problem with your invitation.'}
            {status === 'expired' && 'This invitation link is no longer valid.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={getAlertVariant()}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
          
          {status === 'success' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You'll be redirected to the dashboard in a few seconds...
              </p>
              <Button onClick={() => setLocation('/')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {(status === 'error' || status === 'expired') && (
            <div className="mt-6 text-center">
              <Button onClick={() => setLocation('/')} variant="outline" className="w-full">
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}