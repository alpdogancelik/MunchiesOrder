import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { verifyIyzicoPayment } from "@/lib/iyzico";

interface PaymentWebViewProps {
  url: string;
  onSuccess: (orderId: number) => void;
  onError: () => void;
  onClose: () => void;
}

export default function PaymentWebView({ url, onSuccess, onError, onClose }: PaymentWebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = async (event: MessageEvent) => {
      // Accept messages from iyzico domains
      if (!event.origin.includes('iyzipay.com') && !event.origin.includes('iyzico.com')) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'PAYMENT_SUCCESS' && data.token) {
          setIsLoading(true);
          
          // Verify payment with backend
          const result = await verifyIyzicoPayment(data.token);
          
          if (result.success && result.orderId) {
            onSuccess(result.orderId);
          } else {
            onError();
          }
        } else if (data.type === 'PAYMENT_ERROR') {
          onError();
        }
      } catch (error) {
        console.error('Error parsing payment message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  // Monitor iframe URL changes (fallback method)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          // Try to access the URL - this will throw if cross-origin
          const currentUrl = iframe.contentWindow.location.href;
          
          // Check if the URL indicates success or failure
          if (currentUrl.includes('success')) {
            // Extract token from URL if possible
            const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
            const token = urlParams.get('token');
            
            if (token) {
              verifyIyzicoPayment(token).then((result) => {
                if (result.success && result.orderId) {
                  onSuccess(result.orderId);
                } else {
                  onError();
                }
              });
            }
          } else if (currentUrl.includes('error') || currentUrl.includes('fail')) {
            onError();
          }
        }
      } catch (e) {
        // Expected error due to cross-origin restrictions
        // This is normal and doesn't indicate a real error
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onSuccess, onError]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load payment page. Please check your connection and try again.");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-300 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Payment Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            
            <div className="space-y-3">
              <Button onClick={onClose} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-3" onClick={onClose}>
              <i className="fas fa-arrow-left text-lg"></i>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-credit-card text-primary text-xs"></i>
              </div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Secure Payment</h1>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
          <i className="fas fa-shield-alt text-sm"></i>
          <span className="text-sm font-medium">Secure payment powered by iyzico</span>
        </div>
      </div>

      {/* Payment Iframe */}
      <div className="relative flex-1 bg-white dark:bg-dark-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-dark-200 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Loading Payment Page
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Please wait while we prepare your secure payment form
              </p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-screen border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="iyzico Payment Form"
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
          allow="payment"
        />
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 dark:bg-dark-100 px-4 py-3 border-t border-gray-200 dark:border-dark-100">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <i className="fas fa-lock"></i>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fas fa-shield-alt"></i>
            <span>PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
