import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Navigation, CheckCircle, Truck, UserPlus, UserMinus, Store } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/components/ui/logout-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CourierManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get restaurant owner's restaurants
  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants/owner/me"],
  });

  // Get couriers for selected restaurant
  const { data: assignedCouriers = [] } = useQuery({
    queryKey: ["/api/restaurants", selectedRestaurant, "couriers"],
    enabled: !!selectedRestaurant,
  });

  // Mock available couriers (in real app, this would be from API)
  const availableCouriers = [
    { id: "courier_1", username: "mehmet_courier", firstName: "Mehmet", lastName: "Yılmaz", phone: "+90 555 123 4567" },
    { id: "courier_2", username: "ayse_delivery", firstName: "Ayşe", lastName: "Kaya", phone: "+90 555 987 6543" },
    { id: "courier_3", username: "fatih_bike", firstName: "Fatih", lastName: "Özkan", phone: "+90 555 456 7890" },
  ];

  const assignCourierMutation = useMutation({
    mutationFn: async ({ restaurantId, courierId }: { restaurantId: number; courierId: string }) => {
      await apiRequest("POST", `/api/restaurants/${restaurantId}/couriers`, { courierId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant, "couriers"] });
      toast({
        title: "Courier Assigned",
        description: "Courier successfully assigned to restaurant",
      });
    },
    onError: () => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign courier to restaurant",
        variant: "destructive",
      });
    },
  });

  const unassignCourierMutation = useMutation({
    mutationFn: async ({ restaurantId, courierId }: { restaurantId: number; courierId: string }) => {
      await apiRequest("DELETE", `/api/restaurants/${restaurantId}/couriers/${courierId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant, "couriers"] });
      toast({
        title: "Courier Unassigned",
        description: "Courier successfully removed from restaurant",
      });
    },
    onError: () => {
      toast({
        title: "Unassignment Failed",
        description: "Failed to remove courier from restaurant",
        variant: "destructive",
      });
    },
  });

  const handleAssignCourier = (courierId: string) => {
    if (!selectedRestaurant) return;
    assignCourierMutation.mutate({ restaurantId: selectedRestaurant, courierId });
  };

  const handleUnassignCourier = (courierId: string) => {
    if (!selectedRestaurant) return;
    unassignCourierMutation.mutate({ restaurantId: selectedRestaurant, courierId });
  };

  const assignedCourierIds = assignedCouriers.map((ac: any) => ac.courierId);
  const unassignedCouriers = availableCouriers.filter(c => !assignedCourierIds.includes(c.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Courier Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage delivery team</p>
              </div>
            </div>
            <LogoutButton variant="ghost" size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Restaurant Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Select Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {restaurants.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No restaurants found. Create a restaurant first.
              </p>
            ) : (
              restaurants.map((restaurant: any) => (
                <Button
                  key={restaurant.id}
                  variant={selectedRestaurant === restaurant.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedRestaurant(restaurant.id)}
                >
                  <Store className="w-4 h-4 mr-2" />
                  {restaurant.name}
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        {selectedRestaurant && (
          <>
            {/* Assigned Couriers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Assigned Couriers ({assignedCouriers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedCouriers.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    No couriers assigned to this restaurant
                  </p>
                ) : (
                  assignedCouriers.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                          <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {assignment.courier.firstName} {assignment.courier.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{assignment.courier.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassignCourier(assignment.courierId)}
                        disabled={unassignCourierMutation.isPending}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Couriers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Available Couriers ({unassignedCouriers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unassignedCouriers.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    All available couriers are already assigned
                  </p>
                ) : (
                  unassignedCouriers.map((courier) => (
                    <div key={courier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <Truck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {courier.firstName} {courier.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">@{courier.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{courier.phone}</p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAssignCourier(courier.id)}
                        disabled={assignCourierMutation.isPending}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-2">📍 Assigned couriers will receive orders from this restaurant</p>
              <p>🚚 They can track deliveries and update order status in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}