import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import RestaurantCard from "@/components/restaurant-card";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { Link } from "wouter";
import { useState } from "react";
import { LogoutButton } from "@/components/ui/logout-button";
import { Logo } from "@/components/ui/logo";

const cuisineFilters = ["All", "Pizza", "Burger", "Turkish", "Dessert", "Coffee"];

export default function Home() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
  });

  const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];

  const filteredRestaurants = restaurants.filter((restaurant: any) => {
    const matchesFilter = selectedFilter === "All" || restaurant.cuisine.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Logo size="sm" />
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <i className="fas fa-user text-white"></i>
              )}
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Good day,</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {user?.firstName || 'Student'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('darkMode', document.documentElement.classList.contains('dark').toString());
              }}
            >
              <i className="fas fa-moon text-gray-600 dark:text-gray-400"></i>
            </Button>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <i className="fas fa-cog text-gray-600 dark:text-gray-400"></i>
              </Button>
            </Link>
            <LogoutButton variant="ghost" />
          </div>
        </div>
        
        {/* Delivery Address */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <i className="fas fa-map-marker-alt text-primary mr-2"></i>
          <span>Delivering to: </span>
          <span className="font-medium ml-1">
            {defaultAddress ? `${defaultAddress.title}` : 'Add an address'}
          </span>
          <Link href="/addresses">
            <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
              <i className="fas fa-chevron-down text-xs"></i>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white dark:bg-dark-200 border-b border-gray-100 dark:border-dark-100">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search restaurants or dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-300 border border-gray-200 dark:border-dark-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="px-4 py-4 bg-white dark:bg-dark-200 border-b border-gray-100 dark:border-dark-100">
        <div className="flex space-x-2 overflow-x-auto">
          {cuisineFilters.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
              className={`flex-shrink-0 rounded-full ${
                selectedFilter === filter
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-200"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Promotions Banner */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-accent to-primary rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Student Discount</h3>
              <p className="text-white/80 text-sm">20% off your first order</p>
              <p className="text-xs text-white/60 mt-1">Use code: STUDENT20</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-percentage text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Restaurants */}
      <div className="px-4 py-2 pb-24">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {selectedFilter === "All" ? "Popular Near You" : `${selectedFilter} Restaurants`}
        </h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-200 rounded-2xl p-4 shadow-sm animate-pulse">
                <div className="w-full h-48 bg-gray-200 dark:bg-dark-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-dark-100 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-dark-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No restaurants found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant: any) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation currentPage="home" />
    </div>
  );
}
