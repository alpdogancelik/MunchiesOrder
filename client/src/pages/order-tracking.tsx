import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import OrderStatus from "@/components/order-status";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OrderTracking() {
  const { id } = useParams();
  const orderId = parseInt(id!);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: order, isLoading: orderLoading, error } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && isAuthenticated,
  });

  const { data: userOrders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Find the order from user orders if direct fetch fails
  const orderData = order || userOrders.find((o: any) => o.id === orderId);

  if (!orderData) {
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
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Order Not Found</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-24 h-24 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-search text-gray-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            We couldn't find the order you're looking for
          </p>
          <Link href="/">
            <Button className="bg-primary text-white px-8 py-3 rounded-xl font-semibold">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getEstimatedDeliveryTime = () => {
    if (orderData.estimatedDeliveryTime) {
      return new Date(orderData.estimatedDeliveryTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Calculate estimated time based on order creation and restaurant delivery time
    const orderTime = new Date(orderData.createdAt);
    const deliveryTimeMatch = orderData.restaurant?.deliveryTime?.match(/(\d+)-(\d+)/);
    if (deliveryTimeMatch) {
      const avgTime = (parseInt(deliveryTimeMatch[1]) + parseInt(deliveryTimeMatch[2])) / 2;
      const estimatedTime = new Date(orderTime.getTime() + avgTime * 60000);
      return estimatedTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return "Soon";
  };

  const getRemainingTime = () => {
    if (orderData.status === ORDER_STATUS.DELIVERED) return "Delivered";
    
    const orderTime = new Date(orderData.createdAt);
    const now = new Date();
    const deliveryTimeMatch = orderData.restaurant?.deliveryTime?.match(/(\d+)-(\d+)/);
    
    if (deliveryTimeMatch) {
      const maxTime = parseInt(deliveryTimeMatch[2]);
      const estimatedTime = new Date(orderTime.getTime() + maxTime * 60000);
      const remaining = Math.max(0, Math.floor((estimatedTime.getTime() - now.getTime()) / 60000));
      
      if (remaining > 0) {
        return `${remaining} min remaining`;
      }
    }
    
    return "Arriving soon";
  };

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
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Track Order</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Order Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <OrderStatus status={orderData.status} />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 mt-4">
                {ORDER_STATUS_LABELS[orderData.status as keyof typeof ORDER_STATUS_LABELS]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {orderData.status === ORDER_STATUS.DELIVERED 
                  ? "Your order has been delivered successfully"
                  : orderData.status === ORDER_STATUS.CANCELLED
                  ? "This order has been cancelled"
                  : "Your order is being processed"
                }
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Estimated delivery:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {getEstimatedDeliveryTime()} ({getRemainingTime()})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Order Progress</h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  orderData.status !== ORDER_STATUS.PENDING ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-100'
                }`}>
                  <i className={`fas fa-check text-white text-sm ${
                    orderData.status === ORDER_STATUS.PENDING ? 'text-gray-600 dark:text-gray-400' : ''
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">Order Placed</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(orderData.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  orderData.paymentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-100'
                }`}>
                  <i className={`fas fa-check text-white text-sm ${
                    orderData.paymentStatus !== 'completed' ? 'text-gray-600 dark:text-gray-400' : ''
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">Payment Confirmed</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {orderData.paymentStatus === 'completed' ? 'Completed' : 'Processing'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(orderData.status)
                    ? orderData.status === ORDER_STATUS.PREPARING ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                    : 'bg-gray-300 dark:bg-dark-100'
                }`}>
                  <i className={`fas fa-utensils text-white text-sm ${
                    ![ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(orderData.status) 
                      ? 'text-gray-600 dark:text-gray-400' : ''
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">Being Prepared</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {orderData.status === ORDER_STATUS.PREPARING ? 'In progress...' 
                     : [ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(orderData.status)
                     ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(orderData.status)
                    ? orderData.status === ORDER_STATUS.OUT_FOR_DELIVERY ? 'bg-purple-500 animate-pulse' : 'bg-green-500'
                    : 'bg-gray-300 dark:bg-dark-100'
                }`}>
                  <i className={`fas fa-motorcycle text-white text-sm ${
                    ![ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(orderData.status) 
                      ? 'text-gray-600 dark:text-gray-400' : ''
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">Out for Delivery</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {orderData.status === ORDER_STATUS.OUT_FOR_DELIVERY ? 'On the way...' 
                     : orderData.status === ORDER_STATUS.DELIVERED ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  orderData.status === ORDER_STATUS.DELIVERED ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-100'
                }`}>
                  <i className={`fas fa-home text-white text-sm ${
                    orderData.status !== ORDER_STATUS.DELIVERED ? 'text-gray-600 dark:text-gray-400' : ''
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white">Delivered</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {orderData.status === ORDER_STATUS.DELIVERED ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-store text-primary"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {orderData.restaurant?.name || 'Restaurant'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Order #{orderData.id}</p>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full text-gray-800 dark:text-white font-medium"
              onClick={() => window.open(`tel:+905555555555`, '_self')}
            >
              <i className="fas fa-phone mr-2"></i>
              Contact Restaurant
            </Button>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Order Items</h3>
            
            <div className="space-y-3">
              {orderData.orderItems?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-800 dark:text-white">
                    {item.quantity}x {item.menuItem?.name || 'Menu Item'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ₺{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <hr className="border-gray-200 dark:border-dark-100" />
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-primary">₺{parseFloat(orderData.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
