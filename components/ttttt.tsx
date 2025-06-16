import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { LocateFixed } from 'lucide-react-native';
import { colors } from '@/constants/Colors'; // si tu as un fichier de couleurs

interface Driver {
  id: string;
  fullName: string;
  latitude: number;
  longitude: number;
  mapType: 'standard' | 'satellite' | 'hybrid';
}

const DriversMap: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const mapRef = useRef<MapView>(null);
  const db = getFirestore(app);

  // Écoute des chauffeurs
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Drivers'), (snapshot) => {
      const driverList: Driver[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location?.latitude && data.location?.longitude) {
          driverList.push({
            id: doc.id,
            fullName: data.fullName,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          });
        }
      });

      setDrivers(driverList);
    });

    return () => unsubscribe();
  }, []);

  // Récupération de la position utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission location refusée');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Erreur de localisation :', error);
      }
    })();
  }, []);

  const initialRegion = {
    latitude: drivers[0]?.latitude || userLocation?.latitude || 36.7283,
    longitude: drivers[0]?.longitude || userLocation?.longitude || 5.0478,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType={mapType}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title={driver.fullName}
            description={`Chauffeur ID: ${driver.id}`}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>{driver.fullName[0]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Bouton recentrage sur l'utilisateur */}
      {userLocation && (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            mapRef.current?.animateToRegion({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }}
        >
          <LocateFixed color="white" size={24} />
        </TouchableOpacity>
      )}

      {/* Bouton pour changer le type de carte */}
      <TouchableOpacity
        style={styles.mapTypeButton}
        onPress={() => {
          setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
        }}
      >
        <Text style={styles.mapTypeText}>
          {mapType === 'standard' ? 'Satellite' : 'Standard'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: colors?.primary || '#007AFF',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  mapTypeButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'rgba(140, 15, 15, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  mapTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DriversMap;
