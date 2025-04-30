import React from 'react';
import { View, StyleSheet, Text, Image, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { MapPin } from 'lucide-react-native';

interface MapViewProps {
  busLocation: any;
  busRoutes: any[];
  busStops: any[];
  mapType: string;
}

export default function MapView({ busLocation, busRoutes, busStops, mapType }: MapViewProps) {
  if (Platform.OS === 'web') {
    // On web, show a mockup of the map since react-native-maps might not work well
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
            key={index}
            style={[
              styles.stopMarker, 
              { 
                top: `${30 + (index * 10)}%`, 
                left: `${20 + (index * 15)}%` 
              }
            ]}
          >
            <MapPin size={24} color={colors.primary} />
          </View>
        ))}
        
        <Text style={styles.mockupText}>Interactive map available on mobile devices</Text>
      </View>
    );
  }

  // On native platforms, use actual react-native-maps
  // This is a simplified mock version for the demonstration
  return (
    <View style={styles.mapContainer}>
      <Text style={styles.mapLoadingText}>Loading map...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  mapLoadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textLight,
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
});