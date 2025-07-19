import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    menuItem: {
      id: number;
      name: string;
      description?: string;
      price: string;
      imageUrl?: string;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation({
    mutationFn: async (quantity: number) => {
      await apiRequest("PUT", `/api/cart/${item.id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
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
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeItemMutation.mutate();
    } else {
      updateQuantityMutation.mutate(newQuantity);
    }
  };

  const itemTotal = parseFloat(item.menuItem.price) * item.quantity;

  return (
    <Card className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-white">{item.menuItem.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItemMutation.mutate()}
            disabled={removeItemMutation.isPending}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="fas fa-trash text-sm"></i>
          </Button>
        </div>
        
        {item.menuItem.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {item.menuItem.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(-1)}
              disabled={updateQuantityMutation.isPending}
              className="w-8 h-8 rounded-full p-0"
            >
              <i className="fas fa-minus text-xs"></i>
            </Button>
            <span className="font-medium text-gray-800 dark:text-white min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(1)}
              disabled={updateQuantityMutation.isPending}
              className="w-8 h-8 rounded-full p-0"
            >
              <i className="fas fa-plus text-xs"></i>
            </Button>
          </div>
          <span className="font-bold text-primary text-lg">
            ₺{itemTotal.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
