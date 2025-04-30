import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const userTypes = [
  {
    id: 'parent',
    title: 'Parent',
    description: 'Track your child\'s school bus and receive notifications',
    icon: 'https://images.pexels.com/photos/7282801/pexels-photo-7282801.jpeg',
  },
  {
    id: 'driver',
    title: 'Bus Driver',
    description: 'Manage routes and communicate with administration',
    icon: 'https://images.pexels.com/photos/9225612/pexels-photo-9225612.jpeg',
  },
  {
    id: 'admin',
    title: 'Administration',
    description: 'Monitor all buses and manage the transportation system',
    icon: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Check bus schedules and receive important notifications',
    icon: 'https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg',
  },
];

export default function UserTypeScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { setUserRole } = useAuth();
  
  const handleContinue = () => {
    if (selectedType) {
      setUserRole(selectedType);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select User Type</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.subtitle}>
          Please select your role in the Smart Bus system
        </Text>
        
        <View style={styles.cardsContainer}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.card,
                selectedType === type.id && styles.selectedCard
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <View style={styles.cardImageContainer}>
                <Image 
                  source={{ uri: type.icon }} 
                  style={styles.cardImage} 
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={styles.cardDescription}>{type.description}</Text>
              </View>
              <View style={[
                styles.checkCircle,
                selectedType === type.id && styles.selectedCheckCircle
              ]}>
                {selectedType === type.id && (
                  <View style={styles.checkInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <ChevronRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Extra padding for footer
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckCircle: {
    borderColor: colors.primary,
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  continueButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
    marginRight: 8,
  },
});