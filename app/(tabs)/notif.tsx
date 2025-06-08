import React, { useState, useEffect } from 'react';
import { View, Button, Alert, ActivityIndicator, Text } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { ref, set } from 'firebase/database';
import { db } from '../../firebaseConfig';

export default function NotificationScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        Alert.alert("Info", "Un appareil physique est requis");
        setLoading(false);
        return;
      }

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert("Permissions refusées", "Impossible d'obtenir la permission pour les notifications");
          setLoading(false);
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setToken(token);
        
        // Enregistrer le token dans Firebase
        const userId = await SecureStore.getItemAsync('userId');
        if (userId) {
          await set(ref(db, `Users/${userId}/pushToken`), {
            token,
            platform: Device.osName,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Erreur token:", error);
        Alert.alert("Erreur", "Échec de génération du token");
      } finally {
        setLoading(false);
      }
    };

    registerForPushNotifications();
  }, []);

  const sendTestNotification = async () => {
    if (!token) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notification de test",
          body: "Ceci est une notification locale de test!",
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ padding: 60 }}>
      <Button
        title="Envoyer une notification de test"
        onPress={sendTestNotification}
      />
      
      {token && (
        <Text selectable style={{ marginTop: 20 }}>
          Votre token: {token}
        </Text>
      )}
    </View>
  );
}