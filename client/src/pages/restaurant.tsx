import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MenuItem from "@/components/menu-item";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Restaurant() {
  const { id } = useParams();
  const restaurantId = parseInt(id!);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ["/api/restaurants", restaurantId],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "categories"],
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "menu"],
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { restaurantId: number; menuItemId: number; quantity: number }) => {
      await apiRequest("POST", "/api/cart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item: any) => item.categoryId === selectedCategory)
    : menuItems;

  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.menuItem.price) * item.quantity);
  }, 0);

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  const handleAddToCart = (menuItem: any) => {
    // Check if cart has items from different restaurant
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurantId) {
      toast({
        title: "Different restaurant",
        description: "Clear your cart to add items from this restaurant",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate({
      restaurantId,
      menuItemId: menuItem.id,
      quantity: 1,
    });
  };

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200 dark:bg-dark-100"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-store text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 dark:bg-dark-100 overflow-hidden">
          {restaurant.imageUrl ? (
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-store text-gray-400 text-6xl"></i>
            </div>
          )}
        </div>
        
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full">
              <i className="fas fa-arrow-left text-gray-700"></i>
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full">
              <i className="fas fa-heart text-gray-700"></i>
            </Button>
            <Button variant="outline" size="sm" className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full">
              <i className="fas fa-share text-gray-700"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {restaurant.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {restaurant.description || `Delicious ${restaurant.cuisine} cuisine`}
        </p>
        
        <div className="flex items-center space-x-6 text-sm">
          {restaurant.rating && parseFloat(restaurant.rating) > 0 && (
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 mr-1"></i>
              <span className="font-medium text-gray-800 dark:text-white">
                {parseFloat(restaurant.rating).toFixed(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({restaurant.reviewCount})
              </span>
            </div>
          )}
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <i className="fas fa-clock mr-1"></i>
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <i className="fas fa-motorcycle mr-1"></i>
            <span>
              {parseFloat(restaurant.deliveryFee) === 0 ? "Free delivery" : `₺${restaurant.deliveryFee} delivery`}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-dark-200 px-4 py-3 border-b border-gray-100 dark:border-dark-100 sticky top-0 z-10">
          <div className="flex space-x-2 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="flex-shrink-0 rounded-full"
            >
              All
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0 rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-4 pb-24">
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-utensils text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No menu items available</p>
          </div>
        ) : (
          filteredMenuItems.map((item: any) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              onAddToCart={() => handleAddToCart(item)}
              isLoading={addToCartMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
          <Link href="/cart">
            <Button className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-between hover:bg-primary/90 transition-all">
              <span className="flex items-center">
                <i className="fas fa-shopping-cart mr-2"></i>
                View Cart
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {cartItemCount} items • ₺{cartTotal.toFixed(2)}
              </span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
