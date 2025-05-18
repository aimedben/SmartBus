import React, { forwardRef, useEffect, useState } from 'react';
import { View,TouchableOpacity, StyleSheet, Text, Image, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { MapPin, Bus, LocateFixed } from 'lucide-react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

interface MapViewProps {
  busLocation: {
    id: string;
    latitude: number;
    longitude: number;
    status?: string;
    eta?: string;
    currentLocation?: string;
  } | null;
  busRoutes: {
    id: string;
    coordinates: { latitude: number; longitude: number }[];
  }[];
  busStops: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }[];
  mapType: 'standard' | 'satellite' | 'hybrid';
}

const MapViewComponent = forwardRef(({ busLocation, busRoutes, busStops, mapType }: MapViewProps, ref) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  if (Platform.OS === 'web') {
    // Version web avec mockup
    return (
      <View style={styles.mapMockContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/4429285/pexels-photo-4429285.jpeg' }} 
          style={styles.mapImage}
        />
        
        {busLocation && (
          <View style={[styles.busMarker, { top: '40%', left: '65%' }]}>
            <View style={styles.busMarkerInner}>
              <Text style={styles.busMarkerText}>B{busLocation.id || 42}</Text>
            </View>
          </View>
        )}
        
        {busStops.map((stop, index) => (
          <View 
            key={stop.id}
            style={[styles.stopMarker, { top: `${30 + index * 10}%`, left: `${20 + index * 15}%` }]}
          >
            <MapPin size={24} color={colors.primary} />
          </View>
        ))}
        
        <Text style={styles.mockupText}>Interactive map available on mobile devices</Text>
      </View>
    );
  }

  // Version native avec localisation
  const initialLatitude = busLocation?.latitude || userLocation?.latitude || 48.8566;
  const initialLongitude = busLocation?.longitude || userLocation?.longitude || 2.3522;

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={ref}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {busLocation && (
          <Marker
            coordinate={{
              latitude: busLocation.latitude,
              longitude: busLocation.longitude,
            }}
            title={`Bus ${busLocation.id}`}
            description={busLocation.currentLocation || 'En route'}
          >
            <View style={styles.nativeBusMarker}>
              <Bus size={20} color={colors.white} />
            </View>
          </Marker>
        )}

        {busStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.name}
          >
            <View style={styles.nativeStopMarker}>
              <MapPin size={20} color={colors.white} />
            </View>
          </Marker>
        ))}

        {busRoutes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        ))}
      </MapView>
      {userLocation && (
  <View style={styles.locationButtonContainer}>
  <TouchableOpacity
    style={styles.locationButton}
    onPress={() => {
      if (ref && 'current' in ref && ref.current && userLocation) {
        ref.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }}
  >
    <LocateFixed color="white" size={24} />
  </TouchableOpacity>
</View>
)}

    </View>
  );
});

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMockContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mockupText: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  busMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    
  },
  busMarkerInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  busMarkerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: colors.primary,
  },
  stopMarker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeBusMarker: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
    
  },
  nativeStopMarker: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
  },
  locationButtonContainer: {
  position: 'absolute',
  bottom: 30,
  right: 20,
  zIndex: 10,
},
locationButton: {
  backgroundColor: colors.primary,
  color: colors.white,
  fontSize: 24,
  padding: 12,
  borderRadius: 30,
  textAlign: 'center',
  overflow: 'hidden',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},

});

export default MapViewComponent;
