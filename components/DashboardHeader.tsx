import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { Bell, Search } from 'lucide-react-native';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
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
        <View>
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
    marginBottom: 4,
  },
  role: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});