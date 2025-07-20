import { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { MapPin, Navigation, Phone } from 'lucide-react';

interface GoogleMapsProps {
  restaurantAddress: string;
  deliveryAddress: string;
  restaurantName?: string;
  customerName?: string;
  customerPhone?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapsNavigation({ 
  restaurantAddress, 
  deliveryAddress, 
  restaurantName = "Restaurant",
  customerName = "Customer",
  customerPhone
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  useEffect(() => {
    // Load Google Maps API
    const loadMapsApi = async () => {
      if (!window.google) {
        const script = document.createElement('script');
        // Get API key from server
        const apiKey = await fetch('/api/config/google-maps-key')
          .then(res => res.text())
          .catch(() => 'YOUR_API_KEY');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        setIsLoaded(true);
      }
    };
    
    loadMapsApi();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      initializeMap();
    }
  }, [isLoaded]);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 35.3413, lng: 33.3248 }, // METU NCC coordinates
      mapTypeId: 'roadmap'
    });

    const newDirectionsService = new window.google.maps.DirectionsService();
    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
      draggable: false,
      map: newMap
    });

    setMap(newMap);
    setDirectionsService(newDirectionsService);
    setDirectionsRenderer(newDirectionsRenderer);

    // Calculate route
    calculateRoute(newDirectionsService, newDirectionsRenderer);
  };

  const calculateRoute = (service: any, renderer: any) => {
    if (!service || !renderer) return;

    const request = {
      origin: restaurantAddress,
      destination: deliveryAddress,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    service.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        renderer.setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  const openInGoogleMaps = () => {
    const encodedOrigin = encodeURIComponent(restaurantAddress);
    const encodedDestination = encodeURIComponent(deliveryAddress);
    const url = `https://www.google.com/maps/dir/${encodedOrigin}/${encodedDestination}`;
    window.open(url, '_blank');
  };

  const callCustomer = () => {
    if (customerPhone) {
      window.open(`tel:${customerPhone}`, '_self');
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Route</h3>
          <div className="flex gap-2">
            {customerPhone && (
              <Button size="sm" variant="outline" onClick={callCustomer}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
            <Button size="sm" onClick={openInGoogleMaps}>
              <Navigation className="w-4 h-4 mr-2" />
              Navigate
            </Button>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{restaurantName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{restaurantAddress}</p>
          </div>
        </div>
        
        <div className="ml-1.5 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-6"></div>
        
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{customerName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{deliveryAddress}</p>
            {customerPhone && (
              <p className="text-sm text-blue-600 dark:text-blue-400">{customerPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-64 w-full rounded-b-lg"
          style={{ minHeight: '256px' }}
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-b-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleMapsNavigation;