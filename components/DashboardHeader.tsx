import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { Bell, Search } from 'lucide-react-native';

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
}

export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleText = () => {
    switch (userRole) {
      case 'parent':
        return 'Parent Dashboard';
      case 'driver':
        return 'Driver Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'student':
        return 'Student Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hour}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{userName || 'User'}</Text>
          <Text style={styles.role}>{getRoleText()}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //top: 10,
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hour: {
    top: 10,
  },
  greeting: {
    fontSize: 18,
    color: colors.textDark,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  role: {
    fontSize: 16,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
