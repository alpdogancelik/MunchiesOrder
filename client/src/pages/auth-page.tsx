import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      window.location.reload(); // Refresh to update auth state
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Welcome to Munchies! You can now start ordering.",
      });
      window.location.reload(); // Refresh to update auth state
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!formData.username || !formData.password) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      loginMutation.mutate({
        username: formData.username,
        password: formData.password
      });
    } else {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing Fields", 
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      // Validate username format (no spaces, special characters)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        toast({
          title: "Invalid Username",
          description: "Username can only contain letters, numbers, and underscores",
          variant: "destructive",
        });
        return;
      }
      
      registerMutation.mutate({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 dark:bg-dark-100 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-dark-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      <div className="flex">
        {/* Left Panel - Auth Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 min-h-screen">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                🍔 Munchies
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin ? "Welcome back!" : "Join the feast!"}
              </p>
            </div>

            <Card className="bg-white dark:bg-dark-200 border-0 shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {isLogin ? "Sign In" : "Create Account"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  )}

                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-gray-50 dark:bg-dark-100 border-gray-200 dark:border-dark-100 focus:border-primary"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold rounded-xl transition-all"
                    disabled={loginMutation.isPending || registerMutation.isPending}
                  >
                    {loginMutation.isPending || registerMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </span>
                    ) : (
                      isLogin ? "Sign In" : "Create Account"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        firstName: "",
                        lastName: ""
                      });
                    }}
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    {isLogin ? "Create Account" : "Sign In"}
                  </Button>
                </div>

                {/* Cozy Software Branding */}
                <div className="mt-6 text-center text-gray-400 dark:text-gray-500 text-xs">
                  🔒 Secure authentication powered by Cozy Software
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Hero Section */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
          <div className="flex flex-col justify-center items-center text-white p-12 relative z-10">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Delicious Food<br />
                <span className="text-orange-200">Delivered Fast</span>
              </h2>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Order from the best restaurants in Kalkanlı Campus.<br />
                Fresh ingredients, fast delivery, amazing flavors! 🍕🍔🍜
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="text-orange-200">Fast Delivery</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="text-orange-200">Quality Food</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-orange-200">Secure Payment</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-9xl">🍔</div>
            <div className="absolute top-32 right-20 text-7xl">🍕</div>
            <div className="absolute bottom-20 left-16 text-8xl">🍜</div>
            <div className="absolute bottom-32 right-12 text-6xl">🥗</div>
          </div>
        </div>
      </div>
    </div>
  );
}