import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AddressForm from "@/components/address-form";

export default function AddressManagement() {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: addresses = [], isLoading: addressesLoading, error } = useQuery({
    queryKey: ["/api/addresses"],
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

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await apiRequest("DELETE", `/api/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Address deleted",
        description: "The address has been removed successfully",
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
        description: "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: number) => {
      await apiRequest("PUT", `/api/addresses/${addressId}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Default address updated",
        description: "This address is now your default delivery address",
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
        description: "Failed to set default address",
        variant: "destructive",
      });
    },
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (address: any) => {
    if (window.confirm(`Are you sure you want to delete "${address.title}"?`)) {
      deleteAddressMutation.mutate(address.id);
    }
  };

  const handleSetDefault = (address: any) => {
    if (!address.isDefault) {
      setDefaultMutation.mutate(address.id);
    }
  };

  const handleFormClose = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  if (isLoading || addressesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (showAddressForm) {
    return (
      <AddressForm
        address={editingAddress}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="mr-4">
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Delivery Addresses</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddAddress}
            className="text-primary hover:underline"
          >
            <i className="fas fa-plus mr-1"></i>Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-map-marker-alt text-gray-400 text-3xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No addresses yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Add your first delivery address to get started
            </p>
            <Button 
              onClick={handleAddAddress}
              className="bg-primary text-white px-8 py-3 rounded-xl font-semibold"
            >
              Add Address
            </Button>
          </div>
        ) : (
          <>
            {/* Current Addresses */}
            <div className="space-y-4">
              {addresses.map((address: any) => (
                <Card
                  key={address.id}
                  className={`cursor-pointer transition-colors ${
                    address.isDefault
                      ? "border-2 border-primary bg-primary/5"
                      : "border border-gray-200 dark:border-dark-100 hover:border-primary"
                  }`}
                  onClick={() => !address.isDefault && handleSetDefault(address)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {address.title}
                          </h3>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                          {address.addressLine1}
                        </p>
                        {address.addressLine2 && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                            {address.addressLine2}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {address.city}, {address.country}
                        </p>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address)}
                          disabled={deleteAddressMutation.isPending}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </Button>
                      </div>
                    </div>
                    
                    {address.isDefault && (
                      <div className="flex items-center mt-3">
                        <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Selected for delivery
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Address Button */}
            <div className="mt-6">
              <Card 
                className="border-2 border-dashed border-gray-300 dark:border-dark-100 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                onClick={handleAddAddress}
              >
                <CardContent className="p-6 text-center">
                  <i className="fas fa-plus text-gray-400 text-2xl mb-2"></i>
                  <p className="font-medium text-gray-600 dark:text-gray-400">Add New Address</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
