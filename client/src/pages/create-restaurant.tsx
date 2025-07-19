import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Store, Clock, MapPin } from "lucide-react";

export default function CreateRestaurant() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    address: "",
    phone: "",
    openingHours: "9:00-22:00",
    deliveryRadius: 5
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/restaurants", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant Created!",
        description: "Your restaurant has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/owner/me"] });
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cuisine || !formData.address) {
      toast({
        title: "Please fill required fields",
        description: "Name, cuisine, and address are required",
        variant: "destructive",
      });
      return;
    }
    createRestaurantMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center">
            <Store className="text-primary mr-3" size={24} />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Create Restaurant</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">Restaurant Information</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Fill in the details to create your restaurant profile
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Restaurant Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Delicious Burgers"
                  className="mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of your restaurant..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <Label htmlFor="cuisine" className="text-gray-700 dark:text-gray-300">
                  Cuisine Type *
                </Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => handleChange("cuisine", e.target.value)}
                  placeholder="e.g., Turkish, Fast Food, Pizza"
                  className="mt-2"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
                  <MapPin size={16} className="inline mr-1" />
                  Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Restaurant address"
                  className="mt-2"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+90 555 123 4567"
                  className="mt-2"
                />
              </div>

              {/* Opening Hours */}
              <div>
                <Label htmlFor="openingHours" className="text-gray-700 dark:text-gray-300">
                  <Clock size={16} className="inline mr-1" />
                  Opening Hours
                </Label>
                <Input
                  id="openingHours"
                  value={formData.openingHours}
                  onChange={(e) => handleChange("openingHours", e.target.value)}
                  placeholder="9:00-22:00"
                  className="mt-2"
                />
              </div>

              {/* Delivery Radius */}
              <div>
                <Label htmlFor="deliveryRadius" className="text-gray-700 dark:text-gray-300">
                  Delivery Radius (km)
                </Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  value={formData.deliveryRadius}
                  onChange={(e) => handleChange("deliveryRadius", parseInt(e.target.value) || 5)}
                  placeholder="5"
                  className="mt-2"
                  min="1"
                  max="50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={createRestaurantMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-semibold"
                >
                  {createRestaurantMutation.isPending ? "Creating Restaurant..." : "Create Restaurant"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}