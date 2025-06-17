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
import { Camera, CameraView } from 'expo-camera';
import { app } from '@/firebaseConfig';
import { colors } from '@/constants/Colors';
import DashboardHeader from '../DashboardHeader';
import { getAuth } from 'firebase/auth';

export default function DriverDashboard() {
  const db = getFirestore(app);
  const auth = getAuth();
  const user = auth.currentUser;
  const driverId = user?.uid ;

  const [fullName, setFullName] = useState('');
  const [horaires, setHoraires] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [driverName, setDriverName] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'boarding' | 'alighting'>('boarding');

  const getJourActuel = () => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[new Date().getDay()];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverDoc = await getDoc(doc(db, 'Drivers', driverId));
        if (driverDoc.exists()) {
          const data = driverDoc.data();
          setFullName(data?.fullName ?? '');
          setDriverName(data?.fullName ?? '');
        }

        const horairesSnap = await getDocs(collection(db, 'Drivers', driverId, 'Horaires'));
        const jourActuel = getJourActuel();
        const horairesData = horairesSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(h => h.jour === jourActuel);
        setHoraires(horairesData);

        const routesSnap = await getDocs(collection(db, 'Drivers', driverId, 'Routes'));
        const routesData = routesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRoutes(routesData);
      } catch (error) {
        console.error('Erreur de récupération :', error);
        Alert.alert('Erreur', 'Impossible de charger les données du conducteur.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const validateExpoPushToken = (token: string): boolean => {
    // Nettoyer le token (supprimer les espaces et retours à la ligne)
    const cleanToken = token.trim();
    // Vérifier le format du token Expo
    const expoTokenRegex = /^ExponentPushToken\[[a-zA-Z0-9_-]+\]$/;
    return expoTokenRegex.test(cleanToken);
  };

  const sendNotification = async (token: string, childName: string, type: 'boarding' | 'alighting'): Promise<void> => {
    try {
      // Nettoyer le token (supprimer les espaces et retours à la ligne)
      const cleanToken = token.trim().replace(/\n/g, '');
      console.log('Token original :', JSON.stringify(token));
      console.log('Token nettoyé :', JSON.stringify(cleanToken));
      
      // Valider le token
      if (!validateExpoPushToken(cleanToken)) {
        throw new Error(`Token de notification invalide: ${cleanToken}`);
      }

      // Définir le message selon le type
      let title, body;
      if (type === 'boarding') {
        title = 'Child Boarded Bus';
        body = `Your child has boarded the bus.`;
      } else {
        title = 'Child Left Bus';
        body = `Your child has just left the bus.`;
      }

      const message = {
        to: cleanToken,
        sound: 'default',
        title: title,
        body: body,
        data: {
          driverId: driverId,
          driverName: driverName,
          childName: childName,
          type: type,
          timestamp: new Date().toISOString(),
        },
      };

      console.log('Message à envoyer :', message);

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Réponse de la notification :', data);

      // Gestion spécifique des erreurs Expo
      if (data?.data?.status === 'error') {
        const errorType = data.data.details?.error;
        let errorMessage = data.data.message || 'Erreur inconnue';
        
        switch (errorType) {
          case 'DeviceNotRegistered':
            errorMessage = 'Le destinataire n\'est pas enregistré pour les notifications. Vérifiez que l\'application est installée et que les notifications sont activées.';
            break;
          case 'InvalidCredentials':
            errorMessage = 'Token de notification expiré ou invalide.';
            break;
          case 'MessageTooBig':
            errorMessage = 'Le message est trop volumineux.';
            break;
          case 'MessageRateExceeded':
            errorMessage = 'Trop de messages envoyés rapidement.';
            break;
          default:
            errorMessage = `Erreur Expo (${errorType}): ${errorMessage}`;
        }
        
        throw new Error(errorMessage);
      }

      if (data?.data?.status !== 'ok') {
        throw new Error('Échec de l\'envoi de la notification');
      }

      return data;
    } catch (error) {
      console.error('Erreur d\'envoi de notification :', error);
      throw error;
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || sendingNotification) return;

    console.log('QR Code scanné :', data);
    
    try {
      // Parser les données du QR code
      const qrData = JSON.parse(data);
      const { token, childName } = qrData;
      
      if (!token || !childName) {
        throw new Error('QR Code invalide : token ou nom de l\'enfant manquant');
      }
      
      // Éviter les scans multiples
      setScanned(true);
      setSendingNotification(true);
      setQrData(data);

      // Afficher un indicateur de chargement
      const actionText = notificationType === 'boarding' ? 'montée' : 'descente';
      Alert.alert('Envoi...', `Envoi de la notification de ${actionText} en cours...`);
      
      await sendNotification(token, childName, notificationType);
      
      const successMessage = notificationType === 'boarding' 
        ? `Notification envoyée : ${childName} est monté dans le bus`
        : `Notification envoyée : ${childName} est descendu du bus`;
      
      Alert.alert(
        'Succès ✅', 
        successMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanning(false);
              setScanned(false);
            }
          }
        ]
      );
      
    } catch (parseError) {
      // Si ce n'est pas du JSON, traiter comme un token simple (ancien format)
      console.log('Format de QR code ancien détecté, traitement comme token simple');
      
      setScanned(true);
      setSendingNotification(true);
      setQrData(data);

      try {
        const actionText = notificationType === 'boarding' ? 'montée' : 'descente';
        Alert.alert('Envoi...', `Envoi de la notification de ${actionText} en cours...`);
        
        await sendNotification(data, 'Child', notificationType);
        
        const successMessage = notificationType === 'boarding' 
          ? 'Notification envoyée : L\'enfant est monté dans le bus'
          : 'Notification envoyée : L\'enfant est descendu du bus';
        
        Alert.alert(
          'Succès ✅', 
          successMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                setScanning(false);
                setScanned(false);
              }
            }
          ]
        );
        
      } catch (error) {
        console.error('Erreur lors de l\'envoi :', error);
        
        let errorMessage = 'Échec de l\'envoi de la notification';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        Alert.alert(
          'Erreur ❌', 
          errorMessage,
          [
            {
              text: 'Réessayer',
              onPress: () => {
                setScanned(false);
                setSendingNotification(false);
              }
            },
            {
              text: 'Annuler',
              onPress: () => {
                setScanning(false);
                setScanned(false);
                setSendingNotification(false);
              }
            }
          ]
        );
      }
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading || hasPermission === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bienvenue, {fullName}</Text>

      

      {qrData && (
        <View style={styles.card}>
          <Text style={{ fontWeight: 'bold' }}>Dernier QR Code scanné :</Text>
          <Text style={{ fontSize: 12, color: 'gray' }}>{qrData}</Text>
        </View>
      )}

      {/* Sélecteur de type de notification */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Type de notification</Text>
        <View style={styles.notificationTypeContainer}>
          <Button
            title="🚌 Montée"
            color={notificationType === 'boarding' ? colors.primary : 'gray'}
            onPress={() => setNotificationType('boarding')}
          />
          <View style={{ width: 10 }} />
          <Button
            title="🚏 Descente"
            color={notificationType === 'alighting' ? colors.primary : 'gray'}
            onPress={() => setNotificationType('alighting')}
          />
        </View>
        <Text style={styles.typeDescription}>
          {notificationType === 'boarding' 
            ? 'Notification : "Your child has boarded the bus"'
            : 'Notification : "Your child has just left the bus"'
          }
        </Text>
      </View>

      {!scanning && (
        <View style={{ marginVertical: 20 }}>
          <Button 
            title={`📷 Scanner QR Code (${notificationType === 'boarding' ? 'Montée' : 'Descente'})`}
            onPress={() => {
              setScanning(true);
              setScanned(false);
              setSendingNotification(false);
            }} 
          />
        </View>
      )}

      {scanning && hasPermission && (
        <View style={styles.scanner}>
          <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: 'bold' }}>
            Scanner actif - {notificationType === 'boarding' ? 'Montée' : 'Descente'}
          </Text>
          <Text style={{ marginBottom: 10, fontSize: 14, color: 'gray' }}>
            Pointez vers le QR Code de l'enfant
          </Text>
          {sendingNotification && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text>Envoi de la notification...</Text>
            </View>
          )}
          <CameraView
            style={{ width: '100%', height: 300 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <Button 
            title="Annuler" 
            onPress={() => {
              setScanning(false);
              setScanned(false);
              setSendingNotification(false);
            }} 
          />
        </View>
      )}

      {hasPermission === false && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          Permission caméra refusée. Activez-la dans les paramètres.
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  notificationTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  typeDescription: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 10,
  },
});