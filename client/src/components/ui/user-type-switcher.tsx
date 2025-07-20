import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Store, Truck, LogOut, Home } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export function UserTypeSwitcher() {
  const { logout } = useAuth();
  const currentUserType = localStorage.getItem('userType') || 'user';

  const switchUserType = (type: string) => {
    localStorage.setItem('userType', type);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userType');
    window.location.href = '/landing';
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-orange-900 dark:text-orange-200">
            Switch User Type
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Test different user roles
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            variant={currentUserType === 'user' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchUserType('user')}
            className="flex-col h-auto py-2"
          >
            <User className="w-4 h-4 mb-1" />
            <span className="text-xs">Student</span>
          </Button>
          
          <Button
            variant={currentUserType === 'restaurant' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchUserType('restaurant')}
            className="flex-col h-auto py-2"
          >
            <Store className="w-4 h-4 mb-1" />
            <span className="text-xs">Restaurant</span>
          </Button>
          
          <Button
            variant={currentUserType === 'courier' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchUserType('courier')}
            className="flex-col h-auto py-2"
          >
            <Truck className="w-4 h-4 mb-1" />
            <span className="text-xs">Courier</span>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Link href="/landing" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}