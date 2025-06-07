import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; // Assure-toi du bon chemin vers ta config
import { colors } from '@/constants/colors';

export default function DriverHome() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchAndUpdateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission de localisation refusée");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const currentUser = getAuth().currentUser;

      if (!currentUser) {
        setErrorMsg("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      const newLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(newLocation);

      // Mettre à jour dans Firestore (collection "Drivers")
      const driverRef = doc(db, "Drivers", currentUser.uid);
      await updateDoc(driverRef, { location: newLocation });

    } catch (error) {
      console.error("Erreur de localisation :", error);
      setErrorMsg("Impossible de récupérer la localisation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndUpdateLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de la localisation...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Localisation actuelle :</Text>
      <Text style={styles.coord}>Latitude : {location?.latitude}</Text>
      <Text style={styles.coord}>Longitude : {location?.longitude}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background, padding: 20
  },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'red',
    textAlign: 'center'
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 12,
    color: colors.textDark
  },
  coord: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark
  }
});
