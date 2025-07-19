import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Navigation, CheckCircle, Truck, Store } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/components/ui/logout-button";

type CourierStatus = 'available' | 'assigned' | 'picking_up' | 'delivering' | 'delivered';

interface CourierDelivery {
  id: number;
  orderId: number;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: CourierStatus;
  estimatedTime: string;
  distance: string;
  orderValue: number;
  restaurantName: string;
}

// Mock data for courier deliveries
const mockDeliveries: CourierDelivery[] = [
  {
    id: 1,
    orderId: 101,
    customerName: "Ahmet Yılmaz",
    customerPhone: "+90 555 123 4567",
    pickupAddress: "Pizza Palace, Campus Center",
    deliveryAddress: "Dormitory A, Room 205",
    status: 'assigned',
    estimatedTime: "15 mins",
    distance: "1.2 km",
    orderValue: 45.50,
    restaurantName: "Pizza Palace"
  },
  {
    id: 2,
    orderId: 102,
    customerName: "Elif Demir",
    customerPhone: "+90 555 987 6543",
    pickupAddress: "Burger House, Main Street",
    deliveryAddress: "Library Study Hall",
    status: 'picking_up',
    estimatedTime: "8 mins",
    distance: "0.8 km",
    orderValue: 32.75,
    restaurantName: "Burger House"
  }
];

export default function CourierTracking() {
  const [selectedDelivery, setSelectedDelivery] = useState<CourierDelivery | null>(null);

  // Mock current location
  const [currentLocation] = useState({
    lat: 41.015137,
    lng: 28.979530,
    address: "Campus Center, Near Pizza Palace"
  });

  const getStatusColor = (status: CourierStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-blue-500';
      case 'picking_up': return 'bg-yellow-500';
      case 'delivering': return 'bg-orange-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: CourierStatus) => {
    switch (status) {
      case 'available': return 'Available';
      case 'assigned': return 'Order Assigned';
      case 'picking_up': return 'Picking Up';
      case 'delivering': return 'Delivering';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const updateDeliveryStatus = (deliveryId: number, newStatus: CourierStatus) => {
    // In real app, this would call API to update status
    console.log(`Updating delivery ${deliveryId} to status: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">Courier Panel</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online & Available</span>
              </div>
            </div>
          </div>
          <LogoutButton variant="ghost" />
        </div>
      </div>

      {/* Current Location */}
      <Card className="m-4 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Current Location</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentLocation.address}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Navigation size={16} className="mr-2" />
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Deliveries */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Deliveries ({mockDeliveries.length})
        </h2>

        <div className="space-y-4">
          {mockDeliveries.map((delivery) => (
            <Card key={delivery.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{delivery.orderId}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{delivery.customerName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.restaurantName}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                    {getStatusText(delivery.status)}
                  </Badge>
                </div>

                {/* Pickup Location */}
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Store className="text-green-600" size={16} />
                    <span className="font-medium text-green-800 dark:text-green-400">Pickup</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">{delivery.pickupAddress}</p>
                </div>

                {/* Delivery Location */}
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="text-blue-600" size={16} />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Delivery</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{delivery.deliveryAddress}</p>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>💰 ₺{delivery.orderValue}</span>
                    <span>📍 {delivery.distance}</span>
                    <span>⏱️ {delivery.estimatedTime}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone size={14} className="mr-1" />
                    Call
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {delivery.status === 'assigned' && (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => updateDeliveryStatus(delivery.id, 'picking_up')}
                      >
                        <Truck size={16} className="mr-2" />
                        Start Pickup
                      </Button>
                      <Button variant="outline" size="sm">
                        <Navigation size={16} />
                      </Button>
                    </>
                  )}
                  
                  {delivery.status === 'picking_up' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => updateDeliveryStatus(delivery.id, 'delivering')}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Picked Up - Start Delivery
                    </Button>
                  )}
                  
                  {delivery.status === 'delivering' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delivery Summary */}
      <Card className="m-4 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">₺285</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Earnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">8.2km</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}