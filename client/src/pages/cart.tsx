import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SERVICE_FEE } from "@/lib/constants";
import CartItem from "@/components/cart-item";

export default function Cart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
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
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        {/* Header */}
        <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Your Cart</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-24 h-24 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-shopping-cart text-gray-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Looks like you haven't added any items to your cart yet
          </p>
          <Link href="/">
            <Button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = cartItems[0]?.restaurant;
  const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];

  const subtotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.menuItem.price) * item.quantity);
  }, 0);

  const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee) : 0;
  const serviceFee = SERVICE_FEE;
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Your Order</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearCartMutation.mutate()}
            disabled={clearCartMutation.isPending}
            className="text-red-500 hover:text-red-600"
          >
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Restaurant Info */}
        {restaurant && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-store text-primary"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{restaurant.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Estimated delivery: {restaurant.deliveryTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cart Items List */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item: any) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-800 dark:text-white">₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                <span className="text-gray-800 dark:text-white">
                  {deliveryFee === 0 ? "Free" : `₺${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="text-gray-800 dark:text-white">₺{serviceFee.toFixed(2)}</span>
              </div>
              <hr className="border-gray-200 dark:border-dark-100 my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-primary">₺{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">Delivery Address</h3>
              <Link href="/addresses">
                <Button variant="ghost" size="sm" className="text-primary hover:underline">
                  Change
                </Button>
              </Link>
            </div>
            {defaultAddress ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {defaultAddress.title} - {defaultAddress.addressLine1}
              </p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No delivery address set</p>
                <Link href="/addresses">
                  <Button variant="outline" size="sm">
                    Add Address
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>

      {/* Checkout Button */}
      {defaultAddress && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-dark-100 px-4 py-4">
          <Link href="/payment">
            <Button className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:bg-primary/90 transition-all">
              Proceed to Payment • ₺{total.toFixed(2)}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
