import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { TriangleAlert as AlertTriangle, Check, Car, ClipboardList, Thermometer, Users, X, MapPin, Camera } from 'lucide-react-native';
import ScreenHeader from '@/components/ScreenHeader';

const incidentTypes = [
  { id: 'mechanical', title: 'Mechanical Issue', icon: Car },
  { id: 'student', title: 'Student Issue', icon: Users },
  { id: 'weather', title: 'Weather Problem', icon: Thermometer },
  { id: 'other', title: 'Other', icon: ClipboardList },
];

export default function IncidentsScreen() {
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = () => {
    if (!selectedIncidentType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }

    if (!description) {
      Alert.alert('Error', 'Please provide a description of the incident');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Your incident report has been successfully submitted. The administration has been notified.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setSelectedIncidentType(null);
              setDescription('');
              setLocation('');
              setUrgencyLevel('medium');
            } 
          },
        ]
      );
    }, 1500);
  };

  const UrgencyButton = ({ level, title }: { level: 'low' | 'medium' | 'high', title: string }) => (
    <TouchableOpacity
      style={[
        styles.urgencyButton,
        urgencyLevel === level && styles.selectedUrgencyButton,
        level === 'low' && { backgroundColor: urgencyLevel === level ? colors.successLight : colors.backgroundLight },
        level === 'medium' && { backgroundColor: urgencyLevel === level ? colors.warningLight : colors.backgroundLight },
        level === 'high' && { backgroundColor: urgencyLevel === level ? colors.errorLight : colors.backgroundLight },
      ]}
      onPress={() => setUrgencyLevel(level)}
    >
      <Text
        style={[
          styles.urgencyButtonText,
          urgencyLevel === level && styles.selectedUrgencyButtonText,
          level === 'low' && { color: urgencyLevel === level ? colors.success : colors.textLight },
          level === 'medium' && { color: urgencyLevel === level ? colors.warning : colors.textLight },
          level === 'high' && { color: urgencyLevel === level ? colors.error : colors.textLight },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Report Incident" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Incident Type</Text>
          <Text style={styles.sectionDescription}>Select the type of incident you want to report</Text>
          
          <View style={styles.incidentTypeContainer}>
            {incidentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.incidentTypeButton,
                    selectedIncidentType === type.id && styles.selectedIncidentType
                  ]}
                  onPress={() => setSelectedIncidentType(type.id)}
                >
                  <View style={[
                    styles.incidentTypeIconContainer,
                    selectedIncidentType === type.id && styles.selectedIncidentTypeIconContainer
                  ]}>
                    <Icon 
                      size={24} 
                      color={selectedIncidentType === type.id ? colors.white : colors.primary} 
                    />
                  </View>
                  <Text style={[
                    styles.incidentTypeText,
                    selectedIncidentType === type.id && styles.selectedIncidentTypeText
                  ]}>
                    {type.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <Text style={styles.sectionDescription}>How urgent is this incident?</Text>
          
          <View style={styles.urgencyContainer}>
            <UrgencyButton level="low" title="Low" />
            <UrgencyButton level="medium" title="Medium" />
            <UrgencyButton level="high" title="High" />
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <Text style={styles.sectionDescription}>Provide more information about the incident</Text>
          
          <TextInput
            style={styles.textArea}
            placeholder="Describe the incident in detail..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
          
          <View style={styles.locationContainer}>
            <MapPin size={20} color={colors.primary} style={styles.locationIcon} />
            <TextInput
              style={styles.locationInput}
              placeholder="Current Location"
              placeholderTextColor={colors.textLight}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationButtonText}>Get Location</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Add Photo</Text>
          <Text style={styles.sectionDescription}>Attach a photo of the incident (optional)</Text>
          
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={28} color={colors.primary} />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 4,
  },
  sectionDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  incidentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  incidentTypeButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedIncidentType: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  incidentTypeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIncidentTypeIconContainer: {
    backgroundColor: colors.primary,
  },
  incidentTypeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    textAlign: 'center',
  },
  selectedIncidentTypeText: {
    color: colors.primary,
  },
  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedUrgencyButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  urgencyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  selectedUrgencyButtonText: {
    fontFamily: 'Poppins-SemiBold',
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 16,
    minHeight: 120,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  locationButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  locationButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: 20,
    gap: 8,
  },
  cameraButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  submitButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
  },
});