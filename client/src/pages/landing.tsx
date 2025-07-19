import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, UtensilsCrossed, Truck, Star, Users, Store } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [userType, setUserType] = useState<'student' | 'restaurant' | null>(null);

  const handleLogin = (type: 'student' | 'restaurant') => {
    // Store user type in localStorage for post-login routing
    localStorage.setItem('userType', type);
    window.location.href = '/api/login';
  };

  if (userType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        {/* Animated food particles background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-bounce absolute top-20 left-10 text-6xl opacity-20">🍕</div>
          <div className="animate-bounce absolute top-40 right-20 text-4xl opacity-20" style={{ animationDelay: '1s' }}>🍔</div>
          <div className="animate-bounce absolute bottom-40 left-20 text-5xl opacity-20" style={{ animationDelay: '2s' }}>🍜</div>
          <div className="animate-bounce absolute bottom-20 right-10 text-4xl opacity-20" style={{ animationDelay: '0.5s' }}>🌮</div>
          <div className="animate-bounce absolute top-60 left-1/2 text-3xl opacity-20" style={{ animationDelay: '1.5s' }}>🍰</div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 relative z-10">
          {/* Hunger-inducing Logo */}
          <div className="text-center mb-16 animate-pulse">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl ring-8 ring-white/30 backdrop-blur-lg">
                <UtensilsCrossed className="text-white text-5xl drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-wider" 
                style={{ fontFamily: '"Fredoka One", "Comic Sans MS", cursive' }}>
              Munchies
            </h1>
            <p className="text-white/90 text-xl font-bold drop-shadow-lg mb-2" 
               style={{ fontFamily: '"Nunito", sans-serif' }}>
              🎓 University Food Delivery
            </p>
            <p className="text-white/70 text-lg font-medium drop-shadow-md">
              Kalkanlı Campus • Delicious & Fast
            </p>
          </div>

          {/* User Type Selection */}
          <div className="w-full max-w-md space-y-4">
            <h2 className="text-white text-2xl font-bold text-center mb-8 drop-shadow-lg">
              Choose Your Experience
            </h2>
            
            {/* Student Panel */}
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    I'm a Student
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Order delicious meals from campus restaurants. Quick delivery to your dorm or study spot!
                  </p>
                  <Button 
                    onClick={() => handleLogin('student')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    🎓 Enter as Student
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Owner Panel */}
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Store className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    I'm a Restaurant Owner
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Manage your restaurant, menu, and orders. Grow your business with hungry students!
                  </p>
                  <Button 
                    onClick={() => handleLogin('restaurant')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    🍳 Enter as Owner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-md text-white/90 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-lg">
                <Truck className="text-white" size={20} />
              </div>
              <p className="text-sm font-medium">Fast Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-lg">
                <Star className="text-white" size={20} />
              </div>
              <p className="text-sm font-medium">Top Rated</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-lg">
                <ChefHat className="text-white" size={20} />
              </div>
              <p className="text-sm font-medium">Fresh Food</p>
            </div>
          </div>

          {/* Cozy Software Branding */}
          <div className="absolute bottom-4 right-4 text-white/60 text-xs font-medium">
            Powered by Cozy Software
          </div>
        </div>
      </div>
    );
  }

  // This won't be reached in normal flow since we redirect to login
  return null;
}
