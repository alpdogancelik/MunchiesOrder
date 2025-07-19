import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface BottomNavigationProps {
  currentPage?: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [location] = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  const cartItemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  const navItems = [
    {
      href: "/",
      icon: "fas fa-home",
      label: "Home",
      active: location === "/" || currentPage === "home",
    },
    {
      href: "/search",
      icon: "fas fa-search",
      label: "Search",
      active: location.includes("/search"),
    },
    {
      href: "/cart",
      icon: "fas fa-shopping-cart",
      label: "Cart",
      active: location.includes("/cart"),
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      href: "/orders",
      icon: "fas fa-receipt",
      label: "Orders",
      active: location.includes("/orders") || location.includes("/order/"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-dark-100 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-3 relative ${
                item.active
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-primary"
              }`}
            >
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
