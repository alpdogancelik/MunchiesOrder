import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ImageUpload } from "@/components/ui/image-upload";

export default function MenuManagement() {
  const { restaurantId } = useParams();
  const id = parseInt(restaurantId!);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
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

  const { data: restaurant, error: restaurantError } = useQuery({
    queryKey: ["/api/restaurants", id],
    enabled: !!id && isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/restaurants", id, "categories"],
    enabled: !!id,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/restaurants", id, "menu"],
    enabled: !!id,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if ((restaurantError && isUnauthorizedError(restaurantError as Error))) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [restaurantError, toast]);

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/menu-items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", id, "menu"] });
      toast({
        title: "Item deleted",
        description: "Menu item has been removed successfully",
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
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, isAvailable }: { itemId: number; isAvailable: boolean }) => {
      await apiRequest("PUT", `/api/menu-items/${itemId}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", id, "menu"] });
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
        description: "Failed to update item availability",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-store text-gray-400 text-4xl mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400">Restaurant not found</p>
        </div>
      </div>
    );
  }

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item: any) => item.categoryId === selectedCategory)
    : menuItems;

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleDeleteItem = (item: any) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleToggleAvailability = (item: any) => {
    toggleAvailabilityMutation.mutate({
      itemId: item.id,
      isAvailable: !item.isAvailable,
    });
  };

  if (showItemForm) {
    return <MenuItemForm item={editingItem} restaurantId={id} onClose={() => setShowItemForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-4">
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Menu Management</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{restaurant.name}</p>
            </div>
          </div>
          <Button
            onClick={handleAddItem}
            className="bg-primary text-white"
          >
            <i className="fas fa-plus mr-1"></i>Add Item
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex space-x-2 overflow-x-auto">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="flex-shrink-0 rounded-full"
                >
                  All ({menuItems.length})
                </Button>
                {categories.map((category: any) => {
                  const categoryCount = menuItems.filter((item: any) => item.categoryId === category.id).length;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex-shrink-0 rounded-full"
                    >
                      {category.name} ({categoryCount})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-utensils text-gray-400 text-3xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No menu items</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedCategory ? 'No items in this category' : 'Start building your menu by adding your first item'}
            </p>
            <Button onClick={handleAddItem} className="bg-primary text-white">
              <i className="fas fa-plus mr-2"></i>Add Menu Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMenuItems.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-dark-100 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-utensils text-gray-400"></i>
                      )}
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                            {item.isPopular && (
                              <Badge className="bg-accent/10 text-accent text-xs">Popular</Badge>
                            )}
                            {!item.isAvailable && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p className="font-bold text-primary text-lg">
                            ₺{parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={() => handleToggleAvailability(item)}
                            disabled={toggleAvailabilityMutation.isPending}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-gray-400 hover:text-primary"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                            disabled={deleteItemMutation.isPending}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Menu Item Form Component
function MenuItemForm({ 
  item, 
  restaurantId, 
  onClose 
}: { 
  item: any; 
  restaurantId: number; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    imageUrl: item?.imageUrl || '',
    isAvailable: item?.isAvailable ?? true,
    isPopular: item?.isPopular || false,
    categoryId: item?.categoryId || null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "categories"],
  });

  const saveItemMutation = useMutation({
    mutationFn: async (data: any) => {
      if (item) {
        await apiRequest("PUT", `/api/menu-items/${item.id}`, data);
      } else {
        await apiRequest("POST", `/api/restaurants/${restaurantId}/menu`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId, "menu"] });
      toast({
        title: item ? "Item updated" : "Item added",
        description: `Menu item has been ${item ? 'updated' : 'added'} successfully`,
      });
      onClose();
    },
    onError: (error) => {
      console.error("Menu item save error:", error);
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
        description: `Failed to ${item ? 'update' : 'add'} menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", formData);
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price).toFixed(2),
      imageUrl: formData.imageUrl || '', // Ensure imageUrl is never null
    };
    
    console.log("Submitting:", submitData);
    saveItemMutation.mutate(submitData);
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
              {item ? 'Edit Menu Item' : 'Add Menu Item'}
            </h1>
          </div>
          <Button
            type="submit"
            form="item-form"
            disabled={saveItemMutation.isPending}
            className="bg-primary text-white"
          >
            {saveItemMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-save mr-2"></i>
            )}
            {item ? 'Update' : 'Add'} Item
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your menu item"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₺) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => handleChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meal Photo
                  </label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => handleChange('imageUrl', url)}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Make this item available for ordering
                    </p>
                  </div>
                  <Switch
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => handleChange('isAvailable', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Popular Item
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mark as a popular item to highlight it
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => handleChange('isPopular', checked)}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
