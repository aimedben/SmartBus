import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/constants/colors';

export default function DriverDashboard() {
  const navigation = useNavigation();

  return (
    <View style={styles.section}> 
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Driver Panel</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.driverCard} onPress={() => navigation.navigate('MyRoutes')}>
          <MaterialIcons name="directions-bus" size={24} color={colors.primary} />
          <Text style={styles.cardText}>My Routes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.driverCard} onPress={() => navigation.navigate('DailyLog')}>
          <FontAwesome5 name="calendar-day" size={24} color={colors.primary} />
          <Text style={styles.cardText}>Daily Log</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.driverCard} onPress={() => navigation.navigate('Maintenance')}> 
          <MaterialIcons name="build" size={24} color={colors.primary} />
          <Text style={styles.cardText}>Maintenance</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 140,
    height: 120,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
