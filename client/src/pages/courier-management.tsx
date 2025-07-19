import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Navigation, Eye, Users, Truck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Live courier tracking component for restaurant owners
export default function CourierManagement() {
  const [selectedCourier, setSelectedCourier] = useState<number | null>(null);

  // Mock courier data with live locations
  const [couriers] = useState([
    {
      id: 1,
      name: "Mehmet Özkan",
      phone: "+90 555 111 2233",
      status: 'delivering',
      currentLocation: { lat: 41.015137, lng: 28.979530 },
      address: "Near Campus Library",
      orderId: 101,
      customerName: "Ahmet Yılmaz",
      estimatedArrival: "12 mins",
      distance: "1.8 km from destination",
      avatar: "👨‍🚴"
    },
    {
      id: 2,
      name: "Fatma Kaya",
      phone: "+90 555 444 5566",
      status: 'picking_up',
      currentLocation: { lat: 41.013137, lng: 28.977530 },
      address: "At Restaurant Kitchen",
      orderId: 102,
      customerName: "Elif Demir",
      estimatedArrival: "5 mins to pickup",
      distance: "0.2 km from restaurant",
      avatar: "👩‍🚴"
    },
    {
      id: 3,
      name: "Can Yılmaz",
      phone: "+90 555 777 8899",
      status: 'available',
      currentLocation: { lat: 41.016137, lng: 28.981530 },
      address: "Campus Center",
      orderId: null,
      customerName: null,
      estimatedArrival: "Available for pickup",
      distance: "Ready for orders",
      avatar: "👨‍🚴"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'picking_up': return 'bg-yellow-500';
      case 'delivering': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'picking_up': return 'Picking Up Order';
      case 'delivering': return 'Delivering';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">Courier Tracking</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Live courier locations and delivery status</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Deliveries</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">8.5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time (min)</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Courier List */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Live Courier Tracking ({couriers.length} active)
        </h2>

        <div className="space-y-4">
          {couriers.map((courier) => (
            <Card key={courier.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{courier.avatar}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">{courier.name}</p>
                        <Badge className={`${getStatusColor(courier.status)} text-white text-xs`}>
                          {getStatusText(courier.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{courier.phone}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone size={14} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye size={14} />
                    </Button>
                  </div>
                </div>

                {/* Current Location */}
                <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="text-primary" size={16} />
                    <span className="font-medium text-gray-800 dark:text-gray-300">Current Location</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{courier.address}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    📍 {courier.currentLocation.lat.toFixed(6)}, {courier.currentLocation.lng.toFixed(6)}
                  </p>
                </div>

                {/* Active Order Info */}
                {courier.orderId && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Truck className="text-blue-600" size={16} />
                          <span className="font-medium text-blue-800 dark:text-blue-400">
                            Order #{courier.orderId}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Customer: {courier.customerName}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery Status */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{courier.estimatedArrival}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Navigation size={14} />
                      <span>{courier.distance}</span>
                    </div>
                  </div>
                  
                  {courier.status === 'available' && (
                    <Button size="sm" variant="outline">
                      Assign Order
                    </Button>
                  )}
                </div>

                {/* Live GPS Tracking */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Live GPS tracking active</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View on Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Integration Placeholder */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-dark-100 h-64 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MapPin size={48} className="mx-auto mb-2" />
                <p>Interactive map showing all courier locations</p>
                <p className="text-sm">Real-time GPS tracking integration</p>
                <Button variant="outline" className="mt-3">
                  Open Full Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}