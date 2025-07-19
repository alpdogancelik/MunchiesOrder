import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItemProps {
  item: {
    id: number;
    name: string;
    description?: string;
    price: string;
    imageUrl?: string;
    isAvailable: boolean;
    isPopular: boolean;
  };
  onAddToCart: () => void;
  isLoading?: boolean;
}

export default function MenuItem({ item, onAddToCart, isLoading }: MenuItemProps) {
  return (
    <Card className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-dark-100 rounded-xl flex-shrink-0 overflow-hidden">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="fas fa-utensils text-gray-400"></i>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {item.name}
                {item.isPopular && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                    Popular
                  </Badge>
                )}
              </h3>
            </div>
            
            {item.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-lg">
                ₺{parseFloat(item.price).toFixed(2)}
              </span>
              <Button
                onClick={onAddToCart}
                disabled={!item.isAvailable || isLoading}
                size="sm"
                className={`${
                  !item.isAvailable 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-primary text-white hover:bg-primary/90"
                } font-medium transition-colors`}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : !item.isAvailable ? (
                  "Unavailable"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
