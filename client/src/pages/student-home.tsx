import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Clock, Star, ShoppingCart, User, Package, Filter, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LogoutButton } from "@/components/ui/logout-button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPrompt } from "@/components/ui/notification-prompt";

const cuisineFilters = ["All", "Pizza", "Burger", "Turkish", "Italian", "Asian", "Dessert", "Coffee"];

export default function StudentHome() {
  const { user } = useAuth();
  const { isEnabled: notificationsEnabled } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);

  // Fetch restaurants with search
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCuisine !== "All") params.append('category', selectedCuisine);
      const response = await fetch(`/api/restaurants?${params}`);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return response.json();
    },
    enabled: true,
  });

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/user/me"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  // Fetch cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'out_for_delivery': return 'bg-purple-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user?.firstName || 'Student'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <LogoutButton variant="ghost" size="sm" />
            </div>
          </div>

          {/* Address */}
          {defaultAddress && (
            <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate">{defaultAddress.fullAddress}</span>
              <Link href="/addresses">
                <Button variant="ghost" size="sm" className="ml-1 h-auto p-1 text-xs">
                  Change
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="browse" className="flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="px-4 space-y-4">
            {/* Notification Prompt */}
            {showNotificationPrompt && (
              <NotificationPrompt 
                onDismiss={() => setShowNotificationPrompt(false)}
                className="mb-4"
              />
            )}
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search restaurants, meals, cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cuisine Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cuisineFilters.map((cuisine) => (
                <Button
                  key={cuisine}
                  variant={selectedCuisine === cuisine ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className="whitespace-nowrap"
                >
                  {cuisine}
                </Button>
              ))}
            </div>

            {/* Search Results Count */}
            {(searchQuery || selectedCuisine !== "All") && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCuisine !== "All" && ` in ${selectedCuisine}`}
              </div>
            )}

            {/* Restaurants List */}
            <div className="space-y-4 pb-6">
              {restaurantsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : restaurants.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {searchQuery || selectedCuisine !== "All" 
                      ? "No restaurants match your search" 
                      : "No restaurants available"}
                  </p>
                  {(searchQuery || selectedCuisine !== "All") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCuisine("All");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                restaurants.map((restaurant: any) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {restaurant.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <Badge variant="secondary" className="text-xs">
                                {restaurant.cuisine}
                              </Badge>
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span>{restaurant.rating || '4.5'}</span>
                                <span className="ml-1">({restaurant.reviewCount || '10+'})</span>
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>15-30 min</span>
                              </div>
                            </div>
                          </div>
                          {restaurant.imageUrl && (
                            <img
                              src={restaurant.imageUrl}
                              alt={restaurant.name}
                              className="w-16 h-16 rounded-lg object-cover ml-4"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="px-4 space-y-4">
            <div className="space-y-4 pb-6">
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No orders yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Start browsing restaurants to place your first order
                  </p>
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse Restaurants
                  </Button>
                </div>
              ) : (
                orders.map((order: any) => (
                  <Link key={order.id} href={`/order/${order.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Order #{order.id}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(order.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {order.restaurant.name}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {order.total} ₺
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {order.estimatedDeliveryTime && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Est. delivery: {order.estimatedDeliveryTime}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}