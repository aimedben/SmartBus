import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const { userRole, userName } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderDashboard = () => {
    switch (userRole) {
      case 'parent':
        return <ParentDashboard students={[]} />;
      case 'driver':
        return <DriverDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return null;
    }
  };

  // 🔔 Obtenir le token de notification
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Tu peux ici envoyer `token` à ton serveur Firebase ou Node.js si tu veux
    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync();

    // 📥 Quand la notification est reçue (app ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    // 📲 Quand l'utilisateur clique sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification ouverte:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderDashboard()}
      </ScrollView>
    </View>
  );
}
