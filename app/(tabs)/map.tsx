import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, FlatList, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { app } from '../../firebaseConfig';
import { Bus, Clock, MapPin, ChevronDown, Layers, Navigation2, Plus, X, List, LocateFixed } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getBusRoutes, getBusStops } from '@/utils/mockData';

interface Bus {
  id: string;
  fullName: string;
  latitude: number;
  longitude: number;
  currentLocation?: string;
  status?: string;
  eta?: string;
  routeProgress?: number;
  route?: { latitude: number; longitude: number }[];
}

const MapScreen: React.FC = () => {
  const { userRole } = useAuth();
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  const [busStops, setBusStops] = useState<any[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showDetails, setShowDetails] = useState(true);
  const [showPathModal, setShowPathModal] = useState(false);
  const [pathPoints, setPathPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isSelectingPath, setIsSelectingPath] = useState(false);
  const [showDriverList, setShowDriverList] = useState(false);
  const mapRef = useRef<MapView>(null);
  const db = getFirestore(app);

  // Charger les données des bus et des arrêts
  useEffect(() => {
    setBusRoutes(getBusRoutes());
    setBusStops(getBusStops());

    const unsubscribe = onSnapshot(collection(db, 'Drivers'), (snapshot) => {
      const busList: Bus[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location?.latitude && data.location?.longitude) {
          busList.push({
            id: doc.id,
            fullName: data.fullName || `Driver ${doc.id}`,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            currentLocation: data.currentLocation || 'En route',
            status: data.status || 'en-route',
            eta: data.eta || '7 mins',
            routeProgress: data.routeProgress || 45,
            route: data.route || [],
          });
        }
      });
      setBuses(busList);
      if (!selectedBus && busList.length > 0) {
        setSelectedBus(busList[0].id);
      }
    }, (error) => {
      console.error('Erreur lors de la récupération des chauffeurs:', error);
      Alert.alert('Erreur', 'Impossible de charger les données des chauffeurs');
    });

    return () => unsubscribe();
  }, []);

  // Obtenir la localisation de l'utilisateur
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'L\'accès à la localisation est requis');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Erreur de localisation:', error);
        Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
      }
    })();
  }, []);

  // Mettre à jour les positions des bus toutes les 5 secondes (simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => ({
          ...bus,
          latitude: bus.latitude + (Math.random() - 0.5) * 0.001,
          longitude: bus.longitude + (Math.random() - 0.5) * 0.001,
        }))
      );
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  // Centrer la carte sur le bus sélectionné
  const handleCenterMap = useCallback(() => {
    const bus = buses.find((b) => b.id === selectedBus);
    if (mapRef.current && bus) {
      mapRef.current.animateToRegion({
        latitude: bus.latitude,
        longitude: bus.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [selectedBus, buses]);

  // Centrer la carte sur la position de l'utilisateur
  const handleCenterUserLocation = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert('Erreur', 'Position de l\'utilisateur non disponible');
    }
  }, [userLocation]);

  // Basculer le type de carte
  const toggleMapType = useCallback(() => {
    setMapType((prev) => (prev === 'standard' ? 'satellite' : 'standard'));
  }, []);

  // Gérer le clic sur la carte pour définir le trajet
  const handleMapPress = useCallback((e: any) => {
    if (!isSelectingPath) return;

    const { coordinate } = e.nativeEvent;
    console.log('Clic sur la carte:', coordinate); // Journal pour débogage

    if (pathPoints.length === 0) {
      setPathPoints([coordinate]);
      Alert.alert('Point de départ défini', 'Cliquez à nouveau pour définir le point d\'arrivée');
    } else if (pathPoints.length === 1) {
      setPathPoints((prev) => [...prev, coordinate]);
      setIsSelectingPath(false);
      Alert.alert('Trajet défini', 'Cliquez sur Enregistrer pour valider');
    }
  }, [isSelectingPath, pathPoints]);

  // Lancer la sélection du trajet
  const startPathSelection = useCallback(() => {
    if (!selectedBus) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un bus');
      return;
    }
    setPathPoints([]);
    setIsSelectingPath(true);
    setShowPathModal(true);
    Alert.alert('Sélection du trajet', 'Cliquez sur la carte pour sélectionner le point de départ');
  }, [selectedBus]);

  // Enregistrer le trajet
  const savePath = async () => {
    if (!selectedBus || pathPoints.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner un bus et définir 2 points');
      return;
    }

    try {
      await updateDoc(doc(db, 'Drivers', selectedBus), {
        route: pathPoints,
      });
      Alert.alert('Succès', 'Nouveau trajet enregistré');
      setShowPathModal(false);
      setPathPoints([]);
      setIsSelectingPath(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du trajet:', error);
      Alert.alert('Erreur', 'Sauvegarde échouée');
    }
  };

  // Annuler la sélection du trajet
  const cancelPathSelection = () => {
    setPathPoints([]);
    setIsSelectingPath(false);
    setShowPathModal(false);
  };

  // Région initiale de la carte
  const initialRegion = {
    latitude: buses[0]?.latitude || userLocation?.latitude || 36.7283,
    longitude: buses[0]?.longitude || userLocation?.longitude || 5.0478,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Rendu d'un élément de bus dans la liste
  const renderBusItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity
      style={[styles.busSelectorOption, selectedBus === item.id && styles.busSelectorOptionActive]}
      onPress={() => {
        setSelectedBus(item.id);
        mapRef.current?.animateToRegion({
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }}
    >
      <Text
        style={[styles.busSelectorText, selectedBus === item.id && styles.busSelectorTextActive]}
      >
        Bus #{item.id}
      </Text>
    </TouchableOpacity>
  );

  // Rendu d'un élément de chauffeur dans la liste
  const renderDriverItem = ({ item }: { item: Bus }) => (
    <TouchableOpacity
      style={styles.driverIdItem}
      onPress={() => {
        setSelectedBus(item.id);
        setShowDriverList(false);
        mapRef.current?.animateToRegion({
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }}
    >
      <Text style={styles.driverIdText}>{item.fullName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Carte */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          mapType={mapType}
          onPress={handleMapPress}
          scrollEnabled={!isSelectingPath}
          zoomEnabled={!isSelectingPath}
          pitchEnabled={!isSelectingPath}
          rotateEnabled={!isSelectingPath}
        >
          {/* Marqueurs pour chaque bus */}
          {buses.map((bus) => (
            <Marker
              key={bus.id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={bus.fullName}
              description={`Bus ID: ${bus.id}`}
              onPress={(e) => {
                if (!isSelectingPath) {
                  e.stopPropagation();
                  setSelectedBus(bus.id);
                  mapRef.current?.animateToRegion({
                    latitude: bus.latitude,
                    longitude: bus.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }
              }}
            >
              <View style={styles.marker}>
                <Text style={styles.markerText}>{bus.fullName[0]}</Text>
              </View>
            </Marker>
          ))}

          {/* Marqueurs pour les arrêts de bus */}
          {busStops.map((stop, index) => (
            <Marker
              key={`stop-${index}`}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
              pinColor="blue"
              onPress={(e) => {
                if (!isSelectingPath) e.stopPropagation();
              }}
            />
          ))}

          {/* Trajet du bus sélectionné */}
          {selectedBus && buses.find((b) => b.id === selectedBus)?.route?.length > 0 && (
            <Polyline
              coordinates={buses.find((b) => b.id === selectedBus)!.route}
              strokeColor="#FF0000"
              strokeWidth={3}
            />
          )}

          {/* Points du trajet en cours de sélection */}
          {pathPoints.map((point, index) => (
            <Marker key={`path-point-${index}`} coordinate={point}>
              <View
                style={[styles.pathMarker, { backgroundColor: index === 0 ? '#4CAF50' : '#F44336' }]}
              >
                <Text style={styles.markerText}>{index === 0 ? 'D' : 'A'}</Text>
              </View>
            </Marker>
          ))}

          {/* Ligne du trajet en cours de sélection */}
          {pathPoints.length > 1 && (
            <Polyline coordinates={pathPoints} strokeColor="#0000FF" strokeWidth={3} />
          )}
        </MapView>

        {/* Contrôles de la carte */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={toggleMapType}>
            <Layers size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={handleCenterMap}>
            <Navigation2 size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={handleCenterUserLocation}>
            <LocateFixed size={20} color={colors.primary} />
          </TouchableOpacity>
          {userRole === 'admin' && (
            <TouchableOpacity style={styles.mapControlButton} onPress={startPathSelection}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setShowDriverList(!showDriverList)}
          >
            <List size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de bus (admin uniquement) */}
        {userRole === 'admin' && (
          <View style={styles.busSelector}>
            <FlatList
              data={buses}
              renderItem={renderBusItem}
              keyExtractor={(item) => item.id}
              horizontal
            />
          </View>
        )}

        {/* Liste des chauffeurs */}
        {showDriverList && (
          <View style={styles.driverIdsContainer}>
            <FlatList
              data={buses}
              renderItem={renderDriverItem}
              keyExtractor={(item) => item.id}
              style={styles.driverIdsList}
            />
          </View>
        )}
      </View>

      {/* Modal pour la sélection du trajet */}
      <Modal visible={showPathModal} transparent animationType="slide" onRequestClose={cancelPathSelection}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={cancelPathSelection}>
              <X color="black" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Définir un nouveau trajet</Text>
            <Text style={styles.instructionText}>
              {pathPoints.length === 0
                ? 'Cliquez sur la carte pour sélectionner le point de départ'
                : pathPoints.length === 1
                ? 'Cliquez sur la carte pour sélectionner le point d\'arrivée'
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
                { backgroundColor: pathPoints.length < 2 ? '#ccc' : '#4CAF50', opacity: pathPoints.length < 2 ? 0.6 : 1 },
              ]}
              disabled={pathPoints.length < 2}
              onPress={savePath}
            >
              <Text style={styles.actionButtonText}>Enregistrer le trajet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Détails du bus */}
      <View style={styles.detailsContainer}>
        <TouchableOpacity style={styles.detailsHeader} onPress={() => setShowDetails(!showDetails)}>
          <View style={styles.detailsHeaderLeft}>
            <Bus size={20} color={colors.primary} />
            <Text style={styles.busNumber}>
              Bus #{selectedBus || 'N/A'}
            </Text>
          </View>
          <ChevronDown
            size={20}
            color={colors.textLight}
            style={{ transform: [{ rotate: showDetails ? '0deg' : '-90deg' }] }}
          />
        </TouchableOpacity>

        {showDetails && selectedBus && (
          <View style={styles.detailsContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  {buses.find((b) => b.id === selectedBus)?.status === 'en-route' ? 'En route • ' : ''}
                  ETA {buses.find((b) => b.id === selectedBus)?.eta || '7 mins'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  {buses.find((b) => b.id === selectedBus)?.currentLocation || 'University Road'}
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      buses.find((b) => b.id === selectedBus)?.status === 'en-route'
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {buses.find((b) => b.id === selectedBus)?.status || 'En route to next stop'}
              </Text>
            </View>
            <View style={styles.routeProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${buses.find((b) => b.id === selectedBus)?.routeProgress || 45}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {buses.find((b) => b.id === selectedBus)?.routeProgress || 45}% of route completed
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
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
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
  driverIdsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 200,
  },
  driverIdsList: {
    padding: 10,
  },
  driverIdItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  driverIdText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
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
  marker: {
    backgroundColor: '#6200EE',
    padding: 5,
    borderRadius: 5,
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pathMarker: {
    padding: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  coordinateText: {
    fontSize: 14,
    marginBottom: 5,
  },
  actionButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;