import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { BackButton } from '@/components/ui/back-button';
import { ArrowLeft, Store, Clock, MapPin, Phone, Save } from 'lucide-react';
import { Link } from 'wouter';

const restaurantSchema = z.object({
  name: z.string().min(3, "Restaurant name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Phone number is required"),
  cuisineType: z.string().min(1, "Cuisine type is required"),
  openingTime: z.string(),
  closingTime: z.string(),
  minimumOrder: z.number().min(0, "Minimum order must be positive"),
  deliveryFee: z.number().min(0, "Delivery fee must be positive"),
});

type RestaurantForm = z.infer<typeof restaurantSchema>;

export default function RestaurantProfile() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch restaurant data
  const { data: restaurants = [] } = useQuery({
    queryKey: ['/api/restaurants/owner/me'],
  });

  const restaurant = restaurants[0];

  const form = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || '',
      description: restaurant?.description || '',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      cuisineType: restaurant?.cuisineType || '',
      openingTime: restaurant?.openingTime || '09:00',
      closingTime: restaurant?.closingTime || '22:00',
      minimumOrder: restaurant?.minimumOrder || 0,
      deliveryFee: restaurant?.deliveryFee || 5,
    },
  });

  // Update restaurant mutation
  const updateMutation = useMutation({
    mutationFn: async (data: RestaurantForm) => {
      // First update restaurant data
      const response = await apiRequest('PUT', `/api/restaurants/${restaurant.id}`, data);
      
      // If there's a new image, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const { imageUrl } = await uploadResponse.json();
          await apiRequest('PUT', `/api/restaurants/${restaurant.id}`, { imageUrl });
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant Updated",
        description: "Your restaurant profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants/owner/me'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update restaurant profile",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No restaurant found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Restaurant Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Image */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageSelect={setImageFile}
                  currentImage={restaurant.imageUrl}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter restaurant name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe your restaurant" 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cuisineType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Turkish, Italian, Fast Food" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-5 h-5 text-gray-400 mt-2" />
                          <Input {...field} placeholder="Restaurant address" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex items-start space-x-2">
                          <Phone className="w-5 h-5 text-gray-400 mt-2" />
                          <Input {...field} placeholder="+90 555 123 4567" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <div className="flex items-start space-x-2">
                            <Clock className="w-5 h-5 text-gray-400 mt-2" />
                            <Input {...field} type="time" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <div className="flex items-start space-x-2">
                            <Clock className="w-5 h-5 text-gray-400 mt-2" />
                            <Input {...field} type="time" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="minimumOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Fee (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}