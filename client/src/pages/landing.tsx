import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Utensils, Clock, Shield, Star } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function Landing() {
  const [userType, setUserType] = useState<'user' | 'restaurant' | 'courier'>('user');
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const features = [
    {
      icon: <Utensils className="w-6 h-6" />,
      title: "Local Flavors",
      description: "Authentic Turkish and international cuisines crafted by campus chefs who understand student tastes"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Campus Speed",
      description: "Average 15-minute delivery across Kalkanlı - perfect for study breaks and meal times"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Student-Safe",
      description: "Secure payment with Turkish Lira, designed for student budgets and campus life"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Community Choice",
      description: "Rated by fellow METU NCC students who share your taste and standards"
    }
  ];

  const handleGetStarted = () => {
    localStorage.setItem('userType', userType);
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-2">
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={changeLanguage}
                variant="ghost"
                size="sm"
              />

            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6">
        {/* Hero Section */}
        <div className="pt-12 pb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            <span className="text-3xl">🍽️</span>
            <span className="block mt-2">{t('munchies')}</span>
            <span className="block text-orange-500 text-3xl">Crave & Receive</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto leading-relaxed">
            ODTÜ KKK ve Kalkanlı için yemek siparişi
          </p>
          
          {/* User Type Selection */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">I am a:</p>
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
          
          {/* Market Preview Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="text-2xl mb-2">🛒</div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Munchies Market
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Campus groceries & essentials delivery
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                <Clock className="w-3 h-3" />
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Made for Campus Life 🎓
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="py-8">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trusted by Our Community</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">25+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Campus Restaurants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">800+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">12min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            🏫 Proudly serving METU Northern Cyprus Campus
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            From Kalkanlı with love - connecting taste to community
          </p>
        </footer>
      </div>
    </div>
  );
}