import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ORDER_STATUS, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
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

  const { data: restaurants = [], isLoading: restaurantsLoading, error } = useQuery({
    queryKey: ["/api/restaurants/owner/me"],
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  // Get orders for the first restaurant (simplified for now)
  const restaurantId = restaurants[0]?.id;
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "orders"],
    enabled: !!restaurantId,
  });

  if (isLoading || restaurantsLoading) {
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

  // Calculate stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter((order: any) => 
    new Date(order.createdAt).toDateString() === today
  );

  const todayRevenue = todayOrders.reduce((total: number, order: any) => 
    total + parseFloat(order.total), 0
  );

  const pendingOrders = orders.filter((order: any) => 
    [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="mr-4">
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">🍳 Restaurant Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-24 h-24 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-store text-gray-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Restaurant Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You don't have any restaurants registered yet. Create your first restaurant to start managing orders with our secure platform.
          </p>
          <Link href="/admin/create-restaurant">
            <Button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold">
              Create Restaurant
            </Button>
          </Link>
        </div>
      ) : (
        <div className="px-4 py-6">
          {/* Restaurant Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <i className="fas fa-store text-primary text-xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {restaurants[0].name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {restaurants[0].cuisine} • {restaurants[0].isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <i className="fas fa-receipt text-primary"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {todayOrders.length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-lira-sign text-green-600 dark:text-green-400"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      ₺{todayRevenue.toFixed(0)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href={`/admin/menu/${restaurantId}`}>
                  <Button
                    variant="outline"
                    className="w-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-medium"
                  >
                    <i className="fas fa-utensils mr-2"></i>Manage Menu
                  </Button>
                </Link>
                <Link href="/admin/couriers">
                  <Button
                    variant="outline"
                    className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 font-medium"
                  >
                    <Truck size={16} className="mr-2" />Track Couriers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
                {pendingOrders.length > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    {pendingOrders.length} pending
                  </Badge>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-receipt text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Orders will appear here when customers place them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => {
                    const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS];
                    return (
                      <div
                        key={order.id}
                        className={`border-l-4 pl-4 pr-3 py-3 rounded-r-xl ${
                          statusColor === 'yellow' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
                          statusColor === 'blue' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' :
                          statusColor === 'green' ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
                          statusColor === 'purple' ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' :
                          'border-gray-400 bg-gray-50 dark:bg-gray-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 dark:text-white">
                            Order #{order.id}
                          </span>
                          <Badge className={`${
                            statusColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400' :
                            statusColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400' :
                            statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' :
                            statusColor === 'purple' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400' :
                            'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-400'
                          } text-xs`}>
                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                          {order.orderItems?.length || 0} items • {order.user?.firstName || 'Customer'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {order.address?.addressLine1 || 'Address not available'}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white">
                            ₺{parseFloat(order.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cozy Software Branding */}
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
            <p className="mb-2">🔒 Enterprise Restaurant Management System</p>
            <p>Powered by Cozy Software</p>
          </div>
        </div>
      )}
    </div>
  );
}
