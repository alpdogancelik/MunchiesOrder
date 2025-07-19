import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AddressFormProps {
  address?: any;
  onClose: () => void;
}

export default function AddressForm({ address, onClose }: AddressFormProps) {
  const [formData, setFormData] = useState({
    title: address?.title || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || 'Kalkanlı',
    country: address?.country || 'TRNC',
    isDefault: address?.isDefault || false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      if (address) {
        await apiRequest("PUT", `/api/addresses/${address.id}`, data);
      } else {
        await apiRequest("POST", "/api/addresses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: address ? "Address updated" : "Address added",
        description: `Your address has been ${address ? 'updated' : 'added'} successfully`,
      });
      onClose();
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
        description: `Failed to ${address ? 'update' : 'add'} address`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Address title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.addressLine1.trim()) {
      toast({
        title: "Validation Error",
        description: "Address line 1 is required",
        variant: "destructive",
      });
      return;
    }

    saveAddressMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-4" onClick={onClose}>
              <i className="fas fa-arrow-left text-xl"></i>
            </Button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {address ? 'Edit Address' : 'Add New Address'}
            </h1>
          </div>
          <Button
            type="submit"
            form="address-form"
            disabled={saveAddressMutation.isPending}
            className="bg-primary text-white"
          >
            {saveAddressMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-save mr-2"></i>
            )}
            {address ? 'Update' : 'Save'} Address
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Address Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Home, Dormitory, Office"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Give your address a name for easy identification
                </p>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 1 *
                </label>
                <Textarea
                  value={formData.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  placeholder="Street address, building name, room number"
                  rows={2}
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 2 (Optional)
                </label>
                <Textarea
                  value={formData.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  placeholder="Additional address information, landmarks"
                  rows={2}
                />
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Default Address Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set as Default Address
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Use this address for all future orders by default
                  </p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleChange('isDefault', checked)}
                />
              </div>

              {/* Popular Address Suggestions */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Popular Locations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Dormitory A',
                    'Dormitory B',
                    'Faculty Building',
                    'Student Center',
                    'Library',
                    'Sports Center'
                  ].map((location) => (
                    <Button
                      key={location}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange('title', location)}
                      className="text-left justify-start"
                    >
                      <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                      {location}
                    </Button>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Address Tips */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="fas fa-lightbulb text-blue-600 dark:text-blue-400 text-xs"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                  Address Tips
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Include building name and room number for accurate delivery</li>
                  <li>• Add landmarks to help delivery riders find your location</li>
                  <li>• Double-check spelling to avoid delivery issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
