import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark').toString());
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${html.classList.contains('dark') ? 'dark' : 'light'} mode`,
    });
  };

  const toggleLanguage = () => {
    // TODO: Implement multi-language support
    toast({
      title: "Language",
      description: "Multi-language support coming soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <i className="fas fa-arrow-left text-xl"></i>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Profile</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Profile Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-white text-2xl"></i>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {user?.firstName || user?.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'Student User'
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email || 'student@emu.edu.tr'}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full font-medium"
              onClick={() => {
                toast({
                  title: "Edit Profile",
                  description: "Enhanced profile editing with Google security coming soon!",
                });
              }}
            >
              🔒 Edit Profile (Secure)
            </Button>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Link href="/addresses">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Delivery Addresses</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your addresses</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Button>
              </Link>
              
              <div className="border-t border-gray-100 dark:border-dark-100">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                  onClick={() => {
                    toast({
                      title: "Order History",
                      description: "Order history coming soon!",
                    });
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-receipt text-blue-600 dark:text-blue-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Order History</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">View past orders</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                onClick={() => {
                  toast({
                    title: "Notifications",
                    description: "Notification settings coming soon!",
                  });
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bell text-green-600 dark:text-green-400"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">Notifications</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage notifications</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </Button>
              
              <div className="border-t border-gray-100 dark:border-dark-100">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                  onClick={toggleDarkMode}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-dark-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-moon text-gray-600 dark:text-gray-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Toggle dark theme</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 duration-300 ease-in-out ${
                    document.documentElement.classList.contains('dark') ? 'bg-primary' : 'bg-gray-200'
                  }`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                      document.documentElement.classList.contains('dark') ? 'translate-x-6' : ''
                    }`}></div>
                  </div>
                </Button>
              </div>
              
              <div className="border-t border-gray-100 dark:border-dark-100">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                  onClick={toggleLanguage}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-globe text-purple-600 dark:text-purple-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Language</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">English / Türkçe</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Owner Section */}
          <Card>
            <CardContent className="p-0">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-50 dark:hover:bg-dark-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-store text-orange-600 dark:text-orange-400"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-white">Restaurant Dashboard</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your restaurant</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center p-4 h-auto hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                onClick={() => {
                  // Clear user type and redirect properly
                  localStorage.removeItem('userType');
                  fetch('/api/logout', { method: 'POST', credentials: 'include' })
                    .then(() => {
                      window.location.replace('/landing');
                    })
                    .catch(() => {
                      window.location.replace('/landing');
                    });
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-sign-out-alt text-red-600 dark:text-red-400"></i>
                  </div>
                  <p className="font-medium">Sign Out</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cozy Software Branding */}
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
          <p className="mb-2">🔒 Secured with Enterprise-grade Authentication</p>
          <p>Powered by Cozy Software</p>
        </div>
      </div>
    </div>
  );
}
