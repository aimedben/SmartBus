import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';

export default function EditProfile() {
  const { params } = router;
  const currentData = params?.currentData ? JSON.parse(params.currentData) : {};
  const onSave = params?.onSave;
  
  const [formData, setFormData] = useState({
    nom: currentData.nom || '',
    email: currentData.email || '',
    phone: currentData.phone || ''
  });

  const handleSave = () => {
    if (!formData.nom) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }
    
    const updatedData = {
      nom: formData.nom,
      email: formData.email,
      phone: formData.phone
    };
    
    if (onSave) {
      onSave(updatedData);
    }
    
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Modifier le profil" />
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            value={formData.nom}
            onChangeText={(text) => setFormData({...formData, nom: text})}
            placeholder="Votre nom"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="Votre email"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="Votre numéro"
            keyboardType="phone-pad"
          />
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  formContainer: {
    padding: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.textDark,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16
  }
});