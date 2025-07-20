import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Package, CheckCircle, Truck, Navigation, Phone, Star, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserTypeSwitcher } from "@/components/ui/user-type-switcher";
import { Chatbot } from "@/components/ui/chatbot";
import { BackButton } from "@/components/ui/back-button";

export default function CourierDashboard() {
  const { toast } = useToast();
  const [courierProfile, setCourierProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    // Initialize courier data
    const initializeCourier = async () => {
      try {
        // Get basic courier info
        const profile = {
          id: 'courier_001',
          name: 'Courier User',
          vehicleType: 'motorcycle',
          rating: 4.8,
          completedDeliveries: 127,
          phone: '+90 555 123 4567'
        };
        
        setCourierProfile(profile);
        setCompletedToday(5);
        setEarnings(145.50);
        
        // Get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.log('Location access denied');
            }
          );
        }
        
        // Mock active orders
        setActiveOrders([
          {
            id: 1,
            restaurant: 'Campus Burger',
            customerName: 'Ahmet Yılmaz',
            customerPhone: '+90 555 987 6543',
            address: 'Kalkanlı Campus, Building A, Room 205',
            status: 'ready_for_pickup',
            distance: '0.8 km',
            estimatedTime: '15 min'
          },
          {
            id: 2,
            restaurant: 'Pizza Corner',
            customerName: 'Elif Demir',
            customerPhone: '+90 555 456 7890',
            address: 'Student Dormitory, Block C, Room 312',
            status: 'out_for_delivery',
            distance: '1.2 km',
            estimatedTime: '8 min'
          }
        ]);
        
      } catch (error) {
        console.error('Error initializing courier dashboard:', error);
      }
    };

    initializeCourier();
  }, []);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "You're now offline" : "You're now online",
      description: isOnline ? "You won't receive new orders" : "You can now receive delivery orders",
    });
  };

  const handleOrderUpdate = (orderId, newStatus) => {
    setActiveOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    if (newStatus === 'delivered') {
      setCompletedToday(prev => prev + 1);
      setEarnings(prev => prev + 25.00);
      setActiveOrders(orders => orders.filter(order => order.id !== orderId));
      
      toast({
        title: "Order Delivered!",
        description: "Great job! Order has been marked as delivered.",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_pickup': return 'bg-yellow-500';
      case 'out_for_delivery': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/landing" className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Truck className="w-6 h-6 text-white" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">🍽️ Munchies Courier</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {courierProfile?.name || 'Courier Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleOnlineStatus}
                className={`${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Button>
              
              <div className="flex gap-2">
                <Link href="/landing">
                  <Button variant="outline" size="sm">
                    🏠 Home
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{earnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{courierProfile?.rating || '4.8'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Orders ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isOnline ? 'No active orders. New orders will appear here.' : 'Go online to receive orders.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{order.restaurant}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order #{order.id}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{order.customerName}</span>
                        <Phone className="w-4 h-4 text-gray-500 ml-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{order.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📍 {order.distance}</span>
                        <span>⏱️ {order.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === 'ready_for_pickup' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOrderUpdate(order.id, 'out_for_delivery')}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Start Delivery
                        </Button>
                      )}
                      
                      {order.status === 'out_for_delivery' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOrderUpdate(order.id, 'delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://maps.google.com/?daddr=${encodeURIComponent(order.address)}`, '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${order.customerPhone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Customer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <Link href="/order-history">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  View Order History
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({ title: "Earnings Report", description: "Feature coming soon!" })}
              >
                <Star className="w-4 h-4 mr-2" />
                View Earnings Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot userType="courier" />
    </div>
  );
}