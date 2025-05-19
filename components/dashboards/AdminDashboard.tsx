import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Users, Bus, UserCog, ClipboardList, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.grid}>
        <DashboardCard icon={<Users size={28} color={colors.primary} />} label="Users" count="134" />
        <DashboardCard icon={<Bus size={28} color={colors.success} />} label="Buses" count="12" />
        <DashboardCard icon={<ClipboardList size={28} color={colors.warning} />} label="Trips" count="45" />
        <DashboardCard icon={<UserCog size={28} color={colors.secondary} />} label="Drivers" count="7" />
      </View>

      <Text style={styles.subtitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Add User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Add Bus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Create Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DashboardCard = ({ icon, label, count }: { icon: React.ReactNode; label: string; count: string }) => (
  <View style={styles.card}>
    {icon}
    <Text style={styles.cardCount}>{count}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: colors.textDark,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  cardCount: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textLight,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});
