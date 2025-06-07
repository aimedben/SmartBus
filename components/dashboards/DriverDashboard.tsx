import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Modal
} from 'react-native';
import { Plus, X, User, MapPin, Users, Gauge, IdCard } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default function AddDriver() {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driverData, setDriverData] = useState({
    driverName: '',
    driverLicense: '',
    assignedBus: '',
    route: '',
    contactNumber: '',
    status: 'active'
  });

  const handleInputChange = (field: string, value: string) => {
    setDriverData({
      ...driverData,
      [field]: value
    });
  };

  const addDriver = async () => {
    // Validation des champs requis
    if (!driverData.driverName || !driverData.driverLicense || !driverData.route) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsLoading(true);
      
      // Ajout à la collection Drivers
      await addDoc(collection(db, 'Drivers'), {
        ...driverData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      Alert.alert('Succès', 'Conducteur ajouté avec succès');
      setShowForm(false);
      // Réinitialisation du formulaire
      setDriverData({
        driverName: '',
        driverLicense: '',
        assignedBus: '',
        route: '',
        contactNumber: '',
        status: 'active'
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du conducteur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout du conducteur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowForm(true)}
      >
        <Plus size={20} color={colors.white} />
        <Text style={styles.addButtonText}>Ajouter un Conducteur</Text>
      </TouchableOpacity>

      {/* Modal pour le formulaire */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un nouveau Conducteur</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <User size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom du conducteur*"
                  value={driverData.driverName}
                  onChangeText={(text) => handleInputChange('driverName', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <IdCard size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Permis de conduire*"
                  value={driverData.driverLicense}
                  onChangeText={(text) => handleInputChange('driverLicense', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <MapPin size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Itinéraire*"
                  value={driverData.route}
                  onChangeText={(text) => handleInputChange('route', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Bus size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Bus assigné"
                  value={driverData.assignedBus}
                  onChangeText={(text) => handleInputChange('assignedBus', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Users size={20} color={colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone"
                  keyboardType="phone-pad"
                  value={driverData.contactNumber}
                  onChangeText={(text) => handleInputChange('contactNumber', text)}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={addDriver}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'En cours...' : 'Ajouter le Conducteur'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontFamily: 'Poppins-Regular',
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: colors.textLight,
  },
  submitButtonText: {
    color: colors.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});