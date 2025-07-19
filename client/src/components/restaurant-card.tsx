import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface RestaurantCardProps {
  restaurant: {
    id: number;
    name: string;
    cuisine: string;
    description?: string;
    imageUrl?: string;
    rating: string;
    reviewCount: number;
    deliveryTime: string;
    deliveryFee: string;
    isActive: boolean;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const deliveryFeeText = parseFloat(restaurant.deliveryFee) === 0 ? "Free delivery" : `₺${restaurant.deliveryFee} delivery`;

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="bg-white dark:bg-dark-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-full h-48 bg-gray-200 dark:bg-dark-100 rounded-t-2xl overflow-hidden">
          {restaurant.imageUrl ? (
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="fas fa-store text-gray-400 text-4xl"></i>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
              {restaurant.name}
            </h3>
            {restaurant.rating && parseFloat(restaurant.rating) > 0 && (
              <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <i className="fas fa-star text-yellow-400 text-xs mr-1"></i>
                {parseFloat(restaurant.rating).toFixed(1)}
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {restaurant.cuisine} • {restaurant.description || 'Delicious food'}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <i className="fas fa-clock mr-1"></i>
                <span>{restaurant.deliveryTime}</span>
              </span>
              <span className="flex items-center text-gray-500 dark:text-gray-400">
                <i className="fas fa-motorcycle mr-1"></i>
                <span>{deliveryFeeText}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
