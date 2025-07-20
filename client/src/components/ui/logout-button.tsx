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
        title: "Çıkış yapıldı",
        description: "Başka bir kullanıcı türü seçebilirsiniz",
      });
      
      // Immediately redirect to landing page
      window.location.href = "/";
    },
    onError: () => {
      // Even if logout API fails, clear session and redirect
      localStorage.removeItem('userType');
      toast({
        title: "Çıkış yapıldı",
        description: "Ana sayfaya yönlendiriliyorsunuz",
      });
      window.location.href = "/";
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
{logoutMutation.isPending ? "Çıkış yapılıyor..." : "Çıkış"}
    </Button>
  );
}