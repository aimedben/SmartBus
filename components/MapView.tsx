import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { LocateFixed, Layers, Plus, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Driver {
  id: string;
  fullName: string;
  latitude: number;
  longitude: number;
  currentLocation?: string;
  route?: { latitude: number; longitude: number }[];
}

const DriversMap: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [showPathModal, setShowPathModal] = useState(false);
  const [pathPoints, setPathPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isSelectingPath, setIsSelectingPath] = useState(false);
  const [showDriversList, setShowDriversList] = useState(false);
  const mapRef = useRef<MapView>(null);
  const db = getFirestore(app);

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
            currentLocation: data.currentLocation || 'En route',
            route: data.route || [],
          });
        }
      });
      setDrivers(driverList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

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

  const handleMapLongPress = (e: any) => {
    if (!isSelectingPath) return;

    const { coordinate } = e.nativeEvent;

    if (pathPoints.length === 0) {
      setPathPoints([coordinate]);
      Alert.alert('Point de départ défini', 'Touchez à nouveau pour définir le point d\'arrivée');
    } else if (pathPoints.length === 1) {
      setPathPoints(prev => [...prev, coordinate]);
      setIsSelectingPath(false);
      Alert.alert('Trajet défini', 'Cliquez sur Enregistrer pour valider');
    }
  };

  const startPathSelection = () => {
    if (!selectedDriver) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un chauffeur');
      return;
    }
    setPathPoints([]);
    setIsSelectingPath(true);
    setShowPathModal(true);
    Alert.alert(
      'Sélection du trajet',
      'Maintenez un appui long sur la carte pour sélectionner le point de départ',
      [{ text: 'OK' }]
    );
  };

  const savePath = async () => {
    if (!selectedDriver || pathPoints.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner un chauffeur et définir 2 points');
      return;
    }

    try {
      await updateDoc(doc(db, 'Drivers', selectedDriver.id), {
        route: pathPoints,
      });
      Alert.alert('Succès', 'Nouveau trajet enregistré');
      setShowPathModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Sauvegarde échouée');
    }
  };

  const cancelPathSelection = () => {
    setPathPoints([]);
    setIsSelectingPath(false);
    setShowPathModal(false);
  };

  const initialRegion = {
    latitude: drivers[0]?.latitude || userLocation?.latitude || 36.7283,
    longitude: drivers[0]?.longitude || userLocation?.longitude || 5.0478,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      style={styles.driverItem}
      onPress={() => {
        setSelectedDriver(item);
        setShowDriversList(false);
        mapRef.current?.animateToRegion({
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }}
    >
      <Text style={styles.driverName}>{item.fullName}</Text>
      <Text style={styles.driverLocation}>{item.currentLocation || 'En route'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.driversListButton}
        onPress={() => setShowDriversList(!showDriversList)}
      >
        <Text style={styles.driversListButtonText}>
          {selectedDriver ? selectedDriver.fullName : 'Sélectionner un chauffeur'}
        </Text>
      </TouchableOpacity>

      {showDriversList && (
        <View style={styles.driversListContainer}>
          <FlatList
            data={drivers}
            renderItem={renderDriverItem}
            keyExtractor={(item) => item.id}
            style={styles.driversList}
          />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType={mapType}
        toolbarEnabled={false}
        onLongPress={handleMapLongPress}
        onPress={() => setIsSelectingPath(false)}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title={driver.fullName}
            description={`Chauffeur ID: ${driver.id}`}
            onPress={() => {
              setSelectedDriver(driver);
              setIsSelectingPath(false);
            }}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>{driver.fullName[0]}</Text>
            </View>
          </Marker>
        ))}

        {selectedDriver?.route?.length > 0 && (
          <Polyline
            coordinates={selectedDriver.route}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}

        {pathPoints.map((point, index) => (
          <Marker key={`path-point-${index}`} coordinate={point}>
            <View style={[
              styles.pathMarker,
              { backgroundColor: index === 0 ? '#4CAF50' : '#F44336' }
            ]}>
              <Text style={styles.markerText}>{index === 0 ? 'D' : 'A'}</Text>
            </View>
          </Marker>
        ))}

        {pathPoints.length > 1 && (
          <Polyline
            coordinates={pathPoints}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        )}
      </MapView>

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

      <TouchableOpacity
        style={styles.mapTypeButton}
        onPress={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
      >
        <Layers color="white" size={24} />
      </TouchableOpacity>

      {isAdmin && (
        <TouchableOpacity
          style={styles.addPathButton}
          onPress={startPathSelection}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      )}

      <Modal
        visible={showPathModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelPathSelection}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={cancelPathSelection}
            >
              <X color="black" size={24} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Définir un nouveau trajet</Text>

            <Text style={styles.instructionText}>
              {pathPoints.length === 0
                ? 'Appui long pour le point de départ'
                : pathPoints.length === 1
                ? 'Appui long pour le point d\'arrivée'
                : 'Trajet prêt à être enregistré'}
            </Text>

            <Text style={styles.coordinateText}>
              Départ: {pathPoints[0] ? `${pathPoints[0].latitude.toFixed(4)}, ${pathPoints[0].longitude.toFixed(4)}` : 'Non défini'}
            </Text>
            <Text style={styles.coordinateText}>
              Arrivée: {pathPoints[1] ? `${pathPoints[1].latitude.toFixed(4)}, ${pathPoints[1].longitude.toFixed(4)}` : 'Non défini'}
            </Text>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: pathPoints.length < 2 ? '#ccc' : '#4CAF50',
                  opacity: pathPoints.length < 2 ? 0.6 : 1,
                },
              ]}
              disabled={pathPoints.length < 2}
              onPress={savePath}
            >
              <Text style={styles.actionButtonText}>Enregistrer le trajet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  locationButton: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: '#333', padding: 10, borderRadius: 50,
  },
  mapTypeButton: {
    position: 'absolute', bottom: 80, right: 20,
    backgroundColor: '#333', padding: 10, borderRadius: 50,
  },
  addPathButton: {
    position: 'absolute', bottom: 140, right: 20,
    backgroundColor: '#4CAF50', padding: 10, borderRadius: 50,
  },
  marker: {
    backgroundColor: '#6200EE', padding: 5, borderRadius: 5,
  },
  markerText: { color: 'white', fontWeight: 'bold' },
  pathMarker: {
    padding: 5, borderRadius: 5,
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 10,
  },
  closeButton: {
    position: 'absolute', top: 10, right: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  instructionText: { fontSize: 16, marginBottom: 10 },
  coordinateText: { fontSize: 14, marginBottom: 5 },
  actionButton: {
    marginTop: 15, padding: 10, borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: { color: 'white', fontWeight: 'bold' },
  driversListButton: {
    position: 'absolute', top: 50, left: 20, zIndex: 10,
    backgroundColor: '#fff', padding: 10, borderRadius: 5,
  },
  driversListButtonText: { fontWeight: 'bold' },
  driversListContainer: {
    position: 'absolute', top: 100, left: 20, right: 20,
    backgroundColor: '#fff', maxHeight: 200, borderRadius: 8, zIndex: 10,
  },
  driversList: {
    padding: 10,
  },
  driverItem: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc',
  },
  driverName: { fontWeight: 'bold' },
  driverLocation: { fontSize: 12, color: '#666' },
});

export default DriversMap;
