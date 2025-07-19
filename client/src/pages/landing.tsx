import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        {/* App Logo and Branding */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <i className="fas fa-utensils text-primary text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Munchies</h1>
          <p className="text-white/80 text-lg">University Food Delivery</p>
          <p className="text-white/60 text-sm mt-1">Kalkanlı Campus</p>
        </div>

        <Card className="w-full max-w-sm mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Welcome to Munchies</h2>
            <p className="text-gray-600 text-center mb-6">
              Discover the best restaurants around Kalkanlı Campus. Order your favorite meals and get them delivered to your doorstep.
            </p>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg"
            >
              Sign In to Continue
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                New to Munchies? Sign in to create your account
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm text-white/80">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <i className="fas fa-motorcycle text-white"></i>
            </div>
            <p className="text-sm">Fast Delivery</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <i className="fas fa-star text-white"></i>
            </div>
            <p className="text-sm">Top Rated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
