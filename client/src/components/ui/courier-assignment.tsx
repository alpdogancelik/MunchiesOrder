import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Truck, MapPin, Star, Phone } from "lucide-react";

interface CourierAssignmentProps {
  restaurantId: number;
  onClose?: () => void;
}

export function CourierAssignment({ restaurantId, onClose }: CourierAssignmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourier, setSelectedCourier] = useState<string>("");

  // Fetch available couriers (mock data for now)
  const { data: availableCouriers = [] } = useQuery({
    queryKey: ["/api/couriers/available"],
    queryFn: async () => {
      // Mock available couriers data
      return [
        {
          id: "courier_001",
          name: "Mehmet Yılmaz",
          phone: "+90 555 123 4567",
          vehicleType: "motorcycle",
          rating: 4.8,
          completedDeliveries: 127,
          currentLocation: "Kalkanlı Campus",
          isOnline: true,
          isAvailable: true
        },
        {
          id: "courier_002", 
          name: "Ayşe Demir",
          phone: "+90 555 987 6543",
          vehicleType: "bicycle",
          rating: 4.9,
          completedDeliveries: 89,
          currentLocation: "Student Dormitory",
          isOnline: true,
          isAvailable: true
        },
        {
          id: "courier_003",
          name: "Ali Özkan",
          phone: "+90 555 456 7890", 
          vehicleType: "motorcycle",
          rating: 4.7,
          completedDeliveries: 203,
          currentLocation: "Campus Center",
          isOnline: true,
          isAvailable: false
        }
      ];
    },
  });

  // Fetch currently assigned couriers
  const { data: assignedCouriers = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "couriers"],
  });

  // Assign courier mutation
  const assignCourierMutation = useMutation({
    mutationFn: async (courierId: string) => {
      await apiRequest("POST", `/api/restaurants/${restaurantId}/couriers`, { courierId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId, "couriers"] });
      toast({
        title: "Courier Assigned",
        description: "Courier successfully assigned to restaurant",
      });
      setSelectedCourier("");
    },
    onError: () => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign courier to restaurant",
        variant: "destructive",
      });
    },
  });

  // Unassign courier mutation
  const unassignCourierMutation = useMutation({
    mutationFn: async (courierId: string) => {
      await apiRequest("DELETE", `/api/restaurants/${restaurantId}/couriers/${courierId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId, "couriers"] });
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

  const handleAssignCourier = () => {
    if (selectedCourier) {
      assignCourierMutation.mutate(selectedCourier);
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'motorcycle':
        return '🏍️';
      case 'bicycle':
        return '🚲';
      case 'car':
        return '🚗';
      default:
        return '🛵';
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign New Courier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Assign Courier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Select value={selectedCourier} onValueChange={setSelectedCourier}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available courier" />
              </SelectTrigger>
              <SelectContent>
                {availableCouriers
                  .filter((courier: any) => courier.isOnline && courier.isAvailable)
                  .map((courier: any) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      <div className="flex items-center gap-3">
                        <span>{getVehicleIcon(courier.vehicleType)}</span>
                        <div>
                          <span className="font-medium">{courier.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ⭐ {courier.rating} • {courier.completedDeliveries} deliveries
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAssignCourier}
              disabled={!selectedCourier || assignCourierMutation.isPending}
              className="w-full"
            >
              {assignCourierMutation.isPending ? "Assigning..." : "Assign Courier"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Couriers List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Couriers</CardTitle>
        </CardHeader>
        <CardContent>
          {availableCouriers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No couriers available at the moment</p>
          ) : (
            <div className="space-y-3">
              {availableCouriers.map((courier: any) => (
                <div
                  key={courier.id}
                  className={`p-3 border rounded-lg ${
                    courier.isAvailable 
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-200 bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getVehicleIcon(courier.vehicleType)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {courier.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {courier.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {courier.completedDeliveries} deliveries
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {courier.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          {courier.currentLocation}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge variant={courier.isOnline ? "default" : "secondary"}>
                          {courier.isOnline ? "Online" : "Offline"}
                        </Badge>
                        <Badge variant={courier.isAvailable ? "default" : "outline"}>
                          {courier.isAvailable ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently Assigned Couriers */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Couriers</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedCouriers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No couriers currently assigned</p>
          ) : (
            <div className="space-y-3">
              {assignedCouriers.map((assignment: any) => (
                <div key={assignment.id} className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🏍️</div>
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-200">
                          {assignment.courier?.name || "Assigned Courier"}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unassignCourierMutation.mutate(assignment.courierId)}
                      disabled={unassignCourierMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}