import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/language-selector";
import { NotificationManager } from "@/components/ui/notifications";
import { User, MapPin, Bell, Moon, Sun, FileText, LogOut, Edit, Camera, Upload, Globe } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const fileInputRef = useRef(null);

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

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
        toast({
          title: t('profilePictureUpdated') || 'Profile Picture Updated',
          description: t('profilePictureUpdatedDescription') || 'Your profile picture has been updated successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfileSave = async () => {
    try {
      // Mock profile update - would connect to API
      toast({
        title: t('profileUpdated') || 'Profile Updated',
        description: t('profileUpdatedDescription') || 'Your profile has been updated successfully.',
      });
      setShowEditProfile(false);
    } catch (error) {
      toast({
        title: t('updateFailed') || 'Update Failed',
        description: t('updateFailedDescription') || 'Failed to update profile. Please try again.',
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Profile Header */}
      <div className="bg-white dark:bg-dark-100 px-6 py-8 text-center">
        <div className="relative mx-auto mb-4">
          <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto flex items-center justify-center overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureUpload}
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogTrigger asChild>
            <Button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white">
              <Edit className="w-4 h-4 mr-2" />
              {t('editProfile') || 'Edit Profile'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editProfile') || 'Edit Profile'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t('firstName') || 'First Name'}</label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('lastName') || 'Last Name'}</label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('email') || 'Email'}</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditProfileSave} className="flex-1">
                  {t('save') || 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setShowEditProfile(false)} className="flex-1">
                  {t('cancel') || 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Language Selector */}
      <div className="bg-white dark:bg-dark-100 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {t('language') || 'Language'}
            </span>
          </div>
          <LanguageSelector 
            currentLanguage={currentLanguage}
            onLanguageChange={changeLanguage}
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* Profile Options */}
      <div className="px-6 py-6 space-y-4">
        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/order-history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('orderHistory') || 'Order History'}
                  </span>
                </div>
                <div className="text-gray-400">›</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/addresses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('manageAddresses') || 'Manage Addresses'}
                  </span>
                </div>
                <div className="text-gray-400">›</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                {t('settings') || 'Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('darkMode') || 'Dark Mode'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                  {document.documentElement.classList.contains('dark') ? 
                    <Sun className="w-4 h-4" /> : 
                    <Moon className="w-4 h-4" />
                  }
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('notifications') || 'Notifications'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-500">
                    {t('logout') || 'Logout'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notifications */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white dark:bg-dark-100 w-full rounded-t-lg max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('notifications') || 'Notifications'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4">
              <NotificationManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}