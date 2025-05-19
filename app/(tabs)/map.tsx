import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';
import { Bus, Clock, MapPin, ChevronDown, Layers, Navigation2 } from 'lucide-react-native';
import { getBusLocation, getBusRoutes, getBusStops } from '@/utils/mockData';
import MapViewComponent from '@/components/MapView';

export default function MapScreen() {
  const { userRole } = useAuth();
  const [selectedBus, setSelectedBus] = useState(0);
  const [busLocation, setBusLocation] = useState(null);
  const [busRoutes, setBusRoutes] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [mapType, setMapType] = useState('standard');
  const mapRef = useRef(null);
  const [busLocations, setBusLocations] = useState([]);

  useEffect(() => {
    loadBusData();
    updateAllBusLocations();
    const interval = setInterval(updateAllBusLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Met à jour la position de tous les bus
  const updateAllBusLocations = () => {
    const allLocations = [0, 1, 2].map((index) => getBusLocation(index));
    setBusLocations(allLocations);
    setBusLocation(allLocations[selectedBus]);
  };

  const loadBusData = () => {
    setBusRoutes(getBusRoutes());
    setBusStops(getBusStops());
    updateAllBusLocations();
  };

  // Change le type de la carte entre standard et satellite
  const toggleMapType = useCallback(() => {
    setMapType((prevType) => (prevType === 'standard' ? 'satellite' : 'standard'));
  }, []);

  // Centre la carte sur la position du bus sélectionné
  const handleCenterMap = useCallback(() => {
    if (mapRef.current && busLocation) {
      mapRef.current.animateToRegion({
        latitude: busLocation.latitude,
        longitude: busLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [busLocation]);

  // Change de bus sélectionné (uniquement pour admin)
  useEffect(() => {
    setBusLocation(busLocations[selectedBus]);
  }, [selectedBus, busLocations]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewComponent
  ref={mapRef}
  busLocation={busLocation}
  busRoutes={busRoutes}
  busStops={busStops}
  mapType={mapType}
  busLocations={busLocations}
/>


        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={toggleMapType}>
            <Layers size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={handleCenterMap}>
            <Navigation2 size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {userRole === 'admin' && (
          <View style={styles.busSelector}>
            {[0, 1, 2].map((busIndex) => (
              <TouchableOpacity
                key={busIndex}
                style={[
                  styles.busSelectorOption,
                  selectedBus === busIndex && styles.busSelectorOptionActive,
                ]}
                onPress={() => setSelectedBus(busIndex)}
              >
                <Text
                  style={[
                    styles.busSelectorText,
                    selectedBus === busIndex && styles.busSelectorTextActive,
                  ]}
                >
                  Bus #{['B42', 'B17', 'B103'][busIndex]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <TouchableOpacity
          style={styles.detailsHeader}
          onPress={() => setShowDetails(!showDetails)}
        >
          <View style={styles.detailsHeaderLeft}>
            <Bus size={20} color={colors.primary} />
            <Text style={styles.busNumber}>Bus #{busLocation?.id || 'B42'}</Text>
          </View>
          <ChevronDown
            size={20}
            color={colors.textLight}
            style={{ transform: [{ rotate: showDetails ? '0deg' : '-90deg' }] }}
          />
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.detailsContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  {busLocation?.status === 'en-route' ? 'En route • ' : ''}
                  ETA {busLocation?.eta || '7 mins'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  {busLocation?.currentLocation || 'University Road'}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      busLocation?.status === 'en-route' ? colors.success : colors.warning,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {busLocation?.statusText || 'En route to next stop'}
              </Text>
            </View>

            <View style={styles.routeProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${busLocation?.routeProgress || 45}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {busLocation?.routeProgress || 45}% of route completed
              </Text>
            </View>

            {userRole === 'parent' && (
              <TouchableOpacity style={styles.notifyButton}>
                <Text style={styles.notifyButtonText}>Notify Driver</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1, position: 'relative' },
  mapControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  busSelector: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  busSelectorOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  busSelectorOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  busSelectorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  busSelectorTextActive: {
    color: colors.primary,
  },
  detailsContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  busNumber: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 8,
  },
  detailsContent: { padding: 16, paddingTop: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
  },
  routeProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  notifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.white,
  },
});
