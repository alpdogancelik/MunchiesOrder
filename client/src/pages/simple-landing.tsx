import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Clock, Shield, Star } from "lucide-react";

export default function SimpleLanding() {
  const [userType, setUserType] = useState<'user' | 'restaurant' | 'courier'>('user');

  const handleGetStarted = () => {
    localStorage.setItem('userType', userType);
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-orange-500">Munchies</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6">
        {/* Hero Section */}
        <div className="pt-12 pb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            <span className="text-3xl">🍽️</span>
            <span className="block mt-2">Munchies</span>
            <span className="block text-orange-500 text-3xl">Crave & Receive</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
            ODTÜ KKK ve Kalkanlı için yemek siparişi
          </p>
          
          {/* User Type Selection */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-4">I am a:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={userType === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserType('user')}
                className="h-12 text-xs"
              >
                User
              </Button>
              <Button
                variant={userType === 'restaurant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserType('restaurant')}
                className="h-12 text-xs"
              >
                Restaurant
              </Button>
              <Button
                variant={userType === 'courier' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUserType('courier')}
                className="h-12 text-xs"
              >
                Courier
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="w-full h-12 text-base font-medium mb-6 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Utensils className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Local Flavors</h3>
              <p className="text-xs text-gray-600 mt-1">Campus cuisines</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Fast Delivery</h3>
              <p className="text-xs text-gray-600 mt-1">15-min average</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Shield className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Student-Safe</h3>
              <p className="text-xs text-gray-600 mt-1">Secure payments</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Star className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900 text-sm">Top Rated</h3>
              <p className="text-xs text-gray-600 mt-1">Student choice</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="py-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted by Our Community</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-600">25+</div>
                <div className="text-sm text-gray-600">Restaurants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">800+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">12min</div>
                <div className="text-sm text-gray-600">Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            🏫 Proudly serving METU Northern Cyprus Campus
          </p>
          <p className="text-xs text-gray-400">
            From Kalkanlı with love - connecting taste to community
          </p>
        </footer>
      </div>
    </div>
  );
}