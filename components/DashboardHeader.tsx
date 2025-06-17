import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
}

export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getRoleText = () => {
    switch (userRole) {
      case 'parent':
        return 'Tableau de bord - Parent';
      case 'driver':
        return 'Tableau de bord - Chauffeur';
      case 'admin':
        return 'Tableau de bord - Administrateur';
      case 'student':
        return 'Tableau de bord - Élève';
      default:
        return 'Tableau de bord';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hour}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{userName || 'Utilisateur'}</Text>
          <Text style={styles.role}>{getRoleText()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
