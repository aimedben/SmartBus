import React, { useState, useEffect } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { ref, set } from 'firebase/database';
import { db } from '../../firebaseConfig';
import Constants from 'expo-constants';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const pushToken = await registerForPushNotifications();
        setToken(pushToken);
        
        // Enregistrement dans Firebase
        if (pushToken) {
          await set(ref(db, `users/${Constants.installationId}/pushToken`), {
            token: pushToken,
            platform: Device.osName,
            appVersion: Constants.expoConfig?.version
          });
        }
      } finally {
        setLoading(false);
      }
    };

    initNotifications();

    // Gestion des notifications reçues
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert(notification.request.content.title || 'Nouvelle notification', 
                 notification.request.content.body);
    });

    return () => subscription.remove();
  }, []);

  const sendTestNotification = async () => {
    if (!token) {
      Alert.alert("Erreur", "Token de notification non disponible");
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: '🚍 SmartBus Notification',
          body: 'Votre bus arrive dans 5 minutes!',
          data: { routeId: 'B12', stopId: '456' },
          sound: 'default'
        }),
      });

      const result = await response.json();
      if (result.data?.status === 'ok') {
        Alert.alert("Succès", "Notification envoyée avec succès!");
      } else {
        throw new Error(result.errors?.[0]?.message || "Échec de l'envoi");
      }
    } catch (error) {
      Alert.alert("Erreur", error.message || "Problème lors de l'envoi");
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
    <View style={{ padding: 20 }}>
      <Button
        title="Tester les notifications"
        onPress={sendTestNotification}
        disabled={!token}
      />
    </View>
  );
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    Alert.alert("Attention", "Les notifications ne fonctionnent que sur les appareils physiques");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true
      }
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert("Permission requise", "Activez les notifications dans les paramètres");
    return null;
  }

  try {
    // Solution robuste pour récupérer le projectId
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'smartbus-5d940';
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (error) {
    console.error("Erreur lors de l'obtention du token:", error);
    return null;
  }
}