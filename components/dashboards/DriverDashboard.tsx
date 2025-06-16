import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { Camera, CameraView } from 'expo-camera'; // ✅ Corrigé ici
import { app } from '@/firebaseConfig';
import { colors } from '@/constants/Colors';

export default function DriverDashboard() {
  const db = getFirestore(app);
  const driverId = 'CtCqf5Cdq8MhTQocaNpa'; // Remplace par l'UID réel si besoin

  const [fullName, setFullName] = useState('');
  const [horaires, setHoraires] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  const getJourActuel = () => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[new Date().getDay()];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverDoc = await getDoc(doc(db, 'Drivers', driverId));
        if (driverDoc.exists()) {
          setFullName(driverDoc.data().fullName || '');
        }

        const horairesSnap = await getDocs(collection(db, 'Drivers', driverId, 'Horaires'));
        const jourActuel = getJourActuel();
        const horairesData = horairesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(h => h.jour === jourActuel);
        setHoraires(horairesData);

        const routesSnap = await getDocs(collection(db, 'Drivers', driverId, 'Routes'));
        const routesData = routesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoutes(routesData);
      } catch (error) {
        console.error('Erreur de récupération :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // ✅ Corrigé ici
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(false);

    setQrData(data);
    Alert.alert('QR Code scanné', `Contenu : ${data}`);
    setTimeout(() => setScanned(false), 3000);
  };

  if (loading || hasPermission === null) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bienvenue, {fullName}</Text>

      <Text style={styles.sectionTitle}>Horaires du jour</Text>
      {horaires.length === 0 ? (
        <Text style={styles.noData}>Aucun horaire prévu aujourd’hui.</Text>
      ) : (
        horaires.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text>Jour : {item.jour}</Text>
            <Text>Début : {item.first}</Text>
            <Text>Fin : {item.second}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Mes Routes</Text>
      {routes.map((route, index) => (
        <View key={index} style={styles.card}>
          <Text>Route : {route.name}</Text>
          <Text>Départ : {route.depart}</Text>
          <Text>Arrivée : {route.arriver}</Text>
        </View>
      ))}

      {qrData && (
        <View style={styles.card}>
          <Text style={{ fontWeight: 'bold' }}>Dernier QR Code :</Text>
          <Text>{qrData}</Text>
        </View>
      )}

      {!scanning && (
        <View style={{ marginVertical: 20 }}>
          <Button title="Scanner un QR Code" onPress={() => setScanning(true)} />
        </View>
      )}

      {scanning && hasPermission && (
        <View style={styles.scanner}>
          <Text style={{ marginBottom: 10 }}>📷 Scanner actif</Text>
          <CameraView
            style={{ width: '100%', height: 300 }}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <Button title="Annuler" onPress={() => setScanning(false)} />
        </View>
      )}

      {hasPermission === false && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          Permission caméra refusée. Active-la dans les paramètres.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  noData: {
    fontStyle: 'italic',
    color: 'gray',
    marginBottom: 10,
  },
  scanner: {
    marginTop: 20,
    alignItems: 'center',
  },
});
