import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Banknote, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Email receipt function
const sendReceipt = async (order: any) => {
  try {
    await apiRequest("POST", "/api/send-receipt", {
      email: "alpdogan.celik1@gmail.com",
      orderId: order.id,
      orderData: order
    });
  } catch (error) {
    console.error("Failed to send receipt:", error);
  }
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Get user addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  // Select first address by default
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: async (order) => {
      // Clear cart
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      if (paymentMethod === "cash" || paymentMethod === "card_at_door") {
        toast({
          title: "Order Placed Successfully",
          description: paymentMethod === "cash" 
            ? "You've chosen to pay cash on delivery"
            : "You've chosen to pay with card at door",
        });
        
        // Send receipt email
        await sendReceipt(order);
        setLocation("/");
      } else {
        // Handle online card payment
        handleCardPayment(order);
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Failed to place order",
      });
    },
  });

  const handleCardPayment = async (order: any) => {
    try {
      setIsProcessing(true);
      
      // Initialize iyzico payment
      const response = await apiRequest("POST", "/api/payment/iyzico/initiate", {
        orderId: order.id,
        items: cartItems.map((item: any) => ({
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity
        })),
        amount: cartItems.reduce((sum: number, item: any) => 
          sum + (item.menuItem.price * item.quantity), 0
        ) + 5 + 2 // delivery + service fee
      });

      if (response.ok) {
        const { paymentPageUrl } = await response.json();
        // Redirect to payment page
        window.open(paymentPageUrl, '_blank');
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Unable to process card payment. Try cash on delivery.",
      });
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please select a delivery address",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Add items to your cart before checkout",
      });
      return;
    }

    const orderData = {
      addressId: selectedAddress,
      paymentMethod: paymentMethod === "online" ? "iyzico" : paymentMethod,
      paymentStatus: paymentMethod === "online" ? "pending" : 
        paymentMethod === "cash" ? "cash_on_delivery" : "card_at_door",
      specialInstructions,
      items: cartItems.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.menuItem.price,
        notes: item.notes || ""
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (item.menuItem.price * item.quantity), 0
  );
  const deliveryFee = 5;
  const serviceFee = 2;
  const total = subtotal + deliveryFee + serviceFee;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-4">Add some delicious items to get started!</p>
            <Button onClick={() => setLocation("/restaurants")} className="w-full">
              Browse Restaurants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/cart")}
              className="mr-3"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddress === address.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedAddress(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{address.title}</p>
                    <p className="text-sm text-gray-600">{address.address}</p>
                    {address.isDefault && (
                      <Badge variant="outline" className="mt-1">Default</Badge>
                    )}
                  </div>
                  {selectedAddress === address.id && (
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {/* Card Payment */}
              <div className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">iyzico Secure Payment</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Bank-grade security • SSL encrypted • PCI compliant
                      </p>
                    </div>
                  </div>
                </Label>
                {paymentMethod === "card" && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Cash Payment */}
              <div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg bg-green-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Banknote className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-800">Cash on Delivery</span>
                        <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">Available</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Pay cash when your order arrives at your door
                      </p>
                    </div>
                  </div>
                </Label>
                {paymentMethod === "cash" && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Credit Card at Door */}
              <div className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <RadioGroupItem value="card_at_door" id="card_at_door" />
                <Label htmlFor="card_at_door" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-800">Credit Card at Door</span>
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">Available</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Pay with credit card when courier arrives
                      </p>
                    </div>
                  </div>
                </Label>
                {paymentMethod === "card_at_door" && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add any special instructions for the restaurant..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="font-medium">
                  {(item.menuItem.price * item.quantity).toFixed(2)} ₺
                </span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{subtotal.toFixed(2)} ₺</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{deliveryFee.toFixed(2)} ₺</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span>{serviceFee.toFixed(2)} ₺</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{total.toFixed(2)} ₺</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Confirmation */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-blue-100 rounded-full">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900">Order Confirmation</p>
                <p className="text-blue-700">
                  Secured by Cozy Software authentication system. By placing this order, 
                  you agree to our terms and conditions.
                </p>
                <div className="flex items-center mt-2 text-blue-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Estimated delivery time: 30-45 mins.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={createOrderMutation.isPending || isProcessing}
          className="w-full h-12 text-base font-medium"
        >
          {createOrderMutation.isPending || isProcessing
            ? "Processing..."
            : `Place Order • ${total.toFixed(2)} ₺`
          }
        </Button>
      </div>
    </div>
  );
}