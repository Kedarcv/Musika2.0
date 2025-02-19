import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';

const OrderMap = ({ deliveryAddress, riderLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const riderMarkerRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
    });

    loader.load().then(() => {
      const { google } = window;
      const deliveryLatLng = new google.maps.LatLng(
        deliveryAddress.coordinates.coordinates[1],
        deliveryAddress.coordinates.coordinates[0]
      );

      const mapOptions = {
        center: deliveryLatLng,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Delivery location marker
      const marker = new google.maps.Marker({
        position: deliveryLatLng,
        map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
        title: 'Delivery Location',
      });
      markerRef.current = marker;

      // Rider marker (if rider location exists)
      if (riderLocation) {
        const riderLatLng = new google.maps.LatLng(
          riderLocation.coordinates[1],
          riderLocation.coordinates[0]
        );

        const riderMarker = new google.maps.Marker({
          position: riderLatLng,
          map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
          title: 'Rider Location',
        });
        riderMarkerRef.current = riderMarker;

        // Draw route between rider and delivery location
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
        });

        directionsService.route(
          {
            origin: riderLatLng,
            destination: deliveryLatLng,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            }
          }
        );
      }
    });
  }, [deliveryAddress, riderLocation]);

  // Update rider marker position when location changes
  useEffect(() => {
    if (riderLocation && riderMarkerRef.current && window.google) {
      const newPosition = new window.google.maps.LatLng(
        riderLocation.coordinates[1],
        riderLocation.coordinates[0]
      );
      riderMarkerRef.current.setPosition(newPosition);
    }
  }, [riderLocation]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '400px',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    />
  );
};

export default OrderMap;
