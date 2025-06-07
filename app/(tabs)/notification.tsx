// App.tsx ou HomeScreen.tsx

import React from 'react';
import { SafeAreaView } from 'react-native';
import Notif from './notif'; // adapte le chemin si besoin

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Notif />
      console.log("Mon token Expo :", expoPushToken);

    </SafeAreaView>
  );
}
