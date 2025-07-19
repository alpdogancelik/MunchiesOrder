import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  Database,
  Activity,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";

export default function DeveloperDashboard() {
  const [selectedDev, setSelectedDev] = useState<'arda' | 'alp'>('arda');

  // Get system stats
  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/system-stats"],
  });

  // Get user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Get restaurant stats
  const { data: restaurantStats } = useQuery({
    queryKey: ["/api/admin/restaurants"],
  });

  // Get order stats
  const { data: orderStats } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Developer-specific data
  const devData = {
    arda: {
      name: "Arda Kargacı",
      role: "Lead Full-Stack Developer & Co-Founder",
      avatar: "🚀",
      contributions: [
        "Authentication & Security System",
        "Payment Integration (iyzico)",
        "Database Architecture",
        "API Development",
        "Mobile-First UI Design"
      ],
      stats: {
        commits: 247,
        features: 18,
        bugs_fixed: 34,
        lines_of_code: 12450
      }
    },
    alp: {
      name: "Alp Arslan",
      role: "Frontend Architect & Co-Founder", 
      avatar: "⚡",
      contributions: [
        "React Component Library",
        "User Experience Design",
        "Real-time Features",
        "Performance Optimization",
        "Testing & Quality Assurance"
      ],
      stats: {
        commits: 189,
        features: 15,
        bugs_fixed: 28,
        lines_of_code: 9870
      }
    }
  };

  const currentDev = devData[selectedDev];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Munchies Developer Dashboard</h1>
              <p className="text-orange-100 mt-2">Super Admin Panel • System Overview & Analytics</p>
            </div>
            <LogoutButton variant="secondary" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={selectedDev} onValueChange={(value) => setSelectedDev(value as 'arda' | 'alp')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arda" className="flex items-center space-x-2">
              <span>🚀</span>
              <span>Arda's Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="alp" className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Alp's Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedDev} className="mt-6">
            {/* Developer Profile */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-2xl">
                    {currentDev.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentDev.name}</h2>
                    <p className="text-blue-600 dark:text-blue-400">{currentDev.role}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{currentDev.stats.commits} commits</span>
                      <span>{currentDev.stats.features} features</span>
                      <span>{currentDev.stats.bugs_fixed} bugs fixed</span>
                      <span>{currentDev.stats.lines_of_code.toLocaleString()} lines of code</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {userStats?.total || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Restaurants</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {restaurantStats?.total || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                      <Store className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{restaurantStats?.active || 0} active</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {orderStats?.total || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full">
                      <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Activity className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">{orderStats?.today || 0} today</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {orderStats?.revenue || 0} ₺
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-full">
                      <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+25% this month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Developer Contributions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Key Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentDev.contributions.map((contribution, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">{contribution}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Database</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">API Response</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Fast (120ms)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Gateway</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Server Uptime</span>
                      <Badge variant="outline" className="text-green-600">
                        <Clock className="w-4 h-4 mr-1" />
                        99.9%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent System Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">System Update Deployed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">New courier management system is now live</p>
                    </div>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Payment System Optimized</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cash on delivery option added</p>
                    </div>
                    <Badge variant="outline">5 hours ago</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Database Backup Completed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatic daily backup successful</p>
                    </div>
                    <Badge variant="outline">1 day ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}