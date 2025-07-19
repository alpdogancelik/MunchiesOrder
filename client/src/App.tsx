import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Restaurant from "@/pages/restaurant";
import Cart from "@/pages/cart";
import Payment from "@/pages/payment";
import OrderTracking from "@/pages/order-tracking";
import Profile from "@/pages/profile";
import AddressManagement from "@/pages/address-management";
import AdminDashboard from "@/pages/admin-dashboard";
import MenuManagement from "@/pages/menu-management";
import CourierTracking from "@/pages/courier-tracking";
import CourierManagement from "@/pages/courier-management";
import CreateRestaurant from "@/pages/create-restaurant";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check user type from localStorage and user data
  const userType = localStorage.getItem('userType') || 
    ((user as any)?.email?.includes('@restaurant') ? 'restaurant' : 'student');

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/landing" component={Landing} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Route based on user type */}
          {userType === 'courier' ? (
            <>
              <Route path="/" component={CourierTracking} />
              <Route path="/courier" component={CourierTracking} />
              <Route path="/profile" component={Profile} />
            </>
          ) : userType === 'restaurant' ? (
            <>
              <Route path="/" component={AdminDashboard} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/menu/:restaurantId" component={MenuManagement} />
              <Route path="/admin/couriers" component={CourierManagement} />
              <Route path="/admin/create-restaurant" component={CreateRestaurant} />
              <Route path="/profile" component={Profile} />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/restaurant/:id" component={Restaurant} />
              <Route path="/cart" component={Cart} />
              <Route path="/payment" component={Payment} />
              <Route path="/order/:id" component={OrderTracking} />
              <Route path="/profile" component={Profile} />
              <Route path="/addresses" component={AddressManagement} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="mobile-container bg-white dark:bg-dark-300">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
