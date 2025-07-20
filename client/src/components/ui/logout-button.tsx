import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function LogoutButton({ variant = "outline" }: { variant?: "outline" | "ghost" | "default" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user type from localStorage
      localStorage.removeItem('userType');
      
      toast({
        title: "Logged out successfully",
        description: "You can now select a different user type",
      });
      
      // Small delay then redirect to ensure session is cleared
      setTimeout(() => {
        window.location.replace("/landing");
      }, 200);
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      {logoutMutation.isPending ? "Signing out..." : "Logout"}
    </Button>
  );
}