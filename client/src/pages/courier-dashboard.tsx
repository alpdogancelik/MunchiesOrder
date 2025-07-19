import React, { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPrompt } from "@/components/ui/notification-prompt";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Package, CheckCircle, Truck, Navigation, Phone, Star } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/components/ui/logout-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Courier Profile Setup Component
function CourierProfileSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('/api/courier/profile', {
        method: 'POST',
        body: JSON.stringify(profileData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courier/profile'] });
      toast({
        title: "Profile created successfully",
        description: "You can now start receiving delivery orders",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating profile",
        description: error.message || "Failed to create courier profile",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const profileData = {
      vehicleType: formData.get('vehicleType') as string,
      licensePlate: formData.get('licensePlate') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      deliveryRadius: parseInt(formData.get('deliveryRadius') as string) || 5,
      isAvailable: true,
      isOnline: false,
    };

    try {
      await createProfileMutation.mutateAsync(profileData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Courier Profile</h1>
          <p className="text-gray-600 mt-2">Fill in your details to start delivering orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type *
            </label>
            <select name="vehicleType" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Select vehicle type</option>
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="scooter">Scooter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate
            </label>
            <input
              type="text"
              name="licensePlate"
              placeholder="e.g., KB 123 AB"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              placeholder="+90 555 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Radius (km) *
            </label>
            <input
              type="number"
              name="deliveryRadius"
              required
              min="1"
              max="20"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating Profile..." : "Create Courier Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CourierDashboard() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get courier profile
  const { data: courierProfile, error: profileError } = useQuery({
    queryKey: ["/api/courier/profile"],
  });

  // Get courier assignments - only if profile exists
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/courier/assignments"],
    enabled: !!courierProfile,
  });

  // Get courier orders - only if profile exists
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/courier/orders"],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!courierProfile,
  });

  // Show profile creation if no courier profile exists
  if (profileError && String(profileError).includes('not found')) {
    return <CourierProfileSetup />;
  }

  // Update courier location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      await apiRequest("POST", "/api/courier/location", { latitude, longitude });
    },
    onSuccess: () => {
      console.log("Location updated successfully");
    },
  });

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          
          // Update location on server every minute
          updateLocationMutation.mutate({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'ready': return 'out_for_delivery';
      case 'out_for_delivery': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'ready': return 'Pick Up Order';
      case 'out_for_delivery': return 'Mark Delivered';
      default: return null;
    }
  };

  const activeOrders = orders.filter((order: any) => 
    ['ready', 'out_for_delivery'].includes(order.status)
  );

  const completedToday = orders.filter((order: any) => 
    order.status === 'delivered' && 
    new Date(order.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalEarnings = orders
    .filter((order: any) => 
      order.status === 'delivered' && 
      new Date(order.updatedAt).toDateString() === new Date().toDateString()
    )
    .reduce((sum: number, order: any) => sum + 5, 0); // 5 TL per delivery

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Courier Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLocation ? '📍 Location tracked' : '📍 Getting location...'}
                </p>
              </div>
            </div>
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Daily Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Deliveries Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalEarnings} ₺</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Assigned Restaurants ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No restaurant assignments yet. Contact your manager.
              </p>
            ) : (
              assignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{assignment.restaurant.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.restaurant.cuisine}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Active Deliveries ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No active deliveries</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">New orders will appear here</p>
              </div>
            ) : (
              activeOrders.map((order: any) => (
                <div key={order.id} className="border border-gray-200 dark:border-dark-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4 mr-2" />
                      {order.restaurant.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      Campus Delivery
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(order.createdAt).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.total} ₺
                    </div>
                    {getNextStatus(order.status) && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                        disabled={updateOrderStatusMutation.isPending}
                        className="text-xs"
                      >
                        {getNextStatusLabel(order.status)}
                      </Button>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="pt-2 border-t border-gray-100 dark:border-dark-100">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.orderItems.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {item.price} ₺
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">📱 Your location is being tracked for delivery updates</p>
              <p className="mb-2">🏍️ Pick up orders when ready and mark as delivered</p>
              <p>💰 You earn 5 ₺ per completed delivery</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}