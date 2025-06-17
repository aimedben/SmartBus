import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuth } from '@/context/AuthContext';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import DashboardHeader from '@/components/DashboardHeader'; // 🆕 Import du Header

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 🔔 Fonction exportable pour récupérer le token
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Doit être utilisé sur un vrai appareil pour les notifications push.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Autorisation de notifications refusée.');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
}

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

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

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
      <DashboardHeader userName={userName} userRole={userRole} /> {/* 🆕 Header ajouté ici */}
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
