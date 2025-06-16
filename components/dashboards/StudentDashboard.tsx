import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bus, Clock, MapPin, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/Colors';

export default function StudentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bus Info</Text>

      <View style={styles.card}>
        <View style={styles.header}>
          <Bus size={24} color={colors.primary} />
          <Text style={styles.busTitle}>Bus #B42</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color={colors.textLight} />
          <Text style={styles.detailText}>Next pickup: 07:15 AM</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.detailText}>Stop: University Gate 3</Text>
        </View>

        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackText}>Track Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.upcomingSection}>
        <Text style={styles.subtitle}>Upcoming Trips</Text>
        <View style={styles.tripCard}>
          <Calendar size={18} color={colors.primary} />
          <View style={styles.tripInfo}>
            <Text style={styles.tripType}>Morning Pickup</Text>
            <Text style={styles.tripTime}>Mon, May 20 • 07:15 AM</Text>
          </View>
        </View>
        <View style={styles.tripCard}>
          <Calendar size={18} color={colors.success} />
          <View style={styles.tripInfo}>
            <Text style={styles.tripType}>Afternoon Drop-off</Text>
            <Text style={styles.tripTime}>Mon, May 20 • 03:30 PM</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 12,
    color: colors.textDark,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  busTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
  },
  trackButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackText: {
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  upcomingSection: {
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 12,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripInfo: {
    marginLeft: 10,
  },
  tripType: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  tripTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
});
