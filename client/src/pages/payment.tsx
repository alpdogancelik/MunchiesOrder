import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SERVICE_FEE, PAYMENT_METHODS } from "@/lib/constants";
import { initiateIyzicoPayment } from "@/lib/iyzico";
import PaymentWebView from "@/components/payment-webview";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
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
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    setLocation("/");
    return null;
  }

  const restaurant = cartItems[0]?.restaurant;
  const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];

  if (!defaultAddress) {
    toast({
      title: "No address",
      description: "Please add a delivery address",
      variant: "destructive",
    });
    setLocation("/addresses");
    return null;
  }

  const subtotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.menuItem.price) * item.quantity);
  }, 0);

  const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee) : 0;
  const serviceFee = SERVICE_FEE;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Create order first
      const orderData = {
        restaurantId: restaurant.id,
        addressId: defaultAddress.id,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: PAYMENT_METHODS.IYZICO,
        specialInstructions,
      };

      const orderItems = cartItems.map((item: any) => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price,
      }));

      const order = await createOrderMutation.mutateAsync({
        orderData,
        orderItems,
      });

      // Initiate iyzico payment
      const paymentRequest = {
        orderId: order.id,
        orderData: {
          total: total.toFixed(2),
          address: `${defaultAddress.title}, ${defaultAddress.addressLine1}`,
          items: cartItems.map((item: any) => ({
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
          })),
        },
      };

      const paymentResponse = await initiateIyzicoPayment(paymentRequest);

      if (paymentResponse.success && paymentResponse.paymentPageUrl) {
        setPaymentUrl(paymentResponse.paymentPageUrl);
        setShowPaymentWebView(true);
      } else {
        throw new Error(paymentResponse.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (orderId: number) => {
    setShowPaymentWebView(false);
    toast({
      title: "Payment Successful",
      description: "Your order has been placed successfully!",
    });
    setLocation(`/order/${orderId}`);
  };

  const handlePaymentError = () => {
    setShowPaymentWebView(false);
    toast({
      title: "Payment Failed",
      description: "Payment was not successful. Please try again.",
      variant: "destructive",
    });
  };

  if (showPaymentWebView) {
    return (
      <PaymentWebView
        url={paymentUrl}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onClose={() => setShowPaymentWebView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="mr-4">
              <i className="fas fa-arrow-left text-xl"></i>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Payment</h1>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Order Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Order Details</h3>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{restaurant.name}</span>
                <span className="text-gray-800 dark:text-white">{cartItems.length} items</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-primary">₺{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-3">
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <i className="fas fa-map-marker-alt mr-1"></i>
                Delivering to: {defaultAddress.title}, {defaultAddress.addressLine1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              <div className="border border-primary bg-primary/5 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-credit-card text-primary text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">🔒 iyzico Secure Payment</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Bank-grade security • SSL encrypted • PCI compliant</p>
                  </div>
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-dark-100 rounded-xl p-4 opacity-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-dark-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-money-bill-wave text-gray-400 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">Cash on Delivery</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Pay when your order arrives</p>
                    <p className="text-red-500 text-xs mt-1">Currently unavailable</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Special Instructions</h3>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full resize-none"
              rows={3}
              placeholder="Add any special instructions for the restaurant..."
            />
          </CardContent>
        </Card>

        {/* Order Confirmation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 text-sm"></i>
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">Order Confirmation</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  🔒 Secured by Cozy Software authentication system. By placing this order, you agree to our terms and conditions. 
                  Estimated delivery time: {restaurant.deliveryTime}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-dark-100 px-4 py-4">
        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing || createOrderMutation.isPending}
          className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:bg-primary/90 transition-all"
        >
          {isProcessing || createOrderMutation.isPending ? (
            <div className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Processing...
            </div>
          ) : (
            `Place Order • ₺${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
